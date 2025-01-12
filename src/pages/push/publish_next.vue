<template>
  <div class="publish-next-container">
    <!-- 左上角返回首页按钮 -->
    <button class="back-home" @click="goHome">
      ← 返回首页
    </button>
      <!-- 文件预览区域 -->
      <div class="preview-area">
        <div
          v-for="(file, index) in files"
          :key="index"
          class="preview-item"
          :class="{ 'video-preview': isVideoType }"
        >
            <!-- 图片预览 -->
            <img
              v-if="file.url && !isVideoType"
              :src="file.url"
              alt="图片预览"
            />
            <!-- 视频预览 -->
            <video
              v-if="file.url && isVideoType"
              :src="file.url"
              controls
              alt="视频预览"
            ></video>
            <button class="delete-button" @click="deleteFile(index)">X</button>
            <!-- 封面预览 -->
            <!-- <img
              v-if="isVideoType && file.coverUrl"
              :src="file.coverUrl"
              alt="封面预览"
              class="cover-preview"
            />           -->
        </div>
        <!-- Add 按钮 -->
        <button
          v-if="!isVideoType || (isVideoType && files.length < 1)"
          class="add-button"
          @click="openFileDialog"
          :disabled="isUploading || isPublishing"
        >
          Add
        </button>
        <input
          type="file"
          :accept="isVideoType ? 'video/*' : 'image/*'"
          class="hidden-input"
          ref="fileInput"
          @change="handleFileSelect"
          :multiple="!isVideoType"
        />
        <!-- 上传限制提示 -->
        <p v-if="fileLimitReached" class="limit-message">
          {{ isVideoType ? "只能上传一个视频。" : "最多只能上传18张图片。" }}
        </p>
      </div>
      <div v-if="!isVideoType" class="upload-info-text">
        （最多支持上传18张图片）
      </div>
      <div v-if="isVideoType" class="upload-info-text">
        （最多支持上传1个视频）
      </div>

    <!-- 类别选择 -->
    <div class="category-selection">
      <button class="tag-button" @click="toggleDropdown">
        {{ selectedCategory || "选择类别⬇️" }}
      </button>
      <ul v-if="isDropdownOpen" class="dropdown-menu">
        <li v-for="option in tagOptions" :key="option" @click="selectCategory(option)">
          {{ option }}
        </li>
      </ul>
    </div>
    <!-- 选择类别后显示的内容 -->
    <div v-if="selectedCategory" class="content-section">
      <!-- 标题输入框 -->
      <div class="title-input-container">
        <label class="input-label">取个标题吧：</label>
        <div class="title-wrapper">
            <span class="category-prefix">
            <span v-if="isFindingPartner">
              【找{{ selectedCategory }}搭子】
            </span>
            <span v-else>
              【{{ selectedCategory }}】
            </span>
        </span>
          <input
            type="text"
            v-model="title"
            placeholder="输入标题"
            maxlength="20"
            @input="checkTitleLength"
            class="title-input"
          />
        </div>
        <span class="char-count">{{ title.length }}/20</span>
      </div>
      <p v-if="isTitleExceeded" class="error-message">标题不能超过20字！</p>

      <!-- 信息输入框 -->
      <div class="info-input-container">
        <label class="input-label">说说这次{{ selectedCategory }}吧：</label>
        <textarea
          v-model="info"
          placeholder="怎么去的？为什么会去？去哪了？吃什么了？我也要吃炫一口两口三口"
          maxlength="250"
          @input="checkInfoLength"
          class="info-input"
        ></textarea>
        <span class="char-count">{{ info.length }}/250</span>
      </div>
      <p v-if="isInfoExceeded" class="error-message">帖子内容不能超过250字！</p>

      <!-- 标签选择 -->
      <div class="tag-container">
        <!-- 自定义标签功能 -->
        <div class="custom-tag-container">
          <button class="add-tag-button" @click="toggleCustomDropdown">
            {{ isCustomDropdownOpen ? "收起自定义标签" : "+ 标签" }}
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

      <!-- 是否找搭子功能 -->
      <div class="find-partner-container">
        <button 
          class="find-partner-button" 
          :class="{ active: isFindingPartner }" 
          @click="toggleFindPartner"
        >
          {{ isFindingPartner ? "找搭子模式" : "找搭子" }}
        </button>
        <div v-if="isFindingPartner" class="partner-description">
          <textarea
            v-model="partnerDescription"
            placeholder="请输入您对此次出行的搭子需求（250字以内）"
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
        <button class="publish-note-button" @click="publishNote" :disabled="isPublishing || isUploading">
          发布笔记
        </button>
      </div>
    </div>

    <!-- 灰色蒙版显示上传状态 -->
    <div v-if="isUploading || isPublishing" class="loading-overlay">
      <div class="spinner"></div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useUserStore } from '@/store/user';
