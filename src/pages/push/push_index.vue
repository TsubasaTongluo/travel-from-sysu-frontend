<template>
  <div class="upload-container">
    <!-- 顶部红色按钮 -->
    <div class="upload-options">
      <button :class="{ active: isImageUpload }" @click="toggleUploadType(true)">
        上传图片
      </button>
      <button :class="{ active: !isImageUpload }" @click="toggleUploadType(false)">
        上传视频
      </button>
    </div>

    <!-- 中间拖拽区域 -->
    <div
      class="upload-area"
      @dragover.prevent
      @drop.prevent="handleDrop"
    >
      <p v-if="!file">
        {{ isImageUpload ? "拖拽上传图片或点击选择图片" : "拖拽上传视频或点击选择视频" }}
      </p>
      <input
        type="file"
        :accept="isImageUpload ? 'image/*' : 'video/*'"
        class="hidden-input"
        ref="fileInput"
        @change="handleFileSelect"
      />
      <button class="upload-button" @click="openFileDialog">选择文件</button>

      <!-- 文件预览 -->
      <div v-if="file" class="preview-item">
        <img v-if="isImageUpload && file.url" :src="file.url" alt="预览" />
        <video v-if="!isImageUpload && file.url" :src="file.url" controls></video>
      </div>
    </div>

    <!-- 灰色蒙版加载 -->
    <div v-if="isUploading" class="loading-overlay">
      <div class="spinner"></div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";

const router = useRouter();

const isImageUpload = ref(true); // 默认是图片上传
const file = ref<{ file: File; url: string } | null>(null); // 上传的单个文件
const isUploading = ref(false); // 是否正在上传

// 切换上传类型
const toggleUploadType = (isImage: boolean) => {
  isImageUpload.value = isImage;
  file.value = null; // 清空之前的文件
};

// 打开文件选择框
const openFileDialog = () => {
  const fileInput = document.querySelector(".hidden-input") as HTMLInputElement;
  if (fileInput) fileInput.click();
};

// 处理文件选择
const handleFileSelect = (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (!input.files || input.files.length === 0) return;

  addFile(input.files[0]);
};

// 处理拖拽上传
const handleDrop = (event: DragEvent) => {
  const droppedFiles = event.dataTransfer?.files;
  if (!droppedFiles || droppedFiles.length === 0) return;

  addFile(droppedFiles[0]);
};

// 添加文件到预览
const addFile = (selectedFile: File) => {
  const fileType = selectedFile.type;
  const isValid =
    (isImageUpload.value && fileType.startsWith("image/")) ||
    (!isImageUpload.value && fileType.startsWith("video/"));

  if (!isValid) {
    alert(`请上传正确的${isImageUpload.value ? "图片" : "视频"}文件`);
    return;
  }

  // 限制只能选择一个文件
  file.value = { file: selectedFile, url: URL.createObjectURL(selectedFile) };

  uploadFile();
};

// 上传文件到服务器
const uploadFile = async () => {
  if (!file.value) return;

  const endpoint = isImageUpload.value ? "/api/note/uploadNotePic" : "/api/note/uploadNoteVideo";

  const formData = new FormData();
  formData.append("file", file.value.file);

  isUploading.value = true; // 显示加载蒙版

  try {
    const response = await axios.post(endpoint, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    if (response.status === 200 && response.data.status === "成功") {
      alert("上传成功！");
      // 跳转到 pushNext 界面
      router.push({
        name: "publishNext",
        query: { 
          fileUrl: response.data.url,
          type: isImageUpload.value ? "image" : "video",
         },
      });
    } else {
      throw new Error(response.data.error || "上传失败");
    }
  } catch (error) {
    console.error("文件上传失败：", error);
    alert("上传失败，请重试！");
    // 刷新页面
    window.location.reload();
  } finally {
    isUploading.value = false; // 隐藏加载蒙版
  }
};
</script>

<style scoped>
.upload-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 20px;
  margin-top: 100px; /* 整体下移 */
}

.upload-options {
  display: flex;
  gap: 10px;
}

.upload-options button {
  padding: 12px 30px;
  /* margin-right:0px; */
  border: none;
  border-radius: 9px;
  background-color:rgba(0, 86, 31, 0.7);
  color: white;
  font-size: 14px;
  cursor: pointer;
}

.upload-options button.active {
  background-color: #00561f;
}

.upload-area {
  width: 80%;
  height: 300px;
  border: 2px dashed #ddd;
  border-radius: 9px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #f9f9f9;
  text-align: center;
  color: #666;
  position: relative;
}

.upload-button {
  margin-top: 1px;
  padding: 10px 20px;
  border-radius: 9px;
  background-color:  #00561f;
  color: white;
  border: none;
  cursor: pointer;
}

.hidden-input {
  display: none;
}

.preview-item {
  margin-top: 20px;
  width: 200px;
  height: 200px;
  overflow: hidden;
  border: 1px solid #ddd;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview-item img,
.preview-item video {
  max-width: 100%;
  max-height: 100%;
}

/* 灰色蒙版加载 */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 5px solid #f3f3f3;
  border-top: 5px solid #00561f;
  border-radius: 50%;
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
</style>