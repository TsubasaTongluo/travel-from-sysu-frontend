const { defineConfig } = require("@vue/cli-service");

module.exports = defineConfig({
  transpileDependencies: true,
  // devServer: {
  //   proxy: {
  //     '/api': {
  //       target: 'http://127.0.0.1:4523/m1/5038601-4699037-default', // 后端服务地址
  //       changeOrigin: true,             // 解决跨域问题
  //       pathRewrite: { '^/api': '' },   // 重写路径（可选，根据需要调整）
  //     },
  //   },
  // },
  devServer: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
});