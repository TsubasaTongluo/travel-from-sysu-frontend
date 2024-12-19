import { defineStore } from "pinia";
import {ref, watch} from "vue"
import { storage } from "@/utils/storage";
import type { User } from "@/type/user";


export const useUserStore = defineStore('user',()=>{

    const token = ref("");
    const userInfo = ref<User | null>(storage.get("userInfo") as User);

    const getToken = () => {
        return storage.get("accessToken");
    };


    // 获取用户信息
    const getUserInfo = (): User | null => {
        return userInfo.value;
    };


    // 设置用户信息

    const setUserInfo = (data: User) => {
        userInfo.value = data;
        storage.set("userInfo", data);
    };

    // 设置用户头像
    const setAvatar = (ava:string)=>{
        if(userInfo.value!=null){
            userInfo.value.avatar=ava;
            setUserInfo(userInfo.value);
        }
    };

    // 检查用户是否已登录
    const isLogin = (): boolean => {
        return userInfo.value !== null;
    };

    // 登出
    const loginOut = () => {
        window.localStorage.clear();
        userInfo.value = null;
        token.value = "";
    };

    // 重新设置用户密码
    const setPwd = (pwd:string)=>{
        if(userInfo.value!=null){
            userInfo.value.password=pwd;
            setUserInfo(userInfo.value);
        }
    };
    return { getUserInfo, setUserInfo, loginOut, isLogin, setAvatar, setPwd };

});