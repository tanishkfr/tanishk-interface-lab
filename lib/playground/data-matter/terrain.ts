import * as THREE from "three";
import {
  WORLD,
  reliefWorldHeight,
  terrainEnvelopeAt,
  terrainProfile,
  terrainZ,
  TERRAIN_TOP_OFFSET,
} from "./dimensions";
import {
  PALETTE,
  applyVariantOpacity,
  createBlueprintPlate,
  createContactShadow,
  createTerrainPlinth,
  disposeObject,
  setShadows,
} from "./primitives";
import type { SculptureFrame, SculptureVariant } from "./types";

const SEGMENTS = WORLD.terrainColumns;
const LAYERS = WORLD.terrainRibCount;
const LAYER_GAP = WORLD.terrainDepth / (LAYERS - 1);
const SHEET_THICKNESS = LAYER_GAP * 0.52;
const TRACE_SAMPLES = 65;

/**
 * A shared unit-height rib. The 47 Strata sheets share this one buffer and
 * differ only by depth position and vertical scale, so deformation touches the
 * curve once per frame regardless of layer count.
 */
function buildRibGeometry(): {
  geometry: THREE.BufferGeometry;
  profile: Float32Array;
  update(profile: Float32Array): void;
} {
  const verticesPerCurve = SEGMENTS + 1;
  const curveVertices = verticesPerCurve * 4;
  const endVertices = 8;
  const vertexCount = curveVertices + endVertices;
  const positions = new Float32Array(vertexCount * 3);
  const normals = new Float32Array(vertexCount * 3);
  const profile = new Float32Array(verticesPerCurve);

  for (let i = 0; i <= SEGMENTS; i++) {
    const x = (i / SEGMENTS - 0.5) * WORLD.terrainWidth;
    const base = i * 4;
    positions.set([x, 0, SHEET_THICKNESS / 2], (base + 0) * 3);
    positions.set([x, 0, SHEET_THICKNESS / 2], (base + 1) * 3);
    positions.set([x, 0, -SHEET_THICKNESS / 2], (base + 2) * 3);
    positions.set([x, 0, -SHEET_THICKNESS / 2], (base + 3) * 3);
    normals.set([0, 0, 1], (base + 0) * 3);
    normals.set([0, 1, 0], (base + 1) * 3);
    normals.set([0, 0, -1], (base + 2) * 3);
    normals.set([0, 1, 0], (base + 3) * 3);
  }

  const indices: number[] = [];
  for (let i = 0; i < SEGMENTS; i++) {
    const a = i * 4;
    const b = a + 4;
    // Front cap (+z), back cap (-z), top rim (+y). Winding is outward.
    indices.push(a, b + 1, a + 1, a, b, b + 1);
    indices.push(a + 2, a + 3, b + 3, a + 2, b + 3, b + 2);
    indices.push(a + 1, b + 1, b + 3, a + 1, b + 3, a + 3);
  }

  const leftStart = curveVertices;
  const rightStart = curveVertices + 4;
  const xLeft = -WORLD.terrainWidth / 2;
  const xRight = WORLD.terrainWidth / 2;
  positions.set(
    [
      xLeft, 0, SHEET_THICKNESS / 2,
      xLeft, 0, -SHEET_THICKNESS / 2,
      xLeft, 0, -SHEET_THICKNESS / 2,
      xLeft, 0, SHEET_THICKNESS / 2,
    ],
    leftStart * 3,
  );
  positions.set(
    [
      xRight, 0, SHEET_THICKNESS / 2,
      xRight, 0, -SHEET_THICKNESS / 2,
      xRight, 0, -SHEET_THICKNESS / 2,
      xRight, 0, SHEET_THICKNESS / 2,
    ],
    rightStart * 3,
  );
  for (let i = 0; i < 4; i++) {
    normals.set([-1, 0, 0], (leftStart + i) * 3);
    normals.set([1, 0, 0], (rightStart + i) * 3);
  }
  indices.push(
    leftStart,
    leftStart + 2,
    leftStart + 1,
    leftStart,
    leftStart + 3,
    leftStart + 2,
    rightStart,
    rightStart + 1,
    rightStart + 2,
    rightStart,
    rightStart + 2,
    rightStart + 3,
  );

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("normal", new THREE.BufferAttribute(normals, 3));
  geometry.setIndex(indices);

  function update(nextProfile: Float32Array) {
    profile.set(nextProfile);
    for (let i = 0; i < verticesPerCurve; i++) {
      const y = profile[i];
      const base = i * 4;
      positions[(base + 1) * 3 + 1] = y;
      positions[(base + 3) * 3 + 1] = y;
    }
    positions[(leftStart + 2) * 3 + 1] = profile[0];
    positions[(leftStart + 3) * 3 + 1] = profile[0];
    positions[(rightStart + 2) * 3 + 1] = profile[SEGMENTS];
    positions[(rightStart + 3) * 3 + 1] = profile[SEGMENTS];
    geometry.attributes.position.needsUpdate = true;
    geometry.computeBoundingSphere();
  }

  return { geometry, profile, update };
}

