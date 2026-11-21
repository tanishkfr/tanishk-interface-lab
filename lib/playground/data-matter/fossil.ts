import * as THREE from "three";
import {
  WORLD,
  fossilLayerY,
  fossilWorldDisplacement,
} from "./dimensions";
import { FOSSIL_LAYERS, sampleSeriesCyclic } from "./model";
import {
  PALETTE,
  applyVariantOpacity,
  createContactShadow,
  createEllipticBlueprintPlate,
  createFossilPlinth,
  disposeObject,
  setShadows,
} from "./primitives";
import type { SculptureFrame, SculptureVariant } from "./types";

const SEGMENTS = WORLD.fossilSegments;
const LAYERS = FOSSIL_LAYERS;
const PLATE_RADIUS = 5.45;

const COS = new Float32Array(SEGMENTS);
const SIN = new Float32Array(SEGMENTS);
for (let i = 0; i < SEGMENTS; i++) {
  const angle = (i / SEGMENTS) * Math.PI * 2;
  COS[i] = Math.cos(angle);
  SIN[i] = Math.sin(angle);
}

function sampleRing(frame: SculptureFrame): Float32Array {
  const out = new Float32Array(SEGMENTS);
  const scale = frame.max > 0 ? 1 / frame.max : 0;
  for (let i = 0; i < SEGMENTS; i++) {
    out[i] = sampleSeriesCyclic(frame.values, i / SEGMENTS) * scale;
  }
  return out;
}

function radiusFor(
  normalized: number,
  layer: number,
  relief: number,
): number {
  return (
    WORLD.fossilBaseRadius +
    layer * WORLD.fossilRadiusStep +
    normalized *
      fossilWorldDisplacement(relief) *
      Math.sin(((layer + 2) / 34) * Math.PI)
  );
}

function fossilAngle(index: number, count: number): number {
  return (Math.max(0, Math.min(count - 1, index)) / Math.max(1, count)) *
    Math.PI * 2;
}

function fossilDataU(index: number, count: number): number {
  return Math.max(0, Math.min(count - 1, index)) / Math.max(1, count);
}

