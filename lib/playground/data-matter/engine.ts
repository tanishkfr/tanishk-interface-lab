import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import type { Datum } from "@/lib/playground/math";
import {
  DEFAULT_CAMERA,
  MAX_EDIT_VALUE,
  RELIEF_MAX,
  RELIEF_MIN,
  datumIndexFromAngle,
  datumIndexFromU,
  sampleSeries,
  valuesMaximum,
  type CameraSnapshot,
  type Formation,
  type Material,
} from "./model";
import { WORLD } from "./dimensions";
import {
  createFossilBlueprint,
  createFossilPorcelain,
  createFossilStrata,
} from "./fossil";
import {
  createTerrainBlueprint,
  createTerrainPorcelain,
  createTerrainStrata,
} from "./terrain";
import { PALETTE } from "./primitives";
import type { SculptureFrame, SculptureVariant } from "./types";
import {
  composeCleanPng,
  composePoster,
  loadImage,
  type CaptureMeta,
} from "./capture";

type EngineCallbacks = {
  onHover(index: number | null): void;
  onSelect(index: number | null): void;
  onEditStart(index: number): void;
  onEditValue(index: number, value: number): void;
  onEditEnd(): void;
  onCameraChange(camera: CameraSnapshot): void;
  onContextLost(): void;
  onReady(): void;
};

type EngineConfig = {
  data: Datum[];
  relief: number;
  formation: Formation;
  material: Material;
  camera: CameraSnapshot;
  selected: number | null;
  sculptMode: boolean;
  reducedMotion: boolean;
  lowPower: boolean;
};

const TRACE_CAPACITY = 128;
const FOV = 36;
const MIN_ELEVATION = 6;
const MAX_ELEVATION = 62;
const MIN_ZOOM = 0.78;
const MAX_ZOOM = 1.42;

const valueSpring = { stiffness: 205, damping: 27 };
const maxSpring = { stiffness: 120, damping: 22 };
const reliefSpring = { stiffness: 160, damping: 25 };
const DRAG_PIXELS_PER_SCALE = 155;

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function normalizeDegrees(value: number) {
  return ((((value + 180) % 360) + 360) % 360) - 180;
}

function easeInOutCubic(t: number) {
  const x = clamp(t, 0, 1);
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}

function smoothstep01(t: number) {
  const x = clamp(t, 0, 1);
  return x * x * (3 - 2 * x);
}

function roundForEditing(value: number) {
  return Number.isInteger(value) ? value : Math.round(value * 100) / 100;
}

export class DataMatterEngine {
  private container: HTMLDivElement;
  private overlay: HTMLElement;
  private callbacks: EngineCallbacks;
  private reducedMotion: boolean;
  private lowPower: boolean;

  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private canvas: HTMLCanvasElement;
  private environment: THREE.Texture | null = null;
  private ground: THREE.Mesh;
  private keyLight: THREE.DirectionalLight;
  private fillLight: THREE.DirectionalLight;
  private rimLight: THREE.DirectionalLight;
  private keyTarget: THREE.Object3D;

  private formation: Formation;
  private material: Material;
  private variant: SculptureVariant;
  private oldVariant: SculptureVariant | null = null;
  private transition:
    | { kind: "material" | "formation"; elapsed: number; duration: number }
    | null = null;

  private currentValues: Float32Array;
  private targetValues: Float32Array;
  private valueVelocities: Float32Array;
  private currentMax: number;
  private targetMax: number;
  private maxVelocity = 0;
  private currentRelief: number;
  private targetRelief: number;
  private reliefVelocity = 0;
  private scaleLocked = false;
  private lockedMax = 1;

  private assembly = 0;
  private assemblyDuration = 1.15;

  private selectedIndex: number | null;
  private manualHighlight: number | null = null;
  private pointerHover: number | null = null;
  private draggingIndex: number | null = null;
  private sculptMode: boolean;

  private azimuth: number;
  private elevation: number;
  private targetAzimuth: number;
  private targetElevation: number;
  private zoom: number;
  private targetZoom: number;
  private azimuthVelocity = 0;
  private baseDistance = 18;
  private targetBaseDistance = 18;
  private focusY = -0.14;
  private targetFocusY = -0.14;

  private pointerDown: {
    mode: "orbit" | "sculpt";
    pointerId: number;
    startX: number;
    startY: number;
    lastX: number;
    lastY: number;
    lastTime: number;
    lastMoveTime: number;
    pendingSelect: number | null;
    moved: boolean;
    index: number;
    startValue: number;
    dragMax: number;
  } | null = null;
  private pendingPointer:
    | { x: number; y: number; pointerType: string }
    | null = null;
  private pointerDirty = false;
  private pointerNearGrip = false;

  private grip: THREE.Mesh;
  private gripHalo: THREE.Mesh;
  private gripHit: THREE.Mesh;
  private gripStem: THREE.Line;
  private highlight: THREE.Line;
  private highlightPositions: Float32Array;
  private highlightMaterial: THREE.LineBasicMaterial;

  private width = 1;
  private height = 1;
  private visible = true;
  private disposed = false;
  private frameRequest = 0;
  private lastFrameTime = 0;
  private lastReport = 0;
  private lastReported: CameraSnapshot | null = null;
  private fpsSamples: number[] = [];
  private qualityChecked = false;
  private captureInProgress = false;
  private captureMode = false;
  private geometryDirty = true;
  private highlightDirty = true;
  private lastActiveIndex: number | null = null;
  private pointerNdc = new THREE.Vector2();
  private dragValueStep = 1;

  private resizeObserver: ResizeObserver;
  private intersectionObserver: IntersectionObserver;
  private mediaQuery: MediaQueryList;

