import Vue from "vue";
import VCharts from "v-charts";
Vue.use(VCharts);

import App from "./App";
import router from "./router";
import store from "./store";

import ElementUI from "element-ui";
import "element-ui/lib/theme-chalk/index.css";
Vue.use(ElementUI);

import 'lesso-common/styles/global.less';
import 'lesso-common/styles/cover.less';
import commonInit from "lesso-common";
Vue.use(commonInit);

import "./styles/style.less";
import api from "@/api";
import constant from "@/public/constant";

Vue.prototype.$http = api;
let tap = new Vue();
Vue.prototype.$tap = tap;
Vue.prototype.$global = constant;
Vue.prototype.resetSetItem = function(key, newVal) {
  if (key === "printType") {
    // 创建一个StorageEvent事件
    var newStorageEvent = document.createEvent("StorageEvent");
    const storage = {
      setItem: function(k, val) {
        sessionStorage.setItem(k, val);

        // 初始化创建的事件
        newStorageEvent.initStorageEvent("setItem", false, false, k, null, val, null, null);

        // 派发对象
        window.dispatchEvent(newStorageEvent);
      }
    };
    return storage.setItem(key, newVal);
  }
};
Date.prototype.Format = function(fmt) {
  var o = {
    "M+": this.getMonth() + 1, //月份
    "d+": this.getDate(), //日
    "H+": this.getHours(), //小时
    "m+": this.getMinutes(), //分
    "s+": this.getSeconds(), //秒
    "q+": Math.floor((this.getMonth() + 3) / 3), //季度
    S: this.getMilliseconds() //毫秒
  };
  if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
  for (var k in o)
    if (new RegExp("(" + k + ")").test(fmt))
      fmt = fmt.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length));
  return fmt;
};
Vue.config.productionTip = false;

import lessoSentry from "lesso-sentry";
if (process.env.NODE_ENV == "production") {
  Vue.use(lessoSentry, {
    dsn: "http://494573c5976844bbb4b6444b8c2a5b3e@sentry.auth.lesso.com/19",
    release: process.env.GIT_SHA, //此处使用git提交时的hash值作为版本号
    environment: constant.appenv //运行环境
  });
}
Vue.component("inputRender", require(`@/components/aggridEditComponents/inputRender.vue`).default);

/* eslint-disable no-new */
new Vue({
  components: { App },
  router,
  store,
  template: "<App/>"
}).$mount("#app");