function buildFossilPickMesh(): {
  mesh: THREE.Mesh;
  update(frame: SculptureFrame): void;
} {
  const rows = 32;
  const cols = 96;
  const vertexCount = rows * cols;
  const positions = new Float32Array(vertexCount * 3);
  const indices: number[] = [];
  for (let r = 0; r < rows; r++) {
    const layer = (r / (rows - 1)) * (LAYERS - 1);
    for (let c = 0; c < cols; c++) {
      const i = (r * cols + c) * 3;
      const angle = (c / cols) * Math.PI * 2;
      const radius = WORLD.fossilBaseRadius + layer * WORLD.fossilRadiusStep;
      positions[i] = Math.cos(angle) * radius;
      positions[i + 1] = fossilLayerY(layer);
      positions[i + 2] = Math.sin(angle) * radius * WORLD.fossilZScale;
    }
  }
  for (let r = 0; r < rows - 1; r++) {
    for (let c = 0; c < cols; c++) {
      const n = (c + 1) % cols;
      const a = r * cols + c;
      const b = (r + 1) * cols + c;
      const d = r * cols + n;
      const e = (r + 1) * cols + n;
      indices.push(a, b, d, d, b, e);
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  const material = new THREE.MeshBasicMaterial({
    visible: false,
    side: THREE.DoubleSide,
  });
  const mesh = new THREE.Mesh(geometry, material);
  return {
    mesh,
    update(frame) {
      const ring = sampleRing(frame);
      for (let r = 0; r < rows; r++) {
        const layer = (r / (rows - 1)) * (LAYERS - 1);
        for (let c = 0; c < cols; c++) {
          const angle = (c / cols) * Math.PI * 2;
          const n = Math.round((c / cols) * SEGMENTS) % SEGMENTS;
          const radius = radiusFor(ring[n], layer, frame.relief);
          const i = (r * cols + c) * 3;
          positions[i] = Math.cos(angle) * radius;
          positions[i + 1] = fossilLayerY(layer);
          positions[i + 2] = Math.sin(angle) * radius * WORLD.fossilZScale;
        }
      }
      geometry.attributes.position.needsUpdate = true;
      geometry.computeBoundingSphere();
    },
  };
}

function createHubLine(radius: number, y: number): THREE.Line {
  const points: THREE.Vector3[] = [];
  for (let i = 0; i <= 64; i++) {
    const angle = (i / 64) * Math.PI * 2;
    points.push(
      new THREE.Vector3(
        Math.cos(angle) * radius,
        y,
        Math.sin(angle) * radius * WORLD.fossilZScale,
      ),
    );
  }
  return new THREE.Line(
    new THREE.BufferGeometry().setFromPoints(points),
    new THREE.LineBasicMaterial({
      color: PALETTE.stoneDark,
      transparent: true,
      opacity: 0.45,
    }),
  );
}

function createFossilHub(radius: number, topY: number): THREE.Group {
  const group = new THREE.Group();
  const geometry = new THREE.CylinderGeometry(radius, radius, 0.11, 72);
  const material = new THREE.MeshStandardMaterial({
    color: PALETTE.paper,
    roughness: 0.72,
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.scale.z = WORLD.fossilZScale;
  mesh.position.y = topY - 0.055;
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  group.add(mesh);
  group.add(createHubLine(radius - 0.015, topY + 0.003));
  return group;
}

function easeOutCubic(t: number): number {
  const x = Math.min(1, Math.max(0, t));
  return 1 - Math.pow(1 - x, 3);
}

export function createFossilStrata(): SculptureVariant {
  const root = new THREE.Group();
  root.add(createFossilPlinth(PLATE_RADIUS));
  root.add(createContactShadow(13.2, 11.2));

  const verticesPerRing = SEGMENTS * 6;
  const vertexCount = LAYERS * verticesPerRing;
  const positions = new Float32Array(vertexCount * 3);
  const normals = new Float32Array(vertexCount * 3);
  const indices: number[] = [];

  const nx = new Float32Array(SEGMENTS);
  const nz = new Float32Array(SEGMENTS);
  for (let i = 0; i < SEGMENTS; i++) {
    const x = COS[i];
    const z = SIN[i] / WORLD.fossilZScale;
    const length = Math.hypot(x, z) || 1;
    nx[i] = x / length;
    nz[i] = z / length;
  }

  for (let layer = 0; layer < LAYERS; layer++) {
    const ringBase = layer * verticesPerRing;
    for (let c = 0; c < SEGMENTS; c++) {
      const base = (ringBase + c * 6) * 3;
      const inward = [-nx[c], 0, -nz[c]] as const;
      const outward = [nx[c], 0, nz[c]] as const;
      normals.set(inward, base);
      normals.set(inward, base + 3);
      normals.set(outward, base + 6);
      normals.set(outward, base + 9);
      normals.set([0, 1, 0], base + 12);
      normals.set([0, 1, 0], base + 15);
    }
  }
  for (let layer = 0; layer < LAYERS; layer++) {
    const ringBase = layer * verticesPerRing;
    for (let c = 0; c < SEGMENTS; c++) {
      const n = (c + 1) % SEGMENTS;
      const a = ringBase + c * 6;
      const b = ringBase + n * 6;
      indices.push(
        a + 0, b + 0, b + 1, a + 0, b + 1, a + 1,
        a + 2, a + 3, b + 3, a + 2, b + 3, b + 2,
        a + 4, b + 5, a + 5, a + 4, b + 4, b + 5,
      );
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("normal", new THREE.BufferAttribute(normals, 3));
  geometry.setIndex(indices);
  const material = new THREE.MeshStandardMaterial({
    color: 0xe9dfcc,
    roughness: 0.82,
    metalness: 0,
    side: THREE.DoubleSide,
  });
  const walls = new THREE.Mesh(geometry, material);
  walls.castShadow = true;
  walls.receiveShadow = true;
  walls.frustumCulled = false;
  root.add(walls);

  const hub = createFossilHub(
    Math.max(0.55, WORLD.fossilBaseRadius - WORLD.fossilWallWidth * 1.6),
    fossilLayerY(0) + WORLD.fossilWallHeight,
  );
  root.add(hub);

  const pick = buildFossilPickMesh();
  root.add(pick.mesh);

  function update(frame: SculptureFrame) {
    const ring = sampleRing(frame);
    const displacement = fossilWorldDisplacement(frame.relief);
    const half = WORLD.fossilWallWidth / 2;
    for (let layer = 0; layer < LAYERS; layer++) {
      const stagger = (LAYERS - 1 - layer) * 0.0125;
      const local = Math.min(1, Math.max(0, (frame.emergence - stagger) / 0.62));
      const emerge = easeOutCubic(local);
      const baseY = fossilLayerY(layer) - (1 - emerge) * 0.55;
      const topY = baseY + WORLD.fossilWallHeight * emerge;
      const envelope = Math.sin(((layer + 2) / 34) * Math.PI);
      for (let c = 0; c < SEGMENTS; c++) {
        const radius =
          WORLD.fossilBaseRadius +
          layer * WORLD.fossilRadiusStep +
          ring[c] * displacement * envelope;
        const inner = radius - half;
        const outer = radius + half;
        const base = (layer * SEGMENTS + c) * 6 * 3;
        const ix = COS[c] * inner;
        const iz = SIN[c] * inner * WORLD.fossilZScale;
        const ox = COS[c] * outer;
        const oz = SIN[c] * outer * WORLD.fossilZScale;
        positions[base] = ix;
        positions[base + 1] = baseY;
        positions[base + 2] = iz;
        positions[base + 3] = ix;
        positions[base + 4] = topY;
        positions[base + 5] = iz;
        positions[base + 6] = ox;
        positions[base + 7] = baseY;
        positions[base + 8] = oz;
        positions[base + 9] = ox;
        positions[base + 10] = topY;
        positions[base + 11] = oz;
        positions[base + 12] = ix;
        positions[base + 13] = topY;
        positions[base + 14] = iz;
        positions[base + 15] = ox;
        positions[base + 16] = topY;
        positions[base + 17] = oz;
      }
    }
    geometry.attributes.position.needsUpdate = true;
    geometry.computeBoundingSphere();
    hub.position.y = -(1 - easeOutCubic(frame.emergence)) * 0.55;
    pick.update(frame);
  }

  function anchor(index: number, frame: SculptureFrame): THREE.Vector3 {
    const count = Math.max(2, frame.values.length);
    const angle = fossilAngle(index, count);
    const u = fossilDataU(index, count);
    const normalized = sampleSeriesCyclic(frame.values, u) / frame.max;
    const radius = radiusFor(normalized, 0, frame.relief);
    return new THREE.Vector3(
      Math.cos(angle) * radius,
      fossilLayerY(0) + WORLD.fossilWallHeight + 0.26,
      Math.sin(angle) * radius * WORLD.fossilZScale,
    );
  }

  function trace(index: number, frame: SculptureFrame, out: Float32Array): number {
    const count = Math.max(2, frame.values.length);
    const angle = fossilAngle(index, count);
    const u = fossilDataU(index, count);
    const normalized = sampleSeriesCyclic(frame.values, u) / frame.max;
    for (let layer = 0; layer < LAYERS; layer++) {
      const radius = radiusFor(normalized, layer, frame.relief);
      out[layer * 3] = Math.cos(angle) * radius;
      out[layer * 3 + 1] =
        fossilLayerY(layer) + WORLD.fossilWallHeight + 0.015;
      out[layer * 3 + 2] =
        Math.sin(angle) * radius * WORLD.fossilZScale;
    }
    return LAYERS;
  }

  return {
    root,
    pick: pick.mesh,
    update,
    anchor,
    trace,
    setOpacity(opacity) {
      applyVariantOpacity(root, opacity);
    },
    setShadows(enabled) {
      setShadows(root, enabled);
    },
    dispose() {
      disposeObject(root);
    },
  };
}

export function createFossilPorcelain(): SculptureVariant {
  const root = new THREE.Group();
  root.add(createFossilPlinth(PLATE_RADIUS));
  root.add(createContactShadow(13.2, 11.2));

  const rows = WORLD.fossilGridRows;
  const cols = SEGMENTS;
  const topCount = rows * cols;
  const bottomCount = cols;
  const vertexCount = topCount + bottomCount + 1;
  const centerIndex = vertexCount - 1;
  const positions = new Float32Array(vertexCount * 3);
  const colors = new Float32Array(vertexCount * 3);
  const indices: number[] = [];
  const porcelainColor = new THREE.Color(0xe3dccb);
  const shadeColor = new THREE.Color(0xc6bba5);

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const i = (r * cols + c) * 3;
      colors.set([porcelainColor.r, porcelainColor.g, porcelainColor.b], i);
    }
  }
  for (let c = 0; c < cols; c++) {
    const i = (topCount + c) * 3;
    colors.set([shadeColor.r, shadeColor.g, shadeColor.b], i);
  }
  colors.set([shadeColor.r, shadeColor.g, shadeColor.b], centerIndex * 3);

  for (let r = 0; r < rows - 1; r++) {
    for (let c = 0; c < cols; c++) {
      const n = (c + 1) % cols;
      const a = r * cols + c;
      const b = (r + 1) * cols + c;
      const d = r * cols + n;
      const e = (r + 1) * cols + n;
      indices.push(a, d, b, d, e, b);
    }
  }
  for (let c = 0; c < cols; c++) {
    const n = (c + 1) % cols;
    indices.push(centerIndex, n, c);
  }
  const outerRow = (rows - 1) * cols;
  for (let c = 0; c < cols; c++) {
    const n = (c + 1) % cols;
    const a = outerRow + c;
    const b = outerRow + n;
    const d = topCount + c;
    const e = topCount + n;
    indices.push(a, b, d, b, e, d);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  geometry.setIndex(indices);
  const material = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    vertexColors: true,
    roughness: 0.4,
    metalness: 0,
    clearcoat: 0.32,
    clearcoatRoughness: 0.4,
    envMapIntensity: 0.35,
    side: THREE.DoubleSide,
  });
  const shell = new THREE.Mesh(geometry, material);
  shell.castShadow = true;
  shell.receiveShadow = true;
  shell.frustumCulled = false;
  root.add(shell);

  // One quiet glaze line per encoded contour: exactly 32 lines, matching the
  // data layers rather than the loft resolution.
  const glazePositions = new Float32Array(FOSSIL_LAYERS * cols * 2 * 3);
  const glazeGeometry = new THREE.BufferGeometry();
  glazeGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(glazePositions, 3),
  );
  const glaze = new THREE.LineSegments(
    glazeGeometry,
    new THREE.LineBasicMaterial({
      color: 0x8a7c63,
      transparent: true,
      opacity: 0.17,
    }),
  );
  glaze.frustumCulled = false;
  root.add(glaze);

  const pick = buildFossilPickMesh();
  root.add(pick.mesh);

  function update(frame: SculptureFrame) {
    const ring = sampleRing(frame);
    const displacement = fossilWorldDisplacement(frame.relief);
    const emerge = easeOutCubic(frame.emergence);
    for (let r = 0; r < rows; r++) {
      const layer = (r / (rows - 1)) * (LAYERS - 1);
      const y =
        WORLD.plinthTop +
        (fossilLayerY(layer) - WORLD.plinthTop) * emerge;
      const envelope = Math.sin(((layer + 2) / 34) * Math.PI);
      for (let c = 0; c < cols; c++) {
        const radius =
          WORLD.fossilBaseRadius +
          layer * WORLD.fossilRadiusStep +
          ring[c] * displacement * envelope;
        const i = (r * cols + c) * 3;
        positions[i] = COS[c] * radius;
        positions[i + 1] = y;
        positions[i + 2] = SIN[c] * radius * WORLD.fossilZScale;
      }
    }
    positions[centerIndex * 3] = 0;
    positions[centerIndex * 3 + 1] =
      WORLD.plinthTop +
      (fossilLayerY(0) - WORLD.plinthTop) * emerge +
      0.001;
    positions[centerIndex * 3 + 2] = 0;
    const outerRow = (rows - 1) * cols;
    for (let c = 0; c < cols; c++) {
      const i = (topCount + c) * 3;
      positions[i] = positions[(outerRow + c) * 3];
      positions[i + 1] = WORLD.plinthTop;
      positions[i + 2] = positions[(outerRow + c) * 3 + 2];
    }
    geometry.attributes.position.needsUpdate = true;
    geometry.computeVertexNormals();
    geometry.computeBoundingSphere();
    let cursor = 0;
    for (let layer = 0; layer < FOSSIL_LAYERS; layer++) {
      const r = Math.round((layer / (FOSSIL_LAYERS - 1)) * (rows - 1));
      for (let c = 0; c < cols; c++) {
        const n = (c + 1) % cols;
        glazePositions[cursor++] = positions[(r * cols + c) * 3];
        glazePositions[cursor++] = positions[(r * cols + c) * 3 + 1] + 0.004;
        glazePositions[cursor++] = positions[(r * cols + c) * 3 + 2];
        glazePositions[cursor++] = positions[(r * cols + n) * 3];
        glazePositions[cursor++] = positions[(r * cols + n) * 3 + 1] + 0.004;
        glazePositions[cursor++] = positions[(r * cols + n) * 3 + 2];
      }
    }
    glazeGeometry.attributes.position.needsUpdate = true;
    glazeGeometry.computeBoundingSphere();
    pick.update(frame);
  }

  function anchor(index: number, frame: SculptureFrame): THREE.Vector3 {
    const count = Math.max(2, frame.values.length);
    const angle = fossilAngle(index, count);
    const u = fossilDataU(index, count);
    const normalized = sampleSeriesCyclic(frame.values, u) / frame.max;
    const radius = radiusFor(normalized, 0, frame.relief);
    return new THREE.Vector3(
      Math.cos(angle) * radius,
      fossilLayerY(0) + 0.26,
      Math.sin(angle) * radius * WORLD.fossilZScale,
    );
  }

  function trace(index: number, frame: SculptureFrame, out: Float32Array): number {
    const count = Math.max(2, frame.values.length);
    const angle = fossilAngle(index, count);
    const u = fossilDataU(index, count);
    const normalized = sampleSeriesCyclic(frame.values, u) / frame.max;
    for (let layer = 0; layer < LAYERS; layer++) {
      const radius = radiusFor(normalized, layer, frame.relief);
      out[layer * 3] = Math.cos(angle) * radius;
      out[layer * 3 + 1] = fossilLayerY(layer) + 0.02;
      out[layer * 3 + 2] =
        Math.sin(angle) * radius * WORLD.fossilZScale;
    }
    return LAYERS;
  }

  return {
    root,
    pick: pick.mesh,
    update,
    anchor,
    trace,
    setOpacity(opacity) {
      applyVariantOpacity(root, opacity);
    },
    setShadows(enabled) {
      setShadows(root, enabled);
    },
    dispose() {
      disposeObject(root);
    },
  };
}

export function createFossilBlueprint(): SculptureVariant {
  const root = new THREE.Group();
  root.add(createEllipticBlueprintPlate(PLATE_RADIUS));
  root.add(createContactShadow(13.6, 11.6));

  const contourVertices = LAYERS * SEGMENTS * 2;
  const contourPositions = new Float32Array(contourVertices * 3);
  const contourGeometry = new THREE.BufferGeometry();
  contourGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(contourPositions, 3),
  );
  const contourMaterial = new THREE.LineBasicMaterial({
    color: PALETTE.graphite,
    transparent: true,
    opacity: 0.8,
    toneMapped: false,
  });
  const contours = new THREE.LineSegments(contourGeometry, contourMaterial);
  contours.frustumCulled = false;
  root.add(contours);

  const spokes = 16;
  const spokePositions = new Float32Array(spokes * (LAYERS - 1) * 2 * 3);
  const spokeGeometry = new THREE.BufferGeometry();
  spokeGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(spokePositions, 3),
  );
  const spokeMaterial = new THREE.LineBasicMaterial({
    color: PALETTE.graphiteSoft,
    transparent: true,
    opacity: 0.32,
    toneMapped: false,
  });
  const radial = new THREE.LineSegments(spokeGeometry, spokeMaterial);
  radial.frustumCulled = false;
  root.add(radial);

  root.add(createHubLine(0.55, fossilLayerY(0) + 0.01));

  const pick = buildFossilPickMesh();
  root.add(pick.mesh);

  function update(frame: SculptureFrame) {
    const ring = sampleRing(frame);
    const displacement = fossilWorldDisplacement(frame.relief);
    const emerge = easeOutCubic(frame.emergence);
    const radii = new Float32Array(SEGMENTS);
    let cursor = 0;
    for (let layer = 0; layer < LAYERS; layer++) {
      const y =
        WORLD.plinthTop +
        (fossilLayerY(layer) - WORLD.plinthTop) * emerge;
      const envelope = Math.sin(((layer + 2) / 34) * Math.PI);
      for (let c = 0; c < SEGMENTS; c++) {
        radii[c] =
          WORLD.fossilBaseRadius +
          layer * WORLD.fossilRadiusStep +
          ring[c] * displacement * envelope;
      }
      for (let c = 0; c < SEGMENTS; c++) {
        const n = (c + 1) % SEGMENTS;
        contourPositions[cursor++] = COS[c] * radii[c];
        contourPositions[cursor++] = y;
        contourPositions[cursor++] = SIN[c] * radii[c] * WORLD.fossilZScale;
        contourPositions[cursor++] = COS[n] * radii[n];
        contourPositions[cursor++] = y;
        contourPositions[cursor++] = SIN[n] * radii[n] * WORLD.fossilZScale;
      }
    }
    contourGeometry.attributes.position.needsUpdate = true;
    contourGeometry.computeBoundingSphere();

    cursor = 0;
    for (let s = 0; s < spokes; s++) {
      const c = Math.round((s / spokes) * SEGMENTS) % SEGMENTS;
      for (let layer = 0; layer < LAYERS - 1; layer++) {
        const envelope0 = Math.sin(((layer + 2) / 34) * Math.PI);
        const envelope1 = Math.sin(((layer + 3) / 34) * Math.PI);
        const r0 =
          WORLD.fossilBaseRadius +
          layer * WORLD.fossilRadiusStep +
          ring[c] * displacement * envelope0;
        const r1 =
          WORLD.fossilBaseRadius +
          (layer + 1) * WORLD.fossilRadiusStep +
          ring[c] * displacement * envelope1;
        const y0 =
          WORLD.plinthTop +
          (fossilLayerY(layer) - WORLD.plinthTop) * emerge;
        const y1 =
          WORLD.plinthTop +
          (fossilLayerY(layer + 1) - WORLD.plinthTop) * emerge;
        spokePositions[cursor++] = COS[c] * r0;
        spokePositions[cursor++] = y0;
        spokePositions[cursor++] = SIN[c] * r0 * WORLD.fossilZScale;
        spokePositions[cursor++] = COS[c] * r1;
        spokePositions[cursor++] = y1;
        spokePositions[cursor++] = SIN[c] * r1 * WORLD.fossilZScale;
      }
    }
    spokeGeometry.attributes.position.needsUpdate = true;
    spokeGeometry.computeBoundingSphere();
    pick.update(frame);
  }

  function anchor(index: number, frame: SculptureFrame): THREE.Vector3 {
    const count = Math.max(2, frame.values.length);
    const angle = fossilAngle(index, count);
    const u = fossilDataU(index, count);
    const normalized = sampleSeriesCyclic(frame.values, u) / frame.max;
    const radius = radiusFor(normalized, 0, frame.relief);
    return new THREE.Vector3(
      Math.cos(angle) * radius,
      fossilLayerY(0) + 0.26,
      Math.sin(angle) * radius * WORLD.fossilZScale,
    );
  }

  function trace(index: number, frame: SculptureFrame, out: Float32Array): number {
    const count = Math.max(2, frame.values.length);
    const angle = fossilAngle(index, count);
    const u = fossilDataU(index, count);
    const normalized = sampleSeriesCyclic(frame.values, u) / frame.max;
    for (let layer = 0; layer < LAYERS; layer++) {
      const radius = radiusFor(normalized, layer, frame.relief);
      out[layer * 3] = Math.cos(angle) * radius;
      out[layer * 3 + 1] = fossilLayerY(layer) + 0.02;
      out[layer * 3 + 2] =
        Math.sin(angle) * radius * WORLD.fossilZScale;
    }
    return LAYERS;
  }

  return {
    root,
    pick: pick.mesh,
    update,
    anchor,
    trace,
    setOpacity(opacity) {
      applyVariantOpacity(root, opacity);
    },
    setShadows(enabled) {
      setShadows(root, enabled);
    },
    dispose() {
      disposeObject(root);
    },
  };
}
