import { createApp } from "vue";
import App from "./App.vue";

// 创建Vue应用实例
const app = createApp(App);

// 导入路由配置
import router from "./router/index";

// 使用路由插件
app.use(router);

// 挂载应用至#app根元素
app.mount("#app");

/* 上面的注释删掉也行，问题不大 */
