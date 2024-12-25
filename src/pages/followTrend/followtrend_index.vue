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
        <div class="card" v-for="item in noteList" :key="item.id" style="max-width: 240px">
          <div class="image-wrapper">
            <!-- 如果是视频类型，显示视频封面 -->
            <img
                v-if="isVideo(item.noteCover[0])"
                :src=default_videoCover
                :style="{ maxWidth: '210px', borderRadius: '8px' }"
                fit="contain"
                @click="toMain(item)"
            />


            <div v-if="isVideo(item.noteCover[0])" class="video-icon">
              <img src="/icons/video-icon.png" />
            </div>

            <!-- 如果是图片类型，正常显示图片 -->
            <img
                v-else
                :src="item.noteCover[0]"
                :style="{ maxWidth: '210px', borderRadius: '8px' }"
                fit="contain"
                @click="toMain(item)"
            />
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
                <img
                    :src="item.isLike ? '/icons/like-filled.png' : '/icons/like.png'"
                    class="like-icon"
                    @click="item.isLike ? unlike_note(item) : like_note(item)" />
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

        <!-- 弹窗左侧图片或视频 -->
        <div class="modal-image">
          <!-- 如果是视频格式 -->
          <div v-if="isVideo(selectedNote.noteCover[currentImageIndex])">
            <video controls>
              <source :src="selectedNote.noteCover[currentImageIndex]" type="video/mp4" />
            </video>
          </div>

          <!-- 如果是图片格式 -->
          <img
              v-else
              :src="selectedNote.noteCover[currentImageIndex]"
              @click="toggleFullscreenImage"
          />


          <div v-if="selectedNote.noteCover.length > 1" class="image-navigation">
            <!-- 显示当前图片页数 -->
            <span class="image-index">{{ currentImageIndex + 1 }}/{{ selectedNote.noteCover.length }}</span>
            <!-- 图片切换按钮 -->
            <button @click="prevImage" :disabled="currentImageIndex === 0" class="nav-button">&lt;</button>
            <button @click="nextImage" :disabled="currentImageIndex === selectedNote.noteCover.length - 1" class="nav-button">&gt;</button>
          </div>
        </div>

        <!-- 右侧文字 -->
        <div class="modal-text">
          <!-- 发布者信息 -->
          <div class="author-info">
            <img :src="selectedNote.avatar" class="author-avatar" />
            <span class="author-name">{{ selectedNote.username }}</span>
            <!-- 只有当发布者的 ID 与当前用户的 ID 不相等时才显示按钮 -->
            <button
                v-if="selectedNote?.creatorId !== userStore.getUserInfo()?.uid"
                class="follow-button"
                :class="{ 'followed': selectedNote?.isFollow }"
                @click="selectedNote?.isFollow ? unfollow_note(selectedNote) : follow_note(selectedNote)"
            >
              {{ selectedNote?.isFollow ? '取消关注' : '关注' }}
            </button>
          </div>
          <!-- 标题 -->
          <h1 class="modal-title">{{ selectedNote.title }}</h1>
          <!-- 内容 -->
          <p class="modal-content-text">
            {{ selectedNote.content }}
            <!-- tag -->
            <span class="modal-tag" v-if="selectedNote.tag.length > 0">
              <span
                  v-for="(tag, index) in selectedNote.tag.split(',')"
                  :key="index"
              >
                #{{ tag.trim() }}
              </span>
            </span>
          </p>


          <!-- 修改时间 -->
          <p class="modal-time">{{ formatDate(selectedNote.datetime) }}</p>
          <!-- 分界线 -->
          <hr class="divider" />
          <!-- 评论区 -->
          <div class="comments-placeholder">
            <p v-if="commentList && commentList.length > 0" class="comment-count">共{{ selectedNote.comment_counts }}条评论</p>
            <div v-if="commentList && commentList.length > 0" class="comments-list">
              <div v-for="comment in commentList" :key="comment.comment_id" class="comment-item">
                <div class="comment-left">
                  <img :src="comment.creator_avatar" class="comment-avatar" />
                </div>
                <div class="comment-right">
                  <span class="comment-username">{{ comment.creator_username }}
                    <span class="author-comment" v-if="selectedNote?.creatorId == comment.creator_id">
                      作者
                    </span>
                    </span>
                  <p class="comment-content">{{ comment.content }}</p>
                  <p class="comment-time">{{ formatDate_comment(comment.created_at) }}</p>
                  <div class="comment-icons">
                    <span class="comment-icon">
                      <img
                          :src="comment.isLiked ? '/icons/like-filled.png' : '/icons/like.png'"
                          class="icons" />
                      <i class="iconfont icon-like"></i> {{ comment.comment_like }}
                    </span>
                    <span class="comment-icon">
                      <img src="/icons/comment.png" class="icons" />
                      <i class="iconfont icon-report"></i>
                    </span>
                  </div>
                </div>
              </div>
              <div class="no-more-comments">
                <br />
                没有更多评论啦
                <br />
                <br />
              </div>
            </div>
            <div v-else class="no-comments">暂无评论</div>
          </div>


          <!-- 底部操作栏 -->
          <div class="modal-footer">
            <!-- 输入栏  todo: 评论接口 -->
            <div class="comment-input-container">
              <textarea
                  class="comment-input"
                  placeholder="说点什么……"
                  v-model="commentContent"
                  @keyup.enter="handleEnter"
              ></textarea>
              <button
                  v-if="commentContent"
                  class="send-button"
                  @click="comment_note(selectedNote)"
              >
                发送
              </button>
            </div>
            <!-- 点赞收藏评论按钮 -->
            <div class="action-buttons">
              <span class="action-button" @click="selectedNote.isLike ? unlike_note(selectedNote) : like_note(selectedNote)" >
                <img
                    :src="selectedNote?.isLike ? '/icons/like-filled.png' : '/icons/like.png'"
                    class="icons" />
                <i class="iconfont icon-like"></i> {{ selectedNote.likeCount }}
              </span>
              <span class="action-button" @click="selectedNote?.isCollection ? uncollect_note(selectedNote) : collect_note(selectedNote)">
                <img
                    :src="selectedNote?.isCollection ? '/icons/collection-filled.png' : '/icons/collection.png'"
                    class="icons"
                />
                <i class="iconfont icon-collection"></i> {{ selectedNote.collection }}
              </span>
              <span class="action-button">
                <img src="/icons/comment.png" class="icons"/>
                <i class="iconfont icon-comment"></i> {{ selectedNote.comment_counts }}
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
import Login from "@/pages/user/user_login.vue";
import axios from 'axios';
import default_avatar from "@/assets/logo.png";
import default_videoCover from "@/assets/default_videoCover.png";

