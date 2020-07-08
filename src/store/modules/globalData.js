import api from "@/api";
const state = {
  loadingInstance: "",
  workFlowInfo: {},

  // 选中的流程数据，被跨越的多个页面使用
  transformProcessRowData: {}
};
const getters = {
  getWorkFlow: state => state.workFlowInfo,
  processRowData: state => {
    state.transformProcessRowData.abc = "niaho";
    return state.transformProcessRowData;
  }
};
const mutations = {
  setWorkFlow: (state, info) => {
    state.workFlowInfo = info;
  },
  processRowData: (state, info) => {
    state.transformProcessRowData = info;
  }
};
const actions = {
  getWorkFlowFromNetWork: context => {
    // api.getworkFlowInfo().then(({ data }) => {
    //   if (data.code == 1) {
    //     context.commit("setWorkFlow", data.rows);
    //   }
    // });
  }
};

export default { namespaced: true, state, mutations, actions, getters };
