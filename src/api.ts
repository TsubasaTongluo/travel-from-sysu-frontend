import axios from 'axios';

// 发布笔记的 API 请求
export const publishNote = (formData: FormData): Promise<any> => {
  return axios.post('/api/note/publishNote', formData);  // 注意，这里是相对路径
};