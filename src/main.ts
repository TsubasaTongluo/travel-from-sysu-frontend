import { createApp } from "vue";
import App from "./App.vue";
import axios from 'axios';

// 设置后端地址为 3000 端口
// axios.defaults.baseURL = 'http://127.0.0.1:4523/m1/5038601-4699037-default';
// 创建Vue应用实例
const app = createApp(App);

// 引入pinia
import { createPinia } from "pinia";
// 创建pinia
const pinia = createPinia();
// 安装pinia
app.use(pinia);

// 导入路由配置
import router from "./router/index";

// 使用路由插件
app.use(router);

// 挂载应用至#app根元素
app.mount("#app");

/* 上面的注释删掉也行，问题不大 */
