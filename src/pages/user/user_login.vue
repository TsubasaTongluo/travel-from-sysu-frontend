<!-- 待完善：注册、隐私政策勾选、接口 -->
<template>
  <div class="reds-modal login-modal" role="presentation">
    <i tabindex="-1" class="reds-mask" aria-label="弹窗遮罩"></i>
    <div
      :class="isLogin? 'login-container': 'large-container'"
    >
      <div class="icon-btn-wrapper close-button" @click="close">
        <Close style="width: 1em; height: 1em" />
      </div>

      <div class="right" >
        <!-- 登录部分 -->
        <div v-if="isLogin">
          <div class="title">账号登录</div>
          <div class="input-container">
            <form @submit.prevent="loginMethod">
              <label class="phone">
                <input placeholder="输入账号" type="text" v-model="userLogin.username" required/>
              </label>
              <div style="height: 16px"></div>
              <label class="auth-code">
                <input type="password" placeholder="输入密码" autocomplete="false" v-model="userLogin.password" required>
              </label>
              <div class="err-msg"></div>
              <button class="submit" type="submit">登录</button>
            </form>
          </div>
          <div class="agreements">
            <input type="checkbox" id="agree" v-model="isAgreed" />       
            <label> 我已阅读并同意</label>
            <a class="links" target="_blank" href="https://agree.xiaohongshu.com/h5/terms/ZXXY20220331001/-1">《用户协议》</a>
            <a class="links" target="_blank" href="https://agree.xiaohongshu.com/h5/terms/ZXXY20220509001/-1">《隐私政策》</a>
            <br />
            <a class="links" target="_blank" href="https://oa.xiaohongshu.com/h5/terms/ZXXY20220516001/-1" style="margin-left: 25px">《儿童/青少年个人信息保护规则》</a>
          </div>
          <div class="oauth-tip"><span class="oauth-tip-line">或</span></div>
          <div class="switch-tip" @click="switchToRegister">
          没有账号？<span class="highlight">去注册</span>
          </div>
        </div>

        <!-- 注册部分 -->
        <div v-else>
          <div class="title">新用户注册</div>
          <div style="margin-top: 30"></div>
          <div class="input-container">
            <form @submit.prevent="registerMethod">
              <label class="phone">
                <input placeholder="输入账号" type="text" v-model="userRegister.username" required/>
              </label>

              <div style="height: 16px"></div>
              <label class="email">
                <input type="email" placeholder="输入邮箱（选填）" v-model="userRegister.email" />
              </label>

              <div style="height: 16px"></div>
              <label class="auth-code">
                <input type="password" placeholder="输入密码" autocomplete="false" v-model="userRegister.password" required/>
              </label>

              <div style="height: 16px"></div>
              <label class="auth-code">
                <input type="password" placeholder="确认密码" autocomplete="false" v-model="userRegister.confirmPassword" required/>
              </label>
              
              <!-- <div v-if="passwordsMismatch" class="err-msg">密码和确认密码不一致，请重新输入</div> -->
               <!-- 提交时显示错误消息 -->
              <div v-if="showError" class="err-msg">密码和确认密码不一致，请重新输入</div>

              <div class="err-msg"></div>
              <button class="submit" type="submit">注册</button>
            </form>
          </div>

          <div class="oauth-tip"><span class="oauth-tip-line">或</span></div>
          <div class="switch-tip" @click="switchToLogin">
          已有账号？<span class="highlight">去登录</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>


<script lang="ts" setup>
import { computed, defineEmits } from "vue";
import { ref } from "vue";
import type { UserLogin } from "@/type/user";
import { Close } from "@element-plus/icons-vue";
import axios from 'axios';
import { useRouter } from "vue-router";
import {ElMessage} from "element-plus";
import { useUserStore } from "@/store/user";
import { storage } from "@/utils/storage";
import 'element-plus/dist/index.css';

// 定义事件
const emit = defineEmits(["close-login"]);
const router = useRouter();
const close = () => {
  isLogin.value = true;
  emit("close-login", false);
};
const isAgreed = ref(false);
const userStore = useUserStore();

// 定义响应式数据
const userLogin = ref<UserLogin>({
  username: "",
  password: "",
});

// 注册的响应式数据
const isLogin = ref(true);
const userRegister = ref({
  username:"",
  password:"",
  confirmPassword:"",
  email:"",
});

// 计算属性检查密码是否一致
const passwordsMismatch = computed(() => {
  return userRegister.value.password !== userRegister.value.confirmPassword;
});

// 控制错误消息是否显示
const showError = ref(false);

const switchToLogin=() => {
  isLogin.value = true;
  userLogin.value = {username:"",password:"",};
};

const switchToRegister=() => {
  isLogin.value = false;
  userRegister.value = {
  username:"",
  password:"",
  confirmPassword:"",
  email:"",
};
};

