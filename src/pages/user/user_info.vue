<template>
  <div class="user-page">
    <div class="user">
      <div class="user-info">
        <div class="avatar">
          <div class="avatar-wrapper">
            <!-- todo: 给userInfo 加入头像 -->
            <img :src="userInfo.avatar" class="user-image" style="border: 1px solid rgba(0, 0, 0, 0.08)" />
            <button class="edit-info-btn" @click="editInfo">修改个人信息</button>
          </div>
        </div>
        <div class="info-part">
          <div class="info">
            <div class="basic-info">
              <div class="user-basic">
                <div class="user-nickname">
                  <div class="user-name"> {{ userInfo.username}} </div>
                </div>
                <!-- todo: any其他信息设置？ -->
                <div class="user-content">
                  <span class="user-redId">小红书号：12345</span>
                  <span class="user-IP"> IP属地：广东</span>
                </div>
              </div>
            </div>
            <div class="user-desc">
              <span v-if="userInfo.description == ''">这个人什么都没有写～</span>
              <span v-else>{{ userInfo.description }}</span>
            </div>
            <div class="user-tags">
              <div class="tag-item">
                <div>射手座</div>
              </div>
              <div class="tag-item">
                <div>广东广州</div>
              </div>
              <div class="tag-item">
                <div>程序员</div>
              </div>
            </div>
            <div class="data-info">
              <div class="user-interactions">
                <!-- 需要获取用户的作品、关注、粉丝数 -->
                <div>
                  <span class="count">{{ userInfo.trendCount }}</span
                  ><span class="shows">作品</span>
                </div>
                <div>
                  <span class="count">{{ userInfo.followerCount }}</span
                  ><span class="shows">关注</span>
                </div>
                <div>
                  <span class="count">{{ userInfo.fanCount }}</span
                  ><span class="shows">粉丝</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- todo: ？做访问他人信息 -->
        <!-- 当访问的是别人的信息页时才会出现：聊天键&是否关注 -->
        <!-- <div class="tool-btn" v-show="uid !== currentUid">
          <el-button :icon="ChatLineRound" circle @click="toChat" />
          <el-button type="info" round v-if="_isFollow" @click="follow(uid, 1)">已关注</el-button>
          <el-button type="danger" round v-else @click="follow(uid, 0)">关注</el-button>
        </div> -->

      </div>
    </div>
    <div class="reds-sticky-box user-page-sticky" style="--1ee3a37c: all 0.4s cubic-bezier(0.2, 0, 0.25, 1) 0s">
      <div class="reds-sticky" style="">
        <div class="tertiary center reds-tabs-list" style="padding: 0px 12px">
          <div
            :class="type == 1 ? 'reds-tab-item active' : 'reds-tab-item'"
            style="padding: 0px 16px; margin-right: 0px; font-size: 16px"
          >
            <!-- 切换页面 -->
            <span @click="toPage(1)">笔记</span>
          </div>
          <div
            :class="type == 2 ? 'reds-tab-item active' : 'reds-tab-item'"
            style="padding: 0px 16px; margin-right: 0px; font-size: 16px"
          >
            <span @click="toPage(2)">点赞</span>
          </div>
          <div
            :class="type == 3 ? 'reds-tab-item active' : 'reds-tab-item'"
            style="padding: 0px 16px; margin-right: 0px; font-size: 16px"
          >
            <span @click="toPage(3)">收藏</span>
          </div>
        </div>
      </div>
    </div>
    <div class="note-container" style="--1ee3a37c: all 0.4s cubic-bezier(0.2, 0, 0.25, 1) 0s">
      <!-- <router-view /> -->
      <!-- <Chat
        v-if="chatShow"
        :acceptUid="uid"
        class="animate__animated animate__zoomIn animate__delay-0.5s"
        @click-chat="close"
      ></Chat>
      <Note :type="type"></Note> -->
      <h1>notice-show</h1>
      <p>这里展示点赞/收藏的帖子列表</p>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import { useUserStore } from "@/store/user";
import { useRoute, useRouter } from "vue-router"; 
const route = useRoute();
const userStore = useUserStore();
const currentUid = ref("1");
const userInfo = ref<any>({});
const type = ref(1);
const router = useRouter();

const editInfo = () => {
  // todo: 修改个人信息
  router.push("/editinfo");
};

const toPage = (val: number) => {
  type.value = val;
};

const close = () => {
  // todo: 
  console.log("close");
};

const toChat = () => {
  // todo: 
  console.log("tochat");
};

const follow = (fid: string, type: number) => {
  // todo: 
  console.log("follow");
};

const initData = () => {
  // todo: 
  userInfo.value = userStore.getUserInfo();
  console.log("init");
};

initData();
</script>

