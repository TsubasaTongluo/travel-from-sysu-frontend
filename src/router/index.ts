import { createRouter, createWebHistory } from "vue-router";
import Login from "@/pages/user/user_login.vue";
import Dashboard from "@/pages/dashboard/dashboard_index.vue";

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
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