import { useUserStore } from "@/store/user"; // 导入 Pinia store

const commentContent = ref('');
const commentList = ref<Array<Comment>>([]);


const userStore = useUserStore();
const userId = userStore.getUserInfo()?.id;


const noteList = ref<Note[]>([]); // 从后端获取的笔记数据
const categoryClass = ref("0"); // 当前分类，"0" 表示推荐

const categoryList = ref([
  { id: "旅行", title: "旅行" },
  { id: "外出", title: "外出" },
  { id: "返乡", title: "返乡" }
]);

const isLoading = ref(false); // 加载状态

const isModalVisible = ref(false);

const selectedNote = ref<Note | null>(null); // 单一笔记对象或空值

const loginShow = ref(false); // 控制弹窗状态

const isVideoPlaying = ref(false);  // 视频默认不播放

const currentImageIndex = ref(0);  // 当前显示的图片索引，用于多图

const isFullscreen = ref(false);  // 控制全屏图片弹窗显示

import { toRaw } from 'vue';  // 获取用户原始信息以判断是否登录

const userInfo = ref<any>(null);

onMounted(() => {
  if (!isLoggedIn()) {
    login()  // 如果未登录，显示登录弹窗
  } else {
    const userInfo = userStore.getUserInfo();
    if (userInfo && userInfo.username && userInfo.uid) {
      console.log('当前用户信息:', userInfo);
      fetchNotes(null, userInfo.uid);  // 获取当前用户的笔记
    } else {
      console.error("用户未登录，无法获取笔记！");
    }
  }
});


