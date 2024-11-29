import { defineStore } from "pinia";
import {ref} from "vue"
// import { storage } from "@/utils/storage";
import type { User } from "@/type/user";

export const useUserStore = defineStore('user',()=>{

    const userInfo = ref<User | null>(null);

    // 获取用户信息
    const getUserInfo = (): User | null => {
        return userInfo.value;
    };

    // 设置用户信息
    const setUserInfo = (data: User) => {
        userInfo.value = data;  // 将登录后的用户信息存储到 Pinia 中
    };

    // 检查用户是否已登录
    const isLogin = (): boolean => {
        return userInfo.value !== null;
    };

    // 登出
    const loginOut = () => {
        userInfo.value = null;  // 清空 Pinia 中的用户信息
    };

    return { getUserInfo, setUserInfo, loginOut, isLogin };

});