<style lang="less" scoped>
.user-page {
  background: #fff;
  height: 100vh;

  .user {
    padding-top: 72px;
    display: flex;
    align-items: center;
    justify-content: center;

    .user-info {
      display: flex;
      justify-content: center;
      padding: 48px 0;

      .avatar {
        .avatar-wrapper {
          text-align: center;
          width: 250.66667px;
          height: 175.46667px;
          position: relative;

          .user-image {
            border-radius: 50%;
            margin: 0 auto;
            width: 70%;
            height: 100%;
            object-fit: cover;
          }

          .edit-info-btn {
            position: absolute;
            bottom: -32px;  /* 将按钮放置在头像下方 */
            left: 50%;
            transform: translateX(-50%);  /* 水平居中按钮 */
            padding: 8px 16px;
            background-color: rgba(241, 173, 190, 0.512); /* 半透明背景 */
            color: white;
            border: none;
            border-radius: 15px;
            font-size: 12px;
            cursor: pointer;
            transition: background-color 0.3s;
          }

          .edit-info-btn:hover {
            background-color: rgba(241, 173, 190, 0.29); /* 鼠标悬停时改变透明度 */
          }
        }
      }

      .info-part {
        position: relative;
        width: 100%;

        .info {
          @media screen and (min-width: 1728px) {
            width: 533.33333px;
          }

          margin-left: 32px;

          .basic-info {
            display: flex;
            align-items: center;

            .user-basic {
              width: 100%;

              .user-nickname {
                width: 100%;
                display: flex;
                align-items: center;
                max-width: calc(100% - 96px);

                .user-name {
                  font-weight: 600;
                  font-size: 24px;
                  line-height: 120%;
                  color: #333;
                }
              }

              .user-content {
                width: 100%;
                font-size: 12px;
                line-height: 120%;
                color: rgba(51, 51, 51, 0.6);
                display: flex;
                margin-top: 8px;

                .user-redId {
                  padding-right: 12px;
                }
              }
            }
          }

          .user-desc {
            width: 100%;
            font-size: 14px;
            line-height: 140%;
            color: #333;
            margin-top: 16px;
            white-space: pre-line;
          }

          .user-tags {
            height: 24px;
            margin-top: 16px;
            display: flex;
            align-items: center;
            font-size: 12px;
            color: #333;
            text-align: center;
            font-weight: 400;
            line-height: 120%;

            .tag-item :first-child {
              padding: 3px 6px;
            }

            .tag-item {
              display: flex;
              align-items: center;
              justify-content: center;
              padding: 4px 8px;
              grid-gap: 4px;
              gap: 4px;
              height: 18px;
              border-radius: 41px;
              background: rgba(0, 0, 0, 0.03);
              height: 24px;
              line-height: 24px;
              margin-right: 6px;
              color: rgba(51, 51, 51, 0.6);
            }
          }

          .data-info {
            display: flex;
            align-items: center;
            justify-content: center;
            margin-top: 20px;

            .user-interactions {
              width: 100%;
              display: flex;
              align-items: center;

              .count {
                font-weight: 500;
                font-size: 14px;
                margin-right: 4px;
              }

              .shows {
                color: rgba(51, 51, 51, 0.6);
                font-size: 14px;
                line-height: 120%;
              }
            }

            .user-interactions > div {
              height: 100%;
              display: flex;
              align-items: center;
              justify-content: center;
              text-align: center;
              margin-right: 16px;
            }
          }
        }

        .follow {
          position: absolute;
          margin-left: auto;
          display: block;
          right: 0;
          top: 0;
        }
      }

      .tool-btn {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
    }
  }

  .reds-sticky {
    padding: 16px 0;
    z-index: 5 !important;
    background: hsla(0, 0%, 100%, 0.98);

    .reds-tabs-list {
      @media screen and (min-width: 1728px) {
        width: 1445.33333px;
      }

      display: flex;
      flex-wrap: nowrap;
      position: relative;
      font-size: 16px;
      justify-content: center;

      .reds-tab-item {
        padding: 0px 16px;
        margin-right: 0px;
        font-size: 16px;
        display: flex;
        align-items: center;
        box-sizing: border-box;
        height: 40px;
        cursor: pointer;
        color: rgba(51, 51, 51, 0.8);
        white-space: nowrap;
        transition: transform 0.3s cubic-bezier(0.2, 0, 0.25, 1);
        z-index: 1;
      }

      .reds-tab-item.active {
        background-color: rgba(0, 0, 0, 0.03);
        border-radius: 20px;
        font-weight: 600;
        color: rgba(51, 51, 51, 0.8);
      }
    }
  }
  .note-container{
    padding-top: 72px;
    display: flex;
    align-items: center;
    flex-direction: column;
    z-index: 5 !important;
    justify-content: center;
  }
}
</style>
