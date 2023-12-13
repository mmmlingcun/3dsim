import {
  AnimationGroup,
  ArcRotateCamera,
  BoundingInfo,
  Color3,
  CubeTexture,
  DirectionalLight,
  Engine,
  HemisphericLight,
  Mesh,
  MeshBuilder,
  PositionGizmo,
  RotationGizmo,
  ScaleGizmo,
  Scene,
  SceneLoader,
  StandardMaterial,
  Texture,
  Vector3
} from '@babylonjs/core'
import { GridMaterial } from '@babylonjs/materials/Grid'
import '@babylonjs/loaders/glTF'
import { GLTF2Export } from '@babylonjs/serializers'
import CryptoJS from 'crypto-js'

export class BabylonScene {
  scene: Scene;
  engine: Engine;
  gizmoP:PositionGizmo;
  gizmoR:RotationGizmo;
  gizmoS:ScaleGizmo;
  gizmo;
  selectModel;
  constructor(private canvas: HTMLCanvasElement) {
    this.engine = new Engine(this.canvas, true);
    this.init();
    this.engine.runRenderLoop(() => {
      this.scene.render();
    });
  }

  /**
   * 场景初始化
   */
  init(){
    const THIS = this
    THIS.scene = THIS.CreateScene();
    THIS.camera = THIS.createCamera();
    THIS.lights = THIS.createLight();
    THIS.loadGUI();
    THIS.loadSykBox();
    THIS.createGround();
    // THIS.loadMyModel('/model/钢珠平台场景加密版.glb');

    // 监听双击事件
    THIS.canvas.addEventListener("dblclick",function(){
      var pickResult = THIS.scene.pick(THIS.scene.pointerX, THIS.scene.pointerY);
      console.log(pickResult)
      THIS.selectModel = THIS.getRootMesh(pickResult.pickedMesh)
      THIS.showBoundingBox(THIS.selectModel)
      THIS.adjustModel(THIS.selectModel)
    })
  }

  /**
   * 创建场景
   * @constructor
   */
  CreateScene(): Scene {
    const THIS = this
    // 创建场景
    const scene = new Scene(THIS.engine);
    // 开启场景碰撞检测
    scene.collisionsEnabled = true;
    // 挂载到window上
    window.myScene = scene
    return scene;
  }

  /**
   * 创建相机
   */
  createCamera(){
    const THIS = this
    // 创建环绕相机，指定名称、位置、目标、场景
    const Camera = new ArcRotateCamera("ArcRotateCamera", Math.PI/180*45, 0.8*Math.PI/2, 5,new Vector3(0,1,0), THIS.scene);
    // 添加相机操作控件
    Camera.attachControl(THIS.canvas,true);
    // 开启相机碰撞
    Camera.checkCollisions = true
    // 设置相机缩放尺度
    Camera.wheelDeltaPercentage = 0.01
    // 设置相机缩放范围
    Camera.lowerRadiusLimit = 2
    Camera.upperRadiusLimit = 15
    return Camera
  }

  /**
   * 创建灯光
   */
  createLight(){
    const THIS = this
    // 创建环境光
    const hemisphericLight = new HemisphericLight("HemiLight", new Vector3(0,1,0), THIS.scene);
    // 设置灯光亮度
    hemisphericLight.intensity = 1.5;
    // 创建平行光
    const directionalLight1 = new DirectionalLight("DirectionalLight", new Vector3(-1, -1, -1), THIS.scene);
    directionalLight1.intensity = 1.5;
    return [hemisphericLight,directionalLight1]
  }

  /**
   * 加载天空盒
   */
  loadSykBox(){
    const THIS = this;
    // 创建天空盒
    this.skybox = MeshBuilder.CreateBox("skyBox", { size: 100.0 }, THIS.scene);
    const skyboxMaterial = new StandardMaterial("skyBox", THIS.scene);
    // 关闭背面渲染
    skyboxMaterial.backFaceCulling = false;
    // 关闭光反射
    skyboxMaterial.disableLighting = true;
    this.skybox.material = skyboxMaterial;
    // 天空盒跟随相机位置
    this.skybox.infiniteDistance = true;
    // 天空盒贴图_nx _ny ...
    skyboxMaterial.reflectionTexture = new CubeTexture("/skybox/skybox", THIS.scene);
    skyboxMaterial.reflectionTexture.coordinatesMode = Texture.SKYBOX_MODE;
  }