// 判断用户是否已登录
const isLoggedIn = (): boolean => {
  const userInfo = userStore.getUserInfo();  // 获取用户信息
  const rawUserInfo = toRaw(userInfo);  // 获取原始对象
  return rawUserInfo != null && rawUserInfo.uid != null;  // 判断 uid 是否存在
};

// 点赞收藏评论
const unlike_note = async (note:Note) => {
  // todo: unlike接口
  //console.log("unlike!");
  try {
    const res = await unlike(note.note_id);
    // console.log("点赞结果",res);
    if(res.data.code===200){
      note.isLike=false;
      note.likeCount-=1;
      // ElMessage.success("取消点赞成功");
    }else{
      console.log("取消点赞失败：",res.data.error);
    }
  }catch(error){
    console.log("取消点赞失败：",error);
  }
}

const like_note = async (note:Note) =>{
  // todo: like接口
  //console.log("like!");
  try {
    const res = await like(note.note_id);
    // console.log("点赞结果",res);
    if(res.data.code===200){
      note.isLike=true;
      note.likeCount+=1;
      // ElMessage.success("点赞成功");
    }else{
      console.log("点赞失败：",res.data.error);
    }
  }catch(error){
    console.log("点赞失败：",error);
  }
};

const collect_note = async (note:Note) =>{
  // todo: collect 接口
  //console.log("collect!");
  try {
    const res = await collect(note.note_id);
    // console.log("点赞结果",res);
    if(res.data.code===200){
      note.isCollection=true;
      note.collection+=1;
      // ElMessage.success("收藏成功");
    }else{
      console.log("收藏失败：",res.data.error);
    }
  }catch(error){
    console.log("收藏失败：",error);
  }
};

const uncollect_note = async (note:Note) =>{
  // todo: uncollect 接口
  //console.log("uncollect!");
  try {
    const res = await uncollect(note.note_id);
    // console.log("点赞结果",res);
    if(res.data.code===200){
      note.isCollection=false;
      note.collection-=1;
      // ElMessage.success("取消收藏成功");
    }else{
      console.log("取消收藏失败：",res.data.error);
    }
  }catch(error){
    console.log("取消收藏失败：",error);
  }
};

async function like(nid:number) {
  return await axios({
    url:"/api/note/like",
    method: "POST",
    data: {
      uid: userStore.getUserInfo()?.uid,
      note_id: nid,
    },
  });
}

async function unlike(nid:number) {
  return await axios({
    url:"/api/note/dislike",
    method: "POST",
    data: {
      uid: userStore.getUserInfo()?.uid,
      note_id: nid,
    },
  });
}

async function collect(nid:number) {
  return await axios({
    url:"/api/note/collect",
    method: "POST",
    data: {
      uid: userStore.getUserInfo()?.uid,
      note_id: nid,
    },
  });
}

async function uncollect(nid:number) {
  return await axios({
    url:"/api/note/uncollect",
    method: "POST",
    data: {
      uid: userStore.getUserInfo()?.uid,
      note_id: nid,
    },
  });
}

const comment_note = async (note:Note) =>{
  // todo: comment 接口
  // console.log("comment!");
  try {
    const res = await comment(note.note_id);
    if(res.data.code===200){
      note.comment_counts+=1;
      // todo: 更新评论
      // 获取当前笔记的一级评论
      try {
        const res = await get_firstcomments(note.note_id);
        if (res.data.code===200){
          commentList.value = await processComments(res);
          // console.log(commentList);
        }
      }catch(error){
        console.log("获取评论出错",error);
        commentList.value = [];
      }
    }else{
      console.log("评论失败：",res.data.error);
    }
  }catch(error){
    console.log("评论失败：",error);
  }finally{
    commentContent.value='';
  }
};

async function get_firstcomments(note_id:number){
  return await axios({
    url:"/api/comment/getFirstLevelCommentsByNoteId",
    method: "GET",
    params: { note_id : note_id },
  });
}

