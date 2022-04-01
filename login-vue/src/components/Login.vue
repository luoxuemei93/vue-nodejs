<template>
  <div id="login">
    <label class="lab">
      <span class="demo-input-label">Email</span>
      <el-input v-model="email" placeholder="Please input" clearable @blur="checkEmail"/>
      <div v-show ="isEmail" class="check"><span>邮箱格式不符合规则</span></div>
    </label>
    <label class="lab">
      <span class="demo-input-label">Password</span>
      <el-input v-model="psw" placeholder="Please input password" show-password @blur="checkPsw" @keyup.enter="login"/>
      <div v-show ="isPsw" class="check"><span>密码不符合规则</span></div>
    </label>
    <br />
    <div id="btn">
      <el-button type="success" @click="login">Login</el-button>
    </div>
  </div>
</template>

<script>
import { ref } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";
import { ElNotification } from "element-plus";

export default {
  setup() {
    let email = ref(); // 绑定 email
    let psw = ref(); // 绑定 密码
    let isEmail = ref(false);
    let isPsw = ref(false);

    const router = useRouter();

    // 检查 email 格式
    const checkEmail = () => {
      let emailReg = /^([a-zA-Z]|[0-9])(\w|-)+@[a-zA-Z0-9]+\.([a-zA-Z]{2,4})$/;
      if (!emailReg.test(email.value) && email.value.length) {
        isEmail.value = true;
      } else isEmail.value = false;
    }

    // 检查 password 格式
    const checkPsw = () => {
      if (psw.value.length > 0 && psw.value.length < 6) {
        isPsw.value = true;
      } else isPsw.value = false;
    }

    const login = () => {
      if (!email.value || !psw.value) {
        // alert("输入不能为空");
        ElNotification({
          title: "Warning",
          message: "The email address and password cannot be empty!",
          type: "warning",
        });
        return;
      }

      // 针对 @keyup.enter 触发的情况 额外检查密码格式 
      if (psw.value.length > 0 && psw.value.length < 6) {
        isPsw.value = true;
        return;
      } else isPsw.value = false;

      axios({
        method: "post",
        url: "http://127.0.0.1:3000/api/user/login",
        data: { email: email.value, password: psw.value },
      }).then((res) => {
        console.log(res);
        if (res.data.status === "0") {
          localStorage.setItem("token", res.data.token);
          router.push("/content");
          ElNotification({
            title: "Success",
            message: "Login successfully",
            type: "success",
          });
        } else {
          // alert(res.data.message);
          ElNotification({
            title: "Error",
            message: res.data.message,
            type: "error",
          });
        }
      });
      axios.interceptors.request.use(
        function (config) {
          // 在发送请求之前做些什么
          let token = localStorage.getItem('token');
          if (token) {
            config.headers.Authorization = token;
          }
          return config;
        },
        function (error) {
          // 对请求错误做些什么
          return Promise.reject(error);
        }
      );
    };
    return {
      email,
      psw,
      login,
      checkEmail,
      isEmail,
      checkPsw,
      isPsw
    };
  },
};
</script>

<style>
.lab {
  display: block;
  width: 15vw;
  height: 7vh;
  margin: 2vh;
}

#btn {
  display: flex;
  justify-content: center;
}

button {
  width: 15.2vw;
  height: 4.2vh;
  font-size: 2.8vh;
}

.check {
  color: red;
}
</style>