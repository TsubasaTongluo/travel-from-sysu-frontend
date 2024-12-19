import { createRouter, createWebHistory } from "vue-router";
import Login from "@/pages/user/user_login.vue";
import Dashboard from "@/pages/dashboard/dashboard_index.vue";
import PublishNext from "@/pages/push/publish_next.vue"; // 导入新的页面

export const routes = [
  {
    path: "/",
    redirect: "/index",
  },
  {
    name: "login",
    path: "/login",
    component: Login,
  },
  {
    name: "index",
    path: "/index",
    component: () => import("@/pages/user/user_index.vue"),
    redirect: "/dashboard",
    children: [
      {
        path: "/dashboard",
        component: Dashboard,
        name: "dashboard",
      },
      {
        path: "/followTrend",
        component: () => import("@/pages/followTrend/followtrend_index.vue"),
        name: "followTrend",
      },
      {
        path: "/notice",
        component: () => import("@/pages/notice/notice_index.vue"),
        name: "notice",
      },
      {
        path: "/user",
        component: () => import("@/pages/user/user_index.vue"),
        name: "user",
      },
      {
        path: "/push",
        component: () => import("@/pages/push/push_index.vue"),
        name: "push",
      },
      {
        path: "/userInfo",
        component: () => import("@/pages/user/user_info.vue"),
        name: "userInfo",
      },
    ],
  },
  {
    name: "editInfo",
    path: "/editInfo",
    component: () => import("@/pages/user/edit_info.vue"),
  },
  {
    name: "publishNext",  // 新增的 publishNext 路由
    path: "/publish/next",
    component: PublishNext,  // 指向新的页面组件
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;