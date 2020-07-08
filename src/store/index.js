import Vue from "vue";
import Vuex from "vuex";

// import modules from './modules'
import app from "./modules/app";
import globalData from "./modules/globalData";

Vue.use(Vuex);

export default new Vuex.Store({
  modules: {
    app,
    globalData
  }
});
