import {
  Scene,
  Engine,
  Vector3,
  UniversalCamera,
  StandardMaterial,
  Color3,
  DirectionalLight,
  SpotLight,
  PointLight,
  ShadowGenerator,
  Texture,
  CreateSphere,
  FollowCamera,
  MeshBuilder,
  Mesh,
  PhysicsAggregate,
  PhysicsShapeType,
  PhysicsShapeMesh,
  SceneLoader,
  VirtualJoystick,
  PhysicsImpostor,
  CannonJSPlugin,
} from "@babylonjs/core";
// import * as CANNON from "cannon";
import HavokPhysics from "@babylonjs/havok";
import { HavokPlugin } from "@babylonjs/core/Physics/v2/Plugins/havokPlugin";
import { Inspector } from "@babylonjs/inspector";
import * as GUI from "@babylonjs/gui";
import Drone from "../drone/drone";
import Ring from "../ring/ring";
import Plane from "../plane/plane";
import { rings } from "../ring/rings";
import { playersApi } from "../requests/players";

export default class DroneScene {
  public scene: Scene;
  ringsQuantity: number;
  ringsInfo: GUI.TextBlock;
  timerInfo: GUI.TextBlock;
  startTime: number;
  elapsedTime: number;
  intervalId;
  maxRingsQuantity: number;
  drone: Drone;
  camera: UniversalCamera | FollowCamera;
  fps: HTMLElement;
  canvas: HTMLCanvasElement;
  light: PointLight | SpotLight | DirectionalLight;
  private advancedTexture: GUI.AdvancedDynamicTexture;

  constructor(private engine: Engine) {
    this.scene = this.createScene();

    const mainCamera = new UniversalCamera(
      "UniversalCamera",
      new Vector3(0, 0, 0),
      this.scene
    );
    mainCamera.fov = 1.85;
    this.camera = mainCamera;
    this.advancedTexture =
      GUI.AdvancedDynamicTexture.CreateFullscreenUI("main");

    this.createLocation();
    this.createInspector();
    this.changeCamera(mainCamera);
  }

  createScene(): Scene {
    const scene = new Scene(this.engine);
    this.light = new DirectionalLight(
      "DirectionalLight",
      new Vector3(0, -35, 0),
      scene
    );
    scene.collisionsEnabled = true;

    this.light.intensity = 1;

    return scene;
  }

  // Подключение движка
  async enablePhysic(): Promise<void> {
    const havokInstance = await HavokPhysics();
    const havokPlugin = new HavokPlugin(true, havokInstance);
    this.scene.enablePhysics(new Vector3(0, -9.81, 0), havokPlugin);
    // window.CANNON = CANNON;
    // this.scene.enablePhysics(new Vector3(0, -9.81, 0), new CannonJSPlugin());
  }

  // Создание локации
  async createLocation(): Promise<void> {
    this.scene.getEngine().displayLoadingUI();
    this.startTime = new Date().getTime() / 1000;
    await this.enablePhysic();

    const ground = MeshBuilder.CreateGround(
      "ground",
      { width: 1000, height: 1000 },
      this.scene
    );
    const groundAggregate = new PhysicsAggregate(
      ground,
      PhysicsShapeType.BOX,
      { mass: 0 },
      this.scene
    );
    // ground.physicsImpostor = new PhysicsImpostor(
    //   ground,
    //   PhysicsImpostor.BoxImpostor,
    //   { mass: 0 },
    //   this.scene
    // );
    const groundMaterial = new StandardMaterial("ground", this.scene);
    const groundTexture = new Texture(
      "../assets/textures/grass/grass2.jpg",
      this.scene
    );
    groundTexture.uScale = 50;
    groundTexture.vScale = 50;
    groundMaterial.diffuseTexture = groundTexture;
    groundMaterial.specularColor = new Color3(0, 0, 0);
    ground.material = groundMaterial;
    ground.receiveShadows = true;
    ground.checkCollisions = true;

    const platform = await SceneLoader.ImportMeshAsync(
      null,
      "../assets/models/droneMap/",
      "platforma_v02.glb",
      this.scene
    );

    platform.meshes.forEach((element, index) => {
      if (element instanceof Mesh && index > 0) {
        element.setParent(null);
        const elementAggregate = new PhysicsAggregate(
          element,
          new PhysicsShapeMesh(element, this.scene),
          {
            mass: 0,
            restitution: 0,
          },
          this.scene
        );
        // element.physicsImpostor = new PhysicsImpostor(
        //   element,
        //   PhysicsImpostor.MeshImpostor,
        //   {
        //     mass: 0,
        //     restitution: 0.7,
        //   },
        //   this.scene
        // );
      }
    });

    await this.createDrone();

    this.createRings(rings); // Используется импортированный массив с кольцами

    this.createSkyBox();
    // await this.setShadow();
    this.createPlane();
    this.createGUI();
    this.camera.parent = this.drone.droneBox;
    this.camera.rotation._y = Math.PI;

    this.scene.getEngine().hideLoadingUI();
    console.log(
      "Локация загрузилась за ",
      this.checkTime(this.startTime).toFixed(2),
      " сек."
    );
  }