  /**
   * 创建地板
   */
  createGround(){
    const THIS = this
    // 创建地板
    const ground = MeshBuilder.CreateGround("ground", {width: 20, height:20,sideOrientation:Mesh.DOUBLESIDE}, THIS.scene);
    ground.checkCollisions = true
    // 创建网格材质
    var groundMaterial = new GridMaterial("groundMaterial", THIS.scene);
    // 间隔颜色
    groundMaterial.mainColor = new Color3(0.7,0.7,0.7)
    // 线颜色
    groundMaterial.lineColor = new Color3(1,1,1)
    // 主线频率
    groundMaterial.majorUnitFrequency = 5;
    // 次线强度
    groundMaterial.minorUnitVisibility = 0.7;
    // 网格宽度
    groundMaterial.gridRatio = 1;
    // 透明度
    groundMaterial.opacity = 0.99;
    // 避免相交点过亮
    groundMaterial.useMaxLine = true;
    ground.material = groundMaterial
    ground.id = "ground"
  }

  /**
   * 寻找到模型根节点
   * @param child
   */
  getRootMesh(child){
    while(child.parent.name!="__root__"){
      child=child.parent
    }
    return child
  }

  /**
   * 显示模型包围盒
   * @param parent
   */
  showBoundingBox(parent){
    const THIS=this
    // 获取多个模型组合的最大最小边界
    let childMeshes = parent.getChildMeshes();
    let min = childMeshes[0].getBoundingInfo().boundingBox.minimumWorld;
    let max = childMeshes[0].getBoundingInfo().boundingBox.maximumWorld;
    for(let i=0; i<childMeshes.length; i++){
      let meshMin = childMeshes[i].getBoundingInfo().boundingBox.minimumWorld;
      let meshMax = childMeshes[i].getBoundingInfo().boundingBox.maximumWorld;
      min = Vector3.Minimize(min, meshMin);
      max = Vector3.Maximize(max, meshMax);
    }
    let children = parent.getChildren()
    for (const childKey in children) {
      if(children[childKey].id=="boundingBox"){
        children[childKey].showBoundingBox = !children[childKey].showBoundingBox
        return
      }
    }
    let box = new Mesh("boundingBox", THIS.scene);
    box.setBoundingInfo(new BoundingInfo(min, max));
    box.showBoundingBox = !box.showBoundingBox;
    box.setParent(parent)
  }

  /**
   * 添加控件，调整位置、旋转和缩放
   * @param model
   */
  adjustModel(model){
    const THIS = this
    document.onkeydown=(e)=>{
      var key = e.key
      if(THIS.gizmo.attachedMesh){
        THIS.gizmo.attachedMesh = null
        return
      }
      switch (key){
        case 't':THIS.gizmo = THIS.gizmoP;break;
        case 'r':THIS.gizmo = THIS.gizmoR;break;
        case 's':THIS.gizmo = THIS.gizmoS;break;
        case 'a':THIS.playAnimation(THIS.selectModel);return;
        case 'd':THIS.exportModel2GLB("钢珠平台场景");return;
        default:return;
      }
      THIS.gizmo.attachedMesh = model;
    }
  }

  /**
   * 导出glb模型
   * @param modelName
   */
  exportModel2GLB(modelName){
    const THIS = this;
    // 导出选项:剔除天空盒和网格地板
    let options = {
      shouldExportNode(node){
        return node.id !== "skyBox" && node.id!=="ground"
      }
    }
    // 导出成GLBData
    GLTF2Export.GLBAsync(THIS.scene,"钢珠平台场景",options).then((glb)=>{
      // 加密并下载模型
      THIS.downloadMyModel(glb)
    })
  }

