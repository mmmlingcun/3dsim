<template>
  <div>
    <canvas id='myBabylon'></canvas>
    <input type='file' id='myFile' style='position: absolute;top:10px;left: 10px;' accept='.gltf,.glb,.mmm'/>
    <button @click='uploadModel' style='position: absolute;top:40px;left: 10px;'>加载模型</button>
    <button @click='downloadModel' style='position: absolute;top:70px;left: 10px;'>下载文件</button>

  </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue';
import { BabylonScene } from '@/utils/BabylonScene';

var myBabylon;
export default defineComponent({
  name: 'BabylonOne',
  mounted(){ //lifecycle hook
    const canvas = document.querySelector("canvas");
    myBabylon = new BabylonScene(canvas)
    window.myBabylon = myBabylon
  },
  methods:{
    uploadModel(){
      // 读取input标签上传的文件
      let myFile = document.getElementById("myFile").files[0]
      if(myFile){
        let reader = new FileReader();
        reader.onload = function(e){
          // 读取加密文件的文本内容
          let context = e.target.result
          // 文件内容解密
          let file = myBabylon.decryptMyModel(context,myFile.name)
          // 加载到场景中
          myBabylon.loadModel2Scene(file,myFile.name)
        }
        reader.readAsText(myFile)
      }
    },
    downloadModel(){
      // 场景导出加密下载
      myBabylon.exportModel2GLB()
    }
  }
});
</script>
<style scoped>
#myBabylon{
  height: 100%;
  width: 100%;
}
</style>