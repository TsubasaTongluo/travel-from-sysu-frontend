<template>
  <div class="user-page">
    <div class="user">
      <div class="user-info">
        <div class="avatar">
          <div class="avatar-wrapper">
            <!-- todo: 给userInfo 加入头像 -->
            <img :src="userInfo.avatar || defaultAvatar" class="user-image" style="border: 1px solid rgba(0, 0, 0, 0.08)" />
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
                  <span class="user-redId">小红书号：{{ userInfo.uid.toString().padStart(6, '0') }}</span>
                  <!-- <span class="user-IP"> IP属地：广东</span> -->
                </div>
              </div>
            </div>
            <div class="user-desc">
              <span v-if="userInfo.description == ''">这个人什么都没有写～</span>
              <span v-else>{{ userInfo.description }}</span>
            </div>
            <!-- <div class="user-tags">
              <div class="tag-item">
                <div>射手座</div>
              </div>
              <div class="tag-item">
                <div>广东广州</div>
              </div>
              <div class="tag-item">
                <div>程序员</div>
              </div>
            </div> -->
            <div class="data-info">
              <div class="user-interactions">
                <!-- 需要获取用户的作品、关注、粉丝数 -->
                <div>
                  <span class="count">{{ userInfo.trend_count }}</span
                  ><span class="shows">作品</span>
                </div>
                <div>
                  <span class="count">{{ userInfo.follower_count }}</span
                  ><span class="shows">关注</span>
                </div>
                <div>
                  <span class="count">{{ userInfo.fan_count }}</span
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
    <div class="note-container">
      <div class="grid-container">
        <div
            class="card"
            v-for="item in notelist"
            :key="item.note_id"
            style="max-width: 240px"
        >
          <div class="image-wrapper">
            <img
                :src="item.note_URLs[0]"
                :style="{
                maxWidth: '210px',
                borderRadius: '8px',
              }"
                fit="contain"
                @click="toMain(item)"
            />

            <!--            <div v-if="item.noteType === 'video'" class="video-icon">-->
            <!--              <img src="/icons/video-icon.png" />-->
            <!--            </div>-->
          </div>

          <!-- 内容框 -->
          <div class="footer">
            <a class="title">
              <span>{{ item.note_title }}</span>
            </a>
            <div class="author-wrapper">
              <a class="author">
                <img class="author-avatar" :src="item.avatar" />
                <span class="name">{{ item.username }}</span>
              </a>
              <span class="like-wrapper like-active">
                <i class="iconfont icon-follow" style="width: 1em; height: 1em"></i>
                <img src="/icons/like.png" class="like-icon" @click="like_note" />
                <span class="count">{{ item.like_counts }}</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 弹窗 -->
    <div v-if="isModalVisible" class="modal" @click="closeModal">
      <div class="modal-content" @click.stop>

        <!-- 左侧图片或视频 -->
        <div class="modal-image">
          <!-- 左侧当前图片 -->
          <img
              :src="selectedNote.note_URLs[currentImageIndex]"
              @click="toggleFullscreenImage"
          />

          <div  v-if="selectedNote.note_URLs.length > 1" class="image-navigation">
            <!-- 显示当前图片页数 -->
            <span class="image-index">{{ currentImageIndex + 1 }}/{{ selectedNote.note_URLs.length }}</span>
            <!-- 图片切换按钮 -->
            <button @click="prevImage" :disabled="currentImageIndex === 0" class="nav-button">&lt;</button>
            <button @click="nextImage" :disabled="currentImageIndex === selectedNote.note_URLs.length - 1" class="nav-button">&gt;</button>
          </div>
        </div>

        <div class="modal-image" v-if="selectedNote.noteType === 'video'">
          <!-- 视频播放器 -->
          <video v-if="selectedNote.noteType === 'video'" controls>
            <source :src="selectedNote.video" type="video/mp4" />
          </video>
        </div>
        <!-- 右侧文字 -->
        <div class="modal-text">
          <!-- 发布者信息 -->
          <div class="author-info">
            <img :src="selectedNote.avatar" class="author-avatar" />
            <span class="author-name">{{ selectedNote.username }}</span>
          </div>
          <!-- 标题 -->
          <h1 class="modal-title">{{ selectedNote.note_title }}</h1>
          <!-- 内容 -->
          <p class="modal-content-text">
            {{ selectedNote.note_content }}
            <!-- tag -->
            <span class="modal-tag" v-if="selectedNote.note_tag_list.length > 0">
              <span
                  v-for="(tag, index) in selectedNote.note_tag_list"
                  :key="index"
              >
                #{{ tag }}
              </span>
            </span>
          </p>

          <!-- 修改时间 -->
          <p class="modal-time">{{ selectedNote.note_update_time }}</p>
          <!-- 分界线 -->
          <hr class="divider" />
          <!-- 评论区域 -->
          <div class="comments-placeholder">评论区</div>
          <!-- 底部操作栏 -->
          <div class="modal-footer">
            <!-- 输入栏  todo: 评论接口 -->
            <input type="text" class="comment-input" placeholder="说点什么……" @click="comment_note"/>
            <!-- 点赞收藏评论按钮 -->
            <div class="action-buttons">
              <span class="action-button" @click="like_note">
                <img src="/icons/like.png" class="icons"/>
                <i class="iconfont icon-like"></i> {{ selectedNote.like_counts }}
              </span>
              <span class="action-button" @click="collect_note">
                <img src="/icons/collection.png" class="icons"/>
                <i class="iconfont icon-collection"></i> {{ selectedNote.collect_counts }}
              </span>
              <span class="action-button" @click="comment_note">
                <img src="/icons/comment.png" class="icons"/>
                <i class="iconfont icon-comment"></i> {{ selectedNote.comment_counts }}
              </span>
            </div>
          </div>
        </div>
      </div>
      <div v-if="isFullscreen" class="fullscreen-modal" @click="closeFullscreen">
        <img :src="selectedNote.note_URLs[currentImageIndex]" class="fullscreen-image" />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref,watch } from "vue";
