<template>
  <div class="container" id="container">
    <div class="top">
      <header class="mask-paper">
        <a class="logo-container">
          <img src="../../assets/logo.png" class="logo" />
        </a>
        <div class="tool-box"></div>
        <div class="input-box" id="sujContainer">
          <input
            type="text"
            v-model="keyword"
            class="search-input"
            placeholder="搜索"
          />
          <div class="input-button">
            <div class="search-icon"  @click="searchNotes">
              <a href="#" >
                <Search style="width: 1.2em; height: 1.2em; margin-right: 20px; margin-top: 5px" />
              </a>
            </div>
          </div>
        </div>
        <div class="right"></div>
      </header>
    </div>
    <div class="main">
      <div class="side-bar">
        <ul class="channel-list">
          <li :class="{ 'active-channel': isActiveRoute('/dashboard') }" @click="navigateTo('/dashboard')">
            <a class="link-wrapper">
              <House style="width: 1em; height: 1em; margin-right: 8px" /><span class="channel">发现</span>
            </a>
          </li>
          <li :class="{ 'active-channel': isActiveRoute('/followTrend'), 'disabled': !isLoggedIn  }" @click="isLoggedIn ? navigateTo('/followTrend') : null">
            <Star style="width: 1em; height: 1em; margin-right: 8px" /><span class="channel"> 动态</span>
          </li>
          <li :class="{ 'active-channel': isActiveRoute('/notice'), 'disabled': !isLoggedIn  }" @click="isLoggedIn ? navigateTo('/notice'):null">
            <Bell style="width: 1em; height: 1em; margin-right: 8px" />
            <span class="channel"> 消息</span>
          </li>
          <li :class="{ 'active-channel': isActiveRoute('/push'), 'disabled': !isLoggedIn  }" @click="isLoggedIn ? navigateTo('/push'):null">
            <CirclePlus style="width: 1em; height: 1em; margin-right: 8px" /><span class="channel"> 发布</span>
          </li>
          <!-- <li class="login-button" @click="login">
            <el-button type="danger" round>登录</el-button>
          </li> -->
          <!-- <li class="login-button" @click="login">
            <el-button type="danger" round>登录</el-button>
          </li> -->
          <li v-if="userInfo == null" class="login-button" @click="login">
            <el-button type="danger" round>登录</el-button>
          </li>
          <li v-else :class="{ 'active-channel': isActiveRoute('/userInfo') }" @click="navigateTo('/userInfo')">
            <img :class="'img_avatar'" :src="userInfo.avatar" alt="头像" />
            <span class="channel">我</span>
          </li>
        </ul>
        <div class="information-container" id="informationContainer">
          <div class="information-pad" v-show="padShow">
            <div class="container">
              <div>
                <div>
                  <div class="group-wrapper">
                    <!-- <div class="menu-item hover-effect">
                      <span>关于小红书</span>
                      <div class="icon">
                        <ArrowRight style="width: 1em; height: 1em; margin-right: 8px" />
                      </div>
                    </div>
                    <div class="menu-item hover-effect">
                      <span>隐私，协议</span>
                      <div class="icon">
                        <ArrowRight style="width: 1em; height: 1em; margin-right: 8px" />
                      </div>
                    </div>
                    <div class="menu-item hover-effect">
                      <span>帮助与客服</span>
                    </div>
                  </div>
                  <div class="divider"></div>
                </div>
                <div>
                  <div class="group-wrapper">
                    <div class="group-header">访问方式</div>
                    <div class="menu-item hover-effect">
                      <span>键盘快捷键</span>
                      <div class="icon">
                        <Search style="width: 1em; height: 1em; margin-right: 8px" />
                      </div>
                    </div>
                    <div class="menu-item hover-effect">
                      <span>添加小红书到桌面</span>
                      <div class="icon">
                        <ArrowRight style="width: 1em; height: 1em; margin-right: 8px" />
                      </div>
                    </div>
                    <div class="menu-item hover-effect">
                      <span>小窗模式</span>
                    </div>
                  </div>
                  <div class="divider"></div>
                </div>
                <div>
                  <div class="group-wrapper">
                    <div class="group-header">设置</div>
                    <div class="menu-item hover-effect">
                      <span>深色模式</span>
                      <div class="multistage-toggle component">
                        <button class="toggle-item active">
                          <div class="icon-wrapper">
                            <Sunny style="width: 1em; height: 1em" />
                          </div>
                        </button>
                        <button class="toggle-item">
                          <div class="icon-wrapper">
                            <Moon style="width: 1em; height: 1em" />
                          </div>
                        </button>
                      </div>
                    </div> -->
                    <div class="menu-item hover-effect" @click="isLoggedIn ? handleLogout() : showLogin()">
                      <a href="#"><span>{{ isLoggedIn ? '退出登录' : '登录' }}</span></a>
                    </div>

                    <Login v-show="loginShow" @close-login="closeLogin" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="information-wrapper" @click="loadPad">
            <More style="width: 1em; height: 1em; margin-right: 8px" />
            <span class="channel"> 更多</span>
          </div>
        </div>
      </div>
      <div class="main-content with-side-bar">
        <router-view />
      </div>
    </div>
    <!-- 使用v-show控制登录弹窗显示 -->
    <Login v-show="loginShow" @close-login="close"></Login>
  </div>
  <div v-show="showBottomToolbar" class="bottom-toolbar">
    <button @click="navigateTo('/dashboard')" :class="{ active: isActiveRoute('/dashboard') }">
      <House style="width: 24px; height: 24px" />
      <span>发现</span>
    </button>
    <button @click="navigateTo('/followTrend')" :class="{ active: isActiveRoute('/followTrend'), 'disabled': !isLoggedIn  }">
      <Star style="width: 24px; height: 24px" />
      <span>动态</span>
    </button>
    <button @click="navigateTo('/notice')" :class="{ active: isActiveRoute('/notice'), 'disabled': !isLoggedIn  }">
      <Bell style="width: 24px; height: 24px" />
      <span>消息</span>
    </button>
    <button @click="navigateTo('/push')" :class="{ active: isActiveRoute('/push') , 'disabled': !isLoggedIn }">
      <CirclePlus style="width: 24px; height: 24px" />
      <span>发布</span>
    </button>
  </div>
