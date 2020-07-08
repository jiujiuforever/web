<template>
  <!--积分录入 -->
  <div class="m-view-baseScoreInput m-window">
    <div v-show="showMasterTable">
      <el-row :gutter="10">
        <el-col :span="4">
          <el-select v-model="searchCondiction.companyCode" filterable placeholder="选择公司" clearable>
            <el-option
              v-for="(item,index) in selectCompanyList"
              :key="index"
              :label="item.companyName"
              :value="item.companyCode"
            ></el-option>
          </el-select>
        </el-col>
        <el-col :span="3">
          <el-select
            value-key="id"
            v-model="searchCondiction.deptCode"
            placeholder="评价部门"
            clearable
          >
            <el-option
              v-for="(departitem, index) in selectRoleList"
              :key="index"
              :label="departitem.codeCn"
              :value="departitem.code"
            ></el-option>
          </el-select>
        </el-col>
        <el-col :span="4">
          <el-date-picker
            v-model="searchCondiction.startDate"
            format="yyyy-MM-dd"
            value-format="yyyy-MM-dd"
            placeholder="选择开始日期"
          ></el-date-picker>
        </el-col>
        <el-col :span="4">
          <el-date-picker
            v-model="searchCondiction.endDate"
            format="yyyy-MM-dd"
            value-format="yyyy-MM-dd"
            placeholder="选择结束日期"
          ></el-date-picker>
        </el-col>
        <el-col :span="2" class="pull-right">
          <el-button type="primary" @click="importClick">下一步</el-button>
        </el-col>
        <el-col :span="2" class="pull-right">
          <el-button type="primary" @click="search">查询</el-button>
        </el-col>
        <!-- <el-col :span="2" class="pull-right">
          <el-button type="primary" @click="downTemplate">下载模板</el-button>
        </el-col>-->
      </el-row>

      <div class="m-agTable">
        <ag-grid-vue
          class="m-agTableContent ag-theme-balham"
          :gridOptions="agGridData.gridOptions"
          :columnDefs="agGridData.columnDefs"
          :suppressDragLeaveHidesColumns="true"
          :suppressMakeColumnVisibleAfterUnGroup="true"
          :rowData="agGridData.rowData"
          @gridReady="onGridReady"
          rowSelection="single"
          @cellClicked="rowSelected"
          v-loading="loadingInput"
        ></ag-grid-vue>
      </div>
      <div class="m-page">
        <el-pagination
          @size-change="sizeChange"
          @current-change="currentChange"
          :current-page="pagination.currentPage"
          :page-sizes="pagination.pageSizes"
          :page-size="pagination.pageSize"
          :layout="pagination.layout"
          :total="pagination.totalCount"
        ></el-pagination>
      </div>
    </div>

    <importDataPlane
      v-if="browsdialog.importShow"
      @closeImportPlane="closeImportPlane"
      @saveTablesDatas="saveImportData"
      :tableColumnConfig="tableColumnConfig"
      v-loading="loading"
    ></importDataPlane>
  </div>
</template>