  /**
   * 加密blob
   * @param blob
   */
  encryptMyModel(blob){
    var resultBlob;
    // 把blob转成arrayBuffer,进行加密
    var reader = new FileReader()
    reader.onload = function() {
      // blob转arrayBuffer
      var arrayBuffer = this.result;
      // arrayBuffer转wordArray
      var wordArray = CryptoJS.lib.WordArray.create(arrayBuffer);
      // 内容加密
      wordArray = CryptoJS.AES.encrypt(wordArray, 'secret key 123');
      // arrayBuffer转Blob
      resultBlob = new Blob([wordArray.toString()])
    }
    reader.readAsArrayBuffer(blob)
  }

  /**
   * 加密模型并下载文件
   * @param GLBData
   */
  downloadMyModel(GLBData){
    for (const key in GLBData.glTFFiles) {
      // 文件内容
      const blob = GLBData.glTFFiles[key];
      // 把blob转成arrayBuffer,进行加密
      var reader = new FileReader()
      reader.onload = function() {
        // blob转arrayBuffer
        var arrayBuffer = this.result;
        // arrayBuffer转wordArray
        var wordArray = CryptoJS.lib.WordArray.create(arrayBuffer);
        // 内容加密
        wordArray = CryptoJS.AES.encrypt(wordArray, 'secret key 123');
        // arrayBuffer转Blob
        var blob = new Blob([wordArray.toString()])

        // 使用a标签下载文件
        const link = document.createElement("a");
        document.body.appendChild(link);
        // 隐藏显示
        link.setAttribute("type", "hidden");
        // 文件名称
        link.download = key.replace("glb","mmm");
        let mimeType;
        mimeType = { type: "text/plain" };
        link.href = window.URL.createObjectURL(new Blob([blob], mimeType));
        link.click();
      }
      reader.readAsArrayBuffer(blob)
    }
  }

  /**
   * 通过url加载加密的模型
   * @param url
   */
  loadMyModel(url){
    const THIS = this
    let modelName = url.slice(url.lastIndexOf("/")+1)
    // 创建一个新的XMLHttpRequest对象
    let xhr = new XMLHttpRequest();
    // 配置请求，第一个参数是请求类型，第二个参数是文件路径
    xhr.open('GET', url, true);
    // 设置响应类型为文本
    xhr.responseType = 'text';
    // 注册一个事件处理程序，当请求完成时触发
    xhr.onload = function() {
      // 检查请求的状态
      if (xhr.status === 200) {
        // 请求成功，可以访问响应文本
        let context  = xhr.response;

        // 模型文件内容解密
        let file = THIS.decryptMyModel(context,modelName)

        // 加载模型到场景
        SceneLoader.Append("", file, THIS.scene, function (loadedScene) {
          const rootNode = scene.getMeshById("__root__")
          rootNode.id = modelName.slice(0,modelName.lastIndexOf("."))
          // rootNode.rotation = new Vector3(90*Math.PI/180,0,0)
          console.log("加载",scene)
        })
      } else {
        // 请求失败，处理错误
        console.error('Failed to load gltf file. Status: ' + xhr.status);
      }
    };
    // 注册一个事件处理程序，当请求出错时触发
    xhr.onerror = function() {
      console.error('Network error occurred while trying to fetch the gltf file.');
    };
    // 发送请求
    xhr.send();
  }

  /**
   * txt文本解密成file
   * @param context
   * @param modelName
   */
  decryptMyModel(context,modelName){
    // 内容解密
    let wordArray = CryptoJS.AES.decrypt(context, 'secret key 123');
    // wordBuffer转arrayBuffer
    let decryptedBuffer = new Uint8Array(wordArray.words.length * 4);
    for (let i = 0; i < wordArray.words.length; i++) {
      let word = wordArray.words[i];
      decryptedBuffer[i * 4] = (word >>> 24) & 0xff;
      decryptedBuffer[i * 4 + 1] = (word >>> 16) & 0xff;
      decryptedBuffer[i * 4 + 2] = (word >>> 8) & 0xff;
      decryptedBuffer[i * 4 + 3] = word & 0xff;
    }
    // arrayBuffer转File
    return new File([decryptedBuffer],modelName.replace("mmm","glb"))
  }

