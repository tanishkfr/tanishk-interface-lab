import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { WORLD } from "./dimensions";

export const PALETTE = {
  studio: 0xefece2,
  ink: 0x252620,
  acid: 0xdde23c,
  acidDeep: 0xb3b81f,
  graphite: 0x2c2f27,
  graphiteSoft: 0x5f6354,
  rust: 0xa3472d,
  ivory: 0xf2eee2,
  paper: 0xf0e9d9,
  paperEdge: 0xb7a47f,
  porcelain: 0xf3eee3,
  porcelainShade: 0xd9d1c1,
  stone: 0xc9bda9,
  stoneDark: 0xa99b84,
  brass: 0xb18a52,
  shadow: 0x3a3327,
} as const;

export type DisposableObject = THREE.Object3D & {
  geometry?: THREE.BufferGeometry;
  material?: THREE.Material | THREE.Material[];
};

export function disposeObject(root: THREE.Object3D) {
  const geometries = new Set<THREE.BufferGeometry>();
  const materials = new Set<THREE.Material>();
  root.traverse((object) => {
    const mesh = object as DisposableObject;
    if (mesh.geometry) geometries.add(mesh.geometry);
    const own = Array.isArray(mesh.material)
      ? mesh.material
      : mesh.material
        ? [mesh.material]
        : [];
    for (const material of own) materials.add(material);
  });
  for (const geometry of geometries) geometry.dispose();
  for (const material of materials) {
    const maps = material as THREE.Material & {
      map?: THREE.Texture | null;
      alphaMap?: THREE.Texture | null;
    };
    maps.map?.dispose();
    maps.alphaMap?.dispose();
    material.dispose();
  }
}

export function makeShadowTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const context = canvas.getContext("2d")!;
  const gradient = context.createRadialGradient(128, 128, 8, 128, 128, 126);
  gradient.addColorStop(0, "rgba(45, 38, 25, 0.52)");
  gradient.addColorStop(0.45, "rgba(45, 38, 25, 0.2)");
  gradient.addColorStop(1, "rgba(45, 38, 25, 0)");
  context.fillStyle = gradient;
  context.fillRect(0, 0, 256, 256);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

export function createContactShadow(
  width: number,
  depth: number,
): THREE.Mesh {
  const geometry = new THREE.PlaneGeometry(width, depth);
  const material = new THREE.MeshBasicMaterial({
    map: makeShadowTexture(),
    transparent: true,
    opacity: 0.55,
    depthWrite: false,
    toneMapped: false,
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.y = 0.012;
  mesh.renderOrder = 0;
  return mesh;
}

function stoneMaterial(): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color: 0xb5a68c,
    roughness: 0.9,
    metalness: 0,
  });
}

function plinthEdgeMaterial(): THREE.LineBasicMaterial {
  return new THREE.LineBasicMaterial({
    color: 0x7f7159,
    transparent: true,
    opacity: 0.55,
  });
}

export function createTerrainPlinth(): THREE.Group {
  const group = new THREE.Group();
  const height = WORLD.plinthTop;
  const geometry = new RoundedBoxGeometry(
    WORLD.terrainWidth + 1.05,
    height,
    WORLD.terrainDepth + 1.05,
    4,
    0.055,
  );
  const mesh = new THREE.Mesh(geometry, stoneMaterial());
  mesh.position.y = height / 2;
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  group.add(mesh);

  const edgePoints: THREE.Vector3[] = [];
  const w = (WORLD.terrainWidth + 1.05) / 2 - 0.07;
  const d = (WORLD.terrainDepth + 1.05) / 2 - 0.07;
  const y = height + 0.002;
  edgePoints.push(
    new THREE.Vector3(-w, y, -d),
    new THREE.Vector3(w, y, -d),
    new THREE.Vector3(w, y, d),
    new THREE.Vector3(-w, y, d),
    new THREE.Vector3(-w, y, -d),
  );
  const edge = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints(edgePoints),
    plinthEdgeMaterial(),
  );
  group.add(edge);
  return group;
}

export function createFossilPlinth(outerRadius: number): THREE.Group {
  const group = new THREE.Group();
  const height = WORLD.plinthTop;
  const geometry = new THREE.CylinderGeometry(
    outerRadius,
    outerRadius + 0.08,
    height,
    120,
    1,
  );
  const mesh = new THREE.Mesh(geometry, stoneMaterial());
  mesh.scale.z = WORLD.fossilZScale;
  mesh.position.y = height / 2;
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  group.add(mesh);

  const points: THREE.Vector3[] = [];
  const segments = 120;
  for (let i = 0; i <= segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    points.push(
      new THREE.Vector3(
        Math.cos(angle) * (outerRadius - 0.06),
        height + 0.002,
        Math.sin(angle) * (outerRadius - 0.06) * WORLD.fossilZScale,
      ),
    );
  }
  group.add(
    new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(points),
      plinthEdgeMaterial(),
    ),
  );
  return group;
}

