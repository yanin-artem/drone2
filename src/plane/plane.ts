import {
  Scene,
  AbstractMesh,
  MeshBuilder,
  Vector3,
  StandardMaterial,
  Texture,
  UniversalCamera,
  FollowCamera,
} from "@babylonjs/core";

export default class Plane {
  public plane: AbstractMesh;

  constructor(private scene: Scene, private camera: UniversalCamera | FollowCamera) {}

  public async createPlane(): Promise<void> {
    const plane = MeshBuilder.CreatePlane(
      "tree",
      { width: 5, height: 10, sideOrientation: 1 },
      this.scene
    );
    plane.position = new Vector3(4, 4.5, 5);
    const material = new StandardMaterial("planeMaterial", this.scene);

    const texture = new Texture("../assets/textures/Trees/1 MidGreen.png", this.scene);
    texture.hasAlpha = true;
    material.diffuseTexture = texture;
    material.useAlphaFromDiffuseTexture = true;

    plane.material = material;
    plane.rotation.y = Math.PI;
    console.log(this.camera.getFrontPosition(1));
    this.scene.registerAfterRender(() => {
      plane.lookAt(this.camera.getFrontPosition(1));
    });
  }
}