async function login(data: { username: string; password: string; }){
  return await axios({
    url: "/api/auth/login",
    method: "POST",
    data,
});
};

async function register(data:any){
  return await axios({
    url:"/api/auth/register",
    method: "POST",
    data,
  });
};

// 注册方法
const registerMethod = () => {
  // if (userRegister.value.password !== userRegister.value.confirmPassword) {
  //   ElMessage.error("密码和确认密码不一致！");
  //   return;
  // }
  if (passwordsMismatch.value) {
    // 如果密码不一致，可以阻止提交或给出提示
    showError.value = true;  // 如果密码不一致，显示错误提示
    // 3秒后自动隐藏错误消息
    setTimeout(() => {
      showError.value = false;
    }, 1500);
    return;
  }

  register(userRegister.value)
  .then(response => {
      if (response.data.code == 200) {
        ElMessage.success("注册成功，跳转至登录页面！");
        switchToLogin();
      } else {
        ElMessage.error(response.data.error);
      }
    })
    .catch(error => {
      console.log('注册失败:', error);
      ElMessage.error("注册失败，请稍后重试！");
    });

};

// 登录方法
const loginMethod = () => {
  // 这里是登录逻辑的实现
  if(!isAgreed.value){
    ElMessage.error("请先同意用户协议！");
    return;
  }

  console.log(userLogin.value);
  login(userLogin.value)
    .then(response => {

      // todo: 存储返回的用户信息 & 设置当前用户信息
      // 后端传的信息---冗余？
      // accessToken & refreshToken
      // todo: localstorage 存储 token
      console.log('login sucessfully:',response.data);
      const token = response.data.token;
      console.log('Token:',token);
      storage.set("Token",token);

      const currentUser = response.data.user;
      console.log("user:",response.data.user );
      userStore.setUserInfo(currentUser);
      console.log("pinia user:",userStore.getUserInfo());

      userLogin.value = {username:"",password:"",};

      // 跳转至主界面，关闭登录界面
      router.push({path: "/", query: {date: Date.now()}});
      emit("close-login", false);

    })
    .catch(error => {
      console.log('Error durring login:',error);
      ElMessage.error("登录失败");
    });

};
</script>

<style lang="less" scoped>

a {
  text-decoration: none;
  background-color: transparent;
}

.login-modal {
  z-index: 100010;
  flex-direction: column;
}

.reds-modal {
  display: flex;
  align-items: center;
  justify-content: center;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1000002;
  box-sizing: border-box;
  visibility: visible;
  opacity: 1;
  transition:
    opacity 0.2s,
    visibility 0.2s;

  .reds-mask {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.25);
    z-index: -1;
  }

}

.login-container {
    display: flex;
    position: relative;
    width: 400px;
    height: 480px;
    background: #fff;
    border-radius: 16px;
    box-shadow:
      0 4px 32px 0 rgba(0, 0, 0, 0.08),
      0 1px 4px 0 rgba(0, 0, 0, 0.04);
    transition: all 0.15s;

    .close-button {
      position: absolute;
      right: 20px;
      top: 20px;
      cursor: pointer;
      color: rgba(51, 51, 51, 0.8);
    }
  }

.large-container {
    display: flex;
    position: relative;
    width: 420px;
    height: 550px;
    background: #fff;
    border-radius: 16px;
    box-shadow:
      0 4px 32px 0 rgba(0, 0, 0, 0.08),
      0 1px 4px 0 rgba(0, 0, 0, 0.04);
    transition: all 0.15s;

    .close-button {
      position: absolute;
      right: 20px;
      top: 20px;
      cursor: pointer;
      color: rgba(51, 51, 51, 0.8);
    }

  }