</template>

<script lang="ts" setup>
import { Search, House, Star, Bell, More, CirclePlus } from "@element-plus/icons-vue";
import { useRouter, useRoute } from "vue-router";
import Login from "@/pages/user/user_login.vue";
import { useUserStore } from "@/store/user";
import eventBus from "@/utils/eventBus";
import { ref, onMounted, onUnmounted ,computed} from "vue";

// 初始化loginShow为false，弹窗默认隐藏
const loginShow = ref(false);
const keyword = ref("");
const router = useRouter();
const route = useRoute();
const padShow = ref(false);
const userStore = useUserStore();

const userInfo = ref<any>(null);  // 初始值为null，表示未登录

// 显示登录界面
const showLogin = () => {
  loginShow.value = true;
};

// 关闭登录界面
const closeLogin = () => {
  loginShow.value = false;
  // 更新用户信息
  userInfo.value = userStore.getUserInfo();
};

// 退出登录并刷新页面
const handleLogout = () => {
  userStore.loginOut(); // 执行退出登录逻辑
  userInfo.value = null; // 清空用户信息
  router.push("/dashboard"); // 导航到默认界面
};

// 用户登录状态
const isLoggedIn = computed(() => {
  const userInfo = userStore.getUserInfo();
  return userInfo && userInfo.uid != null;
});

// 导航函数，检查登录状态
const handleNavigation = (path: string) => {
  if (!isLoggedIn.value) {
    alert("请先登录！");
    return;
  }
  router.push(path);
};

// 在获取用户信息时，先检查是否已登录
const getUserInfo = () => {
  const user = userStore.getUserInfo();
  if (user) {
    userInfo.value = user;
  } else {
    userInfo.value = null;  // 如果没有登录，设置为null
  }
};

