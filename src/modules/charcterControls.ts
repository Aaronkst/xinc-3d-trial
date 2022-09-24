import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

export default class CharacterControls {
  model: THREE.Group;
  mixer: THREE.AnimationMixer;
  animationsMap: Map<string, THREE.AnimationAction> = new Map(); //Walk, Run, Idle
  currentAnimation: THREE.AnimationAction | undefined;

  cameraTarget = new THREE.Vector3();

  movementVelocity = 0.05;

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
  }

  private setAnimation(animation: string) {
    if (!this.currentAnimation)
      this.currentAnimation = this.animationsMap.get(animation);
    else this.currentAnimation.stop();
    this.animationsMap.get(animation)?.reset().play();
    this.currentAnimation = this.animationsMap.get(animation);
  }

  public move(point: THREE.Vector3) {
    this.setAnimation("Walk");

    const startx = this.model.position.x;
    const startz = this.model.position.z;

    const pos = { x: false, z: false };

    let xInterval = setInterval(() => {
      if (startx > point.x) {
        if (this.model.position.x <= point.x) {
          clearInterval(xInterval);
        }
        this.model.position.x = this.model.position.x - this.movementVelocity;
      } else {
        if (this.model.position.x >= point.x) {
          clearInterval(xInterval);
        }
        this.model.position.x = this.model.position.x + this.movementVelocity;
      }
    }, 100);

    let zInterval = setInterval(() => {
      if (startz > point.z) {
        if (this.model.position.z <= point.z) {
          clearInterval(zInterval);
        }
        this.model.position.z = this.model.position.z - this.movementVelocity;
      } else {
        if (this.model.position.z >= point.z) {
          clearInterval(zInterval);
        }
        this.model.position.z = this.model.position.z + this.movementVelocity;
      }
    }, 100);

    let callbackInterval = setInterval(() => {
      if (startx > point.x) {
        if (this.model.position.x <= point.x) pos.x = true;
      } else {
        if (this.model.position.x >= point.x) pos.x = true;
      }
      if (startz > point.z) {
        if (this.model.position.z <= point.z) pos.z = true;
      } else {
        if (this.model.position.z >= point.z) pos.z = true;
      }
      if (!!pos.x && !!pos.z) {
        this.setAnimation("Idle");
        clearInterval(callbackInterval);
      }
    }, 100);
  }
}
