import * as THREE from "three";
import * as TWEEN from "@tweenjs/tween.js";

export default class CharacterControls {
  model: THREE.Group;
  mixer: THREE.AnimationMixer;
  animationsMap: Map<string, THREE.AnimationAction> = new Map(); //Walk, Run, Idle
  currentAnimation?: THREE.AnimationAction;
  movement?: TWEEN.Tween<THREE.Vector3>;
  velocity: number;
  default = true;

  constructor(
    model: THREE.Group,
    mixer: THREE.AnimationMixer,
    animationsMap: Map<string, THREE.AnimationAction>,
    currentAction: string,
    speed: number = 3
  ) {
    this.model = model;
    this.mixer = mixer;
    this.animationsMap = animationsMap;
    this.animationsMap.get(currentAction)?.play();
    this.velocity = speed;
  }

  private setAnimation(animation: string) {
    if (!this.currentAnimation)
      this.currentAnimation = this.animationsMap.get(animation);
    else this.currentAnimation.stop();
    this.animationsMap.get(animation)?.reset().play();
    this.currentAnimation = this.animationsMap.get(animation);
  }

  public reset() {
    this.movement?.stop();

    this.setAnimation("Idle");

    this.model.setRotationFromEuler(new THREE.Euler(0, 0, 0));
    this.model.position.x = 0;
    this.model.position.z = 0;
  }

  public move(point: THREE.Vector3) {
    this.default = false;
    this.movement?.stop();
    this.model.lookAt(point);
    this.model.rotateY(Math.PI);
    this.setAnimation("Walk");

    const distance = this.model.position.distanceTo(point);

    this.movement = new TWEEN.Tween(this.model.position).to(
      point,
      (distance / this.velocity) * 1000
    );

    this.movement.start();

    this.movement.onComplete(() => this.setAnimation("Idle"));
  }
}
