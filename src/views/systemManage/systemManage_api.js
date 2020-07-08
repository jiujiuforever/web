// 系统管管理api
import {
    req
} from "@/api/req";
export default {
    // ============================系统枚举项管理===========================

    // 获取具体的某个大类下的 枚举类型
    enumManage_getEnumList: data =>
        req({
            baseUrl: "cap",
            method: "post",
            url: "tblCommonPublicEnumerate/queryTblCommonPublicEnumerateInfo",
            params: data,
            isOriginalGET: 1
        }),
    // 保存某个大分类下的 枚举类型
    enumManage_saveEnum: data =>
        req({
            baseUrl: "cap",
            method: "post",
            url: "tblCommonPublicEnumerate/saveTblCommonPublicEnumerateInfo",
            params: data,
            isOriginalGET: 1
        }),
    // 更新某个大分类下的 枚举类型
    enumManage_updateEnum: data =>
        req({
            baseUrl: "cap",
            method: "post",
            url: "tblCommonPublicEnumerate/updateTblCommonPublicEnumerateInfo",
            params: data,
            isOriginalGET: 1
        }),

    // 获取有多少大类的 枚举
    enumManage_getEnumType: data =>
        req({
            baseUrl: "cap",
            method: "get",
            url: "tblCommonPublicEnumerate/queryTblCommonPublicEnumerateType",
            params: data,
            isOriginalGET: 1
        }),

    // ============================ 日期配置 ===========================
    // 获取限制日期
    dateManage_getDate: data =>
        req({
            baseUrl: "cap",
            method: "post",
            url: "systemPeizhi/querySystemPeizhiList",
            params: data
        }),
    // 修改日期
    dateManage_modifyDate: data =>
        req({
            baseUrl: "cap",
            method: "post",
            url: "systemPeizhi/saveOrUpdateSystemPeizhi",
            params: data
        }),
    // 启用或停用
    dateManage_setState: data =>
        req({
            baseUrl: "cap",
            method: "post",
            url: "systemPeizhi/updateState",
            params: data
        }),
    // ============================ 系统统计 ===========================
    // 公司统计
    systemStatistics_companyStatistics: data =>
        req({
            baseUrl: "cap",
            method: "post",
            url: "target/companyStatistics",
            params: data
        }),
    // 客户统计
    systemStatistics_customStatistics: data =>
        req({
            baseUrl: "cap",
            method: "post",
            url: "target/customStatistics",
            params: data
        }),
    systemStatistics_wxOnlineStatistics: data =>
        req({
            baseUrl: "cap",
            method: "post",
            url: "weiXinLog/wxOnlineStatistics",
            params: data
        }),
    // 统计各部门的积分项
    systemStatistics_quotaStatistics: data =>
        req({
            baseUrl: "cap",
            method: "post",
            url: "target/quotaStatistics",
            params: data
        }),
    // 统计各部门积分录取情况
    systemStatistics_targetStatistics: data =>
        req({
            baseUrl: "cap",
            method: "post",
            url: "target/targetStatistics",
            params: data
        }),
};