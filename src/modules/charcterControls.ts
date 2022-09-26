import * as THREE from "three";

interface Movement {
  xInterval?: ReturnType<typeof setInterval>;
  zInterval?: ReturnType<typeof setInterval>;
  callbackInterval?: ReturnType<typeof setInterval>;
}

/**
 * Convert radians to degrees
 * @param r radians
 * @returns degress
 */
const r2d = (r: number): number => {
  return r * (180 / Math.PI);
};

/**
 * Convert degrees to radians
 * @param d degrees
 * @returns radians
 */
const d2r = (d: number): number => {
  return d * (Math.PI / 180);
};

export default class CharacterControls {
  model: THREE.Group;
  mixer: THREE.AnimationMixer;
  animationsMap: Map<string, THREE.AnimationAction> = new Map(); //Walk, Run, Idle
  currentAnimation: THREE.AnimationAction | undefined;
  movement: Movement;
  moveunit = 0.03;
  velocity = 1;

  constructor(
    model: THREE.Group,
    mixer: THREE.AnimationMixer,
    animationsMap: Map<string, THREE.AnimationAction>,
    currentAction: string
  ) {
    this.model = model;
    this.mixer = mixer;
    this.animationsMap = animationsMap;
    this.animationsMap.forEach((value, key) => {
      if (key == currentAction) {
        value.play();
      }
    });
    this.movement = {};
  }

  private setAnimation(animation: string) {
    if (!this.currentAnimation)
      this.currentAnimation = this.animationsMap.get(animation);
    else this.currentAnimation.stop();
    this.animationsMap.get(animation)?.reset().play();
    this.currentAnimation = this.animationsMap.get(animation);
  }

  public reset() {
    clearInterval(this.movement.xInterval);
    clearInterval(this.movement.zInterval);
    clearInterval(this.movement.callbackInterval);

    this.setAnimation("Idle");

    this.model.setRotationFromEuler(new THREE.Euler(0, 0, 0));
    this.model.position.x = 0;
    this.model.position.z = 0;
  }

  public move(point: THREE.Vector3) {
    clearInterval(this.movement.xInterval);
    clearInterval(this.movement.zInterval);
    clearInterval(this.movement.callbackInterval);

    this.model.lookAt(point);
    this.model.rotateY(Math.PI);
    this.setAnimation("Walk");

    const startx = this.model.position.x;
    const startz = this.model.position.z;

    const distx = point.x > startx ? point.x - startx : startx - point.x;
    const distz = point.z > startz ? point.z - startz : startz - point.z;

    const timex = distx / this.velocity;
    const timez = distz / this.velocity;

    console.log("timex", timex, "timez", timez);

    const isArrived = { x: false, z: false };

    this.movement.xInterval = setInterval(() => {
      if (startx > point.x) {
        if (this.model.position.x <= point.x) {
          clearInterval(this.movement.xInterval);
        }
        this.model.position.x = this.model.position.x - this.moveunit;
      } else {
        if (this.model.position.x >= point.x) {
          clearInterval(this.movement.xInterval);
        }
        this.model.position.x = this.model.position.x + this.moveunit;
      }
    }, 100 / timex);

    this.movement.zInterval = setInterval(() => {
      if (startz > point.z) {
        if (this.model.position.z <= point.z) {
          clearInterval(this.movement.zInterval);
        }
        this.model.position.z = this.model.position.z - this.moveunit;
      } else {
        if (this.model.position.z >= point.z) {
          clearInterval(this.movement.zInterval);
        }
        this.model.position.z = this.model.position.z + this.moveunit;
      }
    }, 100 / timez);

    this.movement.callbackInterval = setInterval(() => {
      if (startx > point.x) {
        if (this.model.position.x <= point.x) isArrived.x = true;
      } else {
        if (this.model.position.x >= point.x) isArrived.x = true;
      }
      if (startz > point.z) {
        if (this.model.position.z <= point.z) isArrived.z = true;
      } else {
        if (this.model.position.z >= point.z) isArrived.z = true;
      }
      if (!!isArrived.x && !!isArrived.z) {
        this.setAnimation("Idle");
        clearInterval(this.movement.callbackInterval);
      }
    }, 100);
  }
}
