<template>
  <div class="feeds-page">
    <div class="channel-container">
      <div class="scroll-container channel-scroll-container">
        <div class="content-container">
          <div :class="categoryClass == '0' ? 'channel active' : 'channel'" @click="getNoteList">推荐</div>
          <div
            :class="categoryClass == item.id ? 'channel active' : 'channel'"
            v-for="item in categoryList"
            :key="item.id"
            @click="getNoteListByCategory(item.id)"
          >
            {{ item.title }}
          </div>
        </div>
      </div>
    </div>

    <!-- 加载 -->
    <div
      class="loading-container"
      v-if="isLoading"
    >
      <div class="spinner"></div>
    </div>

    <div class="feeds-container" :class="{ 'loading': isLoading }">
      <div class="grid-container">
        <div
          class="card"
          v-for="item in noteList"
          :key="item.id"
          style="max-width: 240px"
        >
          <div class="image-wrapper">
            <img
              :src="item.noteCover[0]"
              :style="{
                maxWidth: '210px',
                borderRadius: '8px',
              }"
              fit="contain"
              @click="toMain(item)"
            />

            <div v-if="item.noteType === 'video'" class="video-icon">
              <img src="/icons/video-icon.png" />
            </div>
          </div>

          <!-- 内容框 -->
          <div class="footer">
            <a class="title">
              <span>{{ item.title }}</span>
            </a>
            <div class="author-wrapper">
              <a class="author">
                <img class="author-avatar" :src="item.avatar" />
                <span class="name">{{ item.username }}</span>
              </a>
              <span class="like-wrapper like-active">
                <i class="iconfont icon-follow" style="width: 1em; height: 1em"></i>
                <img src="/icons/like.png" class="like-icon" @click="login" />
                <span class="count">{{ item.likeCount }}</span>
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
        <div class="modal-image" v-if="selectedNote.noteType === 'image'">
          <!-- 左侧当前图片 -->
          <img
            :src="selectedNote.noteCover[currentImageIndex]"
            @click="toggleFullscreenImage"
          />

          <div  v-if="selectedNote.noteCover.length > 1" class="image-navigation">
            <!-- 显示当前图片页数 -->
            <span class="image-index">{{ currentImageIndex + 1 }}/{{ selectedNote.noteCover.length }}</span>
            <!-- 图片切换按钮 -->
            <button @click="prevImage" :disabled="currentImageIndex === 0" class="nav-button">&lt;</button>
            <button @click="nextImage" :disabled="currentImageIndex === selectedNote.noteCover.length - 1" class="nav-button">&gt;</button>
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
          <h1 class="modal-title">{{ selectedNote.title }}</h1>
          <!-- 内容 -->
          <p class="modal-content-text">
            {{ selectedNote.content }}
            <!-- tag -->
            <span class="modal-tag" v-if="selectedNote.tag.length > 0">
              <span
                v-for="(tag, index) in selectedNote.tag"
                :key="index"
              >
                #{{ tag }}
              </span>
            </span>
          </p>

          <!-- 修改时间 -->
          <p class="modal-time">{{ selectedNote.datetime }}</p>
          <!-- 分界线 -->
          <hr class="divider" />
          <!-- 评论区域 -->
          <div class="comments-placeholder">评论区</div>
          <!-- 底部操作栏 -->
          <div class="modal-footer">
            <!-- 输入栏 -->
            <input type="text" class="comment-input" readonly
                   @click="login" placeholder="登录后评论" />
            <!-- 点赞收藏评论按钮 -->
            <div class="action-buttons">
              <span class="action-button" @click="login">
                <img src="/icons/like.png" class="icons"/>
                <i class="iconfont icon-like"></i> {{ selectedNote.likeCount }}
              </span>
              <span class="action-button" @click="login">
                <img src="/icons/collection.png" class="icons"/>
                <i class="iconfont icon-collection"></i> {{ selectedNote.collection }}
              </span>
              <span class="action-button" @click="login">
                <img src="/icons/comment.png" class="icons"/>
                <i class="iconfont icon-comment"></i> {{ selectedNote.comment }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="isFullscreen" class="fullscreen-modal" @click="closeFullscreen">
      <img :src="selectedNote.noteCover[currentImageIndex]" class="fullscreen-image" />
    </div>

    <div class="refresh-button" @click="refreshContent">
      <img src="/icons/refresh.png" class="icons"/>
    </div>
  </div>
  <Login v-show="loginShow" @close-login="close"></Login>

</template>

<script lang="ts" setup>
import { ref, onMounted } from "vue";
import { mockCategoryList, mockNoteList } from "@/mockData";
import Login from "@/pages/user/user_login.vue";

const noteList = ref(mockNoteList);
const categoryList = ref(mockCategoryList);
const categoryClass = ref("0");

const isModalVisible = ref(false);
const selectedNote = ref({
  title: "",
  username: "",
  likeCount: 0,
  noteCover: [],
  content: "",
  avatar: "",
  collection: 0,
  comment: 0,
  noteType: "",
  video: "",
  tag: [],
  datetime: "",
});


const isLoading = ref(true); // 加载状态
const loginShow = ref(false); // 控制弹窗状态

const isVideoPlaying = ref(false);  // 视频默认不播放

const currentImageIndex = ref(0);  // 当前显示的图片索引，用于多图

const isFullscreen = ref(false);  // 控制全屏图片弹窗显示

// 加载
onMounted(() => {
  // 模拟异步加载数据
  setTimeout(() => {
    noteList.value = mockNoteList;
    isLoading.value = false;
  }, 1000);
});

// 显示登录弹窗的函数
const login = () => {
  loginShow.value = true;
};

// 关闭登录弹窗的函数
const close = () => {
  loginShow.value = false;
};


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


// 获取当前分类下的 note 数据
const getFilteredNoteList = () => {
  if (categoryClass.value === "0") {
    // 显示推荐
    return mockNoteList;
  } else {
    // 根据当前分类 ID 筛选
    return mockNoteList.filter((item) => item.categoryId === categoryClass.value);
  }
};

// 刷新按钮点击事件
const refreshContent = () => {
  isLoading.value = true;
  setTimeout(() => {
    noteList.value = shuffleArray(getFilteredNoteList()); // 模拟异步刷新
    isLoading.value = false; // 关闭加载状态
  }, 500); // 设置加载时间
};

// 刷新函数
const shuffleArray = (array: any[]) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// 分类切换逻辑
const getNoteList = () => {
  categoryClass.value = "0"; // 推荐分类
  noteList.value = getFilteredNoteList();
};

const getNoteListByCategory = (id: string) => {
  categoryClass.value = id; // 设置当前分类
  noteList.value = getFilteredNoteList();
};

// 笔记图片切换函数
const prevImage = () => {
  if (currentImageIndex.value > 0) {
    currentImageIndex.value--;
  }
};

const nextImage = () => {
  if (currentImageIndex.value < selectedNote.value.noteCover.length - 1) {
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

</script>


<style lang="less" scoped>
.feeds-page {
  flex: 1;
  padding: 0 24px;
  padding-top: 72px;
  height: 100vh;
  max-width: 1145px; /* 设置页面的最大宽度 */

  .channel-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    user-select: none;
    -webkit-user-select: none;

    .channel-scroll-container {
      backdrop-filter: blur(20px);
      background-color: transparent;
      width: calc(100vw - 24px);

      position: relative;
      overflow: hidden;
      display: flex;
      user-select: none;
      -webkit-user-select: none;
      align-items: center;
      font-size: 16px;
      color: rgba(51, 51, 51, 0.8);
      height: 40px;
      white-space: nowrap;
      height: 72px;

      .content-container::-webkit-scrollbar {
        display: none;
      }

      .content-container {
        display: flex;
        overflow-x: scroll;
        overflow-y: hidden;
        white-space: nowrap;
        color: rgba(51, 51, 51, 0.8);

        .active {
          font-weight: 600;
          background: rgba(0, 0, 0, 0.03);
          border-radius: 999px;
          color: #333;
        }

        .channel {
          height: 40px;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 0 16px;
          cursor: pointer;
          -webkit-user-select: none;
          user-select: none;
        }
      }
    }
  }

  // 加载
  .loading-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 60px; /* 可根据需要调整高度 */
    background-color: #ffffff;
    animation: fadeIn 0.3s ease-in-out;
  }

  .spinner {
    border: 4px solid rgba(0, 0, 0, 0.1);
    border-top: 4px solid #888888;
    border-radius: 50%;
    margin-top: -10px;
    width: 16px;
    height: 16px;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  transition: transform 0.3s ease-in-out;
  &.loading {
    transform: translateY(60px);
  }

  .feeds-container {
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

.refresh-button {
  position: fixed;
  bottom: 50px;
  right: 40px;
  background-color: #f5f5f5;
  border: none;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: background-color 0.3s, transform 0.3s;
  .icons {
    width: 54px;
    height: 54px;
  }
}

.refresh-button:hover {
  background-color: #f3f3f3;
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
