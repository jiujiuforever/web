import apienv from "./env";
import constant from "@/public/constant";
import router from "../router";
import _utils from "@/public/utils";
import { MessageBox } from "element-ui";
import sendMain from "lesso-common/event/ipcRenderer";
import { http } from "@lesso/common-http";
import http2 from "lesso-common/public/http2";

const env = apienv[constant.appenv];

// 退出登录回调
const logoutCallback = info => {
  const goLogin = () => {
    // 清除用户数据
    _utils.removeSession("userData");

    if (constant.isElectron) {
      // 返回 Electorn 窗口
      sendMain("openLoginWin");
    } else {
      // 跳转登录页
      router.push("/login");
    }
  };

  MessageBox.alert(info, {
    showClose: false,
    confirmButtonText: "确定",
    customClass: "alertFailure",
    callback: () => {
      goLogin();
    }
  });
};

const changeJwtCallback = jwt => {
  let userData = _utils.getSession("userData");
  userData.jwt = jwt;
  _utils.saveSession("userData", userData);
};

// 接口无权限回调
const noAuthCallback = info => {
  MessageBox.alert(info, {
    showClose: false,
    confirmButtonText: "确定",
    customClass: "alertFailure"
  });
};

const req = ({ baseUrl, method, url, params, timeout, isLogin, isOriginalGET, responseType,extraConfig }) => {
  let options = {
    url: env[baseUrl] + url,
    method: method,
    params: params,
    timeout: timeout,
    isOriginalGET: isOriginalGET,
    systemId: constant.systemId,
    // userId: _utils.getSession("userData").user.id,
    deviceId: window.fingerprint,
    logoutCallback: logoutCallback,
    changeJwtCallback: changeJwtCallback,
    noAuthCallback: noAuthCallback,
    responseType: responseType,
    extraConfig:extraConfig
  };
  // 非登录接口加鉴权
  let userData = _utils.getSession("userData");
  if (!isLogin && userData.jwt) {
    options.jwt = userData.jwt;
    options.userId = userData.user.id;
  }
  return http(options);
};

//无需鉴权的请请求接口， 方便为第三方调用
const noAuthreq = ({ baseUrl, method, url, params, timeout, isOriginalGET }) => {
  let options = {
    url: env[baseUrl] + url,
    method: method,
    params: params,
    timeout: timeout,
    isOriginalGET: isOriginalGET,
    systemId: constant.systemId,
    logoutCallback: logoutCallback,
    changeJwtCallback: changeJwtCallback
  };
  return http2(options);
};
export { req, noAuthreq };