  // Подключение теней на меши, кроме неба, земли и колец
  async setShadow(): Promise<void> {
    this.light.shadowEnabled = true;
    const shadowGenerator = new ShadowGenerator(2048, this.light);
    // shadowGenerator.useBlurCloseExponentialShadowMap = true;
    // this.light.shadowMaxZ = 10;
    // this.light.shadowMinZ = 0;
    this.scene.meshes.map((mesh) => {
      if (
        mesh.name != "skyBox" &&
        mesh.name != "ground" &&
        mesh.name != "torus"
      ) {
        mesh.receiveShadows = true;
        shadowGenerator.addShadowCaster(mesh);
      }
    });
  }

  // Создание неба
  createSkyBox(): void {
    const skybox = CreateSphere("skyBox", { diameter: 5000.0 }, this.scene);
    const skyboxMaterial = new StandardMaterial("skyBox", this.scene);
    skyboxMaterial.backFaceCulling = false;
    skyboxMaterial.emissiveTexture = new Texture(
      "../assets/textures/sky4.png",
      this.scene
    );
    skyboxMaterial.diffuseColor = new Color3(0, 0, 0);
    skyboxMaterial.specularColor = new Color3(0, 0, 0);
    skybox.material = skyboxMaterial;
    skybox.rotation.x = Math.PI;
    skybox.position.y = 50;
  }

  // Создание плейнов
  async createPlane(): Promise<void> {
    const plane = new Plane(this.scene, this.camera);
    await plane.createPlane();
  }

  // Создание дрона
  async createDrone(): Promise<void> {
    const drone = new Drone(this.scene);
    await drone.createDrone();
    this.drone = drone;
  }

  // Создание кольца
  async createRing(
    position: Vector3,
    rotation: Vector3,
    thickness: number,
    diameter: number,
    tessellation: number
  ): Promise<void> {
    const ring = new Ring(this.scene);
    await ring.createRing(
      position,
      rotation,
      thickness,
      diameter,
      tessellation
    );
    this.detectIntersect(ring);
  }

  // Создание колец из массива с параметрами
  createRings(rings: object): void {
    this.maxRingsQuantity = Object.keys(rings).length;
    this.ringsQuantity = 0;
    for (const [key, value] of Object.entries(rings)) {
      const key = this.createRing(
        value.position,
        value.rotation,
        value.thickness,
        value.diameter,
        value.tessellation
      );
    }
  }

  // Проверка на пролёт сквозь меш в кольце
  detectIntersect(ring: Ring): void {
    let executed = false;
    this.scene.registerBeforeRender(() => {
      if (!executed) {
        if (ring.ringBox.intersectsMesh(this.drone.droneBox)) {
          executed = true;
        }
        if (executed) {
          this.ringsQuantity++;
          this.ringsInfo.text = this.getRingsText();
          ring.ring.dispose();
          ring.ringBox.dispose();
          ring.star.dispose();
          if (this.ringsQuantity === 1) this.createTimer().start();

          if (this.ringsQuantity === this.maxRingsQuantity) {
            this.createTimer().stop();
            this.registrationUI(this.elapsedTime, false);
          }
        }
      }
    });
  }

  // Создание инспектора
  createInspector(): void {
    const secondCamera = new UniversalCamera(
      "secondCamera",
      new Vector3(0, 3, 0),
      this.scene
    );
    secondCamera.minZ = 0;

    secondCamera.speed = 0.3;

    secondCamera.keysUp.push(87);
    secondCamera.keysLeft.push(65);
    secondCamera.keysDown.push(83);
    secondCamera.keysRight.push(68);

    this.scene.onKeyboardObservable.add((evt) => {
      if (evt.type === 2 && evt.event.code === "KeyU") {
        VirtualJoystick.Canvas.style.zIndex = "-1";
        secondCamera.attachControl();
        this.camera.detachControl();
        Inspector.Show(this.scene, {});
        this.engine.exitPointerlock;
        this.scene.activeCameras = [];
        this.scene.activeCameras.push(secondCamera);
      } else if (evt.type === 2 && evt.event.code === "KeyO") {
        if (!this.engine.isPointerLock) this.engine.enterPointerlock();
        secondCamera.detachControl();
        this.camera.attachControl();
        Inspector.Hide();
        this.scene.activeCameras = [];
        this.scene.activeCameras.push(this.camera);
      }
    });
  }

