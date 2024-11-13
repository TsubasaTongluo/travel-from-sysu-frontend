<template>
  <div class="reds-modal login-modal" role="presentation">
    <i tabindex="-1" class="reds-mask" aria-label="弹窗遮罩"></i
    ><!---->
    <div class="login-container">
      <div class="icon-btn-wrapper close-button" @click="close">
        <Close style="width: 1em; height: 1em" />
      </div>
      <div class="right">
        <div class="title">账号登录</div>
        <!---->
        <div class="input-container">
          <form onsubmit="return false">
            <label class="phone">
              <!-- <span class="country-code"></span> -->
              <input placeholder="输入账号" type="text" name="blur" v-model="userLogin.username" />
            </label>
            <div style="height: 16px"></div>
            <label class="auth-code"
            ><input type="password" placeholder="输入密码" autocomplete="false" v-model="userLogin.password"
            /></label>
            <div class="err-msg"></div>
            <button class="submit" @click="loginMethod">登录</button>
          </form>
        </div>
        <div class="agreements">
          <span class="agree-icon"></span>
          <label> 我已阅读并同意</label
          ><a class="links" target="_blank" href="https://agree.xiaohongshu.com/h5/terms/ZXXY20220331001/-1"
        >《用户协议》</a
        ><a class="links" target="_blank" href="https://agree.xiaohongshu.com/h5/terms/ZXXY20220509001/-1"
        >《隐私政策》</a
        ><br /><a
          class="links"
          target="_blank"
          href="https://oa.xiaohongshu.com/h5/terms/ZXXY20220516001/-1"
          style="margin-left: 25px"
        >《儿童/青少年个人信息保护规则》</a
        >
        </div>
        <div class="oauth-tip"><span class="oauth-tip-line">或</span></div>
        <div class="login">
          <div class="login-common wechat">微信登录</div>
          <div class="login-common reg">新用户注册</div>
        </div>
      </div>
    </div>
    <!---->
    <div class="reds-alert">
      <div class="reds-alert-mask" style="display: none"></div>
      <div class="reds-alert-wrapper slot-content" style="width: 320px; display: none">
        <!----><!---->
        <div class="reds-alert-title">阅读并同意</div>
        <div class="reds-alert-content">
          <!----><!----><label data-v-44ecdae0-s="" class="alert-content">
          <div data-v-44ecdae0-s="" class="alert-text">
            <a data-v-44ecdae0-s="" target="_blank" href="https://agree.xiaohongshu.com/h5/terms/ZXXY20220331001/-1"
            >《用户协议》</a
            ><a data-v-44ecdae0-s="" target="_blank" href="https://agree.xiaohongshu.com/h5/terms/ZXXY20220509001/-1"
          >《隐私政策》</a
          ><br data-v-44ecdae0-s="" /><a
            data-v-44ecdae0-s=""
            target="_blank"
            href="https://oa.xiaohongshu.com/h5/terms/ZXXY20220516001/-1"
          >《儿童/青少年个人信息保护规则》</a
          >
          </div>
        </label>
        </div>
        <div class="reds-alert-footer">
          <div class="foot-btns">
            <div class="foot-btn">同意并继续</div>
            <div class="foot-btn">取消</div>
          </div>
          <!----><!---->
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { defineEmits } from "vue";
import { ref } from "vue";
import type { UserLogin } from "@/type/user";
import { Close } from "@element-plus/icons-vue";

// 定义事件
const emit = defineEmits(["close-login"]);

const close = () => {
  emit("close-login", false);
};

// 定义响应式数据
const userLogin = ref<UserLogin>({
  phone: "",
  email: "",
  code: "",
  username: "",
  password: "",
});

// 登录方法
const loginMethod = () => {
  // 这里是登录逻辑的实现
  console.log(userLogin.value);

  // 模拟登录请求
  if (userLogin.value.username === "admin" && userLogin.value.password === "password") {
    console.log("登录成功！");
  } else {
    console.log("登录失败，用户名或密码错误");
  }
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
    transition: all 0.2s;

    .close-button {
      position: absolute;
      right: 20px;
      top: 20px;
      cursor: pointer;
      color: rgba(51, 51, 51, 0.8);
    }

    .right {
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
        font-size: 18px;
        color: rgba(51, 51, 51, 0.8);
        font-weight: 600;
        line-height: 120%;
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
          margin-top: 24px;
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

      .agreements {
        width: 280px;
        position: relative;
        margin-top: 16px;
        padding-left: 18px;
        font-size: 12px;
        color: var(--color-tertiary-label);
        line-height: 120%;

        .agree-icon {
          display: inline-block;
          width: 10px;
          height: 10px;
          border-radius: 100%;
          background-color: #fff;
          border: 1px solid rgba(0, 0, 0, 0.183);
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
        margin-top: 16px;

        .login-common {
          width: 144px;
          height: 40px;
          border: 1px solid rgba(0, 0, 0, 0.08);
          border-radius: 999px;
          color: rgba(51, 51, 51, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          margin-right: 10px;

          .reg {
            margin-left: 16px;
          }
        }
      }
    }
  }
}
</style>