async function comment(note_id:number) {
  // 暂时先只做第一层次的评论
  return await axios({
    url:"/api/comment/publishComment",
    method: "POST",
    data: {
      note_id: note_id,
      creator_id: userStore.getUserInfo()?.uid,
      level: 1,
      content: commentContent.value,
    },
  });
}

async function processComments(res: any): Promise<Comment[]> {

  const comments = res.data.comments;
  if (!comments) {
    console.log("No comments found");
    return [];
  }

  return await Promise.all(res.data.comments
      .map(async (comment: any) => {
        let new_comment: Comment = { ...comment };
        try {
          new_comment.creator_avatar = await fetchAvatarById(new_comment.creator_id);
        } catch (error) {
          console.log("获取头像失败:", error);
          new_comment.creator_avatar = default_avatar; // 如果头像获取失败，设置为默认头像
        }

        try {
          const user = await get_userinfo(new_comment.creator_id);
          new_comment.creator_username = user.data.username;
        } catch (error) {
          console.log("获取用户信息失败:", error);
          new_comment.creator_username = "未知用户"; // 默认用户名
        }
        return new_comment;
      }));
}

const follow_note = async (note:Note) =>{
  try {
    const res = await follow(note.creatorId);
    // console.log("关注结果",res);
    if(res.data.code===200){
      note.isFollow = true;
      // ElMessage.success("关注成功");
      // todo: 本地关注数+1
      if(userInfo.value!==null){
        userInfo.value.follower_count += 1;
        userStore.setUserInfo(userInfo.value);
      }
    }else{
      console.log("关注失败：",res.data.error);
    }
  }catch(error){
    console.log("关注失败：",error);
  }
};

const unfollow_note = async (note:Note) =>{
  try {
    const res = await unfollow(note.creatorId);
    if(res.data.code===200){
      note.isFollow = false;
      if(userInfo.value!==null){
        userInfo.value.follower_count -= 1;
        userStore.setUserInfo(userInfo.value);
      }
    }else{
      console.log("取消关注失败：",res.data.error);
    }
  }catch(error){
    console.log("取消关注失败：",error);
  }
};

async function follow(creator_id:number) {
  return await axios({
    url:"/api/user/follow",
    method: "POST",
    data: {
      current_user_id: userStore.getUserInfo()?.uid,
      target_user_id: creator_id,
    },
  });
}

async function unfollow(creator_id:number) {
  return await axios({
    url:"/api/user/unfollow",
    method: "POST",
    data: {
      current_user_id: userStore.getUserInfo()?.uid,
      target_user_id: creator_id,
    },
  });
}

import type {Note} from "@/type/note";

const fetchNotes = async (noteType: string | null = null, userId: string) => {
  isLoading.value = true;


  try {
    const num = 10;  // 请求的条数，默认为 10
    const cursor = ''; // 游标为空，或者你可以传递一个有效的时间戳

    const response = await axios.get('/api/note/getUserFoNotes', {
      params: {
        user_id: userId, // 用户id
        num: num,         // 请求的条数
        cursor: '',   // 游标为空
      },
    });

    if (response.data && response.data.data && response.data.data.notes) {
      let notes = response.data.data.notes;

      if (notes === null) {
        noteList.value = [];
        console.warn("后端返回了空的笔记列表（null），已转换为空数组");
      } else {
        // 分类过滤
        if (noteType) {
          notes = notes.filter((note: any) => note.note_type === noteType);
        }

        // 填充用户名和头像
        for (let note of notes) {
          const username = await fetchUsernameById(note.note_creator_id);
          note.username = username || '未知用户';

          const avatar = await fetchAvatarById(note.note_creator_id);
          note.avatar = avatar || default_avatar;
        }

        // 更新笔记列表
        noteList.value = notes.map((note: any) => ({
          note_id: note.note_id,
          title: note.note_title,
          content: note.note_content,
          viewCount: note.view_count,
          tag: note.note_tag_list || [],
          noteCover: (() => {
            if (typeof note.note_urls === "string") {
              try {
                const parsedUrls = JSON.parse(note.note_urls);
                if (Array.isArray(parsedUrls)) {
                  return parsedUrls;
                }
              } catch (error) {
                console.error("note_urls 字段解析失败：", error);
              }
              return [];
            } else if (Array.isArray(note.note_urls)) {
              return note.note_urls;
            }
            return [];
          })(),
          creatorId: note.note_creator_id,
          datetime: note.note_update_time,
          likeCount: note.like_counts,
          collection: note.collect_counts,
          comment_counts: note.comment_counts,
          username: note.username,
          avatar: note.avatar,
          noteType: note.note_type,
          isLike: note.status.is_like,  // 后端返回这个字段来表示是否已点赞
          isCollection: note.status.is_collect,  // 后端返回这个字段来表示是否已收藏
          isFollow: note.status.is_follow,
        }));
      }
    } else {
      console.error('后端返回数据格式错误：缺少 notes 字段');
      noteList.value = [];
    }
    isLoading.value = false;
  } catch (error) {
    console.error('获取笔记数据失败', error);
    isLoading.value = false;
    noteList.value = [];
  }
};