import { ref, onMounted,computed } from "vue";
import { useRoute , onBeforeRouteLeave } from "vue-router";
import { useRouter } from "vue-router";
import axios from "axios";

const route = useRoute();
const router = useRouter(); 

// 用户ID
const userstore = useUserStore();
const user = userstore.getUserInfo();
const userId = user?.uid;  

// 页面标题状态
const title = ref<string>(""); // 标题文本
const isTitleExceeded = ref(false); // 是否超出字数

// 信息输入框状态
const info = ref<string>(""); // 信息内容
const isInfoExceeded = ref(false); // 是否超出字数

// 标签选择状态
const isDropdownOpen = ref(false); // 三选一标签下拉栏是否打开
const tagOptions = ["旅游", "活动外出", "返乡记录"]; // 标签选项
const selectedCategory = ref<string | null>(null); // 已选择的类别
// const selectedTag = ref<string | null>(null); // 已选择的三选一标签

// 自定义标签功能状态
const isCustomDropdownOpen = ref(false); // 自定义标签下拉栏是否打开
const customTag = ref<string>(""); // 输入的自定义标签内容
// const customTagOptions = ["城市", "乡村", "草原", "雪地"]; // 自定义标签选项
const customTags = ref<string[]>([]); // 已选自定义标签列表

// 推荐标签
const recommendedTags = ref<string[]>([]); // 推荐标签列表

// 是否处于找旅伴模式
const isFindingPartner = ref(false); 
const partnerDescription = ref<string>(""); // 旅伴描述
const isPartnerDescriptionExceeded = ref(false); // 描述是否超出字数

const files = ref<{ file: File | null; url: string; coverUrl?: string }[]>([]);
const note_urls = ref<string[]>([]); // 上传成功后的图片 URL 列表
const isUploading = ref(false); // 上传状态
const isPublishing = ref(false); // 发布状态

// 视频类型检查
const isVideoType = ref(true); // 是否为视频笔记类型

// 推荐标签内容根据选择的类别动态更新
const updateRecommendedTags = (category: string) => {
  if (category === "旅游") {
    recommendedTags.value = ["市内", "省内", "国内", "国外"];
  } else if (category === "返乡记录") {
    recommendedTags.value = ["回深圳", "回新疆", "火车","飞机"];
  } else if (category === "活动外出") {
    recommendedTags.value = ["留学/交换", "学术会议", "社团活动", "学院活动"];
  } else {
    recommendedTags.value = []; // 如果没有选择或选择其他类别，则清空推荐标签
  }
};

// 文件上传限制提示
const fileLimitReached = computed(() => {
  if (isVideoType.value) {
    return files.value.length >= 2;
  } else {
    return files.value.length >= 18;
  }
});

