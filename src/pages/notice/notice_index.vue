<template>
  <div class="notification-container">
    <!-- 顶部栏目 -->
    <div class="top-bar">
      <div :class="{'tab': true, 'active-tab': activeTab === 'comments'}" @click="switchToComments">评论</div>
      <div :class="{'tab': true, 'active-tab': activeTab === 'likes'}" @click="switchToLikes">赞和收藏</div>
      <div :class="{'tab': true, 'active-tab': activeTab === 'follows'}" @click="switchToFollows">新增关注</div>
    </div>

    <!-- 长横线 -->
    <hr class="divider-long" />

    <!-- 消息内容 -->
    <div class="notification-list">
      <div v-for="(message, index) in filteredNotifications" :key="index" class="notification-item">
        <div class="message-header">
          <img :src="message.avatar || '/images/default-avatar.jpg'" alt="头像" class="avatar" />
          <div class="details">
            <div>
              <span class="username">{{ message.username || '未知用户' }}</span>
              <span class="status">
                {{
                  message.type === 'like'
                    ? '点赞了你'
                    : message.type === 'collect'
                    ? '收藏了你'
                    : message.type === 'follow'
                    ? '关注了你'
                    : message.type === 'comment'
                    ? '评论了你'
                    : ''
                }}
              </span>
            </div>
            <div class="time">{{ formatTime(message.initiated_at) }}</div>
          </div>
        </div>

        <!-- 动态展示评论内容 -->
        <div v-if="message.type === 'comment'" class="message-body">
          {{ message.content }}
          <!-- 显示通过评论ID获取的详细评论 -->
          <div v-if="message.commentDetails">
            <p>{{ message.commentDetails.content }}</p>
            <small>评论ID: {{ message.commentDetails.id }}</small>
          </div>
        </div>

        <!-- 短横线 -->
        <hr class="divider-short" v-if="index !== filteredNotifications.length - 1" />
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      activeTab: "comments", // 当前激活的标签
      notifications: [], // 消息列表
    };
  },
  computed: {
    filteredNotifications() {
      return this.notifications.filter((message) => {
        if (this.activeTab === "likes") {
          return message.type === "like" || message.type === "collect";
        } else if (this.activeTab === "follows") {
          return message.type === "follow";
        } else if (this.activeTab === "comments") {
          return message.type === "comment";
        }
        return message.type === this.activeTab;
      });
    },
  },
  methods: {
    // 切换到 "评论" 功能
    switchToComments() {
      this.activeTab = "comments";
      this.fetchComments();
    },
    // 获取未读评论消息
    async fetchComments() {
      try {
        const response = await axios.get("/api/notification/unread_comments", {
          params: { recipient_id: 2 }, // 根据实际需要传递用户 ID
        });

        if (response.data.code === 200 && response.data.status === "成功") {
          const { notifications } = response.data.data;

          // 获取头像和用户名信息
          const promises = notifications.map(async (item) => {
            const avatar = await this.getUserAvatar(item.initiator_id); // 使用 UID 获取头像
            const username = await this.getUsername(item.initiator_id);

            // 获取评论详细内容
            const commentDetails = await this.getCommentDetails(item.comment_id);

            return {
              ...item,
              avatar,
              username,
              commentDetails, // 添加评论详细内容
            };
          });

          const commentNotifications = await Promise.all(promises);

          this.notifications = [...this.notifications, ...commentNotifications];
        } else {
          console.error("获取评论消息失败：", response.data);
        }
      } catch (error) {
        console.error("接口请求失败：", error);
      }
    },
    // 获取评论详情
    async getCommentDetails(commentId) {
      try {
        const response = await axios.get("/api/comment/getCommentById", {
          params: { comment_id: commentId },
        });
        return response.data.status === "成功" ? response.data.data : null;
      } catch (error) {
        console.error("获取评论详情失败：", error);
        return null;
      }
    },
    // 切换到 "赞和收藏" 功能
    switchToLikes() {
      this.activeTab = "likes";
      this.fetchLikesAndCollects();
    },
    // 获取未读 "赞和收藏" 消息
    async fetchLikesAndCollects() {
      try {
        const response = await axios.get("/api/notification/unread_likes-and-collects", {
          params: { recipient_id: 2 }, // 根据实际需要传递用户 ID
        });

        if (response.data.code === 200 && response.data.status === "成功") {
          const { notifications } = response.data.data;

          // 获取头像和用户名信息
          const promises = notifications.map(async (item) => {
            const avatar = await this.getUserAvatar(item.initiator_id); // 使用 UID 获取头像
            const username = await this.getUsername(item.initiator_id);

            return {
              ...item,
              avatar,
              username,
            };
          });

          const likeCollectNotifications = await Promise.all(promises);

          this.notifications = [...this.notifications, ...likeCollectNotifications];
        } else {
          console.error("获取赞和收藏消息失败：", response.data);
        }
      } catch (error) {
        console.error("接口请求失败：", error);
      }
    },
    // 切换到 "新增关注" 功能
    switchToFollows() {
      this.activeTab = "follows";
      this.fetchFollows();
    },
    // 获取未读 "新增关注" 消息
    async fetchFollows() {
      try {
        const response = await axios.get("/api/notification/unread_follows", {
          params: { recipient_id: 2 }, // 根据实际需要传递用户 ID
        });

        if (response.data.code === 200 && response.data.status === "成功") {
          const { notifications } = response.data.data;

          // 获取头像和用户名信息
          const promises = notifications.map(async (item) => {
            const avatar = await this.getUserAvatar(item.initiator_id); // 使用 UID 获取头像
            const username = await this.getUsername(item.initiator_id);

            return {
              ...item,
              avatar,
              username,
            };
          });

          const followNotifications = await Promise.all(promises);

          this.notifications = [...this.notifications, ...followNotifications];
        } else {
          console.error("获取新增关注消息失败：", response.data);
        }
      } catch (error) {
        console.error("接口请求失败：", error);
      }
    },
    // 获取用户头像
    async getUserAvatar(userId) {
      try {
        const response = await axios.get("/api/auth/getAvatar", {
          params: { uid: userId }, // 传递 uid 参数
        });
        return response.data.avatar || "/images/default-avatar.jpg";
      } catch (error) {
        console.error("获取头像失败：", error);
        return "/images/default-avatar.jpg";
      }
    },
    // 获取用户名
    async getUsername(userId) {
      try {
        const response = await axios.get("/api/auth/getUserInfoByID", {
          params: { id: userId },
        });
        return response.data.username || "未知用户";
      } catch (error) {
        console.error("获取用户名失败：", error);
        return "未知用户";
      }
    },
    // 格式化时间
    formatTime(dateString) {
      const date = new Date(dateString);
      return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}`;
    },
  },
};
</script>

<style scoped>
/* 整体容器样式 */
.notification-container {
  margin-top: 62px; /* 或者 padding-top: 60px; */
}

/* 顶部栏目样式 */
.top-bar {
  display: flex;
  height: 17px;
  justify-content: space-around;
  background-color: rgba(255, 255, 255, 0.8);
  border-radius: 7px;
  color:  rgba(0, 86, 31, 0.8);
  padding: 10px 0;
}

.tab {
  cursor: pointer;
  padding: 0px 30px;
}

.active-tab {
  font-weight: bold;
  height: 0px;
  border-top: 2px solid rgba(0, 86, 31, 0.8);
}

/* 长横线 */
.divider-long {
  border: none;
  height: 2px;
  background-color: rgba(0, 86, 31, 0.8);
  margin: 1px 0;
}

/* 消息列表样式 */
.notification-list {
  font-size: 15px;
  padding: 5px;
}

.notification-item {
  display: flex;
  flex-direction: column;
  padding: 5px 0;
}

.message-header {
  display: flex;
  align-items: center;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 15px;
}

.details {
  flex: 1;
}

.username {
  font-weight: bold;
}

.status {
  margin-left: 5px;
  color: gray;
}

.time {
  color: gray;
  font-size: 0.9em;
}

.message-body {
  margin-top: 5px;
}

/* 短横线 */
.divider-short {
  border: none;
  height: 1px;
  background-color: #eee;
  margin: 5px 0;
}
</style>