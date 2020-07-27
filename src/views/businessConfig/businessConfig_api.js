import {
    req
} from "@/api/req";
// 业务配置api
export default {
    /*****************************************用户管理**********************************************/
    // 查询用户列表数据
    userManage_getUserList: data =>
        req({
            baseUrl: "cap",
            method: "post",
            url: "mstUser/queryMstUserList",
            params: data
        }),
    //  新增或者修改用户数据
    userManage_saveUserData: data =>
        req({
            baseUrl: "cap",
            method: "post",
            url: "mstUser/saveMstUser",
            params: data
        }),
    //   引入用户数据
    userManage_getAuthUser: data =>
        req({
            baseUrl: "auth",
            method: "post",
            url: "authUser/vague",
            params: data
        }),
    //  停用或者启用用户
    userManage_upDateUserState: data =>
        req({
            baseUrl: "cap",
            method: "post",
            url: "mstUser/updateMstUserState",
            params: data
        }),
    //  获取用户授权公司
    userManage_getUserAuthCompany: data =>
        req({
            baseUrl: "cap",
            method: "get",
            url: "mstUser/queryUserCompanyAuthListByUserId",
            params: data,
            timeout: 2000,
            isLogin: false,
            isOriginalGET: true
        }),
    //废弃---新引入用户接口，废弃
    userManage_newGetUserData: data =>
        req({
            baseUrl: "cap",
            method: "post",
            url: "mstUser/queryLeadMstUserList",
            params: data
        }),
    //新引入用户接口
    userManage_importUserList: data =>
        req({
            baseUrl: "cap",
            method: "post",
            url: "mstUser/queryCapUserList",
            params: data
        }),
    // 批量引入用户接口
    userManage_importExcel: data =>
        req({
            baseUrl: "cap",
            method: "post",
            url: "mstUser/importMstUserBatchCheck",
            params: data
        }),
    // 保存批量引入数据
    userManage_saveExcelData: data =>
        req({
            baseUrl: "cap",
            method: "post",
            url: "mstUser/importMstUserBatch",
            params: data
        }),
    /*****************************************积分项管理**********************************************/
    // 查询积分项列表数据
    scoreItem_getScoreList: data =>
        req({
            baseUrl: "cap",
            method: "post",
            url: "tblQuota/queryTblQuotaList",
            params: data
        }),
    // 积分项导入
    scoreItem_importFile: data =>
        req({
            baseUrl: "cap",
            method: "post",
            url: "tblQuota/importTblQuota",
            params: data
        }),
    // OA
    scoreItem_getOAList: data =>
        req({
            baseUrl: "cap",
            method: "post",
            url: "tblOaTemplate/getPagelist",
            params: data
        }),
    //  新增或者修改积分项数据
    scoreItem_saveScoreItem: data =>
        req({
            baseUrl: "cap",
            method: "post",
            url: "tblQuota/saveTblQuota",
            params: data
        }),
    //  停用或者启用积分项
    scoreItem_updateScoreState: data =>
        req({
            baseUrl: "cap",
            method: "post",
            url: "tblQuota/updateState",
            params: data
        }),
    //  新停用或者启用积分项
    scoreItem_newupdateScoreState: data =>
        req({
            baseUrl: "cap",
            method: "post",
            url: "tblQuota/updateTblQuotaState",
            params: data
        }),
    //  获取积分项详情
    scoreItem_getScoreItemById: data =>
        req({
            baseUrl: "cap",
            method: "get",
            url: "tblQuota/queryTblQuotaById",
            params: data,
            timeout: 2000,
            isLogin: false,
            isOriginalGET: true
        }),
    // 分类导入保存
    scoreItem_saveClassify: data =>
        req({
            baseUrl: "cap",
            method: "post",
            url: "tblClassification/importTblClassification",
            params: data
        }),
    /*****************************************客户变更**********************************************/
    clientChange_getPagelist: data =>
        req({
            baseUrl: "cap",
            method: "post",
            url: "customCodeLog/getPagelist",
            params: data
        }),
    clientChange_customCodeChange: data =>
        req({
            baseUrl: "cap",
            method: "post",
            url: "customCodeLog/customCodeChange",
            params: data
        }),
    clientChange_getOldAgencyOpt: data =>
        req({
            baseUrl: 'cap',
            method: 'post',
            url: "target/queryCustomInTarget",
            params: data
        }),
    clientChange_scoreMixed: data =>
        req({
            baseUrl: "cap",
            method: "get",
            url: 'customCodeLog/querySameInCustomCodeChange',
            isOriginalGET: true,
            params: data
        }),
    clientChange_undoCustomCodeChange: data =>
        req({
            baseUrl: "cap",
            method: "get",
            url: "customCodeLog/undoCustomCodeChange",
            isOriginalGET: true,
            params: data
        }),
    /*****************************************home主页的权限**********************************************/
    homeRouter_getSystemAuth: data =>
        req({
            baseUrl: "cap",
            method: "get",
            url: "mstUser/queryUserByUserId",
            isOriginalGET: true,
            params: data
        }),
};