  // Обновляемый текст с количеством колец
  getRingsText(): string {
    if (this.ringsQuantity === this.maxRingsQuantity)
      return `Поздравляем!
Cобраны все звезды!`;
    else
      return `${this.ringsQuantity} из ${this.maxRingsQuantity} звезд собрано`;
  }

  // GUI Информация
  async createGUI(): Promise<void> {
    const ringInfoText = `${this.ringsQuantity} из ${this.maxRingsQuantity} звезд собрано`;
    const ringsInfoBox = new GUI.Rectangle("ringsInfoBox");
    ringsInfoBox.width = "200px";
    ringsInfoBox.height = "50px";
    ringsInfoBox.color = "rgba(255,255,255,0.6)";
    ringsInfoBox.background = "rgba(0,0,0,0.6)";
    ringsInfoBox.cornerRadius = 10;
    ringsInfoBox.thickness = 2;
    ringsInfoBox.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
    ringsInfoBox.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    ringsInfoBox.top = "3%";
    ringsInfoBox.left = "2%";
    this.advancedTexture.addControl(ringsInfoBox);

    this.ringsInfo = new GUI.TextBlock("ringsInfo");
    this.ringsInfo.text = ringInfoText;
    this.ringsInfo.fontSize = "17px";
    this.ringsInfo.color = "white";
    this.ringsInfo.textWrapping = true;
    ringsInfoBox.addControl(this.ringsInfo);

    const InfoText = `Левый джойстик:

↑/↓ - Вверх/вниз

←/→ - Поворот влево/вправо

Правый джойстик:

↑/↓ - Наклон вперёд/назад

←/→ - Наклон влево/вправо`;
    const InfoBox = new GUI.Rectangle("InfoBox");
    InfoBox.width = "200px";
    InfoBox.height = "350px";
    InfoBox.color = "rgba(255,255,255,0.6)";
    InfoBox.background = "rgba(0,0,0,0.6)";
    InfoBox.cornerRadius = 10;
    InfoBox.thickness = 2;
    InfoBox.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
    InfoBox.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    InfoBox.top = "-3%";
    InfoBox.left = "2%";
    this.advancedTexture.addControl(InfoBox);

    const Info = new GUI.TextBlock("Info");
    Info.text = InfoText;
    Info.fontSize = "17px";
    Info.color = "white";
    Info.textWrapping = true;
    InfoBox.addControl(Info);

    const timerText = `Собери все звезды!`;
    const timerBox = new GUI.Rectangle("timerBox");
    timerBox.width = "200px";
    timerBox.height = "50px";
    timerBox.color = "rgba(255,255,255,0.6)";
    timerBox.background = "rgba(0,0,0,0.6)";
    timerBox.cornerRadius = 10;
    timerBox.thickness = 2;
    timerBox.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
    timerBox.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
    timerBox.top = "3%";
    // timerBox.left = "2%";
    this.advancedTexture.addControl(timerBox);

    this.timerInfo = new GUI.TextBlock("ringsInfo");
    this.timerInfo.text = timerText;
    this.timerInfo.fontSize = "17px";
    this.timerInfo.color = "white";
    this.timerInfo.textWrapping = true;
    timerBox.addControl(this.timerInfo);
  }

  // Смена камеры на клавишу С
  changeCamera(mainCamera: UniversalCamera): void {
    const thirdCamera = new FollowCamera(
      "Follow Camera",
      new Vector3(0, 0, 0),
      this.scene
    );
    this.scene.onKeyboardObservable.add((evt) => {
      if (evt.type === 2 && evt.event.code === "KeyC") {
        if (this.camera instanceof UniversalCamera) {
          thirdCamera.position = this.drone.droneBox.position;
          this.camera = thirdCamera;
          this.scene.activeCameras = [];
          this.scene.activeCameras.push(this.camera);
          this.camera.lockedTarget = this.drone.droneBox;
          this.camera.radius = 5;
          this.camera.heightOffset = 1;
          this.camera.cameraAcceleration = 0.5;
          this.camera.maxCameraSpeed = 5;
        } else {
          this.camera = mainCamera;
          this.scene.activeCameras = [];
          this.scene.activeCameras.push(this.camera);
        }
      }
      if (evt.type === 2 && evt.event.code === "KeyR") {
        console.log("Позиция сменена");
        this.drone.droneBox.position = new Vector3(0, 5, 0);
      }
    });
  }

  // Расчет времени между стартом и концом
  checkTime(startTime: number): number {
    const endTime = new Date().getTime() / 1000;
    const resultTime = endTime - startTime;
    return resultTime;
  }

  createTimer() {
    const startTime = new Date().getTime() / 1000;
    let isRunning = false;
    const start = () => {
      isRunning = true;
      if (isRunning) {
        this.intervalId = setInterval(() => {
          this.elapsedTime = this.checkTime(startTime);
          this.timerInfo.text = this.getTimerCountText();
        }, 10);
      }
    };
    const stop = () => {
      isRunning = false;
      clearInterval(this.intervalId);
      this.timerInfo.text = this.getTimerCountText(this.elapsedTime);
    };
    return {
      start,
      stop,
    };
  }