import { useUserStore } from "@/store/user";
import { useRoute, useRouter } from "vue-router";
import defaultAvatar from '@/assets/logo.png';
import axios from "axios";
import type {Note} from "@/type/note";
const route = useRoute();
const userStore = useUserStore();
// const currentUid = ref("1");
const userInfo = ref<any>({});
const type = ref(0);
const router = useRouter();

const notelist = ref<Array<Note>>([]);

watch(
    type,
    (newType, oldType) => {
      console.log("旧值:", oldType);
      console.log("新值:", newType);

      notelist.value = [] as Array<any>;  // 清空 noteList 数据
      getNoteList(newType);  // 调用 getNoteList 方法，传入新的 type 值
    }
);

const getNoteList = async (type: number) => {
  if (type === 1) {
    // todo: 作品数量=0特殊处理
    try {
      const res = await get_trend();
      console.log(res);

      // 过滤出与当前用户 id 一致的帖子
      notelist.value = await Promise.all(res.data.data.notes
          .filter((note: any) => note.note_creator_id === userStore.getUserInfo()?.uid)  // 只保留 creator_id 与当前用户一致的帖子
          .map(async (note: any) => {
            let new_note: Note = { ...note };

            // 如果 note_URLs 是 longtext 类型的字符串，拆分成数组
            if (typeof note.note_urls === "string") {
              // new_note.note_URLs = note.note_urls.split(",").map(url => url.trim());
              try {
                const parsedUrls = JSON.parse(note.note_urls); // 解析 JSON
                if (Array.isArray(parsedUrls)) {
                  new_note.note_URLs = parsedUrls;
                }
              } catch (error) {
                console.error("note_urls 字段解析失败：", error);
              }
            } else if (Array.isArray(note.note_urls)) {
              new_note.note_URLs = note.note_urls;
            } else {
              new_note.note_URLs = [];
            }
            

            // 获取用户信息和头像
            try {
              const userInfo = await get_userinfo(new_note.note_creator_id);
              new_note.username = userInfo.data.username;
            } catch (error) {
              console.log("获取用户信息失败:", error);
              new_note.username = "未知用户"; // 默认用户名
            }

            // 获取头像
            try {
              new_note.avatar = await get_avatar(new_note.note_creator_id);
            } catch (error) {
              console.log("获取头像失败:", error);
              new_note.avatar = defaultAvatar; // 如果头像获取失败，设置为默认头像
            }

            new_note.note_tag_list = [];

            return new_note;
          }));

      console.log(notelist.value);
    } catch (error) {
      console.log("获取作品失败", error);
      notelist.value = [];
    }
  }
};


