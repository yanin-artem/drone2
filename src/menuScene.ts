import {
  DirectionalLight,
  Engine,
  Scene,
  UniversalCamera,
  Vector3,
} from '@babylonjs/core';
import * as GUI from '@babylonjs/gui';

export default class MenuScene {
  public scene: Scene;
  constructor(private engine: Engine) {
    this.createScene();
  }

  private createScene() {
    this.scene = new Scene(this.engine);
    const light = new DirectionalLight(
      'directionalLight',
      new Vector3(0.947, -0.319, -0.04),
      this.scene
    );
    const camera = new UniversalCamera(
      'camera',
      new Vector3(0, 0, 0),
      this.scene
    );
  }

  public createUI(scenesNames: string[]) {
    return new Promise((resolve, reject) => {
      const advancedTexture =
        GUI.AdvancedDynamicTexture.CreateFullscreenUI('UI');
      const grid = new GUI.Grid();
      advancedTexture.addControl(grid);
      let index = 0;

      scenesNames.forEach((name) => {
        grid.addRowDefinition(30, false);
        const button = GUI.Button.CreateSimpleButton(`${index}`, name);
        button.onPointerClickObservable.add(() => {
          resolve(button.name);
        });
        grid.addControl(button, index, 0);
        index++;
      });
      grid.height = 5 * (index + 1) + '%';
      grid.width = '30%';
      grid.top = '0%';
      grid.left = '0%';
      grid.background = 'white';
    });
  }
}
