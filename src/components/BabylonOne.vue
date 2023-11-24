<template>
  <div>
    <canvas id='myBabylon'></canvas>
  </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue';
import { BabylonScene } from '@/utils/BabylonScene';
export default defineComponent({
  name: 'BabylonOne',
  mounted(){ //lifecycle hook
    const canvas = document.querySelector("canvas");
    window.myBabylon = new BabylonScene(canvas)
  }
});
</script>
<style scoped>
#myBabylon{
  height: 100%;
  width: 100%;
}
</style>