// 初始化时从路由参数加载文件
onMounted(() => {
  const fileUrl = route.query.fileUrl as string;
  const coverUrl = route.query.coverUrl as string; // 获取封面 URL
  const type = route.query.type as string;

  if (fileUrl && type === "image") {
    isVideoType.value = false; // 明确设置为 false
    files.value = [
      {
        file: null,
        url: fileUrl,
      },
    ];
    note_urls.value.push(fileUrl); // 初始化 note_urls 列表
  } else if (fileUrl && type === "video") {
    isVideoType.value = true; // 明确设置为 true
    files.value = [{ file: null, url: fileUrl, coverUrl: coverUrl }];
    note_urls.value.push(fileUrl); // 初始化 note_urls 列表
    note_urls.value.push(coverUrl); // 添加封面 URL
  }
  console.log("isVideoType on init:", isVideoType.value);
});

// 在路由离开时删除已上传的文件
onBeforeRouteLeave(async (to, from) => {
  if (files.value.length === 0) {
    console.log("没有文件需要删除，允许路由跳转");
    return;
  }

  // 提示用户
  const confirmLeave = confirm("确定要离开此页面并删除已上传的文件吗？");
  if (!confirmLeave) {
    // 阻止路由跳转
    return false;
  }

  // 复制当前的 note_urls
  const tempUrls = [...note_urls.value];

  // 创建删除请求的 Promise 数组
  const deletePromises = tempUrls.map((url) => {
    return axios.get("/api/note/deleteUploadedFile", {
      params: { file_url: url },
    }).then(response => {
      if (response.status === 200 && response.data.status === "成功") {
        console.log(`文件删除成功: ${url}`);
      } else {
        console.error(`文件删除失败: ${url}, 错误: ${response.data.error || "未知错误"}`);
      }
    }).catch(error => {
      console.error(`删除文件请求失败: ${url}`, error);
    });
  });

  // 等待所有删除请求完成
  await Promise.all(deletePromises);

  // 清空前端的文件列表
  files.value = [];
  note_urls.value = [];

  console.log("所有文件删除完成，允许路由跳转");
});

// 返回首页
const goHome = async () => {
  router.push("/dashboard"); // 根据实际首页路由修改
};

// 打开文件选择框
const openFileDialog = () => {
  const fileInput = document.querySelector(".hidden-input") as HTMLInputElement;
  if (fileInput) fileInput.click();
};

// 处理文件选择
const handleFileSelect = async (event: Event): Promise<void> => {
  const input = event.target as HTMLInputElement;
  if (!input.files || input.files.length === 0) return;

  const file: File = input.files[0];
  await uploadFile(file);
};

// 生成视频封面
const generateVideoCover = (videoFile: File): Promise<File> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    const canvas = document.createElement("canvas");
    const url = URL.createObjectURL(videoFile);

    video.src = url;
    video.crossOrigin = "anonymous";
    video.load();

    video.addEventListener("loadeddata", () => {
      video.currentTime = 0;
    });

    video.addEventListener("seeked", () => {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => {
          if (blob) {
            const coverFile = new File([blob], "cover.png", { type: "image/png" });
            resolve(coverFile);
          } else {
            reject(new Error("无法生成封面图片"));
          }
        }, "image/png");
      } else {
        reject(new Error("无法获取Canvas上下文"));
      }
    });

    video.addEventListener("error", () => {
      reject(new Error("视频加载失败"));
    });
  });
};

