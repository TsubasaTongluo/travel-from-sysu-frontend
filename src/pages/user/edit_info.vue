<template>
  <div class="edit-profile-container"  :style="{ '--buttonColor': buttonColor,'--wordColor': wordColor,'--background': mainBackgroundColor}">
      <div class="edit-profile-box">
          <div class="edit-profile-text">
              <button class="edit-profile-button" :class="{ active: isEditingInfo }" @click="editInfo" :disabled="isNavigating">编辑您的个人资料</button>
              <button class="edit-pwd-button" :class="{ active: !isEditingInfo }" @click="editPwd" :disabled="isNavigating">修改你的账号密码</button>
              <div class="icon-btn-wrapper back-guest" @click="backHome" :disabled="isNavigating">
                    <el-icon class="icon" :size="24">
                        <Back />
                    </el-icon>
                    <span>返回个人主页</span>
              </div>
          </div>
          <el-form class="form" :model="formData" >
              <!-- 修改个人信息表单 -->
              <div v-if="isEditingInfo" class="edit-profile-columns">
                  <!-- 第一列 -->
                  <div class="column">
                      <div class="edit-profile-input">
                          <label>用户名：</label>
                          <el-form-item prop="name">
                              <el-input type="text" v-model="formData.name"></el-input>
                          </el-form-item>
                      </div>
                      <div class="edit-profile-input">
                          <label>手机号：</label>
                          <el-form-item prop="phone">
                              <el-input type="text" v-model="formData.phone"></el-input>
                          </el-form-item>
                      </div>
                      <div class="edit-profile-input">
                          <label>邮箱：</label>
                          <el-form-item prop="email">
                              <el-input type="text" v-model="formData.email"></el-input>
                          </el-form-item>
                      </div>
                      <div class="edit-profile-input">
                          <label>描述：</label>
                          <el-form-item prop="description">
                              <el-input type="textarea" v-model="formData.description" :rows="4" autosize></el-input>
                          </el-form-item>
                      </div>
                  </div>

                  <!-- 第二列 -->
                  <div class="column">
                      <!-- 头像 -->
                      <div class="edit-profile-input">
                        <label>头像修改：</label>

                        <el-form-item prop="avatar">
                            <el-upload 
                                class="avatar-uploader" 
                                :show-file-list="false" 
                                :before-upload="beforeAvatarUpload"
                                :on-success="handleAvatarSuccess"
                                :http-request="customRequest"
                                accept="image/*">
                                
                                <img :src="formData.avatar || defaultAvatar" class="avatar" />
                                <el-icon class="avatar-uploader-icon" :size="24">
                                    <Plus />
                                </el-icon>

                            </el-upload>
                        </el-form-item>

                      </div>
                      
                      <!-- 头像 -->
                  </div>
              </div>

              <div class="column2">
              <!-- 修改账号密码表单 -->
              <div v-if="!isEditingInfo" class="edit-profile-columns2">
                  <!-- 第一列 -->
                  <div class="column">
                      <div class="edit-profile-input">
                          <label>*原密码</label>
                          <el-form-item prop="currentPassword">
                              <el-input type="password" v-model="formData.currentPassword" show-password></el-input>
                          </el-form-item>
                      </div>
                      <div class="edit-profile-input">
                          <label>*新密码</label>
                          <el-form-item prop="newPassword">
                              <el-input type="password" v-model="formData.newPassword" show-password></el-input>
                          </el-form-item>
                      </div>
                  </div>
              </div>
              </div>

              <!-- 修改头像 -->
               
              <div class="submit">
              <!-- 提交按钮 -->
              <el-form-item>
                  <button class="edit-profile-submit" @click="isEditingInfo ? updateInfo('formData') : updatePassword('formData')" :disabled="isNavigating">
                      提交修改
                  </button>
              </el-form-item>
              </div>
          </el-form>
      </div>
      <div class="overlay" id="overlay" :style="{ display: isNavigating ? 'block' : 'none' }"></div>
  </div>
</template>

<script lang="ts" setup>