  /**
   * file加载到场景
   * @param file
   * @param modelName
   */
  loadModel2Scene(file,modelName){
    const THIS = this
    // 加载模型到场景
    SceneLoader.Append("", file, THIS.scene, function (loadedScene) {
      const rootNode = scene.getMeshById("__root__")
      rootNode.id = modelName.slice(0,modelName.lastIndexOf("."))
      console.log("加载完成",THIS.scene)
    })
  }

  /**
   * 初始化控件
   */
  async loadGUI() {
    const THIS = this;
    THIS.gizmoP = new PositionGizmo();
    THIS.gizmoR = new RotationGizmo();
    THIS.gizmoS = new ScaleGizmo();
    THIS.gizmo = THIS.gizmoP

    // // 加载GUI文件
    // let advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI("GUI", true, THIS.scene);
    // let loadedGUI = await advancedTexture.parseFromURLAsync("/GUI/guiTexture.json");
    // // 获取GUI控件
    // let J1Slider = advancedTexture.getControlByName("J1Slider");
    // let J2Slider = advancedTexture.getControlByName("J2Slider");
    // let J3Slider = advancedTexture.getControlByName("J3Slider");
    // let J4Slider = advancedTexture.getControlByName("J4Slider");
    // let J5Slider = advancedTexture.getControlByName("J5Slider");
    // let J6Slider = advancedTexture.getControlByName("J6Slider");
    // let J1Num = advancedTexture.getControlByName("J1Num");
    // let J2Num = advancedTexture.getControlByName("J2Num");
    // let J3Num = advancedTexture.getControlByName("J3Num");
    // let J4Num = advancedTexture.getControlByName("J4Num");
    // let J5Num = advancedTexture.getControlByName("J5Num");
    // let J6Num = advancedTexture.getControlByName("J6Num");
    // // 监听数据变化
    // J1Slider.onValueChangedObservable.add(function(value){
    //   J1Num.text = value.toFixed(1)
    //   let J1 = THIS.scene.getMeshById("J1")
    //   J1.rotation = new Vector3(0,value*Math.PI/180,0)
    // })
    // J2Slider.onValueChangedObservable.add(function(value){
    //   J2Num.text = value.toFixed(1)
    //   let J2 = THIS.scene.getMeshById("J2")
    //   J2.rotation = new Vector3(0,value*Math.PI/180,0)
    // })
    // J3Slider.onValueChangedObservable.add(function(value){
    //   J3Num.text = value.toFixed(1)
    //   let J3 = THIS.scene.getMeshById("J3")
    //   J3.rotation = new Vector3(0,value*Math.PI/180,0)
    // })
    // J4Slider.onValueChangedObservable.add(function(value){
    //   J4Num.text = value.toFixed(1)
    //   let J4 = THIS.scene.getMeshById("J4")
    //   J4.rotation = new Vector3(0,value*Math.PI/180,0)
    // })
    // J5Slider.onValueChangedObservable.add(function(value){
    //   J5Num.text = value.toFixed(1)
    //   let J5 = THIS.scene.getMeshById("J5")
    //   J5.rotation = new Vector3(J5.rotation.x,value*Math.PI/180,J5.rotation.z)
    // })
    // J6Slider.onValueChangedObservable.add(function(value){
    //   J6Num.text = value.toFixed(1)
    //   let J6 = THIS.scene.getMeshById("J6")
    //   J6.rotation = new Vector3(J6.rotation.x,value*Math.PI/180,J6.rotation.z)
    // })
  }

  /**
   * 播放模型文件动画
   */
  playAnimation(model){
    const animationGroup1 = new AnimationGroup(model.name);
    let childMeshes = model.getChildMeshes();
    for (const childMesh of childMeshes) {
      for (const animation of childMesh.animations) {
        animationGroup1.addTargetedAnimation(animation,childMesh)
      }
    }
    console.log(animationGroup1)
    animationGroup1.start(false,1,animationGroup1.from,animationGroup1.to,false)
  }

  createMyUI(){
    var container = document.getElementById("myBabylon")
    var myButton = ""
  }
}
