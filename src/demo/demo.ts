import * as BABYLON from "babylonjs"

let wander = require("../app.ts").default
declare let window: any

class Demo {
  canvas: any
  engine: any
  scene: any
  camera: any

  constructor() {
    this.canvas = document.getElementById("renderCanvas");
    this.engine = new BABYLON.Engine(this.canvas, true, {
      preserveDrawingBuffer: true,
      stencil: true,
      doNotHandleContextLost: true
    });
    this.scene = new BABYLON.Scene(this.engine);
    this.scene.clearColor = new BABYLON.Color4(0, 0, 0, 0);
    //FreeCamera
    this.camera = new BABYLON.FreeCamera("freeCamera", new BABYLON.Vector3(0, 0, 0), this.scene)
    this.camera.attachControl(this.canvas, true);
    let light0 = new BABYLON.HemisphericLight("hem1", new BABYLON.Vector3(0, 1, 0), this.scene);
    light0.intensity = .5;
    this.engine.runRenderLoop(() => {
      this.scene.render();
    })
    window.addEventListener("resize", () => {
      this.engine.resize();
    });

    function random(a: any, b: any) {
      return Math.random() * (b - a) + a
    }

    let ball = BABYLON.Mesh.CreateSphere("ball", 50, 32, this.scene);
    for (let i = 0; i < 100; i++) {
      let instance = ball.createInstance("ball" + i);
      instance.position = new BABYLON.Vector3(random(-2000, 2000), random(-25, 100), random(-1000, 1000))
    }
    let ground = BABYLON.Mesh.CreateGround("ground", 4000, 4000, 1, this.scene)
    let grdMat = new BABYLON.StandardMaterial("grdMat", this.scene)
    let marbleUrl = require("./marble.jpg")
    let grdTex = new BABYLON.Texture(marbleUrl, this.scene)
    grdTex.uScale = grdTex.vScale = 100;
    grdMat.diffuseTexture = grdTex;
    ground.material = grdMat;
    ground.position.y = -50
    ground.checkCollisions = true;
  }
}

let demo = new Demo()
window.demo = demo;
window.test = wander(demo.camera, {})