<template>
  <div class="push-container">
    <h1 class="title">发布内容</h1>

    <form @submit.prevent="handleSubmit" class="form">
      <!-- 标题输入 -->
      <div class="title-input-container">
        <h3 class="section-title">帖子标题</h3>
        <input
          v-model="postTitle"
          type="text"
          placeholder="请输入标题"
          class="title-input"
          required
        />
      </div>

      <!-- 用户输入ID -->
      <div class="user-id-container">
        <h3 class="section-title">输入用户ID</h3>
        <input
          v-model="creatorID"
          type="number"
          placeholder="请输入您的ID"
          class="user-id-input"
          required
        />
      </div>

      <!-- 标签选择 -->
      <div class="tag-container">
        <h3 class="section-title">选择标签</h3>
        <div class="tag-options">
          <label>
            <input
              type="checkbox"
              value="外出"
              v-model="selectedTags"
            />
            外出
          </label>
          <label>
            <input
              type="checkbox"
              value="旅行"
              v-model="selectedTags"
            />
            旅行
          </label>
          <label>
            <input
              type="checkbox"
              value="返乡"
              v-model="selectedTags"
            />
            返乡
          </label>
        </div>
      </div>

      <!-- 找旅伴选项 -->
      <div class="companion-toggle" @click="toggleCompanion">
        <div class="companion-indicator" :class="{ active: isFindingCompanion }"></div>
        <span>{{ isFindingCompanion ? '已选择找旅伴' : '选择是否找旅伴' }}</span>
      </div>

      <div v-if="isFindingCompanion" class="companion-details">
        <h3 class="section-title">找旅伴需求</h3>
        <textarea
          v-model="companionDetails"
          placeholder="在这里输入你的需求..."
          class="post-textarea"
        ></textarea>
      </div>

      <!-- 上传文件 -->
      <div class="upload-container">
        <h3 class="section-title">上传图像或视频</h3>
        <label for="file-upload" class="upload-label">
          选择文件
          <input
            type="file"
            id="file-upload"
            @change="handleFileChange"
            accept="image/*,video/*"
            multiple
          />
        </label>

        <div v-if="previews.length > 0" class="preview-container">
          <h4 class="preview-title">文件预览:</h4>
          <div class="preview-item" v-for="(preview, index) in previews" :key="index">
            <template v-if="preview.isImage">
              <img :src="preview.url" alt="Image Preview" class="preview-image" />
              <button type="button" class="delete-button" @click="removePreview(index)">X</button>
            </template>
            <template v-else-if="preview.isVideo">
              <video :src="preview.url" controls class="preview-video"></video>
              <button type="button" class="delete-button" @click="removePreview(index)">X</button>
            </template>
          </div>
        </div>
      </div>

      <!-- 帖子内容 -->
      <div class="content-section">
        <h3 class="section-title">帖子内容</h3>
        <textarea
          v-model="postContent"
          placeholder="在这里输入你的帖子内容..."
          class="post-textarea"
        ></textarea>
      </div>

      <!-- 提交按钮 -->
      <button type="submit" class="submit-button">发布帖子</button>
    </form>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import axios from 'axios';

// 数据绑定
const files = ref<File[]>([]);
const previews = ref<{ url: string; isImage: boolean; isVideo: boolean }[]>([]);
const postTitle = ref('');
const postContent = ref('');
const selectedTags = ref<string[]>([]);  // 标签是一个字符串数组
const creatorID = ref<number>(12345); // 用户ID（可由用户自行输入）
const isFindingCompanion = ref(false);
const companionDetails = ref('');
const noteCount = ref(0); // 记录文件数量
const noteURLs = ref<string>(''); // 用来存储URL字段

// 上传文件处理
const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (!target.files) return;

  const newFiles = Array.from(target.files);
  newFiles.forEach((file) => {
    if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
      alert('请选择图像或视频文件！');
      return;
    }

    files.value.push(file);

    const reader = new FileReader();
    reader.onload = () => {
      previews.value.push({
        url: reader.result as string,
        isImage: file.type.startsWith('image/'),
        isVideo: file.type.startsWith('video/'),
      });
    };
    reader.readAsDataURL(file);
  });

  // 根据选择的文件更新 noteCount
  noteCount.value = files.value.length;
};

// 删除文件预览
const removePreview = (index: number) => {
  previews.value.splice(index, 1);
  files.value.splice(index, 1);
  // 删除文件后更新 noteCount
  noteCount.value = files.value.length;
};

