<template>
  <!-- 系统统计 -->
  <div class="m-view-baseScoreInput m-window">
    <el-row :gutter="10">
      <el-col :span="4">
        <el-select v-model="selectFlag" filterable placeholder="选择公司" @change="selectChange">
          <el-option
            v-for="(item,index) in selectOptions"
            :key="index"
            :label="item.label"
            :value="item.value"
          ></el-option>
        </el-select>
      </el-col>
      <el-col :span="2" class="pull-right">
        <el-button type="primary" @click="search" v-if="btnStatus.statisticsRefresh">刷新</el-button>
      </el-col>
    </el-row>
    <div class="m-agTable m-bottom">
      <ag-grid-vue
        class="m-agTableContent ag-theme-balham"
        :gridOptions="agGridData.gridOptions"
        :columnDefs="agGridData.columnDefs"
        :suppressDragLeaveHidesColumns="true"
        :suppressMakeColumnVisibleAfterUnGroup="true"
        :rowMultiSelectWithClick="true"
        :rowData="agGridData.rowData"
        @gridReady="onGridReady"
        v-loading="loading"
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
</template>
<script>
import gridOptions from "lesso-common/public/gridOptions";
import Msg from "@/public/message";
import authorize1 from "@/public/authorize1";
export default {
  data() {
    return {
      name:"systemStatistics",
      // 选择配置
      selectOptions: [
        {
          label: "统计公司",
          value: 1
        },
        {
          label: "统计客户",
          value: 2
        },
        {
          label: "最近一周使用查积分的客户",
          value: 3
        },
        {
          label: "最近一周使用查积分的员工",
          value: 4
        },
        {
          label: "统计积分项个数",
          value: 5
        },
        {
          label: "本年各部门积分情况",
          value: 6
        }
      ],
      //   选择值
      selectFlag: 1,
      //  表格配置
      agGridData: {
        gridOptions: {},
        rowData: [],
        columnDefs: []
      },
      //   分页
      pagination: {
        pageSizes: [10, 20, 30, 50, 100],
        pageSize: 30,
        layout: "total, sizes, prev, pager, next, jumper",
        totalCount: 0,
        currentPage: 1
      },
      //   loading
      loading: true,
      // 选择后查询
      changeFlag: false,
      // 初始化按钮权限
      btnStatus:{
        statisticsRefresh: false
      }
    };
  },
  methods: {
    // 更改选项
    selectChange() {
      this.pagination.currentPage = 1;
      this.pagination.pageSize = 30;
      this.search();
    },
    // 根据选择值查询
    async search() {
      this.loading = true;
      if (this.selectFlag == 1) {
        // 统计公司
        this.agGridData.columnDefs = [
          {
            headerName: "公司编码",
            field: "code",
            width: 120,
            tooltipField: "code"
          },
          {
            headerName: "公司名称",
            field: "name",
            width: 200,
            tooltipField: "name"
          }
        ];
        await this.getStatisticsCompany();
      } else if (this.selectFlag == 2) {
        // 统计客户
        this.agGridData.columnDefs = [
          {
            headerName: "客户编码",
            field: "code",
            width: 120,
            tooltipField: "code"
          },
          {
            headerName: "客户名称",
            field: "name",
            width: 200,
            tooltipField: "name"
          }
        ];
        await this.getStatisticsAgency();
      } else if (this.selectFlag == 3) {
        // 查微信客户
        this.agGridData.columnDefs = [
          {
            headerName: "登录ID",
            field: "loginId",
            width: 200,
            tooltipField: "loginId"
          },
          {
            headerName: "open_Id",
            field: "openId",
            width: 200,
            tooltipField: "openId"
          },
          {
            headerName: "登录时间",
            field: "loginTime",
            width: 200,
            tooltipField: "loginTime"
          }
        ];
        await this.getWxAgency();
      } else if (this.selectFlag == 4) {
        // 查微信员工
        this.agGridData.columnDefs = [
          {
            headerName: "登录ID",
            field: "loginId",
            width: 200,
            tooltipField: "loginId"
          },
          {
            headerName: "open_Id",
            field: "openId",
            width: 200,
            tooltipField: "openId"
          },
          {
            headerName: "登录时间",
            field: "loginTime",
            width: 200,
            tooltipField: "loginTime"
          }
        ];
        await this.getWxWork();
      } else if (this.selectFlag == 5) {
        // 查部门使用积分项
        this.agGridData.columnDefs = [
          {
            headerName: "部门编码",
            field: "roleCode",
            width: 120,
            tooltipField: "roleCode"
          },
          {
            headerName: "部门名称",
            field: "roleName",
            width: 200,
            tooltipField: "roleName"
          },
          {
            headerName: "积分项使用数量",
            field: "statistics",
            width: 200,
            tooltipField: "statistics"
          }
        ];
        await this.getUsedQuotaNum();
      } else if (this.selectFlag == 6) {
        // 查部门的录入频率
        this.agGridData.columnDefs = [
          {
            headerName: "部门编码",
            field: "roleCode",
            width: 120,
            tooltipField: "roleCode"
          },
          {
            headerName: "部门名称",
            field: "roleName",
            width: 200,
            tooltipField: "roleName"
          },
          {
            headerName: "部门已录入月份",
            field: "statistics",
            width: 200,
            tooltipField: "statistics"
          }
        ];
        await this.getQuotaType();
      }
      this.loading = false;
    },
    // 统计公司接口
    async getStatisticsCompany() {
      return new Promise((resolve, reject) => {
        let obj = {
          current: this.pagination.currentPage,
          size: this.pagination.pageSize
        };
        this.$http
          .systemStatistics_companyStatistics(obj)
          .then(({ data }) => {
            if (data.code == 1) {
              this.agGridData.rowData = data.rows;
              this.pagination.totalCount = data.total;
              resolve();
            } else {
              Msg.showErrorMsg("获取数据失败");
              reject();
            }
          })
          .catch(() => {
            Msg.showErrorMsg("获取数据失败");
            reject();
          });
      });
    },
    // 统计客户接口
    async getStatisticsAgency() {
      return new Promise((resolve, reject) => {
        let obj = {
          current: this.pagination.currentPage,
          size: this.pagination.pageSize
        };
        this.$http
          .systemStatistics_customStatistics(obj)
          .then(({ data }) => {
            if (data.code == 1) {
              this.agGridData.rowData = data.rows;
              this.pagination.totalCount = data.total;
              resolve();
            } else {
              Msg.showErrorMsg("获取数据失败");
              reject();
            }
          })
          .catch(() => {
            Msg.showErrorMsg("获取数据失败");
            reject();
          });
      });
    },
    // 查微信积分客户
    async getWxAgency() {
      return new Promise((resolve, reject) => {
        let obj = {
          current: this.pagination.currentPage,
          size: this.pagination.pageSize,
          entity: {
            userType: 1
          }
        };
        this.$http
          .systemStatistics_wxOnlineStatistics(obj)
          .then(({ data }) => {
            if (data.code == 1) {
              this.agGridData.rowData = data.rows;
              this.pagination.totalCount = data.total;
              resolve();
            } else {
              Msg.showErrorMsg("获取数据失败");
              reject();
            }
          })
          .catch(() => {
            Msg.showErrorMsg("获取数据失败");
            reject();
          });
      });
    },
    // 查微信积分员工
    async getWxWork() {
      return new Promise((resolve, reject) => {
        let obj = {
          current: this.pagination.currentPage,
          size: this.pagination.pageSize,
          entity: {
            userType: 0
          }
        };
        this.$http
          .systemStatistics_wxOnlineStatistics(obj)
          .then(({ data }) => {
            if (data.code == 1) {
              this.agGridData.rowData = data.rows;
              this.pagination.totalCount = data.total;
              resolve();
            } else {
              Msg.showErrorMsg("获取数据失败");
              reject();
            }
          })
          .catch(() => {
            Msg.showErrorMsg("获取数据失败");
            reject();
          });
      });
    },
    // 查部门使用的积分项
    async getUsedQuotaNum() {
      return new Promise((resolve, reject) => {
        let obj = {
          current: this.pagination.currentPage,
          size: this.pagination.pageSize
        };
        this.$http
          .systemStatistics_quotaStatistics(obj)
          .then(({ data }) => {
            if (data.code == 1) {
              this.agGridData.rowData = data.rows;
              this.pagination.totalCount = data.total;
              resolve();
            } else {
              Msg.showErrorMsg("获取数据失败");
              reject();
            }
          })
          .catch(() => {
            Msg.showErrorMsg("获取数据失败");
            reject();
          });
      });
    },
    // 查部门已录入月份
    async getQuotaType() {
      return new Promise((resolve, reject) => {
        let obj = {
          current: this.pagination.currentPage,
          size: this.pagination.pageSize
        };
        this.$http
          .systemStatistics_targetStatistics(obj)
          .then(({ data }) => {
            if (data.code == 1) {
              this.agGridData.rowData = data.rows;
              this.pagination.totalCount = data.total;
              resolve();
            } else {
              Msg.showErrorMsg("获取数据失败");
              reject();
            }
          })
          .catch(() => {
            Msg.showErrorMsg("获取数据失败");
            reject();
          });
      });
    },
    // 分页
    sizeChange(value) {
      this.pagination.pageSize = value;
      this.search();
    },
    currentChange(value) {
      this.pagination.currentPage = value;
      this.search();
    },

    // ag-grid表格渲染完成回调
    onGridReady(params) {
      this.agGridData.gridApi = params.api;
      this.agGridData.columnApi = params.columnApi;
    },
    // 表格初始化
    initTable() {
      this.agGridData.gridOptions = gridOptions();
      this.agGridData.gridOptions.context = {
        componentParent: this
      };
      this.search();
    },
    // 初始化按钮权限
    initAuthBtn() {
      authorize1.getBtnAuth(this.name, this.btnStatus);
    }
  },
  created() {
    this.initTable();
    this.initAuthBtn();
  }
};
</script>
<style lang="less">
</style>
