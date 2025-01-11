import { createRouter, createWebHistory } from "vue-router";
import Login from "@/pages/user/user_login.vue";
import Dashboard from "@/pages/dashboard/dashboard_index.vue";
import PublishNext from "@/pages/push/publish_next.vue"; // 导入新的页面
import { useUserStore } from "@/store/user"; // 假设你使用 Pinia 来管理用户状态

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
        meta: { requiresAuth: true }, // 添加 meta 字段，标记需要登录
      },
      {
        path: "/followTrend",
        component: () => import("@/pages/followTrend/followtrend_index.vue"),
        name: "followTrend",
        meta: { requiresAuth: true }, // 需要登录
      },
      {
        path: "/notice",
        component: () => import("@/pages/notice/notice_index.vue"),
        name: "notice",
        meta: { requiresAuth: true }, // 需要登录
      },
      {
        path: "/user",
        component: () => import("@/pages/user/user_index.vue"),
        name: "user",
        meta: { requiresAuth: true }, // 需要登录
      },
      {
        path: "/push",
        component: () => import("@/pages/push/push_index.vue"),
        name: "push",
        meta: { requiresAuth: true }, // 需要登录
      },
      {
        path: "/userInfo",
        component: () => import("@/pages/user/user_info.vue"),
        name: "userInfo",
        meta: { requiresAuth: true }, // 需要登录
      },
    ],
  },
  {
    name: "editInfo",
    path: "/editInfo",
    component: () => import("@/pages/user/edit_info.vue"),
    meta: { requiresAuth: true }, // 需要登录
  },
  {
    name: "publishNext", // 新增的 publishNext 路由
    path: "/publish/next",
    component: PublishNext, // 指向新的页面组件
    meta: { requiresAuth: true }, // 需要登录
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// 全局路由守卫
router.beforeEach((to, from, next) => {
  const userStore = useUserStore();
  const isLoggedIn = userStore.getUserInfo()?.uid; // 假设通过 uid 判断是否登录

  if (to.meta.requiresAuth && !isLoggedIn) {
    // 如果页面需要登录且用户未登录
    next({ name: "login", query: { redirect: to.fullPath } }); // 重定向到登录页
  } else {
    next(); // 否则继续导航
  }
});

export default router;
