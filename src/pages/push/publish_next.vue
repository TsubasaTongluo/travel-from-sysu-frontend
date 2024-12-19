<template>
  <div class="publish-next-container">
    <!-- 图片和视频预览区域 -->
    <div class="preview-area">
      <div v-for="(file, index) in files" :key="index" class="preview-item">
        <img v-if="file.type.startsWith('image/')" :src="file.url" alt="预览" />
        <video v-else :src="file.url" controls></video>
        <button class="delete-button" @click="deleteFile(index)">X</button>
      </div>
      <button class="add-button" @click="openFileDialog">Add</button>
      <input
        type="file"
        multiple
        accept="image/*, video/*"
        class="hidden-input"
        ref="fileInput"
        @change="handleFileSelect"
      />
    </div>

    <!-- 标题输入框 -->
    <div class="title-input-container">
      <input
        type="text"
        v-model="title"
        placeholder="输入标题"
        maxlength="20"
        @input="checkTitleLength"
        class="title-input"
      />
      <span class="char-count">{{ title.length }}/20</span>
    </div>
    <p v-if="isTitleExceeded" class="error-message">标题不能超过20字！</p>

    <!-- 信息输入框 -->
    <div class="info-input-container">
      <textarea
        v-model="info"
        placeholder="填写更加全面的信息，让更多的人看到你吧！"
        maxlength="250"
        @input="checkInfoLength"
        class="info-input"
      ></textarea>
      <span class="char-count">{{ info.length }}/250</span>
    </div>
    <p v-if="isInfoExceeded" class="error-message">信息不能超过250字！</p>

    <!-- 标签选择 -->
    <div class="tag-container">
      <button class="tag-button" @click="toggleDropdown">
        {{ selectedTag || "标签" }}
      </button>
      <ul v-if="isDropdownOpen" class="dropdown-menu">
        <li v-for="option in tagOptions" :key="option" @click="selectTag(option)">
          {{ option }}
        </li>
      </ul>

      <!-- 自定义标签功能 -->
      <div class="custom-tag-container">
        <button class="add-tag-button" @click="toggleCustomDropdown">
          {{ isCustomDropdownOpen ? "收起标签" : "+标签" }}
        </button>
        <ul v-if="isCustomDropdownOpen" class="custom-dropdown-menu">
          <li v-for="option in customTagOptions" :key="option" @click="selectCustomTag(option)">
            {{ option }}
          </li>
          <li class="custom-tag-input-container">
            <input
              type="text"
              v-model="customTag"
              placeholder="输入自定义标签"
              @keyup.enter="addCustomTag"
              class="custom-tag-input"
            />
            <button @click="addCustomTag" class="confirm-add-tag-button">添加</button>
          </li>
        </ul>
      </div>

      <!-- 已选标签 -->
      <div class="selected-tags">
        <span v-for="(tag, index) in customTags" :key="index" class="tag-item">
          {{ tag }}
          <span class="delete-tag" @click="removeTag(index)">×</span>
        </span>
      </div>

      <!-- 推荐标签部分 -->
      <div class="recommended-tags">
        <span class="recommendation-label">推荐标签：</span>
        <span class="tag-item" v-for="(tag, index) in recommendedTags" :key="index" @click="addRecommendedTag(tag)">
          {{ tag }}
        </span>
      </div>
    </div>

    <!-- 是否找旅伴功能 -->
    <div class="find-partner-container">
      <button 
        class="find-partner-button" 
        :class="{ active: isFindingPartner }" 
        @click="toggleFindPartner"
      >
        {{ isFindingPartner ? "找旅伴模式" : "找旅伴" }}
      </button>
      <div v-if="isFindingPartner" class="partner-description">
        <textarea
          v-model="partnerDescription"
          placeholder="请输入旅伴描述（250字以内）"
          maxlength="250"
          @input="checkPartnerDescriptionLength"
          class="partner-input"
        ></textarea>
        <span class="char-count">{{ partnerDescription.length }}/250</span>
        <p v-if="isPartnerDescriptionExceeded" class="error-message">旅伴描述不能超过250字！</p>
      </div>
    </div>

    <!-- 发布笔记按钮 -->
    <div class="publish-note-container">
      <button class="publish-note-button" @click="publishNote">发布笔记</button>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import axios from "axios";

const route = useRoute();
// 接收传递的文件信息
const files = ref<File[]>([]);

const addFile = (file: File) => {
  if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
    alert("只能添加图片或视频文件");
    return;
  }

  // 创建一个新的 File 对象包含 URL，存储在 files 数组中
  const fileWithUrl = { ...file, url: URL.createObjectURL(file) };
  files.value.push(fileWithUrl);
};

// 页面标题状态
const title = ref<string>(""); // 标题文本
const isTitleExceeded = ref(false); // 是否超出字数

// 信息输入框状态
const info = ref<string>(""); // 信息内容
const isInfoExceeded = ref(false); // 是否超出字数

