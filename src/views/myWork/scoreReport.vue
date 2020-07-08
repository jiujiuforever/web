<template>
  <!-- 查看积分项 -->
  <div class="m-view-baseScoreInput m-window">
    <div v-show="showMasterTable">
      <el-row :gutter="10">
        <el-col :span="4">
          <el-select
            v-model="searchCondiction.companyCode"
            filterable
            placeholder="选择公司"
            @change="changeCompanyCode"
          >
            <el-option
              v-for="(item,index) in  selectData.companyList"
              :key="index"
              :label="item.companyName"
              :value="item.companyCode"
            ></el-option>
          </el-select>
        </el-col>
        <el-col :span="4">
          <el-select
            v-model="searchCondiction.agencyArea"
            filterable
            placeholder="选择销售区域"
            clearable
          >
            <el-option
              v-for="(item,index) in  selectData.saleAreaList"
              :key="index"
              :label="item"
              :value="item"
            ></el-option>
          </el-select>
        </el-col>
        <el-col :span="4">
          <el-input
            placeholder="输入客户编码或名称"
            v-model="searchCondiction.agencyCode"
            clearable
            @keyup.native.enter="search"
          ></el-input>
        </el-col>
        <el-col :span="4">
          <el-date-picker
            v-model="searchCondiction.endDate"
            type="month"
            placeholder="选择年月"
            value-format="yyyy-MM"
          ></el-date-picker>
        </el-col>
        <el-col :span="2" class="pull-right">
          <el-button type="primary" @click="exportExcel" v-if="btnStatus.rankExport" :disabled="!this.selectData.companyList.length">数据导出</el-button>
        </el-col>
        <el-col :span="2" class="pull-right">
          <el-button type="primary" @click="synchronize" v-if="btnStatus.synchronize" :disabled="!this.selectData.companyList.length">同步</el-button>
        </el-col>
        <el-col :span="2" class="pull-right">
          <el-button type="primary" @click="search" v-if="btnStatus.scoreSearch" :disabled="!this.selectData.companyList.length">查询</el-button>
        </el-col>
      </el-row>

      <div class="m-agTable">
        <ag-grid-vue
          class="m-agTableContent ag-theme-balham"
          :gridOptions="agGridData.gridOptions"
          :columnDefs="agGridData.columnDefs"
          :suppressDragLeaveHidesColumns="true"
          :suppressMakeColumnVisibleAfterUnGroup="true"
          :rowMultiSelectWithClick="true"
          :rowData="agGridData.rowData"
          @gridReady="onGridReady"
          rowSelection="multiple"
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
  </div>
</template>