/** A quiet technical plate for Blueprint: outline, rule, no solid mass. */
export function createBlueprintPlate(width: number, depth: number): THREE.Group {
  const group = new THREE.Group();
  const material = new THREE.LineBasicMaterial({
    color: PALETTE.graphite,
    transparent: true,
    opacity: 0.24,
  });
  const points: THREE.Vector3[] = [];
  const w = width / 2;
  const d = depth / 2;
  const y = WORLD.plinthTop + 0.003;
  points.push(
    new THREE.Vector3(-w, y, -d),
    new THREE.Vector3(w, y, -d),
    new THREE.Vector3(w, y, d),
    new THREE.Vector3(-w, y, d),
    new THREE.Vector3(-w, y, -d),
  );
  group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), material));

  const gridMaterial = new THREE.LineBasicMaterial({
    color: PALETTE.acidDeep,
    transparent: true,
    opacity: 0.38,
  });
  const gridPoints: THREE.Vector3[] = [];
  const divisionsX = 12;
  const divisionsZ = 8;
  for (let i = 1; i < divisionsX; i++) {
    const x = -w + (i / divisionsX) * width;
    gridPoints.push(
      new THREE.Vector3(x, y, -d),
      new THREE.Vector3(x, y, d),
    );
  }
  for (let i = 1; i < divisionsZ; i++) {
    const z = -d + (i / divisionsZ) * depth;
    gridPoints.push(
      new THREE.Vector3(-w, y, z),
      new THREE.Vector3(w, y, z),
    );
  }
  group.add(
    new THREE.LineSegments(
      new THREE.BufferGeometry().setFromPoints(gridPoints),
      gridMaterial,
    ),
  );
  return group;
}

export function createEllipticBlueprintPlate(radius: number): THREE.Group {
  const group = new THREE.Group();
  const material = new THREE.LineBasicMaterial({
    color: PALETTE.graphite,
    transparent: true,
    opacity: 0.26,
  });
  const points: THREE.Vector3[] = [];
  const segments = 120;
  for (let i = 0; i <= segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    points.push(
      new THREE.Vector3(
        Math.cos(angle) * radius,
        WORLD.plinthTop + 0.003,
        Math.sin(angle) * radius * WORLD.fossilZScale,
      ),
    );
  }
  group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), material));

  const gridMaterial = new THREE.LineBasicMaterial({
    color: PALETTE.acidDeep,
    transparent: true,
    opacity: 0.32,
  });
  const grid: THREE.Vector3[] = [];
  grid.push(
    new THREE.Vector3(-radius, WORLD.plinthTop + 0.003, 0),
    new THREE.Vector3(radius, WORLD.plinthTop + 0.003, 0),
    new THREE.Vector3(0, WORLD.plinthTop + 0.003, -radius * WORLD.fossilZScale),
    new THREE.Vector3(0, WORLD.plinthTop + 0.003, radius * WORLD.fossilZScale),
  );
  for (let i = 1; i <= 3; i++) {
    const r = radius * (i / 4);
    const circle: THREE.Vector3[] = [];
    for (let a = 0; a <= 72; a++) {
      const angle = (a / 72) * Math.PI * 2;
      circle.push(
        new THREE.Vector3(
          Math.cos(angle) * r,
          WORLD.plinthTop + 0.003,
          Math.sin(angle) * r * WORLD.fossilZScale,
        ),
      );
    }
    for (let a = 0; a < circle.length - 1; a++) {
      grid.push(circle[a], circle[a + 1]);
    }
  }
  group.add(
    new THREE.LineSegments(
      new THREE.BufferGeometry().setFromPoints(grid),
      gridMaterial,
    ),
  );
  return group;
}

/**
 * Fades a whole variant without losing each material's authored opacity.
 * Used only for short crossfades; steady state is exactly 1.
 */
export function applyVariantOpacity(root: THREE.Object3D, opacity: number) {
  const seen = new Set<THREE.Material>();
  const clamped = Math.min(1, Math.max(0, opacity));
  root.traverse((object) => {
    const own = (object as DisposableObject).material;
    if (!own) return;
    const materials = Array.isArray(own) ? own : [own];
    for (const material of materials) {
      if (seen.has(material)) continue;
      seen.add(material);
      if (material.userData.baseOpacity === undefined) {
        material.userData.baseOpacity = material.opacity;
      }
      const base = material.userData.baseOpacity as number;
      material.opacity = base * clamped;
      material.transparent = material.opacity < 0.999;
      material.depthWrite = material.opacity > 0.92;
      material.needsUpdate = true;
    }
  });
}

export function setShadows(root: THREE.Object3D, enabled: boolean) {
  root.traverse((object) => {
    const mesh = object as THREE.Mesh;
    if (!mesh.isMesh) return;
    const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    const visible = materials.some((material) => material && material.visible);
    mesh.castShadow = enabled && visible;
    mesh.receiveShadow = enabled && visible;
  });
}
