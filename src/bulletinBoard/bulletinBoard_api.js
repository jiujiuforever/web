// 流程相关的接口
import { noAuthreq } from "@/api/req";
export default {
  // ================看板Api================
  rank_agencyForCompany: data =>
    noAuthreq({
      baseUrl: "cap",
      method: "post",
      url: "tblProcessInstance/queryAgencyRankByCompany",
      params: data
    }),
  // 根据公司编码查询对应的经销商的列表
  companyClientManage_getTabelList: data =>
    noAuthreq({
      baseUrl: "cap",
      method: "post",
      url: "ralCompanyAgency/queryRalCompanyAgencyList",
      params: data
    }),
  // 根据公司编码和经销商编码查询对应的数据
  index_geAgencyindexlList: data =>
    noAuthreq({
      baseUrl: "cap",
      method: "post",
      url: "tblProcessIquota/queryAgencyRealTimeScoreByCompany",
      params: data
    }),
  // 获取公司信息
  board_getCompanyInfo: data =>
    noAuthreq({
      baseUrl: "cap",
      method: "post",
      url: "mstCompany/queryMstCompanyList",
      params: data
    })
};