async function get_userinfo(uid: number) {
  return await axios({
    url: "/api/auth/getUserInfoByID",
    method: "GET",
    params: { id: uid },
  });
}


// 获取用户名的函数
const fetchUsernameById = async (userId: number): Promise<string | null> => {
  try {
    const response = await axios.get(`/api/auth/getUserInfoByID`, {
      params: { id: userId },
    });
    if (response.data && response.data.status === '成功') {
      return response.data.username; // 返回用户名
    } else {
      console.error('获取用户名失败', response.data.msg || '未知错误');
      return null;
    }
  } catch (error) {
    console.error('请求用户信息失败', error);
    return null;
  }
};

// 获取用户头像的函数
const fetchAvatarById = async (userId: number): Promise<string | null> => {
  try {
    const response = await axios.get(`/api/auth/getAvatar`, {
      params: { uid: userId },
    });
    if (response.data && response.data.avatar) {
      return response.data.avatar; // 返回头像URL
    } else {
      //console.error('获取头像失败', response.data.error || '未知错误');
      return null;
    }
  } catch (error) {
    //console.error('请求用户头像失败', error);
    return null;
  }
};


const getNoteList = () => {
  const userInfo = userStore.getUserInfo();  // 每次调用时重新获取用户信息
  const userId = userInfo?.uid; // 确保 userId 存在

  if (!userId) {
    console.error('缺少 userId 参数');
    return;
  }

  categoryClass.value = '0';
  fetchNotes(null, userId);  // 将 userId 传递给 fetchNotes
};

const getNoteListByCategory = (id: string) => {
  const userInfo = userStore.getUserInfo();  // 每次调用时重新获取用户信息
  const userId = userInfo?.uid;  // 获取 userId

  if (!userId) {
    console.error('缺少 userId 参数');
    return;
  }

  categoryClass.value = id;
  noteList.value = []; // 清空当前显示的笔记列表
  fetchNotes(id === '0' ? null : id, userId);  // 将 userId 传递给 fetchNotes
};


// 获取分类数据
const fetchCategories = () => {
  categoryList.value;
};

const isVideo = (url: string): boolean => {
  // 判断文件格式是否为视频
  const videoFormats = ['.mp4', '.mov', '.avi', '.mkv'];
  return videoFormats.some(format => url.toLowerCase().endsWith(format));
};




const formatDate = (timestamp: number): string => {
  const date = new Date(timestamp * 1000); // 转换为 JavaScript Date 对象
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // 获取月份并补充零
  const day = String(date.getDate()).padStart(2, '0'); // 获取日期并补充零
  const hours = String(date.getHours()).padStart(2, '0'); // 获取小时并补充零
  const minutes = String(date.getMinutes()).padStart(2, '0'); // 获取分钟并补充零
  const seconds = String(date.getSeconds()).padStart(2, '0'); // 获取秒并补充零

  return `${year}年${month}月${day}日 ${hours}:${minutes}:${seconds}`;
};