import { ref, reactive, computed, watchEffect } from 'vue';
import { useUserStore } from '@/store/user';
import axios from 'axios';
import { useRouter } from 'vue-router';
import { ElIcon, ElMessage } from 'element-plus';
import 'element-plus/dist/index.css';
import { ElForm, ElFormItem} from 'element-plus';
import { ElUpload } from 'element-plus';
import { Plus,Back } from "@element-plus/icons-vue";
import { ElInput } from 'element-plus';
import defaultAvatar from '@/assets/logo.png';

const userstore = useUserStore();
const router = useRouter();

// 响应式数据
const modeValue = ref(null);
const mainBackgroundColor = ref('#d5eac2');
const wordColor = ref('white');

const buttonColor = ref('#409eff');
const isEditingInfo = ref(true);
const isNavigating = ref(false);


const backgroundColor= ref('#d5eac2');

const formData = reactive({
    uid: '',
    name: '',
    phone: '',
    email: '',
    description: '',
    currentPassword: '',
    newPassword: '',
    avatar: ''
});

// todo: 规则
const rules = reactive({
    name: [
        { required: true, message: '公司名称不能为空', trigger: 'blur' },
        { min: 3, message: '公司名称至少需要3个字符', trigger: 'blur' },
        { pattern: /^[A-Za-z0-9_\u4e00-\u9fa5]{3,}$/, message: '公司名称只允许字母、数字、下划线和中文字符', trigger: 'blur' }
    ],
    phone: [
        { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号', trigger: 'blur' }
    ],
    email: [
        { type: 'email', message: '请输入有效的邮箱地址', trigger: 'blur' }
    ],
    currentPassword: [
        { required: true, message: '请输入原密码', trigger: 'blur' },
        { min: 8, message: '原密码至少8个字符', trigger: 'blur' },
        { pattern: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/, message: '原密码至少包含一个字母和一个数字', trigger: 'blur' }
    ],
    newPassword: [
        { required: true, message: '新密码不能为空', trigger: 'blur' },
        { min: 8, message: '新密码至少8个字符', trigger: 'blur' },
        { pattern: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/, message: '新密码至少包含一个字母和一个数字', trigger: 'blur' }
    ],
    description: [
        { max: 100, message: '描述不能超过100个字符', trigger: 'blur' }
    ]
});


// 初始化表单数据
const fetchUserInfo = () => {
    const user = userstore.getUserInfo();
    console.log(user);
    if (user) {
        Object.assign(formData, {
            uid: user.uid,
            name: user.username,
            phone: user.phone,
            email: user.email,
            description: user.description,
            avatar: user.avatar,
        });
    } else {
        console.error('用户信息未找到，请重新登录。');
    }
    
};

// 生命周期初始化
fetchUserInfo();

const updateInfo = async (formName) => {
    // todo: updateInfo

    isNavigating.value = true;
    try {
        const res = await axios.post('api/auth/changeUserInfo', {
            // uid: formData.uid,
            username: formData.name,
            phone: formData.phone,
            email: formData.email,
            description: formData.description,
            avatar: formData.avatar
        });

        if (res.data.code === 200) {
            // todo: 存储新的用户信息
            // userstore.setUserInfo();
            console.log(res.data.user);

            alert('信息修改成功，2秒后跳转首页');
            setTimeout(() => router.push('/dashboard'), 2000);
        } else {
            alert('修改失败');
        }
    } catch (error) {
        console.error('更新信息出错：', error);
    } finally {
        isNavigating.value = false;
    }
};

const updatePassword = async (formName) => {
    // todo: update password

    // isNavigating.value = true;
    // try {
    //     const apiBaseUrl = process.env.VUE_APP_BACKEND_BASE_URL;
    //     const res = await axios.post(`${apiBaseUrl}/updatePassword`, {
    //         account: formData.account,
    //         old_password: formData.currentPassword,
    //         new_password: formData.newPassword,
    //         repeat_password: formData.newPassword
    //     });

    //     if (res.data.code === 200) {
    //         alert('密码修改成功，2秒后跳转首页');
    //         setTimeout(() => router.push('/dashboard'), 2000);
    //     } else {
    //         alert(res.data.status);
    //     }
    // } catch (error) {
    //     console.error('更新密码出错：', error);
    // } finally {
    //     isNavigating.value = false;
    // }
};

const editInfo = () => (isEditingInfo.value = true);
const editPwd = () => (isEditingInfo.value = false);
const backHome = () => {
    if (isNavigating.value) return;
    isNavigating.value = true;
    router.push('/dashboard');
};


// 处理头像上传成功的回调
const handleAvatarSuccess = (res, file) => {
  console.log('头像上传成功', res);
  if (res.status == 200) {
    // 假设后端返回的是新的头像 URL
    formData.avatar = res.data.avatar;  // 设置新的头像 URL
    // todo: 存储新头像到storage
    userstore.setAvatar(res.data.avatar);
    // store.commit('setUser', { ...store.state.user, avatar: formData.value.avatar });
    ElMessage.success('头像上传成功');
  } else {
    ElMessage.error('头像上传失败');
  }
};

// 在上传头像前进行检查
const beforeAvatarUpload = (file) => {
  const isImage = file.type.startsWith('image/');
  if (!isImage) {
    ElMessage.error('上传文件必须是图片类型');
    return false;  // 阻止上传
  }
  const isWithinSizeLimit = file.size / 1024 / 1024 < 2;  // 限制上传图片大小为2MB
  if (!isWithinSizeLimit) {
    ElMessage.error('上传图片大小不能超过 2MB');
    return false;
  }
  return true;
};


const customRequest = ({ file, onSuccess, onError }) => {
  const uploadData = new FormData();
  uploadData.append('uid', formData.uid);  // 假设 formData 中有用户的账户信息
  uploadData.append('file', file);

  console.log(file);
  // 请求接口上传图片
  axios.post('api/auth/uploadAvatar', uploadData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
    .then((result) => {
      console.log(result);
      if (result.status == 200) {
        onSuccess(result);  // 上传成功，触发 onSuccess 回调
      } else {
        onError(new Error('上传失败'));  // 上传失败，触发 onError 回调
      }
    })
    .catch(onError);  // 请求出错时，触发 onError
};

</script>

<style scoped>
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

/* 容器样式 */
.container {
    max-width: 100%;
    height: auto;
    max-height: 100%;
}

/* 内容样式 */
.content {
    max-width: 100%;
    margin: 0 auto;
}

.overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 9999;
    background-color: #d5eac2;
    /* 确保覆盖在页面上方 */
}

.edit-profile-container {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    color: #527d2b;
}

.edit-profile-box {
    margin-top: 70px;
    width: 1200px;
    height: 700px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: var(--wordColor);
    /* color:rgb(25, 27, 30); */
    /* border: 1px solid rgb(25, 27, 30); */
    border-radius: 10px;
    padding-top: 10px;
}

.edit-profile-text {
    position: relative;
    justify-content: center;
    align-self: center;
    font-size: large;
    text-align: left;
    padding-top: 10px;
    line-height: 35px;
}

.form{
    position: relative;
    display: flex; /* 使用 Flexbox 布局 */
    flex-direction: column; /* 垂直排列 */
    justify-content: center; /* 垂直居中 */
    align-items: center; /* 水平居中 */
}

.submit{
    position: relative;
    justify-content: center;
    align-self: center;
}

.user-id {
    font-size: medium;
    margin-left: 20px;
    color:#8c8c8c;
    /* color:var(--wordColor); */
}

.edit-profile-input {
    display: flex;
    width: 550px;
    margin: 20px 0; /* 为每个输入框添加垂直间距 */
}

.edit-profile-columns {
    display: flex; /* 将两列并排显示 */
    align-self: center;
    justify-content: space-between; /* 在两列之间添加空间 */
    width: 100%; /* 宽度为容器的100% */
    gap:70px;
}

.column2{
    position: relative;
    display: flex; /* 使用 Flexbox 布局 */
    flex-direction: column; /* 垂直排列 */
    justify-content: center; /* 垂直居中 */
    align-items: center; /* 水平居中 */
}

.edit-profile-columns2 {
    position: relative;
    align-self: center;
    flex-direction: column; /* 垂直排列 */
    justify-content: center; /* 垂直居中 */
    left: -7%;
    width: 100%; /* 宽度为容器的100% */
}

.column {
    flex: 1; /* 使每一列占据相等的空间 */
    margin: 0 10px; /* 给列之间添加一些间距 */
}

.edit-profile-input textarea {
    width: 100%; /* 宽度为100% */
    max-width: 100%; /* 最大宽度为100% */
    resize: none; /* 禁止手动调整大小 */
    word-break: break-all; /* 长字自动换行 */
}

.edit-profile-input label {
    margin-top: 10px;
    width: 160px;
    font-size: 15px;
    color: #8c8c8c;
    /* color: var(--wordColor); */
}

.edit-profile-container .el-form-item {
    width: 100%;
    height: 40px;
}

.edit-profile-input .el-input__inner{
    -webkit-text-fill-color: black;
    width: 100%;
    height: 40px;
    background-color: transparent;
    /* outline: none; */
    font-size: 1em;
    color: rgb(15, 14, 14);
    /* color: var(--wordColor) */
}

.edit-profile-input .el-input__inner:focus {
    border-color: #409eff; /* 设置焦点时的边框颜色 */
    outline: none;
}

input:-webkit-autofill {
    background-color: rgba(240, 240, 240, 0.7);
    transition: background-color 500ms ease-in-out;
}

.edit-profile-submit {
    width: 200px; /* 按钮宽度 */
    height: 45px; /* 按钮高度 */
    margin-top: 20px; /* 与其他内容的间距 */
    background: #e0e0e0;
    border: none;
    outline: none;
    border-radius: 40px;
    cursor: pointer;
    font-size: 1em;
    color: black;
    font-weight: 500;
}

.edit-profile-submit:hover {
    background: var(--buttonColor);
}

.back-guest {
    position: relative;
    left: -72%;
    top: -188%;
    margin-top: 10px;
    margin-right: 350px;
    color:  black;
    cursor: pointer;
}

.back-guest:hover {
    color: var(--buttonColor);
}

.edit-profile-button {
    position: relative;
    top:-10%;
    left: 3%;
    background-color: rgba(187, 187, 187, 0.5); /* 设置为半透明 */
    color:  rgba(187, 187, 187, 0.5);
    font-weight: 700; /* 设置字体粗细，500 为中等粗细 */
    border: 1px solid  #ffffff00; 
    border-radius: 10px; /* 设置圆角 */
    cursor: pointer;
    transition: background-color 0.3s, border-color 0.3s; /* 添加边框颜色过渡 */
    margin-top: 10px;
    margin-right: 10px; /* 增加一个右边距 */
    text-align: center; /* 文字居中 */
    width: 200px; /* 设置按钮的宽度 */
    height: 60px; /* 设置按钮的高度 */
}

.edit-pwd-button  {
    position: relative;
    top:-10%;
    left: 5%;
    background-color: rgba(187, 187, 187, 0.5); /* 设置为半透明 */
    color: #8c8c8c;
    /* color:  var(--wordColor); */
    font-weight: 700; /* 设置字体粗细，500 为中等粗细 */
    border: 1px solid  #ffffff00; 
    border-radius: 10px; /* 设置圆角 */
    cursor: pointer;
    transition: background-color 0.3s, border-color 0.3s; /* 添加边框颜色过渡 */
    margin-top: 10px;
    margin-right: 10px; /* 增加一个右边距 */
    text-align: center; /* 文字居中 */
    width: 200px; /* 设置按钮的宽度 */
    height: 60px; /* 设置按钮的高度 */
}

.edit-profile-button:hover, .edit-pwd-button:hover {
    background-color: var(--buttonColor);
    border-color: var(--buttonColor); /* 修改hover状态下的边框颜色 */
}

.edit-profile-button.active,
.edit-pwd-button.active {
    background-color: var(--buttonColor); /* 保持激活状态的颜色 */
    border-color:  var(--buttonColor);
    color:  var(--wordColor); /* 文字颜色 */
}
.avatar-uploader {
    position: relative;
    display: inline-block;
}

.avatar {
  width: 200px; /* 根据需要调整头像大小 */
  height: 200px;
  border-radius: 50%; /* 圆形头像 */
}

.avatar-uploader-icon {
  position: absolute;
  bottom: 0;
  right: 0;
  background-color: rgba(0, 0, 0, 0.5); /* 半透明背景 */
  border-radius: 50%; /* 圆形背景 */
  padding: 5px; /* 内间距调整图标大小 */
  color: white; /* 图标颜色 */
}

.overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 9999;
    background-color: rgba(140, 140, 140, 0.5); /* 半透明背景 */
    pointer-events: all; /* 确保遮罩层捕获所有点击事件 */
}
</style>
