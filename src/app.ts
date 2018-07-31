import * as BABYLON from "babylonjs"
import "./wander.less"

if (!Object.assign) {
  Object.assign = function () {
    let json: any = {};
    try {
      json = arguments[0];
      for (let i = 1; i < arguments.length; i++) {
        for (let key in arguments[i]) {
          json[key] = arguments[i][key]
        }
      }
    } catch (e) {
      console.warn(e);
    }
    return json;
  }
  Object.defineProperty(Object.prototype, "assign", {"enumerable": false});
}
export default (camera: any, opt?: any) => {
  if (!camera.getClassName || camera.getClassName() !== "FreeCamera") {
    console.error("babylonWander only support BABYLON.FreeCamera...");
    return;
  }
  let scene: BABYLON.Scene = camera.getScene();
  let engine: BABYLON.Engine = scene.getEngine();
  let canvas: any = engine.getRenderingCanvas();
  let page = document.createElement("div");
  let controlLeft: any = null;
  let controlRight: any = null;
  let controlJump: any = null;
  let arrowTop: any = null;
  let arrowRight: any = null;
  let arrowBottom: any = null;
  let arrowLeft: any = null;
  let canJump: boolean = true;
  //[-1,1]
  let _x: any = 0, _y: any = 0, _z: any = 0
  opt = Object.assign({
    wrapper: canvas.parentElement,
    ellipsoid: new BABYLON.Vector3(.5, 2, .5),
    gravity: new BABYLON.Vector3(0, -9.8, 0),
    keysLeft: [37, 65],
    keysUp: [38, 87],
    keysRight: [39, 68],
    keysDown: [40, 83],
    keysJump: [32],
    speed: 1
  }, opt)

  function initPage() {
    page.setAttribute("class", "babylon-wander show")
    page.innerHTML =
      `
    <div class="control-left">
        <div class="arrow-top"></div>
        <div class="arrow-right"></div>
        <div class="arrow-bottom"></div>
        <div class="arrow-left"></div>
        <div class="control-center"></div>
    </div>
    <div class="control-right">
         <div class="control-center"></div>
    </div>
    <div class="control-jump"></div>
`
    opt.wrapper && opt.wrapper.appendChild(page)
    controlLeft = page.querySelector(".control-left .control-center");
    controlRight = page.querySelector(".control-right .control-center");
    controlJump = page.querySelector(".control-jump");
    arrowTop = page.querySelector(".control-left .arrow-top");
    arrowRight = page.querySelector(".control-left .arrow-right");
    arrowBottom = page.querySelector(".control-left .arrow-bottom");
    arrowLeft = page.querySelector(".control-left .arrow-left");
  }

  function initCamera() {
    camera.checkCollisions = true;
    camera.ellipsoid = opt.ellipsoid;
    scene.gravity = opt.gravity;
    camera._needMoveForGravity = true;
    camera.applyGravity = true;
    camera.speed = 2;
    // camera.keysLeft = opt.keysLeft;
    // camera.keysUp = opt.keysUp;
    // camera.keysRight = opt.keysRight;
    // camera.keysDown = opt.keysDown;
    camera.keysLeft = []
    camera.keysUp = []
    camera.keysRight = []
    camera.keysDown = []
  }

  function _wander() {
    camera._localDirection.copyFromFloats(_x * opt.speed, _y * opt.speed, _z * opt.speed);
    camera.getViewMatrix().invertToRef(camera._cameraTransformMatrix);
    BABYLON.Vector3.TransformNormalToRef(camera._localDirection, camera._cameraTransformMatrix, camera._transformedDirection);
    camera.cameraDirection.addInPlace(camera._transformedDirection);
    if (_y) {
      _y = 0;
    }
  }

  function initRender() {
    disposeRender();
    scene.registerBeforeRender(_wander)
  }

  function disposeRender() {
    scene.unregisterBeforeRender(_wander)
  }

  function keydown(e: any) {
    let keyCode = e.event.keyCode;
    if (opt.keysLeft.indexOf(keyCode) != -1) {
      arrowLeft.classList.add("active");
      _x = -1;
    } else if (opt.keysUp.indexOf(keyCode) != -1) {
      arrowTop.classList.add("active");
      _z = 1;
    } else if (opt.keysRight.indexOf(keyCode) != -1) {
      arrowRight.classList.add("active");
      _x = 1;
    } else if (opt.keysDown.indexOf(keyCode) != -1) {
      arrowBottom.classList.add("active");
      _z = -1;
    } else if (opt.keysJump.indexOf(keyCode) != -1) {
      if (canJump) {
        canJump = false;
        controlJump.classList.add("active");
        _y = 30;
        window.setTimeout(function () {
          canJump = true;
        }, 600)
      }
    }
  }

  function keyup(e: any) {
    let keyCode = e.event.keyCode;
    if (opt.keysLeft.indexOf(keyCode) != -1) {
      arrowLeft.classList.remove("active");
      _x = 0
    } else if (opt.keysUp.indexOf(keyCode) != -1) {
      arrowTop.classList.remove("active");
      _z = 0;
    } else if (opt.keysRight.indexOf(keyCode) != -1) {
      arrowRight.classList.remove("active");
      _x = 0;
    } else if (opt.keysDown.indexOf(keyCode) != -1) {
      arrowBottom.classList.remove("active");
      _z = 0;
    } else if (opt.keysJump.indexOf(keyCode) != -1) {
      controlJump.classList.remove("active");
      _y = 0;
    }
  }

  function initKeyboardEvent() {
    disposeKeyboardEvent();
    scene.onKeyboardObservable.add(keydown, 1)
    scene.onKeyboardObservable.add(keyup, 2)
  }

  function disposeKeyboardEvent() {
    scene.onKeyboardObservable.removeCallback(keydown)
    scene.onKeyboardObservable.removeCallback(keyup)
  }

  function mousedown() {

  }

  initPage();
  initCamera()
  initKeyboardEvent();
  initRender();

  return {
    setWrapper: (wrapper: any) => {
      wrapper.appendChild && wrapper.appendChild(page)
    },
    show: () => {
      initRender();
      page.classList.add("show")
    },
    hide: () => {
      disposeRender();
      page.classList.remove("show")
    },
    dispose: () => {
      disposeRender()
    }
  }
}