  getTimerCountText(endTime?: number): string {
    if (endTime) return `Пройдено за ${endTime.toFixed(2)} сек.`;
    else return `Прошло ${this.elapsedTime.toFixed(2)} сек.`;
  }

  private createNameInput(parentBlock: GUI.Rectangle) {
    const nameInput = new GUI.InputText("name");
    nameInput.fontSize = "17px";
    nameInput.width = "60%";
    nameInput.height = "30px";
    nameInput.top = "-25%";
    nameInput.left = "15%";
    nameInput.color = "white";
    parentBlock.addControl(nameInput);
    return nameInput;
  }

  private createNameInputLabel(parentBlock: GUI.Rectangle) {
    const nameInputLabel = new GUI.TextBlock("nameLabel", "Имя:");
    nameInputLabel.fontSize = "17px";
    nameInputLabel.width = "30%";
    nameInputLabel.height = "25px";
    nameInputLabel.top = "-25%";
    nameInputLabel.left = "-30%";
    nameInputLabel.color = "white";
    parentBlock.addControl(nameInputLabel);
  }

  private createTeamInput(parentBlock: GUI.Rectangle) {
    const teamInput = new GUI.InputText("name");
    teamInput.fontSize = "17px";
    teamInput.width = "60%";
    teamInput.height = "30px";
    teamInput.top = "0%";
    teamInput.left = "15%";
    teamInput.color = "white";
    teamInput.onBeforeKeyAddObservable.add((input) => {
      let key = input.currentKey;
      teamInput.addKey = key >= "0" && key <= "9";
    });
    parentBlock.addControl(teamInput);
    return teamInput;
  }

  private createTeamInputLabel(parentBlock: GUI.Rectangle) {
    const teamInputLabel = new GUI.TextBlock("nameLabel", "Номер команды:");
    teamInputLabel.fontSize = "17px";
    teamInputLabel.width = "30%";
    teamInputLabel.height = "25px";
    teamInputLabel.top = "0%";
    teamInputLabel.left = "-30%";
    teamInputLabel.color = "white";
    parentBlock.addControl(teamInputLabel);
  }

  private createRegisterButton(
    parentBlock: GUI.Rectangle,
    name: GUI.InputText,
    team: GUI.InputText,
    time: number
  ) {
    const button = GUI.Button.CreateSimpleButton("okBtn", "OK");
    button.fontSize = "17px";
    button.width = "30%";
    button.height = "35px";
    button.top = "25%";
    button.color = "white";
    button.onPointerDownObservable.add(() => {
      if (name.text.length && team.text.length) {
        this.executeRegistration(time, +team.text, name.text, parentBlock);
      }
    });
    parentBlock.addControl(button);
  }

  private async executeRegistration(
    time: number,
    team: number,
    name: string,
    parentBlock: GUI.Rectangle
  ) {
    const resultTime = 1000 * +time.toFixed(2);
    try {
      await playersApi.addUser(name, resultTime, team);
      VirtualJoystick.Canvas.style.zIndex = "4";
    } catch (e) {
      if (e.response.status === 400) {
        this.registrationUI(this.elapsedTime, true);
      }
    }
    parentBlock.dispose();
  }

  private createErrorMessage(parentBlock: GUI.Rectangle) {
    const errorMessage = new GUI.TextBlock(
      "errorMessage",
      "Пользователь с таким именем уже существует"
    );
    errorMessage.fontSize = "13px";
    errorMessage.height = "13px";
    errorMessage.top = "-40%";
    errorMessage.color = "red";
    parentBlock.addControl(errorMessage);
  }

  private registrationUI(endTime: number, isError: boolean) {
    VirtualJoystick.Canvas.style.zIndex = "-1";
    const InfoBox = new GUI.Rectangle("InfoBox");
    InfoBox.width = "30%";
    InfoBox.height = isError ? "30%" : "25%";
    InfoBox.color = "rgba(255,255,255,0.6)";
    InfoBox.background = "rgba(0,0,0,0.6)";
    InfoBox.cornerRadius = 10;
    InfoBox.thickness = 2;
    InfoBox.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
    InfoBox.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    InfoBox.top = "-40%";
    InfoBox.left = "35%";
    this.advancedTexture.addControl(InfoBox);
    if (isError) {
      this.createErrorMessage(InfoBox);
    }
    const nameInput = this.createNameInput(InfoBox);
    this.createNameInputLabel(InfoBox);
    const teamInput = this.createTeamInput(InfoBox);
    this.createTeamInputLabel(InfoBox);
    this.createRegisterButton(InfoBox, nameInput, teamInput, endTime);
  }
}