.right {
      flex-grow: 1;
      flex: 1; /* 使 .right 充满剩余空间 */
      display: flex;
      align-items: center;
      flex-direction: column;
      margin-top: 20px;
      /* 使其垂直居中 */
      justify-content: center;
      padding-left: 20px;
      padding-right: 20px;

      .title {
        font-size: 20px;
        color: rgba(51, 51, 51, 0.8);
        font-weight: 600;
        line-height: 120%;
        text-align: center;
        margin-bottom: 30px;
      }

      .input-container {
        margin-top: 24px;
        width: 304px;
        display: flex;
        flex-direction: column;

        .auth-code {
          justify-content: center;
        }

        .phone,
        .auth-code {
          display: flex;
          align-items: center;
          font-size: 16px;
          line-height: 22px;
          color: rgba(51, 51, 51, 0.8);
          height: 48px;
          background: #fff;
          border-radius: 999px;
          border: 1px solid rgba(0, 0, 0, 0.1); /* 默认边框 */
          transition: border-color 0.3s ease-in-out;
          box-sizing: border-box;
          padding: 0 16px; /* 增加内边距 */

          .country-code {
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
            width: 29px;
            height: 100%;
            font-weight: 400;
            margin-left: 16px;
            margin-right: 20px;
            color: #333;
          }

          .country-code:after {
            position: absolute;
            left: 41px;
            content: "";
            height: 24px;
            width: 1px;
            background-color: #fff;
          }
        }


        .phone input,
        .auth-code input {
          font-size: 16px;
          flex: 1;
          height: 100%;
          caret-color: #ff2442; /* 光标颜色 */
          color: #333;
          border: none;
          outline: none;
          background: transparent;
        }

        .phone input::placeholder,
        .auth-code input::placeholder {
          color: rgba(51, 51, 51, 0.5);
        }

        /* 输入框聚焦时的边框高亮 */
        .phone:focus-within, .auth-code:focus-within {
          border-color: #f68d9b;
          box-shadow: 0 0 5px rgba(247, 45, 72, 0.2);
        }

        .code-button {
          font-size: 16px;
          color: #ff2442;
          cursor: pointer;
          opacity: 0.5;
        }

        /* 错误消息 */
        .err-msg {
          margin-top: 8px;
          height: 16px;
          line-height: 16px;
          color: #ff2442; /* 错误提示颜色 */
          font-size: 12px;
          font-weight: 400;
          text-align: center;
        }

        .submit {
          margin-top: 1px;
          height: 48px;
          background: #ff2442;
          color: #fff;
          opacity: 0.9;
          border-radius: 999px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease-in-out;
          width: 100%;
          border: none;
        }

        .submit:hover {
          background: #e36e8a; /* 鼠标悬停时背景色变化 */
          opacity: 1;
        }

        .submit:disabled {
          background: #fac5d0;
          cursor: not-allowed;
        }

        form {
          display: block;
          margin-top: 0em;
        }

      }

      .switch-tip {
        margin-top: 20px;
        text-align: center;
        cursor: pointer;
      }

      .switch-tip .highlight {
        color: #0f32a5;
        font-weight: bold;
      }


      .agreements {
        width: 280px;
        position: relative;
        margin-top: 16px;
        padding-left: 18px;
        font-size: 12px;
        color: var(--color-tertiary-label);
        line-height: 120%;

        .input[type="checkbox"] {
          margin-right: 10px;
        }

        .input[type="checkbox"]:checked {
          color: #0073e6; /* 选中时的文本颜色 */
        }


        a {
          color: #13386c;
        }

        .links {
          font-weight: 400;
        }
      }

      .oauth-tip:after,
      .oauth-tip:before {
        display: block;
        width: 133px;
        height: 1px;
        content: "";
        background-color: rgba(0, 0, 0, 0.08);
      }

      .oauth-tip-line {
        margin: 0 12px;
      }

      .oauth-tip {
        margin-top: 29px;
        display: flex;
        align-items: center;
        font-weight: 400;
        font-size: 14px;
        color: rgba(51, 51, 51, 0.6);
      }

      .login {
        display: flex;
        justify-content: center; /* 水平居中 */
        align-items: center; /* 垂直居中 */
        margin-top: 16px;
        font-size: 14px; /* 适当设置字体大小 */
        color: rgba(9, 48, 100, 0.8); /* 设置字体颜色 */
        cursor: pointer; /* 设置鼠标悬停时为可点击状态 */
      }

      .login-common {
        text-align: center; /* 文本居中 */
        font-weight: 600; /* 设置加粗文本 */
      }
    }

.register-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;

  .modal-content {
    background: white;
    padding: 20px;
    width: 300px;
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  }

  .register-title {
    font-size: 18px;
    margin-bottom: 20px;
    text-align: center;
  }

  .form {
    display: flex;
    flex-direction: column;

    input {
      margin: 10px 0;
      padding: 10px;
      border: 1px solid #ccc;
      border-radius: 4px;
    }

    button {
      background-color: #ff2442;
      color: white;
      padding: 10px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
  }


}

.email {
    display: flex;
    align-items: center;
    font-size: 16px;
    line-height: 22px;
    color: rgba(51, 51, 51, 0.8);
    height: 48px;
    background: #fff;
    border-radius: 999px;
    border: 1px solid rgba(0, 0, 0, 0.1); /* 默认边框 */
    transition: border-color 0.3s ease-in-out;
    box-sizing: border-box;
    padding: 0 16px;

    input {
      font-size: 16px;
      flex: 1;
      height: 100%;
      caret-color: #ff2442; /* 光标颜色 */
      color: #333;
      border: none;
      outline: none;
      background: transparent;
    }

    input::placeholder {
      color: rgba(51, 51, 51, 0.5);
    }

    &:focus-within {
      border-color: #f68d9b;
      box-shadow: 0 0 5px rgba(247, 45, 72, 0.2);
    }
  }
</style>