function formatDate_comment(input) {
  // 将输入字符串转为 Date 对象
  const date = new Date(input);

  // 提取年月日和时间
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0'); // 月份从0开始，需加1
  const day = date.getDate().toString().padStart(2, '0');
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');

  // 拼接格式化字符串
  return `${year}年${month}月${day}日 ${hours}:${minutes}:${seconds}`;
}

// 显示登录弹窗的函数
const login = () => {
  loginShow.value = true;
};

// 关闭登录弹窗
const close = () => {
  loginShow.value = false;
};


const toMain = async (note: any) => {
  selectedNote.value = note;
  // 获取当前笔记的一级评论
  try {
    const res = await get_firstcomments(selectedNote.value?.note_id);
    // console.log("1获取评论：",res);
    if (res.data.code===200){
      commentList.value = await processComments(res);
      // console.log(commentList);
    }
  }catch(error){
    console.log("获取评论出错",error);
    commentList.value = [];
  }
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



// 刷新按钮点击事件
const refreshContent = async () => {
  isLoading.value = true;

  try {
    // 获取当前的 userId
    const userInfo = userStore.getUserInfo();
    const userId = userInfo?.uid;

    if (!userId) {
      console.error('缺少 userId 参数');
      return;
    }

    // 刷新时，根据当前分类和 userId 获取数据
    await fetchNotes(categoryClass.value === '0' ? null : categoryClass.value, userId);
  } catch (error) {
    console.error('刷新数据失败', error);
  } finally {
    isLoading.value = false; // 关闭加载状态
  }
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
          background: rgba(0, 86, 31, 0.3);
          border-radius: 9px;
          color: #00561f;
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
        box-shadow: 0 1px 3px rgba(0, 86, 31, 0.3);
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
              border: 1px solid #eee;
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
    max-height: 640px;
    object-fit: contain;
    border-radius: 8px;
  }
}


.modal-text {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto; /* 启用垂直滚动条 */
  overflow-x: hidden;
  max-height: calc(100% - 50px); /* 限制最大高度，防止内容溢出 */
  padding-right: 10px; /* 向右边移动滚动条 */

  /* 默认隐藏滚动条 */
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none;
}

/* 针对 WebKit 浏览器（如 Chrome、Edge）隐藏滚动条 */
.modal-text::-webkit-scrollbar {
  display: none;
}

/* 鼠标悬停时显示滚动条 */
.modal-text:hover {
  scrollbar-width: thin; /* Firefox */
}

.modal-text:hover::-webkit-scrollbar {
  display: block; /* WebKit 浏览器显示滚动条 */
  width: 6px; /* 设置滚动条宽度 */
}

/* 自定义滚动条样式 */
.modal-text::-webkit-scrollbar {
  width: 6px;
}

.modal-text::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.3); /* 滚动条颜色 */
  border-radius: 3px; /* 滚动条圆角 */
}


