import { AbstractMesh, Scene, VirtualJoystick } from "@babylonjs/core";
import ControlEvents from "./droneControl";

export default class DroneController {
  public YAW_SPEED = 3.5;
  public ROLL_SPEED = 2;
  public PITCH_SPEED = 2;
  public TAKEOFF_SPEED = 30;
  public controls: ControlEvents;

  private leftJoystick: VirtualJoystick;
  private rightJoystick: VirtualJoystick;
  private deltaTime: number;
  constructor(
    private droneBox: AbstractMesh,
    private droneAggregate,
    private scene: Scene
  ) {
    this.controls = new ControlEvents();
    this.virtualControl();
    this.scene.registerBeforeRender(() => {
      this.deltaTime = this.scene.getEngine().getDeltaTime() / 1000;
    });
  }

  rotate(direction, value?) {
    let sign;
    let scale;
    let compPoint1;
    let compPoint2;
    let compF1;
    let compF2;

    if (direction === "right") {
      sign = this.deltaTime;
      compF1 = this.droneBox.right;
      compF2 = this.droneBox.right.negate();
      compPoint1 = this.droneBox.position.add(this.droneBox.forward);
      compPoint2 = this.droneBox.position.add(this.droneBox.forward);
      scale = value
        ? value * this.YAW_SPEED * this.deltaTime
        : sign * this.YAW_SPEED;
    }
    if (direction === "left") {
      sign = -this.deltaTime;
      compF1 = this.droneBox.right;
      compF2 = this.droneBox.right.negate();
      compPoint1 = this.droneBox.position.add(this.droneBox.forward);
      compPoint2 = this.droneBox.position.add(this.droneBox.forward);
      scale = value
        ? value * this.YAW_SPEED * this.deltaTime
        : sign * this.YAW_SPEED;
    }
    if (direction === "forward") {
      sign = this.deltaTime;
      compF1 = this.droneBox.up;
      compF2 = this.droneBox.up.negate();
      compPoint1 = this.droneBox.position.add(this.droneBox.forward);
      compPoint2 = this.droneBox.position.add(this.droneBox.forward);
      scale = value
        ? value * this.PITCH_SPEED * this.deltaTime
        : sign * this.PITCH_SPEED;
    }
    if (direction === "back") {
      sign = -this.deltaTime;
      compF1 = this.droneBox.up;
      compF2 = this.droneBox.up.negate();
      compPoint1 = this.droneBox.position.add(this.droneBox.forward);
      compPoint2 = this.droneBox.position.add(this.droneBox.forward);
      scale = value
        ? value * this.PITCH_SPEED * this.deltaTime
        : sign * this.PITCH_SPEED;
    }
    if (direction === "rightroll") {
      sign = this.deltaTime;
      compF1 = this.droneBox.up;
      compF2 = this.droneBox.up.negate();
      compPoint1 = this.droneBox.position.add(this.droneBox.right);
      compPoint2 = this.droneBox.position.add(this.droneBox.right);
      scale = value
        ? value * this.ROLL_SPEED * this.deltaTime
        : sign * this.ROLL_SPEED;
    }
    if (direction === "leftroll") {
      sign = -this.deltaTime;
      compF1 = this.droneBox.up;
      compF2 = this.droneBox.up.negate();
      compPoint1 = this.droneBox.position.add(this.droneBox.right);
      compPoint2 = this.droneBox.position.add(this.droneBox.right);
      scale = value
        ? value * this.ROLL_SPEED * this.deltaTime
        : sign * this.ROLL_SPEED;
    }
    console.log("zalupa");

    this.droneAggregate.body.applyImpulse(compF1.scale(scale), compPoint1);
    this.droneAggregate.body.applyImpulse(compF2.scale(-scale), compPoint2);

    // this.droneBox.physicsImpostor.applyImpulse(compF1.scale(scale), compPoint1);
    // this.droneBox.physicsImpostor.applyImpulse(compF2.scale(-scale), compPoint2);
  }

  public keyboardControl() {
    ///////////Вращение вправо-влево
    if (this.controls.rotateLeft) {
      this.rotate("left");
    }
    if (this.controls.rotateRight) {
      this.rotate("right");
    }

    ///////// Наклон вправо-влево
    if (this.controls.left) {
      this.rotate("leftroll");
    }
    if (this.controls.right) {
      this.rotate("rightroll");
    }

    ///////// Наклон вперед-назад
    if (this.controls.forward) {
      this.rotate("forward");
    }
    if (this.controls.back) {
      this.rotate("back");
    }

    ///////// Вверх-вниз
    if (this.controls.up) {
      this.droneAggregate.body.applyImpulse(
        this.droneBox.up.scale(this.TAKEOFF_SPEED * this.deltaTime),
        this.droneBox.position.add(this.droneBox.up)
      );
      // this.droneBox.physicsImpostor.applyImpulse(
      //   this.droneBox.up.scale(this.TAKEOFF_SPEED * this.deltaTime),
      //   this.droneBox.position.add(this.droneBox.up)
      // );
    }
    if (this.controls.down) {
      this.droneAggregate.body.applyImpulse(
        this.droneBox.up.scale(-this.TAKEOFF_SPEED * this.deltaTime),
        this.droneBox.position.add(this.droneBox.up)
      );
      // this.droneBox.physicsImpostor.applyImpulse(
      //   this.droneBox.up.scale(-this.TAKEOFF_SPEED * this.deltaTime),
      //   this.droneBox.position.add(this.droneBox.up)
      // );
    }
  }

  public virtualControl() {
    this.leftJoystick = new VirtualJoystick(true);
    this.leftJoystick.limitToContainer = true;
    this.leftJoystick.containerSize = 100;
    this.leftJoystick.setJoystickSensibility(11);
    this.rightJoystick = new VirtualJoystick(false);
    this.rightJoystick.limitToContainer = true;
    this.rightJoystick.containerSize = 100;
    this.rightJoystick.setJoystickSensibility(11);

    this.scene.registerBeforeRender(() => {
      // Левый джойстик
      if (this.leftJoystick.pressed) {
        const joystickValues = this.leftJoystick.deltaPosition;

        // Поворот влево-вправо
        if (joystickValues.x > 0.1) {
          this.rotate("left", joystickValues.x);
        } else if (joystickValues.x < -0.1) {
          this.rotate("right", joystickValues.x);
        }
        // Подъём вверх-вниз
        if (joystickValues.y > 0.1 || joystickValues.y < -0.1) {
          this.droneAggregate.body.applyImpulse(
            this.droneBox.up.scale(
              this.TAKEOFF_SPEED * joystickValues.y * this.deltaTime
            ),
            this.droneBox.getAbsolutePosition()
          );
          // this.droneBox.physicsImpostor.applyImpulse(
          //   this.droneBox.up.scale(this.TAKEOFF_SPEED * joystickValues.y * this.deltaTime),
          //   this.droneBox.getAbsolutePosition()
          // );
        }
      }

      // Правый джойстик
      if (this.rightJoystick.pressed) {
        const joystickValues = this.rightJoystick.deltaPosition;
        // Наклон влево-вправо
        if (joystickValues.x > 0.1) {
          this.rotate("leftroll", joystickValues.x);
        } else if (joystickValues.x < -0.1) {
          this.rotate("rightroll", joystickValues.x);
        }
        // Наклон вперёд-назад
        if (joystickValues.y > 0.1) {
          this.rotate("forward", joystickValues.y);
        } else if (joystickValues.y < -0.1) {
          this.rotate("back", joystickValues.y);
        }
      }
    });
  }
}
