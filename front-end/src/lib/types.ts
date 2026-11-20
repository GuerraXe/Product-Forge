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

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

function generateRandomString(length: number): string {
  const randomValues = new Uint32Array(length);
  crypto.getRandomValues(randomValues);

  let result = '';
  for (let i = 0; i < length; i++) {
    result += ALPHABET[randomValues[i] % ALPHABET.length];
  }
  return result;
}

// Physical properties for back-end calculations.
// Might also want to consider storing the part's 
// entire transformation matrix, for more complex operations
export class Part {
  id: string;
  name: string;
  shape: Shape;
  position: Vector3;
  scale: Vector3;
  rotation: Vector3; // represented in radians
  material: PartMaterial;
  materialName: PartMaterialKey;

  constructor() {
    this.id = generateRandomString(4);
    this.shape = "cube";
    this.name = this.shape + ' ' + this.id;
    this.position = new Vector3();
    this.rotation = new Vector3();
    this.scale = new Vector3(1,1,1);
    this.materialName = "plastic";
    this.material = partMaterials[this.materialName];
  }

  clone(): Part {
    // shallow copy
    const copy = Object.assign<Part, Part>(new Part(), this);
    // deep copy of vector objects so as to not share references
    copy.position = this.position.clone();
    copy.rotation = this.rotation.clone();
    copy.scale = this.scale.clone();
    return copy; 
  }
};

