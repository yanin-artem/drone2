import {
  AbstractMesh,
  Color3,
  Scene,
  Vector3,
  MeshBuilder,
  StandardMaterial,
  Texture,
} from "@babylonjs/core";

export default class Landing {
  public landing: AbstractMesh;
  public landingCenterMesh: AbstractMesh;
  constructor(private scene: Scene) {}

  public async createLanding(
    position: Vector3,
    rotation: Vector3,
    radius: number,
    tessellation: number
  ): Promise<void> {
    this.landing = MeshBuilder.CreateDisc(
      "landingDisc",
      { radius: radius, tessellation: tessellation },
      this.scene
    );
    this.landing.position = position;
    this.landing.rotation = rotation;
    const landingMaterial = new StandardMaterial("LandingMaterial", this.scene);
    landingMaterial.diffuseTexture = new Texture(
      "../assets/textures/landing/landing.png",
      this.scene
    );
    landingMaterial.specularColor = new Color3(0, 0, 0);
    this.landing.material = landingMaterial;

    this.landingCenterMesh = MeshBuilder.CreateDisc(
      "landingCenter",
      { radius: radius / 20 },
      this.scene
    );
    this.landingCenterMesh.setParent(this.landing);
    const landingCenterMeshMaterial = new StandardMaterial("landingCenterMeshMaterial", this.scene);
    landingCenterMeshMaterial.diffuseColor = new Color3(255, 255, 255);
    landingCenterMeshMaterial.specularColor = new Color3(255, 255, 255);
    this.landingCenterMesh.material = landingCenterMeshMaterial;
    this.landingCenterMesh.position = new Vector3(0, 0, -0.005);
    this.landingCenterMesh.rotation.x = 0;
    this.landingCenterMesh.isVisible = false;
  }
}