getUserInfo();  // 调用此函数以获取用户信息

// 监听从其他组件发来的 tag 点击事件
const handleTagClick = (tag: string) => {
  console.log("接收到来自事件总线的标签：", tag);
  keyword.value = tag; // 将标签填入搜索框
};

// 监听和清理事件总线
onMounted(() => {
  eventBus.on("tag-clicked", handleTagClick); // 监听事件
});

onUnmounted(() => {
  eventBus.off("tag-clicked", handleTagClick); // 取消监听
});


// 在访问 userId 时，检查 userInfo 是否有效
let userId: string | undefined = undefined;
if (userInfo.value) {
  userId = userInfo.value.id;
}



// 显示登录弹窗的函数
const login = () => {
  loginShow.value = true;
};

const searchNotes = () => {
  console.log('click search')
  if (!keyword.value.trim()) {
    alert("请输入搜索关键词！");
    return;
  }

  // 使用事件总线触发搜索事件，并传递关键词
  eventBus.emit("search", keyword.value);
};

// 关闭登录弹窗的函数
const close = () => {
  loginShow.value = false;
  // 初始化userInfo
  userInfo.value = userStore.getUserInfo();
};

// 导航到指定路径
const navigateTo = (path: string) => {
  router.push(path);
};

// 退出登录
const logout = () => {
  userStore.loginOut();
  userInfo.value = userStore.getUserInfo();
  navigateTo("/dashboard");
};


// 检查当前路由是否与目标路由匹配
const isActiveRoute = (path: string) => {
  return route.path === path;
};

const loadPad = () => {
  padShow.value = !padShow.value;
};


const showBottomToolbar = ref(false);

// 根据窗口宽度调整工具栏显示
const updateToolbarVisibility = () => {
  showBottomToolbar.value = window.innerWidth <= 960;
};

// 路由切换


// 监听窗口大小变化
window.addEventListener("resize", updateToolbarVisibility);
updateToolbarVisibility();

</script>

<style lang="less" scoped>
.channel-list li.disabled,
.bottom-toolbar button.disabled {
  cursor: not-allowed;
  color: #ccc;
}

.channel-list li.disabled:hover,
.bottom-toolbar button.disabled:hover {
  background: transparent;
  color: #ccc;
}

.channel-list li.disabled .link-wrapper,
.bottom-toolbar button.disabled {
  pointer-events: none;
}

.logo-container {
  display: flex;
  justify-content: flex-start;
  align-items: left;
}

.logo {
  width: 200px;
  margin-left: 10px;
}

a {
  text-decoration: none;
  color: rgba(51, 51, 51, 0.8);
}

