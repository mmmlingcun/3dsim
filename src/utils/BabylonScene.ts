import {
  Scene,
  Engine,
  HemisphericLight,
  MeshBuilder,
  Vector3,
  StandardMaterial,
  Color3,
  ArcRotateCamera,
  Animation,
  CubeTexture,
  Texture,
  Mesh,
  SceneLoader,
  DirectionalLight,
  Color4,
  BoundingBoxGizmo, BoundingInfo, UtilityLayerRenderer, PositionGizmo, RotationGizmo, ScaleGizmo, AnimationGroup
} from '@babylonjs/core'
import { GridMaterial } from '@babylonjs/materials/Grid';
import "@babylonjs/loaders/glTF";

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
    this.scene = this.CreateScene();
    this.init()
    this.engine.runRenderLoop(() => {
      this.scene.render();
    });
  }
  CreateScene(): Scene {
    const THIS = this
    // 创建场景
    const scene = new Scene(THIS.engine);
    // 开启场景碰撞检测
    scene.collisionsEnabled = true;

    // 创建环绕相机，指定名称、位置、目标、场景
    const Camera = new ArcRotateCamera("ArcRotateCamera", Math.PI/180*45, 0.8*Math.PI/2, 5,new Vector3(0,1,0), this.scene);
    // 添加相机操作控件
    Camera.attachControl(THIS.canvas,true);
    // 开启相机碰撞
    Camera.checkCollisions = true
    // 设置相机缩放尺度
    Camera.wheelDeltaPercentage = 0.01
    // 设置相机缩放范围
    Camera.lowerRadiusLimit = 2
    Camera.upperRadiusLimit = 15

    // 创建灯光
    // 创建环境光
    const hemisphericLight = new HemisphericLight("HemiLight", new Vector3(0,1,0), THIS.scene);
    // 设置灯光亮度
    hemisphericLight.intensity = 2;
    // 创建平行光
    const directionalLight1 = new DirectionalLight("DirectionalLight", new Vector3(-1, -1, -1), THIS.scene);
    directionalLight1.intensity = 2;

    // 天空盒
    const skybox = MeshBuilder.CreateBox("skyBox", { size: 100.0 }, scene);
    const skyboxMaterial = new StandardMaterial("skyBox", scene);
    // 关闭背面渲染
    skyboxMaterial.backFaceCulling = false;
    // 关闭光反射
    skyboxMaterial.disableLighting = true;
    skybox.material = skyboxMaterial;
    // 天空盒跟随相机位置
    skybox.infiniteDistance = true;
    // 天空盒贴图_nx _ny ...
    skyboxMaterial.reflectionTexture = new CubeTexture("/skybox/skybox", scene);
    skyboxMaterial.reflectionTexture.coordinatesMode = Texture.SKYBOX_MODE;

    //3D Object
    const ground = MeshBuilder.CreateGround("ground", {width: 20, height:20,sideOrientation:Mesh.DOUBLESIDE}, this.scene);
    ground.checkCollisions = true
    // 创建网格材质
    var groundMaterial = new GridMaterial("groundMaterial", scene);
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

    // 加载模型，返回场景
    SceneLoader.Append("/model/","钢珠平台动画版.glb",THIS.scene,function(scene){
      const rootNode = scene.getMeshById("__root__")
      rootNode.id = "钢珠平台"
      rootNode.rotation = new Vector3(90*Math.PI/180,0,0)
      console.log("加载",scene)
    })


    // 监听双击事件
    THIS.canvas.addEventListener("dblclick",function(){
      var pickResult = scene.pick(scene.pointerX, scene.pointerY);
      console.log(pickResult)
      THIS.selectModel = THIS.getRootMesh(pickResult.pickedMesh)
      THIS.showBoundingBox(THIS.selectModel)
      THIS.adjustModel(THIS.selectModel)
    })
    // 挂载到window上
    window.myScene = scene

    return scene;
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
        default:return;
      }
      THIS.gizmo.attachedMesh = model;
    }
  }

  /**
   * 初始化
   */
  init(){
    const THIS = this;
    THIS.gizmoP = new PositionGizmo();
    THIS.gizmoR = new RotationGizmo();
    THIS.gizmoS = new ScaleGizmo();
    THIS.gizmo = THIS.gizmoP
  }

  /**
   * 播放模型文件动画
   */
  playAnimation(model){
    const animationGroup1 = new AnimationGroup("ER20");
    let childMeshes = model.getChildMeshes();
    for (const childMesh of childMeshes) {
      for (const animation of childMesh.animations) {
        animationGroup1.addTargetedAnimation(animation,childMesh)
      }
    }
    console.log(animationGroup1)
    animationGroup1.start(false,1,animationGroup1.from,animationGroup1.to,false)
  }
}