async function get_userinfo(uid: number) {
  return await axios({
    url: "/api/auth/getUserInfoByID",
    method: "GET",
    params: { id: uid },
  });
}


async function get_avatar(uid: number) {
  try {
    const res = await axios({
      url: "/api/auth/getAvatar",
      method: "GET",
      params: { uid: uid },
    });
    return res.data.avatar; // 成功时返回头像 URL
  } catch (error) {
    console.log(error);
    return defaultAvatar; // 如果出错，返回默认头像
  }
}

const selectedNote = ref<Note | null>(null); // 单一笔记对象或空值


const isModalVisible = ref(false);
// const selectedNote = ref<Note>({
//   collect_counts:0,
//   like_counts:0,
//   note_URLs:[],
//   note_content:'',
//   note_creator_id:1,
//   note_id:1,
//   note_tag_list:[],
//   note_title:"",
//   note_type:"",
//   note_update_time:"",
//   view_count:0,
//   //noteType:"image",
//   //video:"",
//   comment_counts:0,
//   avatar:"",
//   username:"",
//   is_finding_buddy:0,
//   buddy_description:"",
//   isFollow:false,
//   isLike:false,
//   isCollection:false,
// });

const isVideoPlaying = ref(false);  // 视频默认不播放

const currentImageIndex = ref(0);  // 当前显示的图片索引，用于多图

const isFullscreen = ref(false);  // 控制全屏图片弹窗显示

const toMain = (note: any) => {
  selectedNote.value = note;
  isModalVisible.value = true;
  isVideoPlaying.value = false;
  currentImageIndex.value = 0;
  document.body.style.overflow = 'hidden'; // 打开弹窗时禁止滚动
};

const closeModal = () => {
  isModalVisible.value = false;
  isVideoPlaying.value = false;
  currentImageIndex.value = 0;
  document.body.style.overflow = 'auto';  // 关闭弹窗恢复滚动
};

// 笔记图片切换函数
const prevImage = () => {
  if (currentImageIndex.value > 0) {
    currentImageIndex.value--;
  }
};

const nextImage = () => {
  if (currentImageIndex.value < selectedNote.value.note_URLs.length - 1) {
    currentImageIndex.value++;
  }
};

// 切换全屏图片弹窗的显示
const toggleFullscreenImage = () => {
  isFullscreen.value = !isFullscreen.value;
};

// 关闭全屏图片弹窗
const closeFullscreen = () => {
  isFullscreen.value = false;
};

const like_note = () =>{
  // todo: like接口
  console.log("like!");
};

const collect_note = () =>{
  // todo: collect 接口
  console.log("collect!");
};

const comment_note = () =>{
  // todo: comment 接口
  console.log("comment!");
};