// 上传封面图片
const uploadCover = async (coverFile: File): Promise<string> => {
  const formData = new FormData();
  formData.append("file", coverFile);

  // eslint-disable-next-line no-useless-catch
  try {
    const response = await axios.post("/api/note/uploadNotePic", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    if (response.status === 200 && response.data.status === "成功") {
      return response.data.url; // 返回封面图片的 URL
    } else {
      throw new Error(response.data.error || "封面上传失败");
    }
  } catch (error) {
    throw error;
  }
};


// 上传文件到 OSS
const uploadFile = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  isUploading.value = true; // 显示上传状态

  try {
    // 根据文件类型选择接口
    const apiEndpoint = isVideoType.value
      ? "/api/note/uploadNoteVideo"
      : "/api/note/uploadNotePic";

    const response = await axios.post(apiEndpoint, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    if (response.status === 200 && response.data.status === "成功") {
      const uploadedUrl = response.data.url;

      // 如果是视频类型，确保只保留一个文件
      if (isVideoType.value) {
        // 生成封面并上传
        const coverFile = await generateVideoCover(file);
        const coverUrl = await uploadCover(coverFile);
        // 只允许上传一个视频和封面
        files.value = [{ file: null, url: uploadedUrl, coverUrl: coverUrl }];
        note_urls.value = [uploadedUrl, coverUrl];
      } else {
        files.value.push({ file: null, url: uploadedUrl });
        note_urls.value.push(uploadedUrl);
      }
    } else {
      throw new Error(response.data.error || "上传失败");
    }
  } catch (error) {
    console.error("文件上传失败：", error);
    alert("上传失败，请重试！");
  } finally {
    isUploading.value = false; // 隐藏上传状态
  }
};

// 删除文件
const deleteFile = async (index: number) => {
  const deletedFile = files.value[index]; // 获取要删除的文件
  const fileUrl = note_urls.value[index]; // 获取对应的 URL

  try {
    // 调用后端删除接口
        // 调用后端删除接口（使用 GET 请求并传递 URL 参数）
        const response = await axios.get('/api/note/deleteUploadedFile', {
      params: {
        file_url: fileUrl,
      },
    });

    if (response.status === 200 && response.data.status === "成功") {
      // 从前端列表中删除文件
      files.value.splice(index, 1);
      note_urls.value.splice(index, 1);
      console.log("文件删除成功：", deletedFile);
    } else {
      console.error("文件删除失败：", response.data.error || "未知错误");
      alert("文件删除失败，请稍后再试！");
    }
  } catch (error) {
    console.error("删除文件请求失败：", error);
    alert("删除文件时发生错误，请稍后再试！");
  }
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


// 选择类别
const selectCategory = (option: string) => {
  selectedCategory.value = option;
  isDropdownOpen.value = false;
  updateRecommendedTags(option);
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

// 发布笔记
const publishNote = async () => {
  console.log("note_urls:"+note_urls.value);
  // 校验必填项
  if (
    !selectedCategory.value ||
    title.value.length === 0 ||
    info.value.length === 0 ||
    note_urls.value.length === 0
  ) {
    alert("帖子标题、帖子内容都是必填项！");
    return;
  }else{
    if(isFindingPartner.value&&partnerDescription.value.length===0){
      alert("找搭子模式下搭子需求描述不可为空！");
      return;
    }
  }

  // 显示发布状态
  isPublishing.value = true;


  if(isFindingPartner.value){
    title.value = `【找${selectedCategory.value}搭子】 ` + title.value;
    info.value = info.value+ `\n---搭子描述：\n` + partnerDescription.value;  
  }else{
    title.value = `【${selectedCategory.value}】 ` + title.value;
  }


  // 创建 FormData 实例
  const formData = new FormData();
  formData.append('note_title', title.value);
  formData.append('note_content', info.value);
  formData.append('note_tag_list', [...customTags.value].join(','));
  if(selectedCategory.value  == "旅游"){
    formData.append('note_type', "旅行");
  }else if(selectedCategory.value  == "活动外出"){
    formData.append('note_type', "外出");
  }else if(selectedCategory.value  == "返乡记录"){
    formData.append('note_type', "返乡");
  }
  formData.append('note_creator_id', userId);
  formData.append('note_urls',JSON.stringify(note_urls.value));
  if(isFindingPartner.value){
    formData.append('is_finding_buddy', '1');
    formData.append('buddy_description', partnerDescription.value);    
  }

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
      files.value.length = 0;
      // 跳转到个人主页
      router.push('/userInfo');
    } else {
      alert('发布失败，请重试！');
    }
  } catch (error) {
    console.error('发布失败', error);
    alert('发布失败，请重试！');
  }finally {
    isPublishing.value = false; // 隐藏发布状态
  }
};
</script>

<style scoped>

  .content-section {
    width: 100%;
    text-align: left; /* 确保所有文本都左对齐 */
    margin-left: 100px;
  }
  .input-label{
    position: relative;
    font-size: 15px;
    color: #005620ad;
    font-weight: bold;
    background: none;
    border: none;
    margin-bottom: 80px;
  }
  .upload-info-text{
    font-size: 15px;
    color: #005620ad;
    font-weight: thin;
    background: none;
    border: none;
    padding: 0;
  }
  .publish-next-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 20px;
    gap: 20px;
    position: relative;
  }


  /* 左上角返回首页按钮 */
  .back-home {
    position: absolute;
    top: 16px;
    left: 16px;
    cursor: pointer;
    font-size: 16px;
    color: #00561f;
    font-weight: bold;
    background: none;
    border: none;
    padding: 0;
  }

  .back-home:hover {
    color: #003f12;
  }

  .cover-preview {
  width: 100%;
  height: 100px;
  object-fit: cover;
  margin-top: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
}
  
  .preview-area,
  .title-input-container,
  .tag-container {
    width: 80%;
  }

  .info-input-container {
    position: relative;
    max-width: 100%;
  }

  .info-input {
    width: 100%;
    min-height: 80px; /* 设置一个最小高度 */
    height: auto; /* 允许高度自动调整 */
    padding: 10px;
    font-size: 14px;
    line-height: 1.5;
    border: 1px solid #ccc;
    border-radius: 8px;
    resize: none; /* 禁止用户手动调整大小 */
    overflow: hidden; /* 防止内容溢出 */
    box-sizing: border-box;
  }
  
  .preview-area {
    margin-top: 30px;
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
  object-fit: cover; /* 适配图片 */
  }

  .video-preview {
    width: 250px; /* 视频预览更宽一些 */
    height: 140px; /* 按比例调整 */
  }

  .video-preview video {
    width: 100%;
    height: 100%;
    object-fit: contain; /* 确保视频适配区域 */
  } 
  
  .delete-button {
    position: absolute;
    top: 5px;
    right: 5px;
    padding: 5px;
    background-color: #474141;
    color: white;
    border: none;
    border-radius: 20%;
    cursor: pointer;
    font-size: 12px;
  }
  
  .add-button {
    padding: 10px 20px;
    background-color:rgba(0, 86, 31, 0.9);
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-size: 14px;
  }
  .add-button:hover {
    padding: 10px 20px;
    background-color:rgba(0, 86, 31, 1);
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-size: 14px;
  }
  
  .hidden-input {
    display: none;
  }

