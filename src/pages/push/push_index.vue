<template>
  <div class="upload-container">
    <!-- 顶部红色按钮 -->
    <div class="upload-options">
      <button
          :class="{ active: isImageUpload }"
          @click="toggleUploadType(true)"
      >
        上传图片
      </button>
      <button
          :class="{ active: !isImageUpload }"
          @click="toggleUploadType(false)"
      >
        上传视频
      </button>
    </div>

    <!-- 中间拖拽区域 -->
    <div
        class="upload-area"
        @dragover.prevent
        @drop.prevent="handleDrop"
    >
      <p v-if="!files.length">
        {{ isImageUpload ? "拖拽上传图片或点击选择图片" : "拖拽上传视频或点击选择视频" }}
      </p>
      <input
          type="file"
          multiple
          :accept="isImageUpload ? 'image/*' : 'video/*'"
          class="hidden-input"
          ref="fileInput"
          @change="handleFileSelect"
      />
      <button class="upload-button" @click="openFileDialog">选择文件</button>

      <!-- 文件预览 -->
      <div v-if="files.length" class="preview-list">
        <div
            v-for="(file, index) in files"
            :key="index"
            class="preview-item"
        >
          <img
              v-if="isImageUpload && file.url"
              :src="file.url"
              alt="预览"
          />
          <video
              v-if="!isImageUpload && file.url"
              :src="file.url"
              controls
          ></video>
        </div>
      </div>
    </div>

    <!-- 右下角按钮 -->
    <div class="next-step">
      <button
          :class="{ disabled: !files.length }"
          :disabled="!files.length"
          @click="goNextStep"
      >
        下一步
      </button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

const isImageUpload = ref(true); // 默认是图片上传
const files = ref<{ file: File; url: string }[]>([]); // 上传的文件数组

// 切换上传类型
const toggleUploadType = (isImage: boolean) => {
  isImageUpload.value = isImage;
  files.value = []; // 清空之前的文件
};

// 打开文件选择框
const openFileDialog = () => {
  const fileInput = document.querySelector(".hidden-input") as HTMLInputElement;
  if (fileInput) fileInput.click();
};

// 处理文件选择
const handleFileSelect = (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (!input.files) return;

  Array.from(input.files).forEach((file) => {
    addFile(file);
  });
};

// 处理拖拽上传
const handleDrop = (event: DragEvent) => {
  const droppedFiles = event.dataTransfer?.files;
  if (!droppedFiles) return;

  Array.from(droppedFiles).forEach((file) => {
    addFile(file);
  });
};

// 添加文件到列表
const addFile = (file: File) => {
  const fileType = file.type;
  const isValid =
      (isImageUpload.value && fileType.startsWith("image/")) ||
      (!isImageUpload.value && fileType.startsWith("video/"));

  if (!isValid) {
    alert(`请上传正确的${isImageUpload.value ? "图片" : "视频"}文件`);
    return;
  }

  // 将文件添加到预览列表
  files.value.push({ file, url: URL.createObjectURL(file) });
};

// 下一步按钮事件
const goNextStep = () => {
  if (!files.value.length) return;

  // 将文件信息传递到下一个页面
  const fileData = files.value.map((file) => ({
    name: file.file.name,
    type: file.file.type,
    url: file.url,
  }));

  // 如果需要将文件作为 `File` 对象传递，可以直接将 `file` 本身传递
  router.push({
    name: "publishNext",
    query: { files: JSON.stringify(fileData) },
  });
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
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  background-color: #f44336;
  color: white;
  font-size: 14px;
  cursor: pointer;
}

.upload-options button.active {
  background-color: #d32f2f;
}

.upload-area {
  width: 80%;
  height: 300px;
  border: 2px dashed #ddd;
  border-radius: 8px;
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
  margin-top: 10px;
  padding: 8px 16px;
  background-color: #f44336;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.hidden-input {
  display: none;
}

.preview-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 20px;
}

.preview-item {
  width: 100px;
  height: 100px;
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

.next-step {
  margin-top: 20px;
}

.next-step button {
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  font-size: 16px;
  cursor: pointer;
}

.next-step button.disabled {
  background-color: #ddd;
  color: #999;
  cursor: not-allowed;
}

.next-step button:not(.disabled) {
  background-color: #f44336;
  color: white;
}
</style>