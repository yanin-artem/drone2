import { Engine } from "@babylonjs/core";
import MenuScene from "./menuScene";
import DroneScene from "./droneScene/scene";

const canvas = document.querySelector("canvas")!;
const fps = document.getElementById("fps");

window.addEventListener("resize", function () {
  engine.resize();
});

const scenesNames = ["Запуск дрона"];
const scenesClasses = [DroneScene];

const engine = new Engine(canvas, true, { stencil: true });

let currentScene = new MenuScene(engine) as any;

currentScene.createUI(scenesNames).then((sceneIndex) => {
  currentScene = new scenesClasses[sceneIndex as number](engine);
});

engine.runRenderLoop(() => {
  fps.innerHTML = engine.getFps().toFixed() + " fps";
  currentScene.scene.render();
});
