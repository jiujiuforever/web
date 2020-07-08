/*
    srm公用状态
*/
import _utils from "@/public/utils";

const state = {
  userData: _utils.getSession("userData") || { token: "" },
  currentRoute: _utils.getStorage("currentRoute") || "",
  tempUrl: _utils.getStorage("tempUrl") || "",
  tempData: _utils.getStorage("tempData") || ""
};
const getters = {};
const mutations = {
  setUserData(state, data) {
    const { userTypeId } = data.user;
    if (userTypeId == 5 || userTypeId == 4) {
      data.user.userTypeId = 4;
    }
    state.userData = data;
    _utils.saveSession("userData", data);
  },
  changeUserToken(state, data) {
    state.userData.token = data;
    _utils.saveSession("userData", state.userData);
  },
  setCurrentRoute(state, data) {
    state.currentRoute = data;
    _utils.saveStorage("currentRoute", data);
  },
  loginOut(state) {
    _utils.removeSession("userData");
    state.userData = { token: "" };
    _utils.removeStorage("currentRoute");
    state.currentRoute = "";
  },
  setPrintData(state, data) {
    state.tempUrl = data.report;
    _utils.saveStorage("tempUrl", data.report);
    state.tempData = data.data;
    _utils.saveStorage("tempData", data.data);
  }
};

const actions = {};

export default {
//   namespaced: true, 
  state,
  mutations,
  actions,
  getters
};
