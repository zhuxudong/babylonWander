import * as  BABYLON from "babylonjs"
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
  let scene: any = camera.getScene();
  let engine: any = scene.getEngine();
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
  let _x: any = 0, _y: any = 0, _z: any = 0;
  //[-.02, .02]
  // let _rx: any = 0, _ry: any = 0;
  let touchInfoLeft: any = null
  let touchInfoRight: any = null

  opt = Object.assign({
    wrapper: canvas.parentElement,
    ellipsoid: new BABYLON.Vector3(.5, 2, .5),
    gravity: new BABYLON.Vector3(0, -9.8, 0),
    keysLeft: [37, 65],
    keysUp: [38, 87],
    keysRight: [39, 68],
    keysDown: [40, 83],
    keysJump: [32],
    speed: 1,
    jumpingAbility: 30,
    jumpingTime: 600,
    wanderSensibility: 50,
    rotateSensibility: 100
    // maxRotateSpeed: .02
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
    camera.keysLeft = []
    camera.keysUp = []
    camera.keysRight = []
    camera.keysDown = []
  }

  function _wander() {
    if (camera._localDirection) {
      camera._localDirection.copyFromFloats(_x * opt.speed, _y, _z * opt.speed);
      camera.getViewMatrix().invertToRef(camera._cameraTransformMatrix);
      BABYLON.Vector3.TransformNormalToRef(camera._localDirection, camera._cameraTransformMatrix, camera._transformedDirection);
      camera.cameraDirection.addInPlace(camera._transformedDirection);
      // camera.rotation.x = Math.max(Math.min(camera.rotation.x + _rx, Math.PI / 2 - .1), -Math.PI / 2 + .1);
      // camera.rotation.y += _ry;
      if (_y) {
        _y = 0;
      }
    }


  }

  function jump(e?: any) {
    e && e.preventDefault && e.preventDefault();
    controlJump.classList.add("active");
    if (canJump) {
      canJump = false;
      _y = opt.jumpingAbility;
      window.setTimeout(function () {
        canJump = true;
      }, opt.jumpingTime)
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
      jump();
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

  function touchstartLeft(e: any) {
    e.preventDefault && e.preventDefault();
    e = e.changedTouches ? e.changedTouches[0] : e;
    let offsetX: any = getComputedStyle(controlLeft).left;
    let offsetY: any = getComputedStyle(controlLeft).top;
    touchInfoLeft = {
      offsetX: parseFloat(offsetX),
      offsetY: parseFloat(offsetY),
      clientX: e.clientX,
      clientY: e.clientY,
      identifier: e.identifier
    }
  }

  function touchstartRight(e: any) {
    e.preventDefault && e.preventDefault();
    e = e.changedTouches ? e.changedTouches[0] : e;
    let offsetX: any = getComputedStyle(controlRight).left;
    let offsetY: any = getComputedStyle(controlRight).top;
    touchInfoRight = {
      offsetX: parseFloat(offsetX),
      offsetY: parseFloat(offsetY),
      clientX: e.clientX,
      clientY: e.clientY,
      rotationX: camera.rotation.x,
      rotationY: camera.rotation.y,
      identifier: e.identifier
    }
  }

  function touchmove(e: any) {
    e = e.changedTouches ? e.changedTouches[0] : e;
    let difXLeft: any = null;
    let difXRight: any = null;
    let difYLeft: any = null;
    let difYRight: any = null;
    let clientX: any = e.clientX;
    let clientY: any = e.clientY;
    if (touchInfoLeft && e.identifier == touchInfoLeft.identifier) {
      difXLeft = clientX - touchInfoLeft.clientX;
      difYLeft = clientY - touchInfoLeft.clientY;
      controlLeft.style.left = touchInfoLeft.offsetX + difXLeft + "px";
      controlLeft.style.top = touchInfoLeft.offsetY + difYLeft + "px";
      _x = Math.min(Math.max(-1, difXLeft / opt.wanderSensibility), 1);
      _z = Math.min(Math.max(-1, difYLeft / -opt.wanderSensibility), 1);
      if (difXLeft > 0) {
        arrowRight.classList.add("active")
        arrowLeft.classList.remove("active")
      } else if (difXLeft < 0) {
        arrowLeft.classList.add("active")
        arrowRight.classList.remove("active")
      }
      if (difYLeft > 0) {
        arrowBottom.classList.add("active")
        arrowTop.classList.remove("active")
      } else if (difYLeft < 0) {
        arrowTop.classList.add("active")
        arrowBottom.classList.remove("active")
      }
    }
    if (touchInfoRight && e.identifier == touchInfoRight.identifier) {
      difXRight = clientX - touchInfoRight.clientX;
      difYRight = clientY - touchInfoRight.clientY;
      controlRight.style.left = touchInfoRight.offsetX + difXRight + "px";
      controlRight.style.top = touchInfoRight.offsetY + difYRight + "px";
      camera.rotation.x = Math.max(Math.min(touchInfoRight.rotationX + difYRight / opt.rotateSensibility, Math.PI / 2 - .1), -Math.PI / 2 + .1);
      camera.rotation.y = touchInfoRight.rotationY + difXRight / opt.rotateSensibility * Math.PI / 2;
      // _rx = Math.min(Math.max(-opt.maxRotateSpeed, difXRight / opt.rotateSensibility), opt.maxRotateSpeed);
      // _ry = Math.min(Math.max(-opt.maxRotateSpeed, difYRight / -opt.rotateSensibility), opt.maxRotateSpeed);
    }
  }

  function touchend(e: any) {
    e = e.changedTouches ? e.changedTouches[0] : e;
    /**left*/
    if (touchInfoLeft && touchInfoLeft.identifier == e.identifier) {
      touchInfoLeft = null;
      controlLeft.removeAttribute("style");
      arrowTop.classList.remove("active");
      arrowRight.classList.remove("active");
      arrowBottom.classList.remove("active");
      arrowLeft.classList.remove("active");
      _x = _z = 0;
    }
    /**right*/
    if (touchInfoRight && touchInfoRight.identifier == e.identifier) {
      touchInfoRight = null;
      controlRight.removeAttribute("style");
    }
    // _rx = _ry = 0;
    /**jump*/
    controlJump.classList.remove("active");
  }

  function initPannelEvent() {
    disposePannelEvent();
    /**PC*/
    controlLeft.addEventListener("mousedown", touchstartLeft)
    controlRight.addEventListener("mousedown", touchstartRight)
    controlJump.addEventListener("mousedown", jump)
    document.addEventListener("mousemove", touchmove)
    document.addEventListener("mouseup", touchend)
    /**mobile*/
    controlLeft.addEventListener("touchstart", touchstartLeft)
    controlRight.addEventListener("touchstart", touchstartRight)
    controlJump.addEventListener("touchstart", jump)
    document.addEventListener("touchmove", touchmove)
    document.addEventListener("touchend", touchend)
  }

  function disposePannelEvent() {
    /**PC*/
    controlLeft.removeEventListener("mousedown", touchstartLeft)
    controlRight.removeEventListener("mousedown", touchstartRight)
    controlJump.removeEventListener("mousedown", jump)
    document.removeEventListener("mousemove", touchmove)
    document.removeEventListener("mouseup", touchend)
    /**mobile*/
    controlLeft.removeEventListener("touchstart", touchstartLeft)
    controlRight.removeEventListener("touchstart", touchstartRight)
    controlJump.removeEventListener("touchstart", jump)
    document.removeEventListener("touchmove", touchmove)
    document.removeEventListener("touchend", touchend)
  }

  function initAllEvent() {
    initRender();
    initKeyboardEvent();
    initPannelEvent();
  }

  function disposeAllEvent() {
    disposeRender();
    disposeKeyboardEvent();
    disposePannelEvent();
  }

  function disposeAll() {
    disposeAllEvent()
    opt.wrapper.removeChild(page)
  }

  initPage();
  initCamera()
  initAllEvent();
  scene.onDisposeObservable.add(disposeAll)
  return {
    setWrapper: (wrapper: any) => {
      opt.wrapper = wrapper;
      wrapper.appendChild && wrapper.appendChild(page)
    },
    getOption: () => opt,
    setOption: (newOpt: any) => {
      Object.assign(opt, newOpt)
    },
    show: () => {
      initAllEvent();
      page.classList.add("show")
    },
    hide: (disposeEvent?: boolean) => {
      if (disposeEvent) {
        disposeAllEvent()
      } else {
        initAllEvent();
      }
      page.classList.remove("show")
    },
    dispose: disposeAll
  }
}