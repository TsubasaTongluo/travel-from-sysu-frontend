<template>
  <div class="notification-container">
    <!-- 顶部栏目 -->
    <div class="top-bar">
      <div :class="{'tab': true, 'active-tab': activeTab === 'comments'}" @click="activeTab = 'comments'">评论</div>
      <div :class="{'tab': true, 'active-tab': activeTab === 'likes'}" @click="activeTab = 'likes'">赞和收藏</div>
      <div :class="{'tab': true, 'active-tab': activeTab === 'follows'}" @click="activeTab = 'follows'">新增关注</div>
    </div>

    <!-- 长横线 -->
    <hr class="divider-long" />

    <!-- 消息内容 -->
    <div class="notification-list">
      <div v-for="(message, index) in filteredNotifications" :key="index" class="notification-item">
        <div class="message-header">
          <img :src="message.avatar" alt="头像" class="avatar" />
          <div class="details">
            <div>
              <span class="username">{{ message.username }}</span>
              <span class="status">{{ message.isFriend ? '你的好友' : '' }}</span>
            </div>
            <div class="time">{{ message.time }}</div>
          </div>
        </div>
        <div class="message-body" v-if="activeTab === 'comments'">{{ message.content }}</div>

        <!-- 短横线 -->
        <hr class="divider-short" v-if="index !== filteredNotifications.length - 1" />
      </div>
    </div>
  </div>
</template>

<script>


export default {
  data() {
    return {
      activeTab: "comments", // 当前激活的标签
      notifications: [
        {
          avatar: "/images/1.jpg", // 本地图片路径
          username: "Tyro",
          isFriend: true,
          time: "今天 15:57",
          content: "柔造启动", // 评论内容
          type: "comments", // 消息类型
        },
        {
          avatar: "/images/2.jpg",
          username: "Tyro",
          isFriend: true,
          time: "今天 15:39",
          content: "在评论中@了你",
          type: "comments",
        },
        {
          avatar: "/images/3.jpg",
          username: "北希满地乱爬",
          isFriend: true,
          time: "今天 15:29",
          content: "我以为王希转职弹药专家了@",
          type: "comments",
        },
        {
          avatar: "/images/4.jpg",
          username: "新用户",
          isFriend: false,
          time: "今天 14:00",
          type: "likes", // 赞
        },
        {
          avatar: "/images/1.jpg",
          username: "好友1",
          isFriend: true,
          time: "今天 13:00",
          type: "follows", // 新增关注
        },
      ],
    };
  },
  computed: {
    filteredNotifications() {
      return this.notifications.filter((message) => message.type === this.activeTab);
    },
  }
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