import {
  Scene,
  Vector3,
  SceneLoader,
  MeshBuilder,
  Mesh,
  AbstractMesh,
  PhysicsAggregate,
  PhysicsShapeType,
  Animation,
  PhysicsImpostor,
} from "@babylonjs/core";
import "@babylonjs/loaders/glTF";
import DroneController from "./droneController";

export default class Drone {
  public drone: AbstractMesh;
  public droneBox: AbstractMesh;
  public droneController: DroneController;
  public droneAggregate: PhysicsAggregate;
  public dronePropellerMesh;

  constructor(private scene: Scene) {}

  public async createDrone(): Promise<void> {
    const droneMesh = await SceneLoader.ImportMeshAsync(
      "",
      "../assets/models/drone/",
      "drone_lod_01.glb"
    );

    this.drone = droneMesh.meshes[0];

    const dronePropellerMesh = await SceneLoader.ImportMeshAsync(
      "",
      "../assets/models/drone/",
      "propeller.glb"
    );
    dronePropellerMesh.meshes.forEach((element) => {
      if (element instanceof Mesh && element.name != "__root__") {
        const vintBox = MeshBuilder.CreateCylinder("vintBox", {
          height: 0.06,
          diameter: 0.675,
        });
        vintBox.position = element.position.clone();
        vintBox.parent = element.parent;
        element.parent = vintBox;
        element.position = new Vector3(0, 0, 0);
        vintBox.isVisible = false;
        if (Number(element.id.slice(-1)) % 2 === 1) {
          this.vintAnimation(vintBox);
        } else {
          this.vintAnimation(vintBox, false);
        }
      }
    });

    const dronePropeller = dronePropellerMesh.meshes[0];
    dronePropeller.parent = this.drone;

    this.droneBox = MeshBuilder.CreateBox("droneBox", {
      width: 1,
      height: 0.4,
      depth: 1,
    });

    this.droneBox.position = new Vector3(0, 1, 0);

    this.drone.parent = this.droneBox;

    this.droneBox.isVisible = false;

    // this.droneBox.physicsImpostor = new PhysicsImpostor(
    //   this.droneBox,
    //   PhysicsImpostor.SphereImpostor,
    //   { mass: 1.5, restitution: 0.1 },
    //   this.scene
    // );
    // this._boxDrone.physicsImpostor.physicsBody.angularDamping = 0.99;
    // this._boxDrone.physicsImpostor.physicsBody.linearDamping = 0.8;
    this.droneAggregate = new PhysicsAggregate(
      this.droneBox,
      PhysicsShapeType.MESH,
      { mass: 1.5, restitution: 0.1 },
      this.scene
    );
    this.droneAggregate.body.setAngularDamping(10);
    this.droneAggregate.body.setLinearDamping(1);

    this.setController();
    this.calculateMovement();
  }

  private setController(): void {
    this.droneController = new DroneController(
      this.droneBox,
      this.droneAggregate,
      this.scene
    );
  }

  private calculateMovement() {
    this.scene.onKeyboardObservable.add((event) => {
      this.droneController.controls.handleControlEvents(event);
    });
    this.scene.registerBeforeRender(() => {
      this.droneController.keyboardControl();
    });
  }

  private vintAnimation(vint: Mesh, clockwise: boolean = true): void {
    const frameRate = 60;

    const dronePropellerAnimations = new Animation(
      "boxRotation", // имя анимации
      "rotation.y", // свойство, которое будем анимировать (вращение вокруг Y)
      frameRate, // скорость анимации (количество кадров в секунду)
      Animation.ANIMATIONTYPE_FLOAT,
      Animation.ANIMATIONLOOPMODE_CYCLE
    );

    const keyFrames = [];

    let angle = Math.PI * 2;

    if (!clockwise) angle = -Math.PI * 2;

    keyFrames.push({
      frame: 0,
      value: 0, // начальный угол вращения (в радианах)
    });
    keyFrames.push({
      frame: 10,
      value: angle, // конечный угол вращения (один оборот)
    });

    dronePropellerAnimations.setKeys(keyFrames);

    vint.animations.push(dronePropellerAnimations);

    this.scene.beginAnimation(vint, 0, 2 * frameRate, true);
  }
}