function easeOutCubic(t: number): number {
  const x = Math.min(1, Math.max(0, t));
  return 1 - Math.pow(1 - x, 3);
}

export function createTerrainStrata(): SculptureVariant {
  const root = new THREE.Group();
  const plinth = createTerrainPlinth();
  root.add(plinth);
  root.add(createContactShadow(WORLD.terrainWidth + 3.8, WORLD.terrainDepth + 3.8));

  const mat = new THREE.Mesh(
    new THREE.BoxGeometry(
      WORLD.terrainWidth + 0.12,
      0.008,
      WORLD.terrainDepth + 0.12,
    ),
    new THREE.MeshStandardMaterial({
      color: 0x94866d,
      roughness: 0.96,
      metalness: 0,
    }),
  );
  mat.position.y = WORLD.plinthTop;
  mat.receiveShadow = true;
  root.add(mat);

  const { geometry, update: updateRib } = buildRibGeometry();
  const baseColor = new THREE.Color(0xe5d6bb);
  const layers: THREE.Mesh[] = [];
  for (let i = 0; i < LAYERS; i++) {
    const tone = ((i % 5) - 2) * 0.009;
    const material = new THREE.MeshStandardMaterial({
      color: baseColor.clone().offsetHSL(0, 0.01, tone),
      roughness: 0.86,
      metalness: 0,
      side: THREE.DoubleSide,
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(0, WORLD.plinthTop, terrainZ(i / (LAYERS - 1)));
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    layers.push(mesh);
    root.add(mesh);
  }

  const linePositions = new Float32Array(LAYERS * SEGMENTS * 2 * 3);
  const lineGeometry = new THREE.BufferGeometry();
  lineGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(linePositions, 3),
  );
  const edgeLines = new THREE.LineSegments(
    lineGeometry,
    new THREE.LineBasicMaterial({
      color: 0x8f7b57,
      transparent: true,
      opacity: 0.52,
    }),
  );
  edgeLines.frustumCulled = false;
  root.add(edgeLines);
  const xAt = new Float32Array(SEGMENTS + 1);
  for (let i = 0; i <= SEGMENTS; i++) {
    xAt[i] = (i / SEGMENTS - 0.5) * WORLD.terrainWidth;
  }

  const layerScales = new Float32Array(LAYERS);
  const profile = new Float32Array(SEGMENTS + 1);
  const accessProfile = new Float32Array(SEGMENTS + 1);

  function update(frame: SculptureFrame) {
    terrainProfile(frame.values, frame.max, SEGMENTS, profile);
    updateRib(profile);
    const height = reliefWorldHeight(frame.relief);
    for (let layer = 0; layer < LAYERS; layer++) {
      const t = layer / (LAYERS - 1);
      const stagger = layer * 0.0062;
      const local = Math.min(1, Math.max(0, (frame.emergence - stagger) / 0.72));
      const assembled = easeOutCubic(local);
      const scale = Math.max(0.0001, height * terrainEnvelopeAt(t) * assembled);
      layerScales[layer] = scale;
      layers[layer].scale.y = scale;
    }
    let cursor = 0;
    for (let layer = 0; layer < LAYERS; layer++) {
      const t = layer / (LAYERS - 1);
      const z = terrainZ(t) + SHEET_THICKNESS / 2 + 0.012;
      const scale = layerScales[layer];
      for (let i = 0; i < SEGMENTS; i++) {
        linePositions[cursor++] = xAt[i];
        linePositions[cursor++] = WORLD.plinthTop + profile[i] * scale + 0.019;
        linePositions[cursor++] = z;
        linePositions[cursor++] = xAt[i + 1];
        linePositions[cursor++] = WORLD.plinthTop + profile[i + 1] * scale + 0.019;
        linePositions[cursor++] = z;
      }
    }
    lineGeometry.attributes.position.needsUpdate = true;
    lineGeometry.computeBoundingSphere();
  }

  function anchor(index: number, frame: SculptureFrame): THREE.Vector3 {
    const count = Math.max(2, frame.values.length);
    const u = Math.min(1, Math.max(0, index / (count - 1)));
    const p = terrainProfile(frame.values, frame.max, SEGMENTS, accessProfile);
    const i = Math.round(u * SEGMENTS);
    return new THREE.Vector3(
      (u - 0.5) * WORLD.terrainWidth,
      WORLD.plinthTop + p[i] * reliefWorldHeight(frame.relief) + 0.24,
      0,
    );
  }

  function trace(index: number, frame: SculptureFrame, out: Float32Array): number {
    const count = Math.max(2, frame.values.length);
    const u = Math.min(1, Math.max(0, index / (count - 1)));
    const p = terrainProfile(frame.values, frame.max, SEGMENTS, accessProfile);
    const i = Math.round(u * SEGMENTS);
    const height = reliefWorldHeight(frame.relief);
    for (let s = 0; s < TRACE_SAMPLES; s++) {
      const t = s / (TRACE_SAMPLES - 1);
      out[s * 3] = (u - 0.5) * WORLD.terrainWidth;
      out[s * 3 + 1] =
        WORLD.plinthTop + p[i] * height * terrainEnvelopeAt(t) + 0.02;
      out[s * 3 + 2] = terrainZ(t) + SHEET_THICKNESS / 2 + 0.01;
    }
    return TRACE_SAMPLES;
  }

  const pick = createTerrainPickMesh(TERRAIN_TOP_OFFSET.strata);
  root.add(pick.mesh);

  return {
    root,
    pick: pick.mesh,
    update: (frame) => {
      update(frame);
      pick.update(frame);
    },
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

type PickMesh = {
  mesh: THREE.Mesh;
  update(frame: SculptureFrame): void;
};

function createTerrainPickMesh(topOffset: number): PickMesh {
  const columns = 64;
  const rows = 32;
  const positions = new Float32Array((columns + 1) * (rows + 1) * 3);
  const profileCache = new Float32Array(columns + 1);
  const indices: number[] = [];
  for (let r = 0; r <= rows; r++) {
    const t = r / rows;
    const z = terrainZ(t);
    for (let c = 0; c <= columns; c++) {
      const offset = (r * (columns + 1) + c) * 3;
      positions[offset] = (c / columns - 0.5) * WORLD.terrainWidth;
      positions[offset + 1] = WORLD.plinthTop + topOffset;
      positions[offset + 2] = z;
    }
  }
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < columns; c++) {
      const a = r * (columns + 1) + c;
      const b = a + 1;
      const d = a + columns + 1;
      const e = d + 1;
      indices.push(a, d, b, b, d, e);
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
  mesh.castShadow = false;
  mesh.receiveShadow = false;
  return {
    mesh,
    update(frame) {
      const profile = terrainProfile(frame.values, frame.max, columns, profileCache);
      const height = reliefWorldHeight(frame.relief);
      const emerge = easeOutCubic(frame.emergence);
      for (let r = 0; r <= rows; r++) {
        const t = r / rows;
        const envelope = terrainEnvelopeAt(t);
        for (let c = 0; c <= columns; c++) {
          positions[(r * (columns + 1) + c) * 3 + 1] =
            WORLD.plinthTop +
            topOffset +
            profile[c] * height * envelope * emerge +
            0.012;
        }
      }
      geometry.attributes.position.needsUpdate = true;
      geometry.computeBoundingSphere();
    },
  };
}

export function createTerrainPorcelain(): SculptureVariant {
  const root = new THREE.Group();
  const plinth = createTerrainPlinth();
  root.add(plinth);
  root.add(createContactShadow(WORLD.terrainWidth + 3.8, WORLD.terrainDepth + 3.8));

  const columns = WORLD.terrainGridColumns;
  const rows = WORLD.terrainGridRows;
  const updateProfile = new Float32Array(columns + 1);
  const accessProfile = new Float32Array(columns + 1);
  const topCount = (columns + 1) * (rows + 1);
  const sideCount = (columns + 1) * 2 * 2 + (rows + 1) * 2 * 2;
  const vertexCount = topCount + sideCount;
  const positions = new Float32Array(vertexCount * 3);
  const colors = new Float32Array(vertexCount * 3);
  const indices: number[] = [];
  const porcelainColor = new THREE.Color(0xe3dccb);
  const shadeColor = new THREE.Color(0xc6bba5);
  const bottomColor = new THREE.Color(0xb3a68d);

  for (let r = 0; r <= rows; r++) {
    const t = r / rows;
    const z = terrainZ(t);
    for (let c = 0; c <= columns; c++) {
      const i = r * (columns + 1) + c;
      positions.set(
        [(c / columns - 0.5) * WORLD.terrainWidth, WORLD.plinthTop, z],
        i * 3,
      );
      colors.set(
        [porcelainColor.r, porcelainColor.g, porcelainColor.b],
        i * 3,
      );
    }
  }
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < columns; c++) {
      const a = r * (columns + 1) + c;
      const b = a + 1;
      const d = a + columns + 1;
      const e = d + 1;
      indices.push(a, d, b, b, d, e);
    }
  }

  let cursor = topCount;
  const sideSets: Array<{
    edge: (i: number) => number;
    count: number;
    reverse: boolean;
  }> = [
    {
      edge: (i) => (columns + 1) * rows + i,
      count: columns + 1,
      reverse: false,
    },
    {
      edge: (i) => i,
      count: columns + 1,
      reverse: true,
    },
    {
      edge: (i) => i * (columns + 1),
      count: rows + 1,
      reverse: false,
    },
    {
      edge: (i) => i * (columns + 1) + columns,
      count: rows + 1,
      reverse: true,
    },
  ];
  const sideRanges: Array<{ start: number; count: number }> = [];
  for (const side of sideSets) {
    const start = cursor;
    for (let i = 0; i < side.count; i++) {
      const topIndex = side.edge(i);
      const topX = positions[topIndex * 3];
      const topZ = positions[topIndex * 3 + 2];
      positions.set([topX, WORLD.plinthTop, topZ], (cursor + i) * 3);
      positions.set([topX, WORLD.plinthTop, topZ], (cursor + i + side.count) * 3);
      const shade = i === 0 ? bottomColor : shadeColor;
      colors.set([shade.r, shade.g, shade.b], (cursor + i) * 3);
      colors.set([shade.r, shade.g, shade.b], (cursor + i + side.count) * 3);
    }
    cursor += side.count * 2;
    sideRanges.push({ start, count: side.count });
  }
  for (let s = 0; s < sideRanges.length; s++) {
    const { start, count } = sideRanges[s];
    const reverse = sideSets[s].reverse;
    for (let i = 0; i < count - 1; i++) {
      const b0 = start + i;
      const b1 = b0 + 1;
      const t0 = start + count + i;
      const t1 = t0 + 1;
      if (reverse) indices.push(b0, t1, b1, b0, t0, t1);
      else indices.push(b0, b1, t1, b0, t1, t0);
    }
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
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  root.add(mesh);

  function update(frame: SculptureFrame) {
    const profile = terrainProfile(frame.values, frame.max, columns, updateProfile);
    const height = reliefWorldHeight(frame.relief);
    const emerge = easeOutCubic(frame.emergence);
    for (let r = 0; r <= rows; r++) {
      const t = r / rows;
      const envelope = terrainEnvelopeAt(t);
      for (let c = 0; c <= columns; c++) {
        positions[(r * (columns + 1) + c) * 3 + 1] =
          WORLD.plinthTop +
          TERRAIN_TOP_OFFSET.porcelain +
          profile[c] * height * envelope * emerge;
      }
    }
    for (let s = 0; s < sideSets.length; s++) {
      const side = sideSets[s];
      const sideStart = sideRanges[s].start;
      for (let i = 0; i < side.count; i++) {
        const topIndex = side.edge(i);
        const topY = positions[topIndex * 3 + 1];
        positions[(sideStart + i + side.count) * 3 + 1] = topY;
      }
    }
    geometry.attributes.position.needsUpdate = true;
    geometry.computeVertexNormals();
    geometry.computeBoundingSphere();
  }

  function anchor(index: number, frame: SculptureFrame): THREE.Vector3 {
    const count = Math.max(2, frame.values.length);
    const u = Math.min(1, Math.max(0, index / (count - 1)));
    const profile = terrainProfile(frame.values, frame.max, columns, accessProfile);
    const c = Math.round(u * columns);
    return new THREE.Vector3(
      (u - 0.5) * WORLD.terrainWidth,
      WORLD.plinthTop +
        TERRAIN_TOP_OFFSET.porcelain +
        profile[c] * reliefWorldHeight(frame.relief) +
        0.24,
      0,
    );
  }

  function trace(index: number, frame: SculptureFrame, out: Float32Array): number {
    const count = Math.max(2, frame.values.length);
    const u = Math.min(1, Math.max(0, index / (count - 1)));
    const profile = terrainProfile(frame.values, frame.max, columns, accessProfile);
    const c = Math.round(u * columns);
    const height = reliefWorldHeight(frame.relief);
    for (let s = 0; s < TRACE_SAMPLES; s++) {
      const t = s / (TRACE_SAMPLES - 1);
      out[s * 3] = (u - 0.5) * WORLD.terrainWidth;
      out[s * 3 + 1] =
        WORLD.plinthTop +
        TERRAIN_TOP_OFFSET.porcelain +
        profile[c] * height * terrainEnvelopeAt(t) +
        0.012;
      out[s * 3 + 2] = terrainZ(t);
    }
    return TRACE_SAMPLES;
  }

  const pick = createTerrainPickMesh(TERRAIN_TOP_OFFSET.porcelain);
  root.add(pick.mesh);

  return {
    root,
    pick: pick.mesh,
    update: (frame) => {
      update(frame);
      pick.update(frame);
    },
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

export function createTerrainBlueprint(): SculptureVariant {
  const root = new THREE.Group();
  root.add(
    createBlueprintPlate(WORLD.terrainWidth + 0.8, WORLD.terrainDepth + 0.8),
  );
  root.add(createContactShadow(WORLD.terrainWidth + 3.2, WORLD.terrainDepth + 3.2));

  const contourVertices = LAYERS * SEGMENTS * 2;
  const dropVertices = LAYERS * 2 * 2;
  const contourPositions = new Float32Array(
    (contourVertices + dropVertices) * 3,
  );
  const contourGeometry = new THREE.BufferGeometry();
  contourGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(contourPositions, 3),
  );
  const contourMaterial = new THREE.LineBasicMaterial({
    color: PALETTE.graphite,
    transparent: true,
    opacity: 0.82,
    toneMapped: false,
  });
  const contours = new THREE.LineSegments(contourGeometry, contourMaterial);
  contours.frustumCulled = false;
  root.add(contours);

  const ribs = 11;
  const ribPositions = new Float32Array(ribs * (LAYERS - 1) * 2 * 3);
  const ribGeometry = new THREE.BufferGeometry();
  ribGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(ribPositions, 3),
  );
  const ribMaterial = new THREE.LineBasicMaterial({
    color: PALETTE.graphiteSoft,
    transparent: true,
    opacity: 0.3,
    toneMapped: false,
  });
  const spine = new THREE.LineSegments(ribGeometry, ribMaterial);
  spine.frustumCulled = false;
  root.add(spine);

  const xAt = new Float32Array(SEGMENTS + 1);
  for (let i = 0; i <= SEGMENTS; i++) {
    xAt[i] = (i / SEGMENTS - 0.5) * WORLD.terrainWidth;
  }
  const ribU = new Float32Array(ribs);
  for (let i = 0; i < ribs; i++) ribU[i] = i / (ribs - 1);
  const updateProfile = new Float32Array(SEGMENTS + 1);
  const accessProfile = new Float32Array(SEGMENTS + 1);

  function update(frame: SculptureFrame) {
    const profile = terrainProfile(
      frame.values,
      frame.max,
      SEGMENTS,
      updateProfile,
    );
    const height = reliefWorldHeight(frame.relief);
    const emerge = easeOutCubic(frame.emergence);
    let cursor = 0;
    for (let layer = 0; layer < LAYERS; layer++) {
      const t = layer / (LAYERS - 1);
      const envelope = terrainEnvelopeAt(t);
      const z = terrainZ(t);
      const yAt = (i: number) =>
        WORLD.plinthTop + profile[i] * height * envelope * emerge;
      for (let i = 0; i < SEGMENTS; i++) {
        contourPositions[cursor++] = xAt[i];
        contourPositions[cursor++] = yAt(i);
        contourPositions[cursor++] = z;
        contourPositions[cursor++] = xAt[i + 1];
        contourPositions[cursor++] = yAt(i + 1);
        contourPositions[cursor++] = z;
      }
      for (const side of [-1, 1]) {
        const x = side < 0 ? -WORLD.terrainWidth / 2 : WORLD.terrainWidth / 2;
        const y = yAt(side < 0 ? 0 : SEGMENTS);
        contourPositions[cursor++] = x;
        contourPositions[cursor++] = WORLD.plinthTop;
        contourPositions[cursor++] = z;
        contourPositions[cursor++] = x;
        contourPositions[cursor++] = y;
        contourPositions[cursor++] = z;
      }
    }
    contourGeometry.attributes.position.needsUpdate = true;
    contourGeometry.computeBoundingSphere();

    cursor = 0;
    for (let r = 0; r < ribs; r++) {
      const c = Math.round(ribU[r] * SEGMENTS);
      for (let layer = 0; layer < LAYERS - 1; layer++) {
        const t0 = layer / (LAYERS - 1);
        const t1 = (layer + 1) / (LAYERS - 1);
        const y0 =
          WORLD.plinthTop +
          profile[c] * height * terrainEnvelopeAt(t0) * emerge;
        const y1 =
          WORLD.plinthTop +
          profile[c] * height * terrainEnvelopeAt(t1) * emerge;
        ribPositions[cursor++] = xAt[c];
        ribPositions[cursor++] = y0;
        ribPositions[cursor++] = terrainZ(t0);
        ribPositions[cursor++] = xAt[c];
        ribPositions[cursor++] = y1;
        ribPositions[cursor++] = terrainZ(t1);
      }
    }
    ribGeometry.attributes.position.needsUpdate = true;
    ribGeometry.computeBoundingSphere();
  }

  function anchor(index: number, frame: SculptureFrame): THREE.Vector3 {
    const count = Math.max(2, frame.values.length);
    const u = Math.min(1, Math.max(0, index / (count - 1)));
    const profile = terrainProfile(
      frame.values,
      frame.max,
      SEGMENTS,
      accessProfile,
    );
    const c = Math.round(u * SEGMENTS);
    return new THREE.Vector3(
      (u - 0.5) * WORLD.terrainWidth,
      WORLD.plinthTop +
        profile[c] *
          reliefWorldHeight(frame.relief) *
          terrainEnvelopeAt(0.5) +
        0.24,
      0,
    );
  }

  function trace(index: number, frame: SculptureFrame, out: Float32Array): number {
    const count = Math.max(2, frame.values.length);
    const u = Math.min(1, Math.max(0, index / (count - 1)));
    const profile = terrainProfile(
      frame.values,
      frame.max,
      SEGMENTS,
      accessProfile,
    );
    const c = Math.round(u * SEGMENTS);
    const height = reliefWorldHeight(frame.relief);
    for (let s = 0; s < TRACE_SAMPLES; s++) {
      const t = s / (TRACE_SAMPLES - 1);
      out[s * 3] = (u - 0.5) * WORLD.terrainWidth;
      out[s * 3 + 1] =
        WORLD.plinthTop + profile[c] * height * terrainEnvelopeAt(t) + 0.02;
      out[s * 3 + 2] = terrainZ(t);
    }
    return TRACE_SAMPLES;
  }

  const pick = createTerrainPickMesh(TERRAIN_TOP_OFFSET.blueprint);
  root.add(pick.mesh);

  return {
    root,
    pick: pick.mesh,
    update: (frame) => {
      update(frame);
      pick.update(frame);
    },
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

