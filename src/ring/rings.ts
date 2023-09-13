// Кольца записываются в виде: { название: {расположение: Vector3, поворот: Vector3, толщина: number, диаметр: number, тесселяция: number}}
import { Vector3 } from "@babylonjs/core";

export const rings = {
  ring1: {
    position: new Vector3(30, 5, 7),
    rotation: new Vector3(0, 0, 0),
    thickness: 0.2,
    diameter: 3,
    tessellation: 32,
  },
  ring2: {
    position: new Vector3(30, 5, 7),
    rotation: new Vector3(0, 0, 1.57),
    thickness: 0.2,
    diameter: 3,
    tessellation: 32,
  },
  ring3: {
    position: new Vector3(30, 5, 7),
    rotation: new Vector3(0, 1, 1.57),
    thickness: 0.2,
    diameter: 3,
    tessellation: 32,
  },
  ring4: {
    position: new Vector3(30, 5, 7),
    rotation: new Vector3(1, 0, 1.57),
    thickness: 0.2,
    diameter: 3,
    tessellation: 32,
  },
  ring5: {
    position: new Vector3(30, 5, 7),
    rotation: new Vector3(0, 1.4, 1.57),
    thickness: 0.2,
    diameter: 3,
    tessellation: 32,
  },
  ring6: {
    position: new Vector3(30, 5, 7),
    rotation: new Vector3(0, 0, 1.57),
    thickness: 0.2,
    diameter: 3,
    tessellation: 32,
  },
  ring7: {
    position: new Vector3(30, 5, 7),
    rotation: new Vector3(4, 0, 1.57),
    thickness: 0.2,
    diameter: 3,
    tessellation: 32,
  },
  ring8: {
    position: new Vector3(30, 5, 7),
    rotation: new Vector3(0, 0, 0.57),
    thickness: 0.2,
    diameter: 3,
    tessellation: 32,
  },
  ring9: {
    position: new Vector3(30, 5, 7),
    rotation: new Vector3(6, 0, 1),
    thickness: 0.2,
    diameter: 3,
    tessellation: 32,
  },
  ring10: {
    position: new Vector3(30, 5, 7),
    rotation: new Vector3(0, 0, 2),
    thickness: 0.2,
    diameter: 3,
    tessellation: 32,
  },
};
