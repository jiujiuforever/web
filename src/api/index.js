import { req } from "./req";
import systemManage_api from "@/views/systemManage/systemManage_api.js";
import businessConfig_api from "@/views/businessConfig/businessConfig_api.js";
import baseData_api from "@/views/baseData/baseData_api.js";
import myWork_api from "@/views/myWork/myWork_api.js"
let api = {
    // 重置个人信息
    personalReset: data =>
        req({
            baseUrl: "csr",
            method: "post",
            url: "ralAccountSupplier/personalReset",
            params: data
        }),
    //重置密码接口
    resetPassword: data =>
        req({
            baseUrl: "csr",
            method: "post",
            url: "ralAccountSupplier/resetPassword",
            params: data
        }), //重置密码接口
    login: data =>
        req({
            baseUrl: "auth",
            method: "post",
            url: "account/login",
            params: data,
            isLogin: true
        }), //登录新接口
    retrievePassword: data =>
        req({
            baseUrl: "auth",
            method: "get",
            url: "account/retrieve",
            params: data,
            isLogin: false,
            isOriginalGET: true
        }), //重置密码Idm接口
    modifyPassword: data =>
        req({
            baseUrl: "auth",
            method: "get",
            url: "account/modifypwd",
            params: data,
            isLogin: false,
            isOriginalGET: true
        }), //修改密码Idm接口
    getTimestamp: data =>
        req({
            baseUrl: "auth",
            method: "post",
            url: "account/getTimeStamp",
            params: data
        }), //获取服务器时间戳
    userLogout: data =>
        req({
            baseUrl: "auth",
            method: "post",
            url: "account/exit",
            params: data
        }), //用户退出登录,
    getToken: data =>
        req({
            baseUrl: "auth",
            method: "get",
            url: "account/register",
            params: data,
            isLogin: false,
            isOriginalGET: true
        }), //获取登录token
    validatePassword: data =>
        req({
            baseUrl: "auth",
            method: "post",
            url: "account/authenticate",
            params: data
        }), //验证旧密码
    editPassword: data =>
        req({
            baseUrl: "auth",
            method: "put",
            url: `authUser?userkey=${data.userkey}&tokenkey=${data.tokenkey}`,
            params: data
        }), //修改用户密码
    editPasswordIdm: data =>
        req({
            baseUrl: "csr",
            method: "post",
            url: "ralAccountSupplier/updatePassword",
            params: data
        }), //修改用户密码idm
    saveCustomStyle: data =>
        req({
            baseUrl: "auth",
            method: "post",
            url: "account/saveTableStyle",
            params: data
        }), //保存agGrid自定义样式 2019-05-02
    getCustomClassStyle: data =>
        req({
            baseUrl: "auth",
            method: "post",
            url: "account/getTableStyle",
            params: data
        }), //获取agGrid自定义样式 2019-05-02
    //根据登录账号获取数据菜单
    getMenu: data =>
        req({
            baseUrl: "auth",
            method: "post",
            url: "authResource/getUserAuthResource",
            params: data
        }),
    //获取服务器时间
    getServerTime: data =>
        req({
            baseUrl: "csr",
            method: "get",
            url: "mstCompany/getServerTime",
            params: data
        }),
    getEnumList: data =>
        req({
            baseUrl: "cap",
            method: "post",
            // url: "tblEnums/queryEnumsByGroup",
            url: "tblCommonPublicEnumerate/queryTblCommonPublicEnumerateInfo",
            params: data
        }),
};
api = Object.assign(
    api,
    systemManage_api,
    businessConfig_api,
    baseData_api,
    myWork_api
);
export default api;