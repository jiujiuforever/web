import {
    req
} from "@/api/req";
// 基础数据
export default {
    /*****************************************客户管理**********************************************/
    // 查询客户列表
    clientManage_getClientList: data =>
        req({
            baseUrl: "cap",
            method: "post",
            url: "mstAgency/queryMstAgencyList",
            params: data
        }),
    clientManage_getClientList1: data =>
        req({
            baseUrl: "cap",
            method: "post",
            url: "mstAgency/queryMstAgencySingleList",
            params: data
        }),
    // 引入客户保存
    clientManage_addNewClient: data =>
        req({
            baseUrl: "cap",
            method: "post",
            url: "mstAgency/saveMstAgency",
            params: data
        }),
    // 停用or启用
    clientManage_updateState: data =>
        req({
            baseUrl: "cap",
            method: "post",
            url: "mstAgency/updateState",
            params: data
        }),
    clientManage_synchronization: data =>
        req({
            baseUrl: "cap",
            method: "get",
            url: "mstAgency/syncAgencyInfo"
        }),
    clientManage_getsaleArea: data =>
        req({
            baseUrl: "cap",
            method: "get",
            isOriginalGET: true,
            url: "mstAgency/queryAgencyAreaFromMstAgency",
            params: data
        }),
    /*****************************************公司管理**********************************************/
    // 查询公司列表
    companyManage_getCompanyList: data =>
        req({
            baseUrl: "cap",
            method: "post",
            url: "mstCompany/queryMstCompanyList",
            params: data
        }),
    // 引入公司保存
    companyManage_addNewCompany: data =>
        req({
            baseUrl: "cap",
            method: "post",
            url: "mstCompany/saveMstCompany",
            params: data
        }),
    // 停用or启用
    companyManage_updateState: data =>
        req({
            baseUrl: "cap",
            method: "post",
            url: "mstCompany/updateState",
            params: data
        }),
    // 获取引入公司数据
    companyManage_getAuthCompany: data =>
        req({
            baseUrl: "cap",
            method: "post",
            url: "mstCompany/queryAuthDeptInfo",
            params: data
        }),
    //  公司管理--同步
    companyManage_synchronization: data =>
        req({
            baseUrl: "cap",
            method: "get",
            url: "mstCompany/syncCompanyInfo"
        }),
};