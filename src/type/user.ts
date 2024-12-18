export interface UserLogin {
  username: string;
  password: string;
}

export interface User{
  uid:number;
  username: string;
  password: string;
  avatar: string;
  description: string;
  phone: string;
  email: string;
  trendCount: number;
  followerCount: number;
  fanCount: number;
}