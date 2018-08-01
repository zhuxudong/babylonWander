# babylonWander
> 基于Babylon的漫游手柄插件,该插件使用自己的配置来实现漫游功能，具体配置参考下面option

## Global
```
<script src="babylonWander.min.js"></script>  
<script>
    babylonWander(camera)
</script>
```
## NPM
npm install
```
npm install babylonwander --save
```
use with ES6
```
import babylonWander from 'babylonWander'
babylonWander(camera)
```
or you can use with commonJS
```
let babylonWander=require('babylonWander')
babylonWander(camera)
```

## option
```
let wander=babylonWander(camera,option)
```
* camera:创建的漫游相机
* option:漫游相关配置,默认配置如下
   > 默认canvas的父对象,可以通过 wander.setWrapper来更改
   * wrapper: canvas.parentElement
   > 碰撞椭圆体
   * ellipsoid: new BABYLON.Vector3(.5, 2, .5)
   > 重力
   * gravity: new BABYLON.Vector3(0, -9.8, 0)
   > 漫游code码,默认←↑→↓和AWDS
   * keysLeft: [37, 65]
   * keysUp: [38, 87]
   * keysRight: [39, 68]
   * keysDown: [40, 83]
   > 跳跃code码,默认space
   * keysJump: [32]
   > 漫游速度
   * speed: 1
   > 弹跳能力
   * jumpingAbility: 30
   > 允许弹跳间隔时间
   * jumpingTime: 600
   > 漫游灵敏度,50代表50像素达到最大值，所以数值越大越不灵敏
   * wanderSensibility: 50
   > 旋转视角灵敏度
   * rotateSensibility: 100


## API
```
let wander=babylonWander(camera,option)
```
> 重新设置包裹漫游插件的DOM
* wander.setWrapper(dom) 
> 获取漫游插件的配置项
* wander.getOption() 
> 设置漫游插件的配置项
* wander.setOption({...}) 
> 显示插件,并开启事件
* wander.show()
> 隐藏插件,disposeEvent决定是否隐藏的同时也销毁事件
* wander.hide(disposeEvent?: boolean) 
> 手动销毁漫游插件.当babylon引擎销毁的时候会自动销毁漫游插件
* wander.dispose() 


![demo](//http://zhuxudong.cn/github/img/babylonWander/1.jpg)


 