// 标签选择状态
const isDropdownOpen = ref(false); // 三选一标签下拉栏是否打开
const tagOptions = ["旅行", "外出", "返乡"]; // 标签选项
const selectedTag = ref<string | null>(null); // 已选择的三选一标签

// 自定义标签功能状态
const isCustomDropdownOpen = ref(false); // 自定义标签下拉栏是否打开
const customTag = ref<string>(""); // 输入的自定义标签内容
const customTagOptions = ["城市", "乡村", "草原", "雪地"]; // 自定义标签选项
const customTags = ref<string[]>([]); // 已选自定义标签列表

// 推荐标签
const recommendedTags = ref<string[]>(["上海", "北京", "广州", "深圳"]); // 推荐标签列表

// 是否处于找旅伴模式
const isFindingPartner = ref(false); 
const partnerDescription = ref<string>(""); // 旅伴描述
const isPartnerDescriptionExceeded = ref(false); // 描述是否超出字数

// 初始化时从路由参数加载文件
onMounted(() => {
  const fileData = route.query.files ? JSON.parse(route.query.files as string) : [];
  files.value = fileData;
});

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

// 删除文件
const deleteFile = (index: number) => {
  files.value.splice(index, 1);
};

// 检查标题字数
const checkTitleLength = () => {
  isTitleExceeded.value = title.value.length > 20;
};

// 检查信息字数
const checkInfoLength = () => {
  isInfoExceeded.value = info.value.length > 250;
};

// 切换三选一标签下拉栏
const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value;
};

// 选择三选一标签
const selectTag = (option: string) => {
  selectedTag.value = option;
  isDropdownOpen.value = false;
};

// 切换自定义标签下拉栏
const toggleCustomDropdown = () => {
  isCustomDropdownOpen.value = !isCustomDropdownOpen.value;
};

// 从下拉栏选择推荐标签
const selectCustomTag = (option: string) => {
  if (!customTags.value.includes(option)) {
    customTags.value.push(option);
  }
  isCustomDropdownOpen.value = false;
};

// 添加用户输入的自定义标签
const addCustomTag = () => {
  if (customTag.value.trim() && !customTags.value.includes(customTag.value)) {
    customTags.value.push(customTag.value.trim());
    customTag.value = ""; // 清空输入框
  }
};

// 添加推荐标签
const addRecommendedTag = (tag: string) => {
  if (!customTags.value.includes(tag)) {
    customTags.value.push(tag);
  }
};

// 删除已选自定义标签
const removeTag = (index: number) => {
  customTags.value.splice(index, 1);
};

// 切换找旅伴模式
const toggleFindPartner = () => {
  isFindingPartner.value = !isFindingPartner.value;
};

// 检查旅伴描述字数
const checkPartnerDescriptionLength = () => {
  isPartnerDescriptionExceeded.value = partnerDescription.value.length > 250;
};

// 用户ID
const userId = "1";  // 显式声明类型为 string，并赋值为字符串