// 切换找旅伴选项
const toggleCompanion = () => {
  isFindingCompanion.value = !isFindingCompanion.value;
};
const handleSubmit = async () => {
  // 校验必填项
  if (!postTitle.value || !postContent.value || selectedTags.value.length === 0) {
    console.log('1111111111222223333456456546464646456',postContent.value, postTitle.value, selectedTags.value.length)
    alert('请填写所有必需的信息！');
    return;
  }

  const formData = new FormData();

  // 添加表单数据
  formData.append('noteTitle', postTitle.value);
  formData.append('noteContent', postContent.value);
  formData.append('noteCreatorID', creatorID.value.toString());  // 转换为数字类型
  formData.append('noteTagList', JSON.stringify(selectedTags.value)); // 标签是数组
  formData.append('noteType', '新闻');  // 使用新闻类型
  formData.append('noteCount', files.value.length.toString());  // 传递图片/视频数量，确保是字符串
  formData.append('noteURLs', noteURLs.value);  // 添加 URL 字段
  files.value.forEach((file) => formData.append('file', file)); // 保持文件对象传递

  // 输出所有要发送的数据（formData），用于检查
  console.log("提交的数据：");
  for (let [key, value] of formData.entries()) {
    // 输出每个表单数据的 key 和 value
    if (value instanceof File) {
      console.log(`${key}: ${value.name}`);  // 输出文件名而非内容
    } else {
      console.log(`${key}: ${value}`);  // 输出其他字段的内容
    }
  }

  try {
    const response = await axios.post('/api/note/publishNote', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    console.log("响应数据:", response);
  } catch (error) {
    console.error('请求错误:', error);
  }
};

// 重置表单数据
const resetForm = () => {
  files.value = [];
  previews.value = [];
  postTitle.value = '';
  postContent.value = '';
  selectedTags.value = [];  // 重置标签选择
  creatorID.value = 12345; // 恢复初始ID
  isFindingCompanion.value = false;
  companionDetails.value = '';
  noteURLs.value = ''; // 清空URL字段
};
</script>

<style scoped>
/* 样式部分保持不变 */
.tag-options label {
  margin-right: 20px;
}
</style>
<style scoped>
/* 样式部分保持不变 */
.tag-options label {
  margin-right: 20px;
}
</style>

<style scoped>
/* 样式部分保持不变 */
</style>

<style scoped>
/* 样式 */
.title-input-container,
.user-id-container,
.tag-container,
.companion-details,
.upload-container,
.content-section {
  margin-bottom: 20px;
}

.user-id-input,
.tag-input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
}

.upload-container input[type="file"] {
  display: none;
}

.preview-container {
  margin-top: 15px;
}

.preview-item {
  margin-bottom: 15px;
}

.preview-image,
.preview-video {
  width: 100%;
  max-width: 300px;
  border-radius: 8px;
}

.submit-button {
  display: block;
  width: 100%;
  background-color: hsl(0, 87%, 53%);
  color: white;
  padding: 12px;
  border: none;
  border-radius: 5px;
  font-size: 1.2rem;
  cursor: pointer;
  margin-top: 20px;
  transition: background-color 0.3s ease;
}

.submit-button:hover {
  background-color: #830e0e;
}

.submit-button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.submit-button:focus {
  outline: none;
  box-shadow: 0 0 5px rgba(149, 5, 5, 0.6);
}
</style>

<style lang="less" scoped>
.push-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
  height: 100%;
}

.title {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 20px;
  color: #333;
}

.form {
  width: 100%;
  background-color: #f9f9f9;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.section-title {
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 10px;
  color: #555;
}

.tag-container, .companion-details, .upload-container, .content-section {
  margin-bottom: 30px;
}

.tag-options {
  display: flex;
  gap: 20px;
}

.tag-option {
  font-size: 1rem;
  display: flex;
  align-items: center;
}

.companion-toggle {
  display: flex;
  align-items: center;
  cursor: pointer;
  border: 1px solid #ddd;
  border-radius: 20px;
  padding: 5px 15px;
  background-color: #f0f0f0;
  width: fit-content;
  margin-top: 10px;
}

.companion-indicator {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background-color: #ccc;
  margin-right: 10px;
  transition: background-color 0.3s ease;
}

.companion-indicator.active {
  background-color: #e01320;
}

.upload-label {
  display: inline-block;
  background-color: #ef1111;
  color: white;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1rem;
}

.upload-container input[type="file"] {
  display: none;
}

.preview-container {
  margin-top: 15px;
}

.preview-title {
  font-size: 1rem;
  font-weight: 600;
}

.preview-item {
  margin-bottom: 15px;
}

.preview-image, .preview-video {
  width: 100%;
  max-width: 300px;
  border-radius: 8px;
}

.post-textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  min-height: 100px;
  font-size: 1rem;
  resize: none;
}

.submit-button {
  display: block;
  width: 100%;
  background-color: hsl(0, 87%, 53%);
  color: white;
  padding: 12px;
  border: none;
  border-radius: 5px;
  font-size: 1.2rem;
  cursor: pointer;
  margin-top: 20px;
  transition: background-color 0.3s ease;
}

.submit-button:hover {
  background-color: #830e0e;
}

.submit-button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.submit-button:focus {
  outline: none;
  box-shadow: 0 0 5px rgba(149, 5, 5, 0.6);
}
.preview-item {
  position: relative;
  margin-bottom: 15px;
}

.delete-button {
  position: absolute;
  top: 5px;
  right: 5px;
  background-color: red;
  color: white;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  font-size: 14px;
  line-height: 24px;
  text-align: center;
  cursor: pointer;
}

.delete-button:hover {
  background-color: darkred;
}
</style>