async function get_trend(){
  return await axios({
    url:"/api/note/getNotesByCreatorId",
    method: "GET",
    params: {
      creator_id: userStore.getUserInfo()?.uid,
      num : userStore.getUserInfo()?.trend_count,
    },
  });
};

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
  type.value = 1;
  userInfo.value = userStore.getUserInfo();
  console.log(userInfo);
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
  .note-container {
    .grid-container {
      /* 瀑布流布局 */
      column-width: 210px; /* 设置每列的最小宽度 */
      column-gap: 16px; /* 列间距 */
      padding: 0 8px;
      column-count: 5;

      /* 卡片样式适配瀑布流 */
      .card {
        position: relative;
        display: inline-block; /* 必须使用 inline-block，避免跨列 */
        width: 100%; /* 确保卡片宽度适配列宽 */
        margin-bottom: 16px; /* 卡片间距 */
        background: #fff;
        border-radius: 8px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        overflow: hidden;

        .image-wrapper {
          position: relative; /* 确保视频图标可以定位在图片上层 */

          img {
            width: 100%;
            height: auto;
            border-radius: 8px;
          }

          .video-icon {
            position: absolute;
            top: 8px;
            right: 8px;
            width: 30px;
            height: 30px;
            z-index: 1; /* 图标在图片上层 */
          }
        }
      }


      @media (max-width: 1200px) {
        .grid-container {
          column-width: 180px; /* 列宽调整为更小值 */
        }
      }

      @media (max-width: 768px) {
        .grid-container {
          column-width: 150px; /* 移动端列宽更小 */
          column-gap: 12px; /* 列间距缩小 */
        }
      }

      @media (max-width: 480px) {
        .grid-container {
          column-width: 120px; /* 最小列宽 */
          column-gap: 8px; /* 列间距缩小 */
        }
      }


      .footer {
        padding: 12px;

        .title {
          margin-bottom: 8px;
          word-break: break-all;
          display: -webkit-box;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 2;
          overflow: hidden;
          font-weight: 500;
          font-size: 14px;
          line-height: 140%;
          color: #333;
        }

        .author-wrapper {
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 20px;
          color: rgba(51, 51, 51, 0.8);
          font-size: 12px;

          .author {
            display: flex;
            align-items: center;
            color: inherit;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;

            .author-avatar {
              margin-right: 6px;
              width: 20px;
              height: 20px;
              border-radius: 20px;
              object-fit: cover;
            }
          }

          .like-wrapper {
            display: flex;
            align-items: center;

            .like-icon {
              width: 36px; /* 设置图标大小 */
              height: 36px;
              margin-right: -8px; /* 图标与数字之间的间距 */
            }

            .count {
              margin-left: 2px;
            }
          }
        }
      }
    }
  }
  .modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 5000;
  }

  .modal-content {
    display: flex; /* 弹窗内使用 Flex 布局 */
    position: relative;
    background: #fff;
    padding: 20px;
    border-radius: 8px;
    height: 650px;
    width: 950px;
    text-align: center;
    z-index: 5000;
    gap: 20px; /* 左右间距 */
  }

  .modal-image {
    flex: 0 0 487.5px;
    height: 650px;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #f7f7f7; /* 图片未加载时的背景色 */
    position: relative;
    border-radius: 8px; /* 圆角 */


    img {
      max-width: 100%; /* 限制图片最大宽度 */
      max-height: 100%; /* 限制图片最大高度 */
      object-fit: contain; /* 保持图片比例，避免拉伸 */
      border-radius: 8px; /* 圆角 */
      &:hover{
        cursor: zoom-in;  // cursor显示放大鼠标图标
      }
    }

    .image-navigation {
      position: absolute;
      top: 50%;
      left: 0;
      right: 0;
      display: flex;
      justify-content: space-between;
      transform: translateY(-50%);
      z-index: 1;
      padding: 0 5px;
      visibility: hidden;
    }

    .image-index {
      color: #fff;
      font-size: 14px;
      background: rgba(0, 0, 0, 0.35);
      padding: 5px 10px;
      border-radius: 10px;
      position: absolute;
      top: -295px;
      right: 15px;
      visibility: hidden; /* 默认隐藏 */
      user-select:none;   /* 不可选中文字以免点击放大图片的时候干扰 */
    }

    .nav-button {
      color: #fff;
      border: none;
      font-weight: bold;
      font-size: 18px;
      height: 35px;
      width: 35px;
      cursor: pointer;
      border-radius: 50%;
      display: inline-flex;
      justify-content: center;
      align-items: center;
      visibility: hidden; /* 默认隐藏按钮 */
      user-select:none;   /* 不可选中文字以免点击放大图片的时候干扰 */
      backdrop-filter:blur(1px);
    }

    &:hover .image-index {
      visibility: visible; /* 鼠标悬停时显示按钮 */
    }

    &:hover .nav-button {
      visibility: visible; /* 鼠标悬停时显示按钮 */
      background: rgba(0, 0, 0, 0.3);
    }

    &:hover .nav-button:disabled {
      background: rgba(0, 0, 0, 0.1);
      cursor: not-allowed;
    }

    .video-cover {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      display: flex;
      justify-content: center;
      align-items: center;
      background: #f7f7f7;
    }

    .play-btn {
      background-color: rgba(0, 0, 0, 0.5);
      color: white;
      border: none;
      padding: 10px 20px;
      font-size: 16px;
      cursor: pointer;
      border-radius: 5px;
    }

    video {
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
      border-radius: 8px;
    }
  }


  .modal-text {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow-y: auto; /* 启用垂直滚动条 */
    max-height: 100%; /* 限制最大高度，防止内容溢出 */
  }


  .author-info {
    display: flex;
    align-items: center;
    margin-bottom: 16px; /* 头像和标题之间的间距 */

    .author-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      margin-right: 16px; /* 头像与名称之间的间距 */
      object-fit: cover;
    }

    .author-name {
      font-size: 18px;
      font-weight: bold;
    }

  }

  .modal-title {
    font-size: 20px;
    font-weight: bold;
    //font-family: "黑体", Arial, sans-serif;
    //font-family: "PingFang SC", "Helvetica Neue", "Helvetica", "Arial", "Microsoft YaHei", "\\5FAE软雅黑", "Hiragino Sans GB", "Heiti SC", "WenQuanYi Micro Hei", sans-serif;
    text-align: left;
    margin-top: 2px; /* 头像和标题之间的间距 */
    margin-bottom: 16px; /* 标题与内容之间的间距 */
  }

  .modal-content-text {
    display: inline;
    font-size: 16px;
    line-height: 1.5;
    text-align: left;
    // 等线字体
    //font-family: "PingFang SC", "Helvetica Neue", "Helvetica", "Arial", "Microsoft YaHei", "\\5FAE软雅黑", "Hiragino Sans GB", "Heiti SC", "WenQuanYi Micro Hei", sans-serif;
    margin-top: 0; /* 标题于内容之间的间距 */
    margin-bottom: 4px; /* 内容和tag与时间之间的间距 */
    white-space: pre-line;

    .modal-tag {
      display: inline-block;
      color: #003366;
      //font-weight: bold;
      font-size: 16px;
    }
  }

  .modal-time{
    color: #666;
    font-size: 14.5px;
    text-align: left;
    margin-bottom: 16px; /* 时间与分界线之间的间距 */
  }


  .divider {
    border: none;
    border-top: 1px solid #e0e0e0;
    margin: 4px 0;
  }

  .comments-placeholder {
    color: #999;
    text-align: center;
    margin-top: 20px;
    min-height: 150px; /* 最小高度 */
  }

  .modal-footer {
    position: absolute;
    left: 515px;
    right: 0; /* 保证右侧对齐 */
    bottom: 0; /* 保持在底部 */
    background: #fff;
    padding: 10px 20px; /* 内边距 */
    display: flex;
    justify-content: space-between;
    align-items: center;
    z-index: 10; /* 确保覆盖滚动内容 */
    border-top: 1px solid #e0e0e0;
    border-radius: 0 0 8px 0;

    .comment-input {
      flex: 1;
      height: 25px;
      padding: 8px 12px;
      border-radius: 20px;
      margin-right: 20px;
      font-size: 14px;
      background: rgba(0, 0, 0, 0.03);
      border: none; // 去除输入框的边框
      outline: none;  // 去除点击时输入框的边框
      box-shadow: none;   // 去除输入框的阴影，看起来更简约一点
    }

    .action-buttons {
      display: flex;
      gap: 15px;

      .action-button {
        display: flex;
        align-items: center;
        gap: 5px;
        font-size: 16px;
        cursor: pointer;
        .icons {
          width: 48px;
          height: 48px;
          margin-right: -16px; /* 图标与数字之间的间距 */
        }
      }
    }
  }
}
.fullscreen-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.3);
  display: flex;
  justify-content: center;
  align-items: center;
  backdrop-filter: blur(8px);
  z-index: 8000;
}

.fullscreen-modal:hover{
  cursor:zoom-out;  // cursor显示缩小鼠标图标
}

.fullscreen-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}


</style>