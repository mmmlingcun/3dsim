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
import CryptoJS from 'crypto-js'
export default {
  name: 'JiaMi',
  methods:{
    jiaMi(){
      // Encrypt
      var ciphertext = CryptoJS.AES.encrypt('my content', 'secret key 123').toString();

      // Decrypt
      var bytes  = CryptoJS.AES.decrypt(ciphertext, 'secret key 123');
      var originalText = bytes.toString(CryptoJS.enc.Utf8);

      console.log(originalText); // 'my message'

      var context1 = document.getElementById("content1").value
      var password = document.getElementById("password1").value

      // Encrypt
      var ciphertext = CryptoJS.AES.encrypt(context1,password).toString();

      document.getElementById("content").value = ciphertext
      document.getElementById("password2").value = password

    },
    jieMi(){
      var content = document.getElementById("content").value
      var password2 = document.getElementById("password2").value

      // Decrypt
      var bytes  = CryptoJS.AES.decrypt(content, password2);
      var originalText = bytes.toString(CryptoJS.enc.Utf8);

      document.getElementById("content2").value = originalText
    },
    encrypt(key,word) {

    },
    decrypt(key,word) {

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