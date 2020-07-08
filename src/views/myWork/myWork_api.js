// 系统管管理api
import {
    req
} from "@/api/req";
export default {
    // ================积分项录入 ==================
    ScoreInput_getCompanyList: data =>
        req({
            baseUrl: "cap",
            method: "post",
            url: "mstUser/queryUserCompanyAuthListByUserId",
            params: data
        }),
    ScoreInput_getDeparmentQuatoList: data =>
        req({
            baseUrl: "cap",
            method: "get",
            url: "tblQuota/queryRoleQuotaTypeByUserId",
            isOriginalGET: true,
            params: data
        }),
    ScoreInput_getFileList: data =>
        req({
            baseUrl: "cap",
            method: "post",
            url: "introductionLog/getPagelist",
            params: data
        }),
    ScoreInput_saveImportPerson: data =>
        req({
            baseUrl: "cap",
            method: "post",
            url: "introductionLog/saveIntroductionLog",
            params: data
        }),
    ScoreInput_saveImportData: data =>
        req({
            baseUrl: "cap",
            method: "post",
            url: "target/importExcel",
            params: data,
            timeout: 60000
        }),
    ScoreInput_getScoreRuleList: data =>
        req({
            baseUrl: "cap",
            method: "post",
            url: "tblQuota/queryTblQuotaList",
            params: data
        }),
    // 获取限制日期
    ScoreInput_getDate: data =>
        req({
            baseUrl: "cap",
            method: "post",
            url: "systemPeizhi/querySystemPeizhiList",
            params: data
        }),
    ScoreInput_saveImportDataCheck: data =>
        req({
            baseUrl: "cap",
            method: "post",
            url: "target/importExcelRalCheck",
            params: data
        }),
    ScoreInput_saveImportSpecialDataCheck: data =>
        req({
            baseUrl: "cap",
            method: "post",
            url: "target/importExcelRalCheckSpecial",
            params: data
        }),
    ScoreInput_getDeparmentAuth: data =>
        req({
            baseUrl: "cap",
            method: "get",
            url: "mstUser/queryDeptByUserId",
            isOriginalGET: true,
            params: data
        }),
    // ================查看积分 ==================
    ScoreReport_getImportDataDepart: data =>
        req({
            baseUrl: "cap",
            method: "post",
            url: "tblQuota/getPagelist",
            params: data
        }),
    ScoreReport_downloadTExcel: data =>
        req({
            baseUrl: "cap",
            method: "post",
            url: "introductionLog/fileDownLoad",
            params: data,
            responseType: "arraybuffer",
            headers: {
                'Content-Type': "application/json; application/octet-stream"
            }
        }),
    ScoreReport_importExcelCheck: data =>
        req({
            baseUrl: "cap",
            method: "post",
            url: "target/importExcelCheck",
            params: data,
        }),
    ScoreReport_downloadTemplate: data =>
        req({
            baseUrl: "cap",
            method: "get",
            url: "tblQuota/getImportTemplateByDept",
            params: data,
            isOriginalGET: true,
            responseType: 'blob'
        }),
    ScoreReport_exportExcel: data =>
        req({
            baseUrl: "cap",
            method: "post",
            url: "target/exportQuotaScore",
            params: data,
            responseType: 'blob'
        }),
    ScoreReport_exportExcelRank: data =>
        req({
            baseUrl: "cap",
            method: "post",
            url: "target/exportRank",
            params: data,
            responseType: 'blob'
        }),
    ScoreReport_getScoreData: data =>
        req({
            baseUrl: "cap",
            method: "post",
            url: "target/queryAgencyRankByCompany",
            params: data
        }),

    ScoreReport_getTotalScore: data =>
        req({
            baseUrl: "cap",
            method: "post",
            url: "target/queryTotalScoreOfEachQuotaBatch",
            params: data,
            timeout: 60000
        }),

    ScoreReport_getScoreDetail: data =>
        req({
            baseUrl: "cap",
            method: "post",
            url: "target/queryQuotaScoreDetails",
            params: data
        }),
    ScoreReport_getScoreDetailPc: data =>
        req({
            baseUrl: "cap",
            method: "post",
            url: "target/queryQuotaScoreDetailsPc",
            params: data
        }),
    ScoreReport_getHeaderName: data =>
        req({
            baseUrl: "cap",
            method: "post",
            url: "target/queryQuotaByCustom",
            params: data
        }),
    ScoreReport_getDetailRecord: data =>
        req({
            baseUrl: "cap",
            method: "post",
            url: "targetLog/getPagelist",
            params: data
        }),
    ScoreReport_modifyScore: data =>
        req({
            baseUrl: "cap",
            method: "post",
            url: "target/modifyTarget",
            params: data
        }),
    ScoreReport_getDeparmentList: data =>
        req({
            baseUrl: "cap",
            method: "post",
            url: "tblCommonPublicEnumerate/queryTblCommonPublicEnumerateInfo",
            params: data
        }),
    ScoreReport_getSaleArea: data =>
        req({
            baseUrl: "cap",
            method: "get",
            url: "mstAgency/queryAgencyAreaByCompany",
            isOriginalGET: true,
            params: data
        }),
    ScoreReport_getFormsRecord: data =>
        req({
            baseUrl: "cap",
            method: "post",
            url: "queryLog/getPagelist",
            params: data
        }),
    ScoreInput_saveRank: data =>
        req({
            baseUrl: "cap",
            method: "get",
            isOriginalGET: true,
            url: "targetRank/saveRank",
            params: data
        }),
    ScoreInput_saveRankYuedu: data =>
        req({
            baseUrl: "cap",
            method: "get",
            isOriginalGET: true,
            url: "targetRankYuedu/saveRankYuedu",
            params: data
        }),
    // ===============权限检测 ==================
    ScoreInput_getAuthor: data =>
        req({
            baseUrl: "cap",
            method: "post",
            url: "mstUser/queryMstUserList",
            params: data
        }),
    // =============== 申诉处理 ==================
    Appeal_getPageList: data =>
        req({
            baseUrl: "cap",
            method: "post",
            url: "targetShensu/getPagelist",
            params: data
        }),
    Appeal_submitAppeal: data =>
        req({
            baseUrl: "cap",
            method: "put",
            url: "targetShensu/dealShensu",
            params: data
        }),
    Appeal_cancelAppeal: data =>
        req({
            baseUrl: "cap",
            method: "get",
            url: "targetShensu/cancelShensuByUser",
            isOriginalGET: true,
            params: data
        }),
};