<script>
import localeText from "@/i18n/agGridText";
import authorize from "@/public/authorize1";
import Msg from "@/public/message";
import { downLoadOnlieTemplate } from "./components/xlsFileUploadUnit.js";
export default {
  name: "scoreReport",
  components: {},
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
      // 分页
      pagination: {
        pageSizes: [100, 300, 500, 1000, 2000],
        pageSize: 100,
        layout:"total, sizes, prev, pager, next, jumper",
        totalCount: 0,
        currentPage: 1
      },
      // 搜索条件
      searchCondiction: {
        companyCode: "",
        agencyCode: "",
        agencyArea: "",
        current: "",
        endDate: "",
        roleCode: "",
        isOneYear: 0,
        sort: 1
      },
      //   选择公司源
      selectData: {
        companyList: [],
        saleAreaList: []
      },
      // 弹窗传递控制对象
      browsdialog: {
        formShow: false,
        formRecord: false
      },
      // 按钮权限配置
      name: "scoreReport",
      btnStatus: {
        rankExport: false,
        synchronize: false,
        scoreSearch: false
      },
      selectRowData: {},
      loading: true
    };
  },
  computed: {
    // 主表是否展示
    showMasterTable() {
      return !this.browsdialog.formShow && !this.browsdialog.formRecord;
    }
  },
  methods: {
    // 查看总分
    closeScoreForm() {
      this.browsdialog.formShow = false;
    },
    // 表格渲染回调
    onGridReady(params) {
      this.agGridData.gridApi = params.api;
      this.agGridData.columnApi = params.columnApi;
    },
    // 获取主表数据
    getTableDataList() {
      if(!this.searchCondiction.companyCode){
        Msg.showErrorMsg("用户缺乏授权公司")
        return;
      }
      this.loading = true;
      let that = this;
      let data = {
        current: this.pagination.currentPage,
        entity: this.searchCondiction,
        size: this.pagination.pageSize
      };
      this.$http
        .ScoreReport_getScoreData(data)
        .then(({ data }) => {
          if (data.code == 1) {
            that.agGridData.rowData = data.rows;
            that.pagination.totalCount = data.total;
          } else {
            Msg.showErrorMsg(data.info)
          }
          this.loading = false;
        })
        .catch(({ response }) => {
          this.loading = false;
          that.$message.error(response.data.info);
        });
    },
    // 搜索
    search() {
      this.pagination.currentPage = 1;
      this.getTableDataList();
    },
    // 数据导出
    exportExcel() {
      let obj = {
        ...this.searchCondiction,
        sapNum: this.$global.user.sapNum,
        createId: this.$global.user.id,
        createBy: this.$global.user.loginName
      };
      let companyMessage = this.selectData.companyList.filter(val => {
        if (val.companyCode == this.searchCondiction.companyCode) {
          return val;
        }
      });
      let companyName = companyMessage[0].companyName;
      let date =
        `${new Date(this.searchCondiction.endDate).Format("yyyy")}年` +
        `${new Date(this.searchCondiction.endDate).Format("MM")}月`;
      this.$http.ScoreReport_exportExcelRank(obj).then(val => {
        let blob = new Blob([val.data], { type: "application/vnd.ms-excel" });
        downLoadOnlieTemplate(blob, `${companyName}${date}的积分排名表`);
      });
    },
    // 同步
    synchronize() {
      let obj = {
        userId: this.$global.user.id,
        userName: this.$global.user.loginName
      };
      this.$http
        .ScoreInput_saveRank(obj)
        .then(({ data }) => {
          if (data.code == 1) {
            console.log(data);
            return this.$http.ScoreInput_saveRankYuedu(obj);
          } else {
            this.$alert(`同步失败`, {
              showClose: false,
              confirmButtonText: "确定",
              customClass: "alertPrompt"
            });
            return;
          }
        })
        .then(({ data }) => {
          if (data.code == 1) {
            this.$message.success("同步成功");
          } else {
            this.$alert(`同步失败`, {
              showClose: false,
              confirmButtonText: "确定",
              customClass: "alertPrompt"
            });
            return;
          }
        })
        .catch(() => {
          this.$alert(`同步失败`, {
            showClose: false,
            confirmButtonText: "确定",
            customClass: "alertPrompt"
          });
          return;
        });
    },
    //  ag-grid表格表头初始化
    initTable() {
      // 配置
      this.agGridData.gridOptions = {
        context: {
          componentParent: this
        },
        enableColResize: true,
        localeText: localeText,
        rowSelection: "multiple",
        enableCellChangeFlash: true,
        rowMultiSelectWithClick: true,
        // suppressRowClickSelection: true,
        enableFilter: false, //列过滤器
        enableSorting: true //列排序
      };
      // 头部
      this.agGridData.columnDefs = [
        {
          headerName: "",
          field: "",
          width: 60,
          checkboxSelection: true,
          headerCheckboxSelection: true
        },
        {
          headerName: "公司编码",
          field: "companyCode",
          width: 120,
          tooltipField: "companyCode"
        },
        {
          headerName: "公司",
          field: "companyName",
          width: 200,
          tooltipField: "companyName"
        },
        {
          headerName: "客户编码",
          field: "agencyCode",
          width: 120,
          tooltipField: "agencyCode"
        },
        {
          headerName: "客户",
          field: "agencyName",
          width: 200,
          tooltipField: "agencyName"
        },
        {
          headerName: "销售区域",
          field: "agencyArea",
          width: 120,
          tooltipField: "agencyArea"
        },
        {
          headerName: "总分",
          field: "totalScore",
          width: 120,
          tooltipField: "totalScore"
        },
        {
          headerName: "排名",
          field: "rank",
          width: 120,
          tooltipField: "rank"
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
    // api获取公司列表
    getCompanyList() {
      return new Promise((resolve, reject) => {
        let id = this.$global.user.id;
        let that = this;
        let data = {
          current: "1",
          entity: {
            userId: id
          },
          size: "100"
        };
        this.$http
          .ScoreInput_getCompanyList(data)
          .then(({ data }) => {
            if (data.code == 1 && data.total > 0) {
              that.selectData.companyList = data.rows;
              that.searchCondiction.companyCode = data.rows[0].companyCode;

              resolve();
            } else {
              that.$message.error("请联系管理员添加授权公司");
              that.loading = false;
              reject();
            }
          })
          .catch(({ response }) => {
            that.$message.error(response.data.info);
            reject();
          });
      });
    },
    // 更换选择公司编号
    changeCompanyCode() {
      (this.searchCondiction.agencyArea = ""),
        (this.selectData.saleAreaList = []);
      this.getSaleArea();
    },
    // api获取销售区域
    getSaleArea() {
      let obj = {
        companyCode: this.searchCondiction.companyCode
      };
      this.$http
        .ScoreReport_getSaleArea(obj)
        .then(({ data }) => {
          if (data.code == 1) {
            this.selectData.saleAreaList = data.rows;
          } else {
            this.$message.error(data.info);
          }
        })
        .catch(() => {
          that.$message.error("获取销售区域失败");
        });
    },
    // 报表查看积分项
    Formclick() {
      let selectRows = this.agGridData.gridApi.getSelectedRows();
      if (selectRows.length == 0) {
        this.$alert(`提示：请选择你需要查看的数据`, {
          showClose: false,
          confirmButtonText: "确定",
          customClass: "alertPrompt"
        });
        return;
      } else {
        // 选择数据
        let selectRowData = {
          companyCode: selectRows[0].companyCode,
          companyName: selectRows[0].companyName,
          agencyCodeList: selectRows.map(val => {
            return val.agencyCode;
          }),
          agencyNameList: selectRows.map(val => {
            return val.agencyName;
          }),
          totalScoreList: selectRows.map(val => {
            return val.totalScore;
          }),
          endDate: "",
          roleCode: "",
          quotaType: "",
          isOneYear: "",
          size: 100,
          current: 1,
          sort: 0
        };
        this.selectRowData = selectRowData;
        this.browsdialog.formShow = true;
      }
    },
    // 初始化月份
    initDate() {
      let year;
      let month;
      if (new Date().getMonth()) {
        //1-11(2月-12月)
        year = new Date().Format("yyyy");
        month = new Date().getMonth();
      } else {
        //0(1月)
        year = new Date().Format("yyyy") - 1;
        month = 12;
      }
      this.searchCondiction.endDate = `${year}-${month}`;
    },
    // 初始化数据
    async initData() {
      this.initDate();
      await this.getCompanyList();
      this.getTableDataList();
      this.getSaleArea();
    },
    // 初始化按钮权限
    getAuthBtn() {
      authorize.getBtnAuth(this.name, this.btnStatus);
    }
  },
  beforeMount() {
    // 初始话表格
    this.initTable();
    // 初始化数据
    this.initData();
    // 初始化按钮权限
    this.getAuthBtn();
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
