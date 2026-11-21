import type * as THREE from "three";

/** The live values fed to geometry: spring state, never React state. */
export type SculptureFrame = {
  values: Float32Array;
  max: number;
  relief: number;
  /** 0 = absent, 1 = assembled. */
  emergence: number;
};

export type SculptureVariant = {
  root: THREE.Group;
  pick: THREE.Mesh;
  update(frame: SculptureFrame): void;
  anchor(index: number, frame: SculptureFrame): THREE.Vector3;
  trace(index: number, frame: SculptureFrame, out: Float32Array): number;
  setOpacity(opacity: number): void;
  setShadows(enabled: boolean): void;
  dispose(): void;
};
