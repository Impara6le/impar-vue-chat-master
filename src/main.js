import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import ElementUI from 'element-ui'; // 2.1引入结构
import 'element-ui/lib/theme-chalk/index.css'; // 2.2引入样式
import dayjs from 'dayjs';
Vue.prototype.dayjs = dayjs;

import VueDirectiveImagePreviewer from 'vue-directive-image-previewer';
import 'vue-directive-image-previewer/dist/assets/style.css';
Vue.use(VueDirectiveImagePreviewer);
Vue.use(ElementUI); // 3.安装

Vue.config.productionTip = false;

Vue.directive('title', {
  inserted: function (el, binding) {
    document.title = el.dataset.title
  }
})

new Vue({
  router,
  render: h => h(App)
}).$mount("#app");