  constructor(
    container: HTMLDivElement,
    overlay: HTMLElement,
    callbacks: EngineCallbacks,
    config: EngineConfig,
  ) {
    this.container = container;
    this.overlay = overlay;
    this.callbacks = callbacks;
    this.reducedMotion = config.reducedMotion;
    this.lowPower = config.lowPower;
    this.formation = config.formation;
    this.material = config.material;
    this.sculptMode = config.sculptMode;
    this.selectedIndex = config.selected;

    this.canvas = document.createElement("canvas");
    this.canvas.className = "dm-canvas";
    this.canvas.setAttribute("aria-hidden", "true");
    container.appendChild(this.canvas);

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: !this.lowPower,
      alpha: true,
      powerPreference: "high-performance",
    });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.NeutralToneMapping;
    this.renderer.toneMappingExposure = 0.92;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.shadowMap.autoUpdate = false;
    this.renderer.shadowMap.needsUpdate = true;
    this.renderer.setClearColor(0x000000, 0);
    this.scene = new THREE.Scene();
    this.scene.environmentIntensity = 0.48;
    this.renderer.domElement.style.touchAction = this.sculptMode
      ? "none"
      : "pan-y";
    this.camera = new THREE.PerspectiveCamera(
      FOV,
      1,
      0.1,
      120,
    );
    this.azimuth = config.camera.azimuth;
    this.elevation = clamp(config.camera.elevation, MIN_ELEVATION, MAX_ELEVATION);
    this.targetAzimuth = this.azimuth;
    this.targetElevation = this.elevation;
    this.zoom = clamp(config.camera.zoom, MIN_ZOOM, MAX_ZOOM);
    this.targetZoom = this.zoom;
    this.focusY = this.formation === "terrain" ? -0.14 : -0.18;
    this.targetFocusY = this.focusY;

    const values = config.data.map((datum) =>
      Number.isFinite(datum.value) ? Math.max(0, datum.value) : 0,
    );
    this.currentValues = Float32Array.from(values);
    this.targetValues = Float32Array.from(values);
    this.valueVelocities = new Float32Array(values.length);
    this.currentMax = valuesMaximum(values);
    this.targetMax = this.currentMax;
    this.currentRelief = clamp(config.relief, RELIEF_MIN, RELIEF_MAX);
    this.targetRelief = this.currentRelief;

    this.setupEnvironment();
    const lights = this.setupLights();
    this.keyLight = lights.keyLight;
    this.fillLight = lights.fillLight;
    this.rimLight = lights.rimLight;
    this.keyTarget = lights.keyTarget;

    const shadowGround = new THREE.Mesh(
      new THREE.PlaneGeometry(70, 70),
      new THREE.ShadowMaterial({
        color: 0x3d3628,
        opacity: 0.22,
        depthWrite: false,
      }),
    );
    shadowGround.rotation.x = -Math.PI / 2;
    shadowGround.position.y = 0.004;
    shadowGround.receiveShadow = true;
    this.ground = shadowGround;
    this.scene.add(shadowGround);

    this.highlightMaterial = new THREE.LineBasicMaterial({
      color: PALETTE.acidDeep,
      transparent: true,
      opacity: 0.92,
      toneMapped: false,
      depthTest: false,
    });
    this.highlightPositions = new Float32Array(TRACE_CAPACITY * 3);
    const highlightGeometry = new THREE.BufferGeometry();
    highlightGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(this.highlightPositions, 3),
    );
    this.highlight = new THREE.Line(highlightGeometry, this.highlightMaterial);
    this.highlight.frustumCulled = false;
    this.highlight.renderOrder = 3;
    this.highlight.visible = false;
    this.scene.add(this.highlight);

    const gripGeometry = new THREE.SphereGeometry(0.12, 22, 16);
    const gripMaterial = new THREE.MeshBasicMaterial({
      color: PALETTE.acid,
      toneMapped: false,
    });
    this.grip = new THREE.Mesh(gripGeometry, gripMaterial);
    this.grip.renderOrder = 4;
    this.grip.visible = false;
    this.scene.add(this.grip);

    const haloGeometry = new THREE.SphereGeometry(0.158, 20, 14);
    this.gripHalo = new THREE.Mesh(
      haloGeometry,
      new THREE.MeshBasicMaterial({
        color: PALETTE.ink,
        side: THREE.BackSide,
        toneMapped: false,
      }),
    );
    this.gripHalo.renderOrder = 4;
    this.gripHalo.visible = false;
    this.scene.add(this.gripHalo);

    const stemGeometry = new THREE.BufferGeometry();
    stemGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(new Float32Array(6), 3),
    );
    this.gripStem = new THREE.Line(
      stemGeometry,
      new THREE.LineBasicMaterial({
        color: PALETTE.ink,
        transparent: true,
        opacity: 0.7,
        depthTest: false,
      }),
    );
    this.gripStem.frustumCulled = false;
    this.gripStem.visible = false;
    this.gripStem.renderOrder = 3;
    this.scene.add(this.gripStem);

    this.gripHit = new THREE.Mesh(
      new THREE.SphereGeometry(0.42, 12, 8),
      new THREE.MeshBasicMaterial({ visible: false }),
    );
    this.gripHit.visible = false;
    this.scene.add(this.gripHit);

    this.variant = this.createVariant();
    this.scene.add(this.variant.root);
    const initialFrame: SculptureFrame = {
      values: this.currentValues,
      max: Math.max(0.0001, this.currentMax),
      relief: this.currentRelief,
      emergence: this.reducedMotion ? 1 : 0,
    };
    this.variant.update(initialFrame);
    this.variant.setShadows(true);
    if (this.reducedMotion) this.assembly = 1;

    this.mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    this.mediaQuery.addEventListener("change", this.onReducedMotionChange);

    this.resizeObserver = new ResizeObserver(this.handleResize);
    this.resizeObserver.observe(container);
    this.intersectionObserver = new IntersectionObserver(
      (entries) => {
        this.visible = entries[0]?.isIntersecting ?? true;
        if (this.visible) this.invalidate();
      },
      { rootMargin: "120px" },
    );
    this.intersectionObserver.observe(container);

    document.addEventListener("visibilitychange", this.onVisibilityChange);
    this.canvas.addEventListener("pointerdown", this.onPointerDown);
    this.canvas.addEventListener("pointermove", this.onPointerMove);
    this.canvas.addEventListener("pointerup", this.onPointerUp);
    this.canvas.addEventListener("pointercancel", this.onPointerCancel);
    this.canvas.addEventListener("pointerleave", this.onPointerLeave);
    this.canvas.addEventListener("webglcontextlost", this.onContextLost);
    this.canvas.addEventListener("webglcontextrestored", this.onContextRestored);

    this.overlay.dataset.visible = "false";
    this.handleResize();
    this.updateCursor("mouse");
    this.callbacks.onReady();
    this.invalidate();
  }

  private setupEnvironment() {
    const pmrem = new THREE.PMREMGenerator(this.renderer);
    pmrem.compileCubemapShader();
    const room = new RoomEnvironment();
    const texture = pmrem.fromScene(room, 0.04).texture;
    this.scene.environment = texture;
    this.environment = texture;
    room.traverse((object) => {
      const mesh = object as THREE.Mesh;
      mesh.geometry?.dispose();
      if (Array.isArray(mesh.material)) {
        for (const material of mesh.material) material.dispose();
      } else {
        mesh.material?.dispose();
      }
    });
    pmrem.dispose();
  }

  private setupLights() {
    const hemisphere = new THREE.HemisphereLight(0xfff6e4, 0x6d6250, 0.5);
    this.scene.add(hemisphere);

    const keyLight = new THREE.DirectionalLight(0xffeed2, 2.7);
    keyLight.position.set(-9, 8, 10);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(
      this.lowPower ? 1024 : 2048,
      this.lowPower ? 1024 : 2048,
    );
    keyLight.shadow.camera.left = -11;
    keyLight.shadow.camera.right = 11;
    keyLight.shadow.camera.top = 11;
    keyLight.shadow.camera.bottom = -11;
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 44;
    keyLight.shadow.bias = -0.00035;
    keyLight.shadow.normalBias = 0.024;
    const keyTarget = new THREE.Object3D();
    keyTarget.position.set(0, 0.9, 0);
    this.scene.add(keyTarget);
    keyLight.target = keyTarget;
    this.scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xffedd8, 0.48);
    fillLight.position.set(9, 4.5, 8);
    fillLight.target.position.set(0, 1, 0);
    this.scene.add(fillLight, fillLight.target);

    const rimLight = new THREE.DirectionalLight(0xb9c9ea, 1.25);
    rimLight.position.set(5, 6.5, -11);
    rimLight.target.position.set(0, 1, 0);
    this.scene.add(rimLight, rimLight.target);

    return { keyLight, fillLight, rimLight, keyTarget };
  }

  private createVariant(): SculptureVariant {
    if (this.formation === "terrain") {
      if (this.material === "strata") return createTerrainStrata();
      if (this.material === "porcelain") return createTerrainPorcelain();
      return createTerrainBlueprint();
    }
    if (this.material === "strata") return createFossilStrata();
    if (this.material === "porcelain") return createFossilPorcelain();
    return createFossilBlueprint();
  }

  private makeFrame(emergence = this.assembly): SculptureFrame {
    return {
      values: this.currentValues,
      max: Math.max(0.0001, this.currentMax),
      relief: this.currentRelief,
      emergence,
    };
  }

  private computeBaseDistance(aspect: number): number {
    const isTerrain = this.formation === "terrain";
    const objectWidth = isTerrain ? 16.2 : 11.8;
    const objectHeight = isTerrain ? 4.8 : 3.2;
    const objectDepth = isTerrain ? 8.6 : 9.2;
    const halfV = Math.tan((FOV * Math.PI) / 360);
    const halfH = halfV * Math.max(0.2, aspect);
    const vertical = (objectHeight / 2 + 0.45) / halfV;
    const horizontal = (objectWidth / 2 + 0.45) / halfH;
    return Math.max(10.5, (Math.max(vertical, horizontal) + objectDepth * 0.24) * 1.06);
  }

  private positionCamera(distance: number) {
    const azimuth = (this.azimuth * Math.PI) / 180;
    const elevation = (this.elevation * Math.PI) / 180;
    const horizontal = Math.cos(elevation) * distance;
    this.camera.position.set(
      Math.sin(azimuth) * horizontal,
      this.focusY + Math.sin(elevation) * distance,
      Math.cos(azimuth) * horizontal,
    );
    this.camera.lookAt(0, this.focusY, 0);
    this.camera.updateMatrixWorld();
  }

  private applyCamera() {
    this.positionCamera(this.baseDistance * this.zoom);
  }

  private requestFrame() {
    if (this.frameRequest || this.disposed) return;
    if (!this.visible || document.hidden) return;
    this.frameRequest = requestAnimationFrame(this.tick);
  }

  private invalidate() {
    this.requestFrame();
  }

  private tick = (time: number) => {
    this.frameRequest = 0;
    if (this.disposed || !this.visible || document.hidden) return;
    const dt = this.lastFrameTime
      ? Math.min(0.05, Math.max(0.001, (time - this.lastFrameTime) / 1000))
      : 1 / 60;
    this.lastFrameTime = time;
    const active = this.step(dt, time);
    this.render();
    if (active) {
      this.reportCamera(false);
      this.frameRequest = requestAnimationFrame(this.tick);
    } else {
      this.reportCamera(true);
      this.lastFrameTime = 0;
    }
  };

  private step(dt: number, now: number): boolean {
    let active = false;

    if (this.assembly < 1) {
      this.assembly = Math.min(1, this.assembly + dt / this.assemblyDuration);
      this.geometryDirty = true;
      active = true;
    }

    if (this.stepSprings(dt)) {
      active = true;
      this.geometryDirty = true;
    }
    if (this.stepCamera(dt)) active = true;
    if (this.stepLight(dt)) active = true;

    if (this.transition) {
      this.stepTransition(dt);
      if (this.transition?.kind === "formation") this.geometryDirty = true;
      active = true;
    }

    if (this.pointerDirty && this.pendingPointer) {
      this.pointerDirty = false;
      if (this.draggingIndex !== null) {
        this.applySculptPointer(this.pendingPointer.y);
      } else if (!this.pointerDown) {
        this.updatePointerHover(
          this.pendingPointer.x,
          this.pendingPointer.y,
          this.pendingPointer.pointerType,
        );
      }
      active = true;
    } else if (this.draggingIndex !== null) {
      active = true;
    }

    if (this.pointerDown && this.pointerDown.mode === "orbit") {
      active = true;
    }

    const frame = this.makeFrame();
    if (this.geometryDirty) {
      this.variant.update(frame);
      if (this.oldVariant) this.oldVariant.update({ ...frame, emergence: 1 });
      this.renderer.shadowMap.needsUpdate = true;
      this.geometryDirty = false;
      this.highlightDirty = true;
    }
    const activeIndex = this.activeIndex();
    if (activeIndex !== this.lastActiveIndex) {
      this.lastActiveIndex = activeIndex;
      this.highlightDirty = true;
    }
    if (this.highlightDirty) {
      this.updateHighlight(frame, now);
      this.highlightDirty = false;
    }
    this.updateOverlay(frame);
    this.measureQuality(dt);
    return active;
  }

  private stepSprings(dt: number): boolean {
    if (this.reducedMotion) {
      let changed = false;
      for (let i = 0; i < this.currentValues.length; i++) {
        if (this.currentValues[i] !== this.targetValues[i]) {
          this.currentValues[i] = this.targetValues[i];
          changed = true;
        }
        this.valueVelocities[i] = 0;
      }
      if (this.currentMax !== this.targetMax) {
        this.currentMax = this.targetMax;
        changed = true;
      }
      if (this.currentRelief !== this.targetRelief) {
        this.currentRelief = this.targetRelief;
        changed = true;
      }
      return changed;
    }

    const steps = Math.min(5, Math.max(1, Math.ceil(dt / (1 / 120))));
    const h = dt / steps;
    let active = false;

    for (let s = 0; s < steps; s++) {
      for (let i = 0; i < this.currentValues.length; i++) {
        const target = this.targetValues[i];
        const current = this.currentValues[i];
        const acceleration =
          valueSpring.stiffness * (target - current) -
          valueSpring.damping * this.valueVelocities[i];
        this.valueVelocities[i] += acceleration * h;
        let next = current + this.valueVelocities[i] * h;
        if (next < 0) {
          next = 0;
          if (this.valueVelocities[i] < 0) this.valueVelocities[i] = 0;
        }
        if (Math.abs(next - current) > 1e-7) active = true;
        this.currentValues[i] = next;
      }

      const maxAcceleration =
        maxSpring.stiffness * (this.targetMax - this.currentMax) -
        maxSpring.damping * this.maxVelocity;
      this.maxVelocity += maxAcceleration * h;
      this.currentMax = Math.max(0.0001, this.currentMax + this.maxVelocity * h);

      const reliefAcceleration =
        reliefSpring.stiffness * (this.targetRelief - this.currentRelief) -
        reliefSpring.damping * this.reliefVelocity;
      this.reliefVelocity += reliefAcceleration * h;
      this.currentRelief += this.reliefVelocity * h;
    }

    let settled = true;
    for (let i = 0; i < this.currentValues.length; i++) {
      if (
        Math.abs(this.targetValues[i] - this.currentValues[i]) > 0.001 ||
        Math.abs(this.valueVelocities[i]) > 0.02
      ) {
        settled = false;
        break;
      }
    }
    if (
      Math.abs(this.targetMax - this.currentMax) > 0.002 ||
      Math.abs(this.maxVelocity) > 0.02
    ) {
      settled = false;
    }
    if (
      Math.abs(this.targetRelief - this.currentRelief) > 0.03 ||
      Math.abs(this.reliefVelocity) > 0.08
    ) {
      settled = false;
    }

    if (settled) {
      for (let i = 0; i < this.currentValues.length; i++) {
        this.currentValues[i] = this.targetValues[i];
        this.valueVelocities[i] = 0;
      }
      this.currentMax = this.targetMax;
      this.maxVelocity = 0;
      this.currentRelief = this.targetRelief;
      this.reliefVelocity = 0;
      return false;
    }
    return active;
  }

  private stepCamera(dt: number): boolean {
    let active = false;

    if (
      !this.reducedMotion &&
      !this.pointerDown &&
      Math.abs(this.azimuthVelocity) > 0.2
    ) {
      this.azimuth += this.azimuthVelocity * dt;
      this.targetAzimuth = this.azimuth;
      this.azimuthVelocity *= Math.exp(-3.4 * dt);
      if (Math.abs(this.azimuthVelocity) < 0.2) this.azimuthVelocity = 0;
      active = true;
    }

    const smoothing = this.reducedMotion ? 1 : 1 - Math.exp(-14 * dt);
    if (!this.pointerDown) {
      const deltaAzimuth = this.targetAzimuth - this.azimuth;
      const deltaElevation = this.targetElevation - this.elevation;
      const deltaZoom = this.targetZoom - this.zoom;
      if (
        Math.abs(deltaAzimuth) > 0.02 ||
        Math.abs(deltaElevation) > 0.02 ||
        Math.abs(deltaZoom) > 0.0005
      ) {
        this.azimuth += deltaAzimuth * smoothing;
        this.elevation += deltaElevation * smoothing;
        this.zoom += deltaZoom * smoothing;
        active = true;
      } else {
        this.azimuth = this.targetAzimuth;
        this.elevation = this.targetElevation;
        this.zoom = this.targetZoom;
      }
    }

    const distanceDelta = this.targetBaseDistance - this.baseDistance;
    if (Math.abs(distanceDelta) > 0.01) {
      this.baseDistance +=
        distanceDelta * (this.reducedMotion ? 1 : 1 - Math.exp(-9 * dt));
      active = true;
    } else {
      this.baseDistance = this.targetBaseDistance;
    }

    const focusDelta = this.targetFocusY - this.focusY;
    if (Math.abs(focusDelta) > 0.002) {
      this.focusY += focusDelta * (this.reducedMotion ? 1 : 1 - Math.exp(-9 * dt));
      active = true;
    } else {
      this.focusY = this.targetFocusY;
    }

    this.elevation = clamp(this.elevation, MIN_ELEVATION, MAX_ELEVATION);
    this.zoom = clamp(this.zoom, MIN_ZOOM, MAX_ZOOM);
    this.applyCamera();
    return active;
  }

  private pointerLightTarget = new THREE.Vector3(0, 0.9, 0);
  private pointerLightCurrent = new THREE.Vector3(0, 0.9, 0);
  private pointerParallax = { x: 0, y: 0 };

  private stepLight(dt: number): boolean {
    if (this.reducedMotion) {
      this.keyTarget.position.set(0, 0.9, 0);
      return false;
    }
    const target = this.pointerLightTarget;
    target.set(this.pointerParallax.x * 0.85, 0.9, this.pointerParallax.y * 0.7);
    const delta = target.distanceTo(this.pointerLightCurrent);
    if (delta > 0.005) {
      this.pointerLightCurrent.lerp(
        target,
        1 - Math.exp(-2.6 * dt),
      );
      this.keyTarget.position.copy(this.pointerLightCurrent);
      this.renderer.shadowMap.needsUpdate = true;
      return true;
    }
    this.keyTarget.position.copy(target);
    this.pointerLightCurrent.copy(target);
    return false;
  }

  private stepTransition(dt: number) {
    const transition = this.transition;
    if (!transition || !this.oldVariant) return;
    transition.elapsed += dt;
    const p = clamp(transition.elapsed / transition.duration, 0, 1);

    if (transition.kind === "material") {
      const eased = smoothstep01(p);
      this.oldVariant.setOpacity(1 - eased);
      this.variant.setOpacity(eased);
      if (p >= 1) {
        this.finishTransition();
      }
      return;
    }

    const oldFade = 1 - smoothstep01(clamp(p / 0.62, 0, 1));
    this.oldVariant.setOpacity(oldFade);
    this.oldVariant.root.position.y = -0.42 * easeInOutCubic(p);
    const newFade = smoothstep01(clamp((p - 0.12) / 0.42, 0, 1));
    this.variant.setOpacity(newFade);
    this.assembly = clamp((p - 0.12) / 0.82, 0, 1);
    if (p >= 1) {
      this.assembly = 1;
      this.finishTransition();
    }
  }

  private finishTransition() {
    if (this.oldVariant) {
      this.scene.remove(this.oldVariant.root);
      this.oldVariant.dispose();
      this.oldVariant = null;
    }
    this.transition = null;
    this.variant.setOpacity(1);
    this.variant.setShadows(true);
    this.variant.root.position.y = 0;
    this.renderer.shadowMap.needsUpdate = true;
    this.geometryDirty = true;
    this.invalidate();
  }

  private beginTransition(kind: "material" | "formation") {
    if (this.oldVariant) {
      this.scene.remove(this.oldVariant.root);
      this.oldVariant.dispose();
      this.oldVariant = null;
    }
    if (this.transition) {
      this.transition = null;
    }
    this.variant.setOpacity(1);
    this.variant.setShadows(false);
    this.variant.root.position.y = 0;
    this.oldVariant = this.variant;
    const next = this.createVariant();
    next.setOpacity(0);
    next.setShadows(false);
    next.root.position.y = 0;
    this.variant = next;
    this.scene.add(next.root);
    this.transition = {
      kind,
      elapsed: 0,
      duration:
        kind === "material" ? (this.reducedMotion ? 0.001 : 0.32) : this.reducedMotion ? 0.001 : 0.92,
    };
    if (kind === "formation") this.assembly = this.reducedMotion ? 1 : 0;
    this.geometryDirty = true;
    this.invalidate();
  }

  private handleResize = () => {
    const rect = this.container.getBoundingClientRect();
    if (rect.width < 2 || rect.height < 2) return;
    this.width = rect.width;
    this.height = rect.height;
    const dpr = Math.min(
      window.devicePixelRatio || 1,
      this.lowPower ? 1.35 : 2,
    );
    this.renderer.setPixelRatio(dpr);
    this.renderer.setSize(rect.width, rect.height, false);
    this.camera.aspect = rect.width / rect.height;
    this.camera.updateProjectionMatrix();
    this.targetBaseDistance = this.computeBaseDistance(this.camera.aspect);
    if (this.reducedMotion) this.baseDistance = this.targetBaseDistance;
    this.invalidate();
  };

  private measureQuality(dt: number) {
    if (this.qualityChecked || this.reducedMotion) return;
    if (dt > 0.008 && dt < 0.1) this.fpsSamples.push(dt);
    if (this.fpsSamples.length < 80) return;
    this.fpsSamples.sort((a, b) => a - b);
    const median = this.fpsSamples[Math.floor(this.fpsSamples.length * 0.55)];
    this.qualityChecked = true;
    if (median > 1 / 40 && !this.lowPower) {
      this.lowPower = true;
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.35));
      this.keyLight.shadow.mapSize.set(1024, 1024);
      this.keyLight.shadow.map?.dispose();
      this.keyLight.shadow.map = null;
      this.renderer.shadowMap.needsUpdate = true;
    }
  }

  private render() {
    if (this.disposed) return;
    this.renderer.render(this.scene, this.camera);
  }

  // ---------------------------------------------------------------- interaction

  private pointerToNdc(clientX: number, clientY: number) {
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: ((clientX - rect.left) / rect.width) * 2 - 1,
      y: -((clientY - rect.top) / rect.height) * 2 + 1,
    };
  }

  private raycaster = new THREE.Raycaster();

  private pick(clientX: number, clientY: number): {
    index: number;
    point: THREE.Vector3;
  } | null {
    if (!this.variant) return null;
    const ndc = this.pointerToNdc(clientX, clientY);
    this.pointerNdc.set(ndc.x, ndc.y);
    this.raycaster.setFromCamera(this.pointerNdc, this.camera);
    this.variant.root.updateMatrixWorld(true);
    const hits = this.raycaster.intersectObject(this.variant.pick, false);
    if (!hits.length) return null;
    const point = hits[0].point;
    const count = this.targetValues.length;
    if (this.formation === "terrain") {
      const u = clamp((point.x + WORLD.terrainWidth / 2) / WORLD.terrainWidth, 0, 1);
      return {
        index: datumIndexFromU(count, u),
        point,
      };
    }
    const u =
      Math.atan2(point.z / WORLD.fossilZScale, point.x) / (Math.PI * 2);
    return {
      index: datumIndexFromAngle(count, u),
      point,
    };
  }

  private projectedAnchor(
    index: number,
  ): { x: number; y: number; point: THREE.Vector3 } | null {
    if (!this.variant) return null;
    const point = this.variant.anchor(
      index,
      this.makeFrame(this.assembly),
    );
    const projected = point.clone().project(this.camera);
    if (projected.z > 1) return null;
    return {
      x: (projected.x * 0.5 + 0.5) * this.width,
      y: (-projected.y * 0.5 + 0.5) * this.height,
      point,
    };
  }

  private hitGrip(
    clientX: number,
    clientY: number,
    pointerType: string,
  ): number | null {
    if (this.captureMode) return null;
    const index = this.activeIndex();
    if (index === null) return null;
    const projected = this.projectedAnchor(index);
    if (!projected) return null;
    const threshold =
      pointerType === "touch" || pointerType === "pen" ? 28 : 16;
    const rect = this.canvas.getBoundingClientRect();
    const dx = projected.x - (clientX - rect.left);
    const dy = projected.y - (clientY - rect.top);
    if (Math.hypot(dx, dy) <= threshold) return index;
    return null;
  }

  private onPointerDown = (event: PointerEvent) => {
    if (event.button !== 0 || this.disposed) return;
    const gripIndex = this.captureMode
      ? null
      : this.hitGrip(event.clientX, event.clientY, event.pointerType);
    const pickResult = this.captureMode
      ? null
      : this.pick(event.clientX, event.clientY);

    if (
      gripIndex !== null ||
      (this.sculptMode && pickResult !== null)
    ) {
      const index = gripIndex ?? pickResult!.index;
      this.startSculpt(event, index);
      return;
    }

    this.pointerDown = {
      mode: "orbit",
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      lastX: event.clientX,
      lastY: event.clientY,
      lastTime: performance.now(),
      lastMoveTime: performance.now(),
      pendingSelect: pickResult?.index ?? null,
      moved: false,
      index: -1,
      startValue: 0,
      dragMax: 1,
    };
    this.azimuthVelocity = 0;
    this.canvas.setPointerCapture?.(event.pointerId);
    this.invalidate();
  };

  private startSculpt(event: PointerEvent, index: number) {
    const count = this.targetValues.length;
    const safeIndex = clamp(index, 0, count - 1);
    const startValue = this.targetValues[safeIndex] ?? 0;
    let hasFractions = false;
    for (let i = 0; i < this.targetValues.length; i++) {
      if (!Number.isInteger(this.targetValues[i])) {
        hasFractions = true;
        break;
      }
    }
    this.dragValueStep = hasFractions ? 0.1 : 1;
    this.scaleLocked = true;
    this.lockedMax = valuesMaximum(this.targetValues);
    this.selectedIndex = safeIndex;
    this.draggingIndex = safeIndex;
    this.callbacks.onSelect(safeIndex);
    this.callbacks.onEditStart(safeIndex);
    this.pointerDown = {
      mode: "sculpt",
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      lastX: event.clientX,
      lastY: event.clientY,
      lastTime: performance.now(),
      lastMoveTime: performance.now(),
      pendingSelect: safeIndex,
      moved: false,
      index: safeIndex,
      startValue,
      dragMax: Math.max(1, this.lockedMax),
    };
    this.canvas.setPointerCapture?.(event.pointerId);
    this.canvas.style.cursor = "ns-resize";
    this.invalidate();
  }

  private applySculptPointer(clientY: number) {
    const state = this.pointerDown;
    if (!state || state.mode !== "sculpt") return;
    const delta = state.startY - clientY;
    const raw = clamp(
      state.startValue + (delta / DRAG_PIXELS_PER_SCALE) * state.dragMax,
      0,
      MAX_EDIT_VALUE,
    );
    const value = roundForEditing(
      Math.round(raw / this.dragValueStep) * this.dragValueStep,
    );
    if (Math.abs(value - (this.targetValues[state.index] ?? 0)) < 1e-9) return;
    this.targetValues[state.index] = value;
    this.geometryDirty = true;
    this.highlightDirty = true;
    if (Math.abs(delta) > 2) state.moved = true;
    this.callbacks.onEditValue(state.index, value);
    this.invalidate();
  }

  private updatePointerHover(x: number, y: number, pointerType: string) {
    // x/y are client coordinates.
    this.pointerParallax.x = clamp((x / window.innerWidth) * 2 - 1, -1, 1);
    this.pointerParallax.y = clamp((y / window.innerHeight) * 2 - 1, -1, 1);
    if (this.pointerDown) return;
    const result = this.pick(x, y);
    const next = result?.index ?? null;
    const previousNear = this.pointerNearGrip;
    const projected = next !== null ? this.projectedAnchor(next) : null;
    if (projected) {
      const rect = this.canvas.getBoundingClientRect();
      const dx = projected.x - (x - rect.left);
      const dy = projected.y - (y - rect.top);
      this.pointerNearGrip = Math.hypot(dx, dy) <= 18;
    } else {
      this.pointerNearGrip = false;
    }
    if (next !== this.pointerHover) {
      this.pointerHover = next;
      this.callbacks.onHover(next);
      this.invalidate();
    }
    if (next !== this.pointerHover || previousNear !== this.pointerNearGrip) {
      this.updateCursor(pointerType);
    }
  }

  private updateCursor(pointerType: string) {
    if (this.captureMode) {
      this.canvas.style.cursor = "grab";
      return;
    }
    if (this.draggingIndex !== null) {
      this.canvas.style.cursor = "ns-resize";
      return;
    }
    if (this.sculptMode) {
      this.canvas.style.cursor = this.pointerHover !== null ? "ns-resize" : "grab";
      return;
    }
    if (pointerType === "touch") {
      this.canvas.style.cursor = "default";
      return;
    }
    this.canvas.style.cursor = this.pointerNearGrip ? "ns-resize" : "grab";
  }

  private onPointerMove = (event: PointerEvent) => {
    if (this.disposed) return;
    const state = this.pointerDown;
    if (state) {
      const now = performance.now();
      const dt = Math.max(0.008, (now - state.lastMoveTime) / 1000);
      const dx = event.clientX - state.lastX;
      const dy = event.clientY - state.lastY;
      if (state.mode === "orbit") {
        if (Math.hypot(event.clientX - state.startX, event.clientY - state.startY) > 4) {
          state.moved = true;
        }
        this.azimuth -= dx * 0.32;
        this.targetAzimuth = this.azimuth;
        this.elevation = clamp(
          this.elevation + dy * 0.25,
          MIN_ELEVATION,
          MAX_ELEVATION,
        );
        this.targetElevation = this.elevation;
        const angularVelocity = (-dx * 0.32) / dt;
        this.azimuthVelocity =
          this.azimuthVelocity * 0.65 + angularVelocity * 0.35;
        state.lastX = event.clientX;
        state.lastY = event.clientY;
        state.lastTime = now;
        state.lastMoveTime = now;
        this.invalidate();
        return;
      }
      if (state.mode === "sculpt") {
        this.applySculptPointer(event.clientY);
        state.lastY = event.clientY;
        state.lastMoveTime = now;
        return;
      }
      return;
    }

    this.pendingPointer = {
      x: event.clientX,
      y: event.clientY,
      pointerType: event.pointerType,
    };
    this.pointerDirty = true;
    this.invalidate();
  };

  private releasePointer(event: PointerEvent) {
    if (this.canvas.hasPointerCapture?.(event.pointerId)) {
      this.canvas.releasePointerCapture?.(event.pointerId);
    }
  }

  private onPointerUp = (event: PointerEvent) => {
    const state = this.pointerDown;
    if (!state) return;
    this.releasePointer(event);
    this.pointerDown = null;

    if (state.mode === "sculpt") {
      this.scaleLocked = false;
      this.targetMax = valuesMaximum(this.targetValues);
      this.draggingIndex = null;
      this.callbacks.onEditEnd();
      this.updateCursor(event.pointerType);
      this.reportCamera(true);
      this.invalidate();
      return;
    }

    if (!state.moved && !this.captureMode) {
      this.select(state.pendingSelect);
    }
    if (this.reducedMotion) this.azimuthVelocity = 0;
    this.updateCursor(event.pointerType);
    this.reportCamera(true);
    this.invalidate();
  };

  private onPointerCancel = (event: PointerEvent) => {
    const state = this.pointerDown;
    if (!state) return;
    this.releasePointer(event);
    this.pointerDown = null;
    if (state.mode === "sculpt") {
      this.scaleLocked = false;
      this.targetMax = valuesMaximum(this.targetValues);
      this.draggingIndex = null;
      this.callbacks.onEditEnd();
    }
    this.updateCursor(event.pointerType);
    this.invalidate();
  };

  private onPointerLeave = () => {
    if (this.pointerDown) return;
    if (this.pointerHover !== null) {
      this.pointerHover = null;
      this.callbacks.onHover(null);
      this.invalidate();
    }
    this.pointerParallax.x *= 0.2;
    this.pointerParallax.y *= 0.2;
    this.invalidate();
  };

  private onContextLost = (event: Event) => {
    event.preventDefault();
    this.stopLoop();
    this.callbacks.onContextLost();
  };

  private onContextRestored = () => {
    // The React boundary remounts the stage on loss; this is a safety net for
    // browsers that restore quickly before the remount is requested.
    this.invalidate();
  };

  private onVisibilityChange = () => {
    if (!document.hidden) {
      this.lastFrameTime = 0;
      this.invalidate();
    }
  };

  private onReducedMotionChange = (event: MediaQueryListEvent) => {
    this.reducedMotion = event.matches;
    if (this.reducedMotion) {
      this.assembly = 1;
      this.currentValues.set(this.targetValues);
      this.currentMax = this.targetMax;
      this.currentRelief = this.targetRelief;
      this.valueVelocities.fill(0);
      this.maxVelocity = 0;
      this.reliefVelocity = 0;
      this.azimuthVelocity = 0;
      if (this.transition) this.finishTransition();
    }
    this.invalidate();
  };

  private activeIndex(): number | null {
    if (this.draggingIndex !== null) return this.draggingIndex;
    if (this.manualHighlight !== null) return this.manualHighlight;
    if (this.pointerHover !== null) return this.pointerHover;
    return this.selectedIndex;
  }

  private updateHighlight(frame: SculptureFrame, now: number) {
    void now;
    if (this.captureMode) {
      this.highlight.visible = false;
      this.grip.visible = false;
      this.gripHalo.visible = false;
      this.gripStem.visible = false;
      this.gripHit.visible = false;
      this.overlay.dataset.visible = "false";
      return;
    }
    if (this.transition?.kind === "formation") {
      this.highlight.visible = false;
      this.grip.visible = false;
      this.gripHalo.visible = false;
      this.gripStem.visible = false;
      this.gripHit.visible = false;
      this.overlay.dataset.visible = "false";
      return;
    }
    const index = this.activeIndex();
    if (index === null || index < 0 || index >= frame.values.length) {
      this.highlight.visible = false;
      this.grip.visible = false;
      this.gripHalo.visible = false;
      this.gripStem.visible = false;
      this.gripHit.visible = false;
      this.overlay.dataset.visible = "false";
      return;
    }
    const count = this.variant.trace(index, frame, this.highlightPositions);
    this.highlight.geometry.setDrawRange(0, count);
    this.highlight.geometry.attributes.position.needsUpdate = true;
    this.highlight.visible = true;
    this.highlightMaterial.color.set(PALETTE.acidDeep);
    this.highlightMaterial.opacity =
      this.draggingIndex === index
        ? 1
        : this.manualHighlight === index || this.pointerHover === index
          ? 0.92
          : 0.72;

    const anchor = this.variant.anchor(index, frame);
    this.grip.position.copy(anchor);
    this.gripHalo.position.copy(anchor);
    this.gripHit.position.copy(anchor);
    this.grip.visible = true;
    this.gripHalo.visible = true;
    this.gripHit.visible = true;
    const scale =
      this.draggingIndex === index ? 1.2 : this.pointerHover === index ? 1.1 : 1;
    this.grip.scale.setScalar(scale);
    this.gripHalo.scale.setScalar(scale);
    const stem = this.gripStem.geometry.attributes
      .position as THREE.BufferAttribute;
    const stemArray = stem.array as Float32Array;
    stemArray[0] = anchor.x;
    stemArray[1] = anchor.y - 0.24;
    stemArray[2] = anchor.z;
    stemArray[3] = anchor.x;
    stemArray[4] = anchor.y - 0.02;
    stemArray[5] = anchor.z;
    stem.needsUpdate = true;
    this.gripStem.visible = true;
    (this.gripStem.material as THREE.LineBasicMaterial).opacity = 0.55;
  }

  private updateOverlay(frame: SculptureFrame) {
    const index = this.activeIndex();
    if (
      this.captureMode ||
      index === null ||
      this.transition?.kind === "formation"
    ) {
      this.overlay.dataset.visible = "false";
      return;
    }
    const anchor = this.variant.anchor(index, frame);
    const projected = anchor.clone().project(this.camera);
    if (projected.z > 1) {
      this.overlay.dataset.visible = "false";
      return;
    }
    const x = (projected.x * 0.5 + 0.5) * this.width;
    const y = (-projected.y * 0.5 + 0.5) * this.height;
    if (x < -40 || x > this.width + 40 || y < 0 || y > this.height + 40) {
      this.overlay.dataset.visible = "false";
      return;
    }
    const clampedX = clamp(x, 76, Math.max(76, this.width - 76));
    const clampedY = clamp(y, 76, this.height - 16);
    this.overlay.style.transform = `translate3d(${clampedX.toFixed(1)}px, ${(clampedY - 16).toFixed(1)}px, 0) translate(-50%, -100%)`;
    this.overlay.dataset.visible = "true";
  }

  private reportCamera(force: boolean) {
    const now = performance.now();
    if (!force && now - this.lastReport < 80) return;
    const camera: CameraSnapshot = {
      azimuth: Math.round(normalizeDegrees(this.azimuth) * 10) / 10,
      elevation: Math.round(this.elevation * 10) / 10,
      zoom: Math.round(this.zoom * 100) / 100,
    };
    if (
      this.lastReported &&
      Math.abs(this.lastReported.azimuth - camera.azimuth) < 0.05 &&
      Math.abs(this.lastReported.elevation - camera.elevation) < 0.05 &&
      Math.abs(this.lastReported.zoom - camera.zoom) < 0.005
    ) {
      return;
    }
    this.lastReported = camera;
    this.lastReport = now;
    this.callbacks.onCameraChange(camera);
  }

  private select(index: number | null) {
    if (this.captureMode) return;
    if (this.selectedIndex === index) return;
    this.selectedIndex = index;
    this.callbacks.onSelect(index);
    this.invalidate();
  }

  // ---------------------------------------------------------------- public API

  setData(data: Datum[]) {
    if (this.disposed) return;
    const values = data.map((datum) =>
      Number.isFinite(datum.value) ? Math.max(0, datum.value) : 0,
    );
    if (values.length !== this.targetValues.length) {
      if (this.draggingIndex !== null) {
        this.draggingIndex = null;
        this.scaleLocked = false;
        this.callbacks.onEditEnd();
      }
      const nextCurrent = new Float32Array(values.length);
      const nextVelocity = new Float32Array(values.length);
      if (this.currentValues.length > 0 && values.length > 1) {
        for (let i = 0; i < values.length; i++) {
          nextCurrent[i] = sampleSeries(this.currentValues, i / (values.length - 1));
        }
      }
      this.currentValues = nextCurrent;
      this.valueVelocities = nextVelocity;
      this.targetValues = Float32Array.from(values);
      this.currentMax = valuesMaximum(this.currentValues);
      this.targetMax = valuesMaximum(values);
      const previousSelected = this.selectedIndex;
      this.selectedIndex =
        this.selectedIndex !== null && this.selectedIndex < values.length
          ? this.selectedIndex
          : null;
      if (previousSelected !== null && this.selectedIndex === null) {
        this.callbacks.onSelect(null);
      }
      if (this.pointerHover !== null) {
        this.pointerHover = null;
        this.callbacks.onHover(null);
      }
      this.manualHighlight = null;
      this.lastActiveIndex = this.selectedIndex;
      this.geometryDirty = true;
      this.highlightDirty = true;
      this.invalidate();
      return;
    }
    let changed = false;
    for (let i = 0; i < values.length; i++) {
      if (Math.abs(values[i] - this.targetValues[i]) > 1e-7) {
        this.targetValues[i] = values[i];
        changed = true;
      }
    }
    if (!changed) return;
    if (!this.scaleLocked) {
      this.targetMax = valuesMaximum(this.targetValues);
    }
    this.geometryDirty = true;
    this.invalidate();
  }

  setRelief(relief: number) {
    if (this.disposed) return;
    const next = clamp(relief, RELIEF_MIN, RELIEF_MAX);
    if (Math.abs(next - this.targetRelief) < 1e-7) return;
    this.targetRelief = next;
    this.geometryDirty = true;
    this.invalidate();
  }

  setFormation(formation: Formation) {
    if (this.disposed || formation === this.formation) return;
    this.formation = formation;
    this.targetFocusY = formation === "terrain" ? -0.14 : -0.18;
    this.targetBaseDistance = this.computeBaseDistance(this.camera.aspect);
    this.beginTransition("formation");
    this.invalidate();
  }

  setMaterial(material: Material) {
    if (this.disposed || material === this.material) return;
    this.material = material;
    this.beginTransition("material");
    this.invalidate();
  }

  setSelected(index: number | null) {
    if (this.disposed) return;
    if (
      index !== null &&
      (index < 0 || index >= this.targetValues.length)
    ) {
      index = null;
    }
    this.selectedIndex = index;
    this.invalidate();
  }

  setHighlight(index: number | null) {
    if (this.disposed) return;
    if (index !== this.manualHighlight) {
      this.manualHighlight = index;
      this.invalidate();
    }
  }

  setSculptMode(enabled: boolean) {
    if (this.sculptMode === enabled) return;
    this.sculptMode = enabled;
    this.canvas.style.touchAction = enabled ? "none" : "pan-y";
    this.updateCursor("mouse");
    this.invalidate();
  }

  setCaptureMode(enabled: boolean) {
    if (this.captureMode === enabled) return;
    this.captureMode = enabled;
    this.highlight.visible = false;
    this.grip.visible = false;
    this.gripHalo.visible = false;
    this.gripStem.visible = false;
    this.gripHit.visible = false;
    this.overlay.dataset.visible = "false";
    this.updateCursor("mouse");
    this.highlightDirty = true;
    this.invalidate();
  }

  setCamera(camera: CameraSnapshot) {
    if (this.disposed) return;
    const nearestAzimuth =
      this.azimuth +
      normalizeDegrees(camera.azimuth - this.azimuth);
    this.targetAzimuth = nearestAzimuth;
    this.targetElevation = clamp(
      camera.elevation,
      MIN_ELEVATION,
      MAX_ELEVATION,
    );
    this.targetZoom = clamp(camera.zoom, MIN_ZOOM, MAX_ZOOM);
    this.azimuthVelocity = 0;
    if (this.reducedMotion) {
      this.azimuth = this.targetAzimuth;
      this.elevation = this.targetElevation;
      this.zoom = this.targetZoom;
    }
    this.invalidate();
  }

  resetCamera() {
    this.setCamera(DEFAULT_CAMERA);
  }

  zoomBy(factor: number) {
    this.targetZoom = clamp(this.targetZoom * factor, MIN_ZOOM, MAX_ZOOM);
    this.invalidate();
  }

  getCamera(): CameraSnapshot {
    return {
      azimuth: Math.round(normalizeDegrees(this.azimuth) * 10) / 10,
      elevation: Math.round(this.elevation * 10) / 10,
      zoom: Math.round(this.zoom * 100) / 100,
    };
  }

  private async captureDataUrl(width: number, height: number) {
    const renderer = this.renderer;
    const oldSize = renderer.getSize(new THREE.Vector2());
    const oldPixelRatio = renderer.getPixelRatio();
    const oldAspect = this.camera.aspect;
    const oldClear = new THREE.Color();
    renderer.getClearColor(oldClear);
    const oldAlpha = renderer.getClearAlpha();
    const oldPosition = this.camera.position.clone();
    const oldQuaternion = this.camera.quaternion.clone();

    renderer.setPixelRatio(1);
    renderer.setSize(width, height, false);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    const distance =
      this.computeBaseDistance(this.camera.aspect) * this.zoom * 1.015;
    this.positionCamera(distance);
    renderer.setClearColor(0xefece2, 1);
    renderer.shadowMap.needsUpdate = true;
    renderer.render(this.scene, this.camera);
    const dataUrl = renderer.domElement.toDataURL("image/png");

    renderer.setPixelRatio(oldPixelRatio);
    renderer.setSize(oldSize.x, oldSize.y, false);
    this.camera.aspect = oldAspect;
    this.camera.updateProjectionMatrix();
    this.camera.position.copy(oldPosition);
    this.camera.quaternion.copy(oldQuaternion);
    this.camera.updateMatrixWorld();
    renderer.setClearColor(oldClear, oldAlpha);
    this.render();
    return dataUrl;
  }

  async capturePng(meta: CaptureMeta): Promise<Blob> {
    if (this.captureInProgress) throw new Error("A capture is already running.");
    this.captureInProgress = true;
    try {
      const dataUrl = await this.captureDataUrl(2400, 1600);
      const image = await loadImage(dataUrl);
      return await composeCleanPng(image, meta);
    } finally {
      this.captureInProgress = false;
    }
  }

  async capturePoster(meta: CaptureMeta): Promise<Blob> {
    if (this.captureInProgress) throw new Error("A capture is already running.");
    this.captureInProgress = true;
    try {
      const dataUrl = await this.captureDataUrl(2000, 1650);
      const image = await loadImage(dataUrl);
      return await composePoster(image, meta);
    } finally {
      this.captureInProgress = false;
    }
  }

  dispose() {
    if (this.disposed) return;
    this.disposed = true;
    this.stopLoop();
    this.resizeObserver.disconnect();
    this.intersectionObserver.disconnect();
    document.removeEventListener("visibilitychange", this.onVisibilityChange);
    this.mediaQuery.removeEventListener("change", this.onReducedMotionChange);
    this.canvas.removeEventListener("pointerdown", this.onPointerDown);
    this.canvas.removeEventListener("pointermove", this.onPointerMove);
    this.canvas.removeEventListener("pointerup", this.onPointerUp);
    this.canvas.removeEventListener("pointercancel", this.onPointerCancel);
    this.canvas.removeEventListener("pointerleave", this.onPointerLeave);
    this.canvas.removeEventListener("webglcontextlost", this.onContextLost);
    this.canvas.removeEventListener(
      "webglcontextrestored",
      this.onContextRestored,
    );
    const variants = new Set<SculptureVariant>();
    if (this.variant) variants.add(this.variant);
    if (this.oldVariant) variants.add(this.oldVariant);
    for (const variant of variants) variant.dispose();
    this.grip.geometry.dispose();
    (this.grip.material as THREE.Material).dispose();
    this.gripHalo.geometry.dispose();
    (this.gripHalo.material as THREE.Material).dispose();
    this.gripHit.geometry.dispose();
    (this.gripHit.material as THREE.Material).dispose();
    this.gripStem.geometry.dispose();
    (this.gripStem.material as THREE.Material).dispose();
    this.highlight.geometry.dispose();
    this.highlightMaterial.dispose();
    this.ground.geometry.dispose();
    (this.ground.material as THREE.Material).dispose();
    this.keyLight.shadow.map?.dispose();
    this.environment?.dispose();
    this.renderer.dispose();
    this.canvas.remove();
    try {
      this.renderer.forceContextLoss();
    } catch {
      // Some browsers throw after disposal; the canvas is already detached.
    }
  }

  private stopLoop() {
    if (this.frameRequest) cancelAnimationFrame(this.frameRequest);
    this.frameRequest = 0;
  }
}
