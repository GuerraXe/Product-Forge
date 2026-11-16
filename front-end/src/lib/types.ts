import { Vector3 } from "three";
import materials from "../materials.json";

// no confusion with THREEJS materials used in rendering
export type PartMaterialKey = keyof typeof materials;
export type PartMaterial = {
  color: string,
  // more TBA
};
export const partMaterials: Record<PartMaterialKey, PartMaterial> = materials;
export const partMaterialKeys = Object.keys(partMaterials) as PartMaterialKey[];

export type Shape = "cube" | "sphere" | "cylinder";

export type TransformMode = "translate" | "rotate" | "scale" | undefined;

const DEFAULT_ALPHABET =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

function generateRandomString(length: number): string {
  const randomValues = new Uint32Array(length);
  crypto.getRandomValues(randomValues);

  let result = '';
  for (let i = 0; i < length; i++) {
    result += DEFAULT_ALPHABET[randomValues[i] % DEFAULT_ALPHABET.length];
  }
  return result;
}

// Physical properties for back-end calculations.
export class Part {
  id: string;
  name: string;
  shape: Shape;
  position: Vector3;
  scale: Vector3;
  rotation: Vector3; // represented in radians
  material: PartMaterialKey;

  constructor() {
    this.id = generateRandomString(4);
    this.shape = "cube";
    this.name = this.shape + ' ' + this.id;
    this.position = new Vector3();
    this.rotation = new Vector3();
    this.scale = new Vector3(1,1,1);
    this.material = "plastic";
  }
};

