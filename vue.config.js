const vuxLoader = require("vux-loader")

module.exports = {
  configureWebpack: config => {
    vuxLoader.merge(config, {
      plugins: ["vux-ui"]
    });
  },
  // devServer: { // 环境配置
  //   host: '0.0.0.0',
  //   public: 'hk.imparable.fun:888', // 此处是自己电脑IP地址！
  //   port: '888',
  //   https: false,
  //   disableHostCheck: true,
  //   open: false // 配置自动启动浏览器
  // },
  lintOnSave:false
};
