import { Engine, Scene } from '@babylonjs/core';

export default class Root {
  public static usePointerLock = true;
  public static isinventoryScreen = true;

  constructor(private scene: Scene, private engine: Engine) {
    this.setPointerLock();
  }

  private setPointerLock() {
    this.scene.onPointerDown = () => {
      console.log(Root.usePointerLock);
      if (
        !this.engine.isPointerLock &&
        Root.usePointerLock &&
        Root.isinventoryScreen
      )
        this.engine.enterPointerlock();
    };
  }
}
