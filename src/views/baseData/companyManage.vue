<!-- 公司管理界面 -->
<template>
  <div class="m-view-companyManage m-window">
    <div class="m-condition">
      <el-row :gutter="10">
        <el-col :span="4">
          <el-input
            v-model.trim="searchForm.companyName"
            placeholder="请输入公司编号/名称"
            clearable
            @keyup.native.enter="search(1)"
            maxlength="20"
          ></el-input>
        </el-col>
        <el-col :span="2" class="pull-right">
          <el-button
            type="primary"
            @click="enableCompany"
            v-if="btnStatus.companyStop"
          >{{ searchForm.state == 1 ? "停用" : "启用" }}</el-button>
        </el-col>
        <el-col :span="2" class="pull-right">
          <el-button type="primary" @click="synchronization" v-if="btnStatus.companySynchronize">同步</el-button>
        </el-col>
        <el-col :span="2" class="pull-right">
          <el-button type="primary" @click="search(1)" v-if="btnStatus.companySearch">查询</el-button>
        </el-col>
        <el-col :span="2" class="pull-right">
          <el-checkbox
            v-model="searchForm.state"
            @change="changeState"
            :true-label="0"
            :false-label="1"
          >显示停用</el-checkbox>
        </el-col>
      </el-row>
    </div>
    <div class="m-agTable m-bottom">
      <ag-grid-vue
        class="m-agTableContent ag-theme-balham"
        :gridOptions="gridOptions"
        :columnDefs="columnDefs"
        :rowData="rowData"
        v-loading="loading"
      ></ag-grid-vue>
    </div>
    <div class="m-page">
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="pageInfo.current"
        :page-sizes="pageInfo.pageSizes"
        :page-size="pageInfo.size"
        :layout="pageInfo.layout"
        :total="pageInfo.total"
      ></el-pagination>
    </div>
  </div>
</template>

<script>
import localeText from "@/i18n/agGridText";
import Msg from "@/public/message";
import authorize1 from "@/public/authorize1";
export default {
  data() {
    return {
      name: "companyManage",
      // 查询条件
      searchForm: {
        companyName: "",
        state: 1 //1启用,0停用
      },
      // 分页信息
      pageInfo: {
        current: 1,
        pageSizes: [30, 50, 100, 150, 200],
        size: 30,
        layout: "total, sizes, prev, pager, next, jumper",
        total: 0
      },
      // 数据加载状态
      loading: "",
      // 表格数据
      rowData: [],
      // 表格配置
      gridOptions: {},
      // 列配置
      columnDefs: [],
      // 按钮权限
      btnStatus: {
        companySearch: false,
        companySynchronize: false,
        companyStop: false
      }
    };
  },
  props: {
    addTab: {
      type: Function
    }
  },
  mounted() {
    this.search();
  },
  methods: {
    /**分页相关事件开始**/
    handleSizeChange(val) {
      this.pageInfo.current = 1;
      this.pageInfo.size = val;
      this.search();
    },
    handleCurrentChange(val) {
      this.pageInfo.current = val;
      this.search();
    },
    /**分页相关事件结束**/
    // 查询公司列表数据
    search(flag) {
      if (flag) this.pageInfo.current = 1;
      const { state, companyName } = this.searchForm;
      const { current, size } = this.pageInfo;
      let params = {
        entity: {
          keyword: companyName,
          state
        },
        current,
        size
      };
      this.loading = true;
      this.$http
        .companyManage_getCompanyList(params)
        .then(({ data }) => {
          this.loading = false;
          if (data.code == 1) {
            let rowData = data.rows;
            this.gridOptions.api.setRowData(rowData);
            this.pageInfo.total = data.total;
          } else {
            Msg.showErrorMsg(data.info);
          }
        })
        .catch(err => {
          console.log(err);
          this.loading = false;
          Msg.showErrorMsg("获取数据失败");
        });
    },
    // 状态改变回调
    changeState(val) {
      this.search(1);
    },
    // 同步数据
    synchronization() {
      this.loading = true;
      this.$http
        .companyManage_synchronization()
        .then(({ data }) => {
          if (data.code == 1) {
            this.$message.success(
              `已同步公司记录数:${data.rows.syncCompanyCount}`
            );
            this.search(1);
          } else {
            this.loading = false;
            Msg.showErrorMsg("同步失败");
          }
        })
        .catch(() => {
          this.loading = false;
          Msg.showErrorMsg("同步失败");
        });
    },
    // 启用或停用
    enableCompany() {
      let row = this.gridOptions.api.getSelectedRows();
      const { state } = this.searchForm;
      if (row.length <= 0) {
        Msg.showPopMsg(`提示：请选择需要${state == 1 ? "停用" : "启用"}的数据`);
        return;
      } else {
        this.$confirm(`确定${state == 1 ? "停用" : "启用"}吗?`, "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消"
        })
          .then(() => {
            let ids = row.map(item => {
              return item.id;
            });
            let params = {
              ids: ids.join(","),
              state: state == 0 ? 1 : 0,
              updateBy: this.$global.user.employeeName,
              updateId: this.$global.user.id
            };
            this.loading = true;
            this.$http
              .companyManage_updateState(params)
              .then(({ data }) => {
                this.loading = false;
                if (data.code == 1) {
                  this.$message.success(
                    `提示：成功${state == 1 ? "停用" : "启用"}${
                      row.length
                    }条数据`
                  );
                  this.search();
                } else {
                  Msg.showErrorMsg(data.info);
                }
              })
              .catch(err => {
                this.loading = false;
                Msg.showErrorMsg(`${state == 1 ? "停用" : "启用"}失败！`);
              });
          })
          .catch(() => {
            this.$message({
              type: "info",
              message: "已取消操作"
            });
          });
      }
    },
    // 初始化表格
    initTable() {
      this.gridOptions = {
        context: {
          componentParent: this
        },
        enableColResize: true,
        rowSelection: "multiple",
        localeText: localeText,
        enableCellChangeFlash: true,
        rowMultiSelectWithClick: true,
        // suppressRowClickSelection: true,
        enableFilter: false, //列过滤器
        enableSorting: true //列排序
      };

      this.columnDefs = [
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
          tooltipField: "parentCode"
        },
        {
          headerName: "公司名称",
          field: "companyName",
          width: 300,
          tooltipField: "enumCode"
        },
        {
          headerName: "状态",
          width: 90,
          field: "state",
          cellRenderer: function(params) {
            if (params.value == 1) return '<span class="ag-icon">启用</span>';
            else if (params.value == 0)
              return '<span class="ag-icon">停用</span>';
          }
        }
      ];
    },
    // 初始化按钮权限
    initAuthBtn() {
      authorize1.getBtnAuth(this.name, this.btnStatus);
    }
  },
  beforeMount() {
    // 页面 ag-grid 配置
    this.initTable();
    this.initAuthBtn();
  }
};
</script>
