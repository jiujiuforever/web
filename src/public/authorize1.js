import constant from "@/public/constant";
import env from "@/api/env";
import utils from "@/public/utils";

import {
  getNavAuthItem,
  getMenuAuthItem,
  getBtnAuthItem
} from "lesso-common/public/authorize";

/** todo:填写权限系统配置的编码*/
let systemCode = "cap"; // systemCode

let baseParams = {
  authUrl: env[constant.appenv].auth,
  systemId: constant.systemId,
  systemCode: systemCode
};

let getUserInfo = () => {
  let userInfo = {
    userId: utils.getSession("userData").user.id,
    userName: utils.getSession("userData").user.userName
  };
  return userInfo;
};

// 获取左侧导航栏权限
const getNavAuth = () => {
  let params = Object.assign({}, baseParams, getUserInfo());
  return getNavAuthItem(params);
};

// 获取按钮权限
const getBtnAuth = (pageCode, btnStatus) => {
  let params = Object.assign(
    {},
    baseParams,
    { pageCode, btnStatus },
    getUserInfo()
  );
  return getBtnAuthItem(params);
};
// 获取菜单权限
const getMenuAuth = parentId => {
  let params = Object.assign({}, baseParams, { parentId }, getUserInfo());
  return getMenuAuthItem(params);
};

export default {
  getNavAuth,
  getMenuAuth,
  getBtnAuth
};