.author-info {
  display: flex;
  align-items: center;
  margin-bottom: 16px; /* 头像和标题之间的间距 */

  .author-avatar {
    border: 1px solid #eee;
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

  .follow-button {
    margin-left: auto; /* 将按钮推到右侧 */
    padding: 6px 12px;
    font-size: 14px;
    background-color: #ff0000;
    color: white;
    border: none;
    border-radius: 20px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background-color 0.3s;
  }

  .follow-button:hover {
    background-color: #e92828; /* 鼠标悬停时的颜色 */
  }

  .follow-button.followed {
    background-color: #ff5c8d; /* 取消关注时的背景色 */
  }

  .follow-button:focus {
    outline: none; /* 去掉按钮的聚焦框 */
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
  margin-bottom: -2px; /* 内容和tag与时间之间的间距 */
  white-space: pre-line;

  .modal-tag {
    display: inline-block;
    color: #003366;
    //font-weight: bold;
    font-size: 16px;
    cursor: pointer;
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
  min-height: 150px;

  .comment-count{
    text-align: left;
    font-size: 14px;
    color: #8b8b8b;
    font-weight: bold;
    margin-top: 0;
    margin-bottom: 10px;
  }

  .comments-list {
    display: flex;
    flex-direction: column;
    gap: 10px; /* 每条评论之间的间距 */
    padding: 0;
  }

  .comment-item {
    background-color: #fff;
    border-radius: 8px;
    padding: 12px;
    display: flex; /* 使用 flex 布局，使头像和评论内容并排 */
    gap: 12px; /* 左右容器之间的间距 */
    align-items: flex-start; /* 确保头像和右侧内容垂直对齐 */
  }

  .comment-left {
    flex-shrink: 0; /* 固定左侧宽度 */
  }

  .comment-avatar {
    border: 1px solid #eee;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    object-fit: cover;
  }

  .comment-right {
    display: flex;
    flex-direction: column; /* 确保右侧内容垂直排列 */
    justify-content: flex-start; /* 保持内容顶部对齐 */
    gap: 0px; /* 用户名、内容和时间之间的间距 */
    text-align: left;
    flex: 1; /* 右侧容器占据剩余宽度 */
  }

  .comment-username {
    //font-weight: bold;
    font-size: 16px;
    color: #8b8b8b;
    margin-bottom: -5px;  // 用户名与评论内容之间的间距
    display: flex; /* 启用 Flexbox */
    align-items: center; /* 垂直居中对齐 */

    .author-comment{
      margin-left: 6px;
      padding: 2px;
      border-radius: 8px; /* 圆角 */
      font-size: 13px;
      background-color: #f7f7f7;
      color: #8b8b8b;
    }
  }


  .comment-content {
    font-size: 16px;
    color: #555;
    white-space: normal; /* 允许换行 */
    overflow-wrap: break-word; /* 长单词会换行 */
    word-wrap: break-word; /* 兼容旧浏览器的属性 */
    word-break: break-word; /* 额外确保单词在任何地方都能断开 */
    margin-bottom: -5px;  // 评论内容与时间之间的间距
  }

  .comment-time {
    font-size: 13px;
    color: #8b8b8b;
    margin-bottom: 2px;
  }

  .comment-icons {
    display: flex;
    gap: 16px; /* 图标间的间距 */
    margin-top: 0px; /* 与时间的间距 */
  }

  .comment-icon {
    font-size: 14px;
    display: flex;
    align-items: center;
    cursor: pointer;
    color: #333;
    margin-left: -8px;
  }

  .comment-icon img {
    width: 30px; /* 图标大小 */
    height: 30px;
  }


  .no-comments {
    font-size: 16px;
    color: #aaa;
    font-style: italic;
  }
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


  .comment-input-container {
    position: relative;
    display: flex;
    align-items: center;
    width: 100%;
    // gap: 10px; /* 留出按钮与输入框之间的空隙 */
  }

  .comment-input {
    width: 100%;
    //min-height: 25px; /* 设置最小高度 */
    //max-height: 50px;
    padding: 8px 12px;
    font-size: 14px;
    //border: 1px solid #ccc;
    border: none;
    border-radius: 20px;
    outline: none;
    transition: border-color 0.3s ease;
    background: rgba(0, 0, 0, 0.03);
    padding-right: 25%; /* 为了避免右侧文字显示，设置 padding-right */
    resize: none;  /* 禁止手动调整大小 */
    box-sizing: border-box; /* 确保 padding 不会改变宽度 */
  }

  .comment-input:focus {
    border: 1px solid;
    border-color: #333; /* 输入框聚焦时的边框颜色 */
  }

  .send-button {
    position: absolute;
    right: 10px;  /* 发送按钮位置靠右 */
    padding: 6px 12px;
    background-color: #333;
    color: white;
    border: none;
    border-radius: 20px;
    cursor: pointer;
    font-size: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background-color 0.3s;
    opacity: 0;  /* 初始状态下按钮不可见 */
  }

  .send-button:hover {
    background-color: #666;
  }

  .send-button:focus {
    outline: none;
  }

  .comment-input:not(:placeholder-shown) + .send-button {
    opacity: 1;  /* 只有当输入框有值时按钮才显示 */
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