<script>
import {
  fileDataLoad,
  downLoadOnlieTemplate,
  downLoadTemplate
} from "./components/xlsFileUploadUnit.js";
import gridOptions from "lesso-common/public/gridOptions";
import importDataPlane from "./components/component_ImportExcel.vue";
import { fieldConfigForEN } from "@/public/importFieldConfig.js";
import Msg from "@/public/message.js";
export default {
  name: "baseScoreInput",
  components: {
    importDataPlane
  },
  data() {
    return {
      // 表格
      agGridData: {
        rowData: [],
        columnDefs: [],
        gridOptions: {},
        gridApi: {},
        columnApi: {}
      },
      // 翻页
      pagination: {
        pageSizes: [10, 20, 30, 50, 100],
        pageSize: 30,
        layout: "total, sizes, prev, pager, next, jumper",
        totalCount: 0,
        currentPage: 1
      },
      // 搜索条件
      searchCondiction: {
        companyCode: "",
        deptCode: "",
        startDate: "",
        endDate: "",
        userId: this.$global.user.id,
        userName: this.$global.user.loginName,
      },
      // 下拉框部门信息
      selectRoleList: [],
      // 下拉框公司信息
      selectCompanyList: [],
      //   选择的数据源
      selectData: {
        companyList: [
          {
            companyName: "",
            companyCode: ""
          }
        ],
        deparmentList: [
          {
            codeCn: "",
            id: ""
          }
        ]
      },
      // 弹窗传递信息,有两个弹窗
      browsdialog: {
        operatorType: "edit",
        detailShow: false,
        importShow: false
      },
      // 导入组件列配置信息
      tableColumnConfig: [],

      //loading
      loading: false,
      loadingInput: false
    };
  },
  computed: {
    // 主表是否展示
    showMasterTable() {
      return !(this.browsdialog.detailShow || this.browsdialog.importShow);
    }
  },
  watch:{
    'searchCondiction.startDate': function(){
      let flag = new Date(this.searchCondiction.endDate) - new Date(this.searchCondiction.startDate)
      console.log(flag)
      if(this.searchCondiction.startDate && this.searchCondiction.endDate){
        if(flag < 0){
          this.$message.warning("结束日期小于开始日期");
          this.searchCondiction.startDate = ""
        }
      }
    },
    'searchCondiction.endDate': function(){
      if(this.searchCondiction.startDate && this.searchCondiction.endDate){
        let flag = new Date(this.searchCondiction.endDate) - new Date(this.searchCondiction.startDate)
        if(flag < 0){
          this.$message.warning("结束日期小于开始日期");
          this.searchCondiction.endDate = ""
        }
      }
    }
  },
  methods: {
    //单行选中
    rowSelected(params) {
      if (params.colDef.field == "download") {
        let obj = {
          fileName: params.data.fileName,
          groupName: "CAP",
          viewPath: params.data.url
        };
        this.$http.ScoreReport_downloadTExcel(obj).then(val => {
          let blob = new Blob([val.data], { type: "application/vnd.ms-excel" });
          downLoadOnlieTemplate(blob, `${params.data.fileName}`);
        });
      }
    },
    // 表格渲染回调
    onGridReady(params) {
      this.agGridData.gridApi = params.api;
      this.agGridData.columnApi = params.columnApi;
      // this.agGridData.gridApi.sizeColumnsToFit()
    },
    // 获取主表数据
    getTableDataList() {
      this.loadingInput = true;
      let data = {
        current: this.pagination.currentPage,
        size: this.pagination.pageSize,
        entity: this.searchCondiction
      };
      this.$http
        .ScoreInput_getFileList(data)
        .then(({ data }) => {
          if (data.code == 1) {
            this.agGridData.rowData = data.rows;
            this.pagination.totalCount = data.total;
            this.loadingInput = false;
          } else {
            this.loadingInput = false;
            Msg.showErrorMsg(data.info);
          }
        })
        .catch(() => {
          this.loadingInput = false;
          Msg.showErrorMsg("获取导入日志失败");
        });
    },
    // 获取已启用的部门信息
    getRoleGroup() {
      let data = {
        current: 1,
        entity: {
          type: "role_group",
          state: 1
        },
        size: 999
      };
      this.$http
        .getEnumList(data)
        .then(res => {
          const { code, rows, info } = res.data;
          if (code == 1) {
            this.selectRoleList = rows;
          } else {
            Msg.showErrorMsg(info);
          }
        })
        .catch(err => {
          Msg.showErrorMsg("获取部门数据失败");
        });
    },
    // 根据id查授权公司
    getCompanyList() {
      return new Promise((resolve, reject) => {
        let obj = {
          current: 1,
          size: 100,
          entity: {
            userId: this.$global.user.id
          }
        };
        this.$http
          .ScoreInput_getCompanyList(obj)
          .then(({ data }) => {
            if (data.code == 1) {
              this.selectCompanyList = data.rows;
              resolve();
            } else {
              Msg.showErrorMsg(data.info);
              reject();
            }
          })
          .catch(() => {
            Msg.showErrorMsg("获取公司列表信息失败");
            reject();
          });
      });
    },
    // 搜索
    search() {
      if (!this.selectCompanyList.length) {
        Msg.showErrorMsg("用户缺乏授权公司");
        return;
      }
      this.pagination.currentPage = 1;
      this.getTableDataList();
    },
    //  ag-grid表格表头初始化
    initTable() {
      // 配置
      this.agGridData.gridOptions = gridOptions();
      this.agGridData.gridOptions.context = {
        componentParent: this
      };
      // 头部
      this.agGridData.columnDefs = [
        {
          headerName: "积分统计时间",
          field: "recordTime",
          width: 120,
          tooltipField: "recordTime"
        },
        {
          headerName: "公司",
          field: "companyName",
          width: 200,
          tooltipField: "companyName"
        },
        {
          headerName: "部门",
          field: "deptName",
          width: 120,
          tooltipField: "deptName"
        },
        {
          headerName: "导入人员",
          field: "userName",
          width: 120,
          tooltipField: "userName"
        },
        {
          headerName: "文件名",
          field: "fileName",
          width: 200,
          tooltipField: "fileName"
        },
        {
          headerName: "导入时间",
          field: "createTime",
          width: 200,
          tooltipField: "createTime"
        },
        {
          headerName: "操作",
          width: 150,
          field: "download",
          cellRenderer: function(params) {
            return '<a href="javascript:;">下载</a>';
          }
        }
      ];
    },

    // 翻页
    sizeChange(val) {
      this.pagination.pageSize = val;
      this.getTableDataList();
    },
    // 当前页便变化
    currentChange(val) {
      this.pagination.currentPage = val;
      this.getTableDataList();
    },
    // 导入界面触发
    importClick() {
      this.browsdialog.importShow = true;
    },
    // 关闭导入预览界面
    closeImportPlane() {
      this.browsdialog.importShow = false;
    },
    // 通知外层调用保存数据的接口
    saveImportData(data) {
      // 调用保存数据接口
      this.loading = true;
      let { id, loginName } = this.$global.user;
      let submitData = {
        data: JSON.stringify(data.rowData),
        id: id,
        loginName: loginName,
        roleCode: data.roleCode
      };
      let importPerson = {
        companyCode: this.$global.user.bukrs,
        deptCode: data.roleCode,
        recordTime: data.rowData[0].recordTime,
        url: data.viewPath,
        fileName: data.fileName,
        user: id,
        createId: id,
        createBy: loginName
      };
      let viewPath = data.viewPath;
      this.$http
        .ScoreInput_saveImportData(submitData)
        .then(({ data }) => {
          if (data.code == 1) {
            return this.$http.ScoreInput_saveImportPerson(importPerson);
          } else if (data.code == 0) {
            this.$alert(data.info, {
              showClose: false,
              confirmButtonText: "确定",
              customClass: "alertPrompt"
            });
            this.loading = false;
          }
        })
        .then(({ data }) => {
          if (data.code == 1) {
            this.loading = false;
            this.$message.success("上传并保存成功");
            this.browsdialog.importShow = false;
            this.getTableDataList();
          }
        })
        .catch(err => {
          console.log(err);
          this.$message.error("上传失败");
        });
    },
    // 获取部门列表
    getDeparmentList() {
      let that = this;
      let data = {
        userId: this.$global.user.id
      };
      let result = [];
      this.$http
        .ScoreInput_getDeparmentQuatoList(data)
        .then(({ data }) => {
          if (data.code == 1) {
            data.rows.forEach(item => {
              let obj = {
                codeCn: `${item.roleName}-${item.quotaTypeName}`,
                code: `${item.roleCode}-${item.quotaType}`
              };
              result.push(obj);
            });
            that.selectData.deparmentList = result;
          } else {
            Msg.showErrorMsg(data.info);
          }
        })
        .catch(() => {
          Msg.showErrorMsg("获取授权部门失败");
        });
    },
    async init() {
      // 初始话表格
      this.initTable();
      // 获取筛选公司数据
      this.getRoleGroup();
      this.getDeparmentList();
      await this.getCompanyList();
      if (!this.selectCompanyList.length) {
        Msg.showErrorMsg("用户缺乏授权公司");
        return;
      }
      this.getTableDataList();
    }
  },
  beforeMount() {
    this.init();
  }
};
</script>
<style lang="less" scoped>
.m-view-baseScoreInput {
  .m-agTable {
    position: absolute;
    left: 0;
    right: 0;
    top: 50px;
    bottom: 35px;
  }
}
</style>
