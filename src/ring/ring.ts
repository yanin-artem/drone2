import {
  AbstractMesh,
  Color3,
  Scene,
  Vector3,
  MeshBuilder,
  StandardMaterial,
  GlowLayer,
  SceneLoader,
} from "@babylonjs/core";

export default class Ring {
  public ring: AbstractMesh;
  public ringBox: AbstractMesh;
  public star: AbstractMesh;

  constructor(private scene: Scene) {}

  public async createRing(
    position: Vector3,
    rotation: Vector3,
    thickness: number,
    diameter: number,
    tessellation: number
  ): Promise<void> {
    this.ring = MeshBuilder.CreateTorus(
      "ring",
      { thickness: thickness, diameter: diameter, tessellation: tessellation },
      this.scene
    );
    this.ring.position = position;
    this.ring.rotation = rotation;
    const ringMaterial = new StandardMaterial("RingMaterial", this.scene);
    ringMaterial.emissiveColor = new Color3(255, 0, 255);
    ringMaterial.diffuseColor = new Color3(255, 0, 255);
    ringMaterial.specularColor = new Color3(255, 0, 255);
    this.ring.material = ringMaterial;

    this.ringBox = MeshBuilder.CreateCylinder(
      "disc",
      { height: 0.01, diameter: diameter * 0.75 },
      this.scene
    );
    this.ringBox.isVisible = false;
    this.ringBox.setParent(this.ring);
    this.ringBox.position = new Vector3(0, 0, 0);
    this.ringBox.rotation = new Vector3(0, 0, 0);
    this.createStar();
    this.setGlowLayer();
  }

  private async createStar(): Promise<void> {
    const starMesh = await SceneLoader.ImportMeshAsync("", "../assets/models/star/", "star2.glb");

    this.star = starMesh.meshes[0];
    this.star.scaling = new Vector3(4, 4, 4);
    this.star.position = this.ring.position;
    // console.log(this.star.getChildMeshes()[0]);
    // star.parent = this.ringBox;
    // star.rotation = new Vector3(Math.PI / 2, 0, 0);
  }

  private setGlowLayer(): void {
    const glowLayer = new GlowLayer("glow", this.scene);
    glowLayer.intensity = 1;
    glowLayer.customEmissiveColorSelector = (mesh, subMesh, material, result) => {
      if (mesh === this.ring) {
        result.set(1, 0, 1, 1);
      } else {
        result.set(0, 0, 0, 0);
      }
    };
  }
}
