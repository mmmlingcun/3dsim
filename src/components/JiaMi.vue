<template>
  <div id='jiami'>
    <div class='block'>
      <div class='element'>
        <label>密钥</label>
      </div>
      <div class='element'>
        <input type='text' id='password1'>
      </div>
      <div class='element'>
        <label>原始内容</label>
      </div>
      <div class='element'>
        <textarea name='jiemi' id='content1' cols='23' rows='10'></textarea>
      </div>
    </div>
    <button @click='jiaMi'>加密</button>
    <div class='block'>
      <div class='element'>
        <label>加密内容</label>
      </div>
      <div class='element'>
        <textarea name='jiemi' id='content' cols='30' rows='10'></textarea>
      </div>
    </div>
    <button @click='jieMi'>解密</button>
    <div class='block'>
      <div class='element'>
        <label>密钥</label>
      </div>
      <div class='element'>
        <input type='text' id='password2'>
      </div>
      <div class='element'>
        <label>解密内容</label>
      </div>
      <div class='element'>
        <textarea name='jiemi' id='content2' cols='23' rows='10'></textarea>
      </div>
    </div>
  </div>
</template>

<script>
import forge from 'node-forge'
export default {
  name: 'JiaMi',
  methods:{
    jiaMi(){
      var keyStr = forge.random.getBytesSync(16) // 生成随机iv 12字节
      this.key = keyStr
      document.getElementById("password1").value = forge.util.encode64(keyStr);
      var content = document.getElementById("content1").value
      var result = this.encrypt(keyStr,content)
      document.getElementById("content").value = result
    },
    jieMi(){
      var keyStr = document.getElementById("password1").value
      document.getElementById("password2").value = keyStr
      var content = document.getElementById("content").value
      var result = this.decrypt(keyStr,content)
      document.getElementById("content2").value = result
    },
    encrypt(key,word) {
      var iv = forge.random.getBytesSync(16) // 生成随机iv 12字节
      var cipher = forge.cipher.createCipher('AES-CBC', key) // 生成AES-GCM模式的cipher对象 并传入密钥
      cipher.start({
        iv: iv
      })
      cipher.update(forge.util.createBuffer(forge.util.encodeUtf8(word)))
      cipher.finish()
      var encrypted = cipher.output
      this.iv = iv
      this.encrypted = encrypted
      console.log(this)
      return forge.util.encode64(encrypted.getBytes())
    },
    decrypt(key,word) {
      var key = this.key
      var iv = this.iv
      var encrypted = this.encrypted
      var decipher = forge.cipher.createDecipher('AES-CBC', key);
      decipher.start({iv: iv});
      decipher.update(encrypted);
      var result = decipher.finish(); // check 'result' for true/false
      var decrypted = decipher.output
      return forge.util.encode64(decrypted.getBytes());
    }
  }
}
</script>

<style scoped>
#jiami{
  display: flex;
  justify-content: space-evenly;
  align-items: center;
}
.element {
  text-align: center;
  margin-bottom: 20px; /* 自定义垂直间距 */
}

</style>