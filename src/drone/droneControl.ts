import { KeyboardInfo, PointerInfo } from "@babylonjs/core";

export default class ControlEvents {
  public up = false;
  public rotateRight = false;
  public down = false;
  public rotateLeft = false;
  public forward = false;
  public back = false;
  public left = false;
  public right = false;

  public handleControlEvents(event: KeyboardInfo) {
    console.log(event.event.code);

    if (event.event.code === "KeyW") {
      this.up = event.type === 1;
    }
    if (event.event.code === "KeyS") {
      this.down = event.type === 1;
    }
    if (event.event.code === "KeyD") {
      this.rotateRight = event.type === 1;
    }
    if (event.event.code === "KeyA") {
      this.rotateLeft = event.type === 1;
    }
    if (event.event.code === "ArrowUp") {
      this.forward = event.type === 1;
    }
    if (event.event.code === "ArrowDown") {
      this.back = event.type === 1;
    }
    if (event.event.code === "ArrowRight") {
      this.right = event.type === 1;
    }
    if (event.event.code === "ArrowLeft") {
      this.left = event.type === 1;
    }
  }
}
