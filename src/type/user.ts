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
  note_count: number;
  follower_count: number;
  fan_count: number;
  gender:number;
  birthday:string;
}