.title-input-container,
.info-input-container,
.tag-container,
.find-partner-container,
.publish-note-container {
  width: 100%;
  margin-bottom: 20px; /* 各部分之间的间距 */
}

.title-wrapper,
.info-input-container textarea,
.partner-description textarea {
  width: 100%;
}

.title-wrapper {
  display: flex;
  align-items: center;
  margin-top: 8px;
}
.title-wrapper .category-prefix {
  white-space: nowrap; /* 禁止文本换行 */
  overflow: hidden; /* 如果文本太长，可以隐藏超出的部分 */
  /* text-overflow: ellipsis; 显示省略号 '...' 来表示超出的文本 */
}

.category-prefix {
  margin-top:5px;
  margin-right: 4px;
  font-size: 15px;
  color: #1c1a1aad;
  font-weight: thin;

}

.title-input,
.info-input,
.partner-input,
.custom-tag-input {
  width: 100%;
  padding: 8px;
  margin-top: 4px;
  font-size: 14px;
  border: 1px solid #ccc;
  border-radius: 4px;
}
  
  .char-count {
    text-align: right;
    margin-top: 5px;
    margin-left: 10px;
    font-size: 14px;
    color: #666;
  }
  
  .error-message {
    color:#00561f;
    font-size: 14px;
    margin-top: 5px;
  }
  
  .tag-button {
    width: fit-content; /* 保持按钮宽度自然调整 */
    padding: 10px 17px;
    font-size: 14px;
    background-color: rgba(0, 86, 31, 0.2);
    border: none;
    border-radius: 10px;
    cursor: pointer;
  }

  .dropdown-menu {
    margin-top: 10px;
    list-style: none;
    padding: 0;
    border: 1px solid #ccc;
    border-radius: 10px;
    background-color: #f9f9f9;
    width: fit-content; /* 修改为与按钮宽度一致 */
    max-width: 100%;
    position: relative; /* 使菜单浮动 */
  margin-left: 5px; /* 将菜单右对齐 */
  z-index: 10; /* 确保菜单在其他元素之上 */
  }
  .dropdown-menu li {
    font-size: 14px;
    padding: 10px;
    cursor: pointer;
  }
  
  .dropdown-menu li:hover {
    background-color: #00561f;
    border-radius: 10px;
    color: white;
  }

  .recommendation-label{
    font-size: 15px;
    color: #005620ad;
    font-weight: bold;
    margin-top: 5px;
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
    padding: 8px 10px;
    background-color: rgba(0, 86, 31, 0.2);
    border-radius: 10px;
    font-size: 14px;
  }
  
  .delete-tag {
    margin-left: 5px;
    cursor: pointer;
  }
  
  .add-tag-button {
    background-color: rgba(0, 86, 31, 0.9);
    color:white;
    padding: 8px 10px;
    border: none;
    border-radius: 10px;
    cursor: pointer;
  }
  
  .custom-tag-input-container {
    display: flex;
    gap: 0px;
  }
  
  .confirm-add-tag-button {
    background-color:#00561f;
    color: white;
    border: none;
    padding: 8px 10px;
    border-radius: 10px;
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
    gap: 10px;
    margin-top: 15px;
  }
  
  .recommended-tags .tag-item {
    padding: 8px 10px;
    background-color:rgba(0, 86, 31, 0.2);
    border-radius: 10px;
    font-size: 14px;
    cursor: pointer;
  }
  
  .recommended-tags .tag-item:hover {
    background-color:rgba(0, 86, 31, 0.9);
    color: white;
  }
  .custom-tag-input-container {
    display: flex;
    gap: 8px;
    padding: 5px;
    margin-left: -45px;
  }
  
  .custom-tag-input {
    width: 150px; /* 设置固定宽度 */
    padding: 8px;
    border: 1px solid #ccc;
    border-radius: 5px;
  }
  
  .confirm-add-tag-button {
    background-color: #00561f;
    color: white;
    border: none;
    padding: 7px 10px;
    border-radius: 10px;
    cursor: pointer;
  }
  .find-partner-container {
    display: flex;
    flex-direction: column; /* 改为垂直排列 */
    gap: 10px; /* 按钮和描述之间的间距 */
    margin-top: 20px;
    width: 80%;
  }
  
  .find-partner-button {
    width: 20%; 
    padding: 10px 0; /* 设置上下内边距 */
    font-size: 14px;
    color: white;
    background-color: rgba(128, 128, 128, 0.701);
    border: none;
    border-radius: 10px;
    cursor: pointer;
    margin-bottom: 8px;
  }
  
  .find-partner-button.active {
    background-color:rgba(0, 86, 31, 0.9);
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
    padding: 10px 30px;
    font-size: 16px;
    color: white;
    background-color:rgba(0, 86, 31, 0.9);
    border: none;
    border-radius: 10px;
    cursor: pointer;
    transition: background-color 0.3s; /* 平滑过渡效果 */
    margin-left: -80px;
  }
  
  .publish-note-button:hover {
    background-color:rgba(0, 86, 31, 1);
  }

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