// 发布笔记
const publishNote = async () => {
  // 校验必填项
  if (title.value.length === 0 || info.value.length === 0 || files.value.length === 0) {
    alert("标题、信息和图片都是必填项！");
    return;
  }

  // 创建 FormData 实例，用于上传文件
  const formData = new FormData();

  // 将文件对象直接添加到 FormData
  files.value.forEach((file) => {
    formData.append('files', file);  // 'files' 是后台接收的字段名
  });

  // 将其他数据字段添加到 FormData
  formData.append('note_title', title.value);
  formData.append('note_content', info.value);
  formData.append('note_tag_list', [...customTags.value].join(','));
  formData.append('note_type', selectedTag.value || '');
  formData.append('note_creator_id', userId);

  // 打印 FormData 的内容
  for (let pair of formData.entries()) {
    console.log(`${pair[0]}: ${pair[1]}`);
  }

  // 提交数据
  try {
    const response = await axios.post('/api/note/publishNoteWithPics', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    if (response.status === 200) {
      alert('发布成功！');
    } else {
      alert('发布失败，请重试！');
    }
  } catch (error) {
    console.error('发布失败', error);
    alert('发布失败，请重试！');
  }
};
</script>
  <style scoped>
  .publish-next-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 20px;
    gap: 20px;
  }
  
  .preview-area,
  .title-input-container,
  .info-input-container,
  .tag-container {
    width: 80%;
  }
  
  .preview-area {
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 8px;
    background-color: #f9f9f9;
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    justify-content: center;
  }
  
  .preview-item {
    position: relative;
    width: 150px;
    height: 150px;
    border: 1px solid #ccc;
    border-radius: 5px;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .preview-item img {
    max-width: 100%;
    max-height: 100%;
  }
  
  .delete-button {
    position: absolute;
    top: 5px;
    right: 5px;
    padding: 5px;
    background-color: #f44336;
    color: white;
    border: none;
    border-radius: 50%;
    cursor: pointer;
    font-size: 12px;
  }
  
  .add-button {
    padding: 10px 20px;
    background-color: #f44336;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-size: 14px;
  }
  
  .hidden-input {
    display: none;
  }
  
  .title-input,
  .info-input {
    width: 100%;
    padding: 10px;
    font-size: 16px;
    border: 1px solid #ccc;
    border-radius: 5px;
  }
  
  .char-count {
    text-align: right;
    margin-top: 5px;
    font-size: 14px;
    color: #666;
  }
  
  .error-message {
    color: #f44336;
    font-size: 14px;
    margin-top: 5px;
  }
  
  .dropdown-menu {
    margin-top: 10px;
    list-style: none;
    padding: 0;
    border: 1px solid #ccc;
    border-radius: 5px;
    background-color: #f9f9f9;
    width: fit-content; /* 修改为与按钮宽度一致 */
    max-width: 100%;
  }
  
  .tag-button {
    width: fit-content; /* 保持按钮宽度自然调整 */
    padding: 5px 10px;
    font-size: 14px;
    background-color: #ffcccc;
    border: none;
    border-radius: 5px;
    cursor: pointer;
  }
  
  .dropdown-menu li {
    padding: 10px;
    cursor: pointer;
  }
  
  .dropdown-menu li:hover {
    background-color: #f44336;
    color: white;
  }
  .tag-container {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  
  .selected-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
  
  .tag-item {
    display: inline-flex;
    align-items: center;
    padding: 5px 10px;
    background-color: #ffcccc;
    border-radius: 5px;
    font-size: 14px;
  }
  
  .delete-tag {
    margin-left: 5px;
    cursor: pointer;
  }
  
  .add-tag-button {
    background-color: #b80a0a;
    padding: 5px 10px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
  }
  
  .custom-tag-input-container {
    display: flex;
    gap: 8px;
  }
  
  .confirm-add-tag-button {
    background-color: #f44336;
    color: white;
    border: none;
    padding: 5px 10px;
    border-radius: 5px;
    cursor: pointer;
  }
  .publish-next-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 20px;
    gap: 20px;
  }
  
  /* 样式与之前类似，新增推荐标签部分 */
  .recommended-tags {
    display: flex;
    gap: 8px;
    margin-top: 15px;
  }
  
  .recommended-tags .tag-item {
    padding: 5px 10px;
    background-color: #ffcccc;
    border-radius: 5px;
    font-size: 14px;
    cursor: pointer;
  }
  
  .recommended-tags .tag-item:hover {
    background-color: #f44336;
    color: white;
  }
  .custom-tag-input-container {
    display: flex;
    gap: 8px;
    padding: 5px;
  }
  
  .custom-tag-input {
  
    width: 150px; /* 设置固定宽度 */
    padding: 5px;
    border: 1px solid #ccc;
    border-radius: 5px;
  }
  
  .confirm-add-tag-button {
    background-color: #f44336;
    color: white;
    border: none;
    padding: 5px 10px;
    border-radius: 5px;
    cursor: pointer;
    .recommendation-label {
    font-size: 14px; /* 调整字体大小 */
    color: black; /* 设置为黑色 */
    margin-right: 8px; /* 给文字与后续内容之间添加间距 */
  }
  }
  .find-partner-container {
    display: flex;
    flex-direction: column; /* 改为垂直排列 */
    gap: 10px; /* 按钮和描述之间的间距 */
    margin-top: 20px;
    width: 80%;
  }
  
  .find-partner-button {
    width: 20%; /* 保证按钮宽度和+标签一致 */
    padding: 10px 0; /* 设置上下内边距 */
    font-size: 14px;
    color: white;
    background-color: grey;
    border: none;
    border-radius: 5px;
    cursor: pointer;
  }
  
  .find-partner-button.active {
    background-color: #f44336; /* 激活状态的颜色 */
  }
  
  .partner-description {
    width: 100%; /* 确保描述框占满宽度 */
  }
  
  .partner-input {
    width: 100%;
    padding: 10px;
    font-size: 14px;
    border: 1px solid #ccc;
    border-radius: 5px;
    resize: none;
  }
  
  .char-count {
    text-align: right;
    margin-top: 5px;
    font-size: 14px;
    color: #666;
  }
  
  .error-message {
    color: #f44336;
    font-size: 14px;
    margin-top: 5px;
  }
  .publish-note-container {
    display: flex;
    justify-content: center; /* 让按钮居中 */
    margin-top: 20px; /* 上边距 */
  }
  
  .publish-note-button {
    padding: 10px 20px;
    font-size: 16px;
    color: white;
    background-color: #f44336; /* 默认红色 */
    border: none;
    border-radius: 5px;
    cursor: pointer;
    transition: background-color 0.3s; /* 平滑过渡效果 */
  }
  
  .publish-note-button:hover {
    background-color: #d32f2f; /* 悬停时变为深红色 */
  }
  
  </style>