.container {
  max-width: 1728px;
  background-color: #fff;
  margin: 0 auto;

  .top {
    display: flex;
    flex-direction: column;
    justify-content: center;
    width: 100vw;
    height: 72px;
    position: fixed;
    left: 0;
    top: 0;
    z-index: 10;
    align-items: center;
    background: #ffffff;

    header {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      max-width: 1728px;
      height: 72px;
      padding: 0 16px 0 24px;
      z-index: 10;

      .tool-box {
        width: 24px;
        height: 70px;
        position: absolute;
        left: 0;
        top: 0;
      }

      .input-box {
        height: 40px;
        position: fixed;
        left: 50%;  // 设置input框居50%的位置
        transform: translate(-50%);
        max-width: 450px;

        @media screen and (max-width: 695px) {
          display: none;
        }

        @media screen and (min-width: 960px) and (max-width: 1191px) {
          width: calc(-36px + 50vw);
        }

        @media screen and (min-width: 1192px) and (max-width: 1423px) {
          width: calc(-33.6px + 40vw);
        }

        @media screen and (min-width: 1424px) and (max-width: 1727px) {
          width: calc(-42.66667px + 33.33333vw);
        }

        @media screen and (min-width: 1728px) {
          width: 533.33333px;
        }

        .search-input {
          padding: 0 0 0 16px;  // 把输入框的右边空白位置去掉了
          width: 100%;
          height: 110%;
          font-size: 16px;
          line-height: 120%;
          color:  #030403;
          caret-color: #00561f;
          background: rgba(0, 86, 31, 0.05);
          border-radius: 9px;
          border:  #00561f;; // 去除输入框的边框
          outline:  #00561f;;  // 去除点击时输入框的边框
          box-shadow:  #00561f;;   // 去除输入框的阴影，看起来更简约一点

        }

        .input-button {
          position: absolute;
          right: -15px;
          top: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
          color: rgba(0, 86, 31, 0.8);

          .close-icon .search-icon {
            width: 40px;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            color: rgba(0, 86, 31, 0.8);
          }
        }
      }
    }
  }

  .main {
    display: flex;

    .side-bar {
      @media screen and (max-width: 695px) {
        display: none;
      }

      @media screen and (min-width: 696px) and (max-width: 959px) {
        display: none;
      }

      @media screen and (min-width: 960px) and (max-width: 1191px) {
        width: calc(-18px + 25vw);
        margin-left: 12px;
      }

      @media screen and (min-width: 1192px) and (max-width: 1423px) {
        width: calc(-16.8px + 20vw);
        margin-left: 12px;
      }

      @media screen and (min-width: 1424px) and (max-width: 1727px) {
        width: calc(-21.33333px + 16.66667vw);
        margin-left: 16px;
      }

      @media screen and (min-width: 1728px) {
        width: 266.66667px;
        margin-left: 16px;
      }

      height: calc(100vh - 72px);
      overflow-y: scroll;
      background-color: #fff;
      display: flex;
      flex-direction: column;
      flex-shrink: 0;
      padding-top: 16px;
      margin-top: 72px;
      position: fixed;
      overflow: visible;
      z-index: 3000;
      //background-color: #ffd0d8;

      .channel-list {
        min-height: auto;
        -webkit-user-select: none;
        user-select: none;
        margin-top: 0;
        //flex-grow: 0.85;
        //background-color: rgba(114, 109, 109, 0.88);

        li.login-button {
          background-color: rgba(0, 86, 31, 0.8);
          display: flex;
          justify-content: center;
          align-items: center;
          border-radius: 30px;
          color: rgb(255, 253, 253);
          padding: 0;
          font-weight: bold;

          &:hover {
            background:rgba(0, 86, 31, 0.6);
            opacity: 1;
          }

          .el-button {
            background-color: transparent;
            border: none;
            padding: 0;
          }
        }

        .active-channel {
          background-color: rgba(0, 86, 31, 0.3);
          border-radius: 9px;
          color:#00561f;
        }

        li {
          padding-left: 16px;
          min-height: 48px;
          display: flex;
          align-items: center;
          cursor: pointer;
          margin: 0 16px 12px -42px;  // 调整li的位置
          color: rgba(0, 86, 31, 0.6);

          .link-wrapper {
            display: flex;
            width: 100%;
            height: 48px;
            align-items: center;
            color:#00561f;
          }

          .message-count {
            margin-left: 7rem;
            background-color: red;
            width: 20px;
            height: 20px;
            font-size: 14px;
            line-height: 20px;
            text-align: center;
            border-radius: 50%;
            color: #fff;
          }
        }

        .img_avatar {
          width: 30px;
          height: 30px;
          border-radius: 100%;
          // object-fit: contain;
          object-fit: cover; /* 保持比例，裁剪图片 */
        }



        .channel {
          font-size: 16px;
          font-weight: 450;
          margin-left: 12px;
          color:rgba(0, 0, 0, 0.7);
        }
      }
      .channel-list li.disabled {
        cursor: not-allowed;
        color: #ccc;
      }

      .channel-list li.disabled:hover {
        background: transparent;
        color: #ccc;
      }

      .channel-list li.disabled .link-wrapper {
        pointer-events: none; /* 禁止内部元素的事件 */
      }

      .information-container {
        display: inline-block;
        width: 100%;
        color:rgba(0, 86, 31, 1);
        font-size: 18px;
        position: absolute;
        bottom: 35px;   // “更多”的位置
        left: 10px;

        .information-pad {
          z-index: 16;
          margin-bottom: 4px;
          width: 100%;


          .container {
            width: 80%;
            background: #fff;
            box-shadow:
              0 4px 32px 0 rgba(0, 86, 31, 0.08),
              0 1px 4px 0 rgba(0, 86, 31, 0.04);
            border-radius: 12px;

            .divider {
              margin: 0px 12px;
              list-style: none;
              height: 0;
              border: 1px solid rgba(0, 0, 0, 0.08);
              border-width: 1px 0 0;
            }

            .group-wrapper {
              padding: 5px;

              .group-header {
                display: flex;
                align-items: center;
                padding: 0 12px;
                font-weight: 400;
                height: 32px;
                color: rgba(0, 86, 31, 0.6);
                font-size: 12px;
                border:#00561f;
              }

              .menu-item {
                height: 40px;
                color:  rgba(0, 86, 31, 0.6);
                font-size: 16px;
                border-radius: 8px;
                display: flex;
                align-items: center;
                padding: 0 12px;
                font-weight: 400;

                .icon {
                  color:  rgba(0, 86, 31, 0.6);
                  margin-left: auto;
                }

                .component {
                  margin-left: auto;
                }

                .multistage-toggle {
                  position: relative;
                  background: rgba(0, 86, 31, 0.6);
                  display: flex();
                  padding: 2px;
                  border-radius: 999px;
                  cursor: pointer;

                  .active {
                    background: #fff;
                    box-shadow:
                      0 2px 8px 0  rgba(0, 86, 31, 0.6),
                      0 1px 2px 0  rgba(0, 86, 31, 0.6);
                    color: rgba(0, 86, 31, 0.6);
                  }

                  .toggle-item {
                    border-radius: 999px;
                    background: transparent;
                    color:  rgba(0, 86, 31, 0.6);

                    .icon-wrapper {
                      width: 24px;
                      height: 24px;
                      display: flex;
                      align-items: center;
                      justify-content: center;
                      cursor: pointer;
                    }
                  }
                }
              }
            }
          }

          .container:hover {
                background-color: rgba(0, 86, 31, 0.4);  /* hover 时背景变为绿色 */
                color: #fff; /* hover 时文字变为白色 */
              }
        }

        .information-wrapper {
          -webkit-user-select: none;
          user-select: none;
          cursor: pointer;
          position: relative;
          //margin-left: 100px;
          height: 48px;
          width: 100%;
          display: flex;
          font-weight: 450;
          align-items: center;
          border-radius: 9px;
        }
      }
    }

    .main-content {
      width: 100%;

      @media screen and (min-width: 960px) and (max-width: 1191px) {
        width: calc(100% - (-6px + 25vw));
        padding-left: calc(-6px + 25vw);
      }

      @media screen and (min-width: 1192px) and (max-width: 1423px) {
        width: calc(100% - (-4.8px + 20vw));
        padding-left: calc(-4.8px + 20vw);
      }

      @media screen and (min-width: 1424px) and (max-width: 1727px) {
        width: calc(100% - (-5.33333px + 16.66667vw));
        padding-left: calc(-5.33333px + 16.66667vw);
      }

      @media screen and (min-width: 1728px) {
        width: calc(100% - 282.66667px);
        padding-left: 282.66667px;
      }
    }
  }
}

.bottom-toolbar {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 50px;
  display: flex;
  justify-content: space-around;
  align-items: center;
  background: #fff;
  box-shadow: 0 -1px 5px rgba(0, 0, 0, 0.1);
  z-index: 1000;

  button {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: none;
    border: none;
    cursor: pointer;
    color: #777777;

    &.active {
      color: #00561f;
    }

    span {
      font-size: 12px;
      margin-top: 4px;
    }
  }
}

</style>