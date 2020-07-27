<!-- 客户管理界面 -->
<template>
  <div class="m-view-clientManage m-window">
    <div class="m-condition">
      <el-row :gutter="10">
        <el-col :span="4">
          <el-select v-model="searchForm.companyCode" filterable placeholder="选择公司" @change="getSaleArea" clearable>
            <el-option
              v-for="(item,index) in companyList"
              :key="index"
              :label="item.companyName"
              :value="item.companyCode"
            ></el-option>
          </el-select>
        </el-col>
        <el-col :span="4">
          <el-select v-model="searchForm.agencyArea" filterable placeholder="选择销售地区" clearable>
            <el-option
              v-for="(item,index) in saleAreaList"
              :key="index"
              :label="item"
              :value="item"
            ></el-option>
          </el-select>
        </el-col>
        <el-col :span="4">
          <el-input
            v-model.trim="searchForm.name"
            placeholder="请输入客户编号/名称"
            clearable
            maxlength="20"
            @keyup.native.enter="search(1)"
          ></el-input>
        </el-col>
        <el-col :span="2" class="pull-right">
          <el-button type="primary" @click="enableClient" v-if="btnStatus.clientStop">
            {{
            searchForm.state == 0 ? "启用" : "停用"
            }}
          </el-button>
        </el-col>
        <el-col :span="2" class="pull-right">
          <el-button type="primary" @click="synchronization" v-if="btnStatus.clientSynchronize">同步</el-button>
        </el-col>
        <el-col :span="2" class="pull-right">
          <el-button type="primary" @click="search(1)" v-if="btnStatus.clientSearch">查询</el-button>
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
        :page-sizes="[30, 50, 100, 150, 200]"
        :page-size="pageInfo.size"
        layout="total, sizes, prev, pager, next, jumper"
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
      name: "clientManage",
      // 查询条件
      searchForm: {
        companyCode: "",
        agencyArea:"",
        name: "",
        state: 1 //1启用,0停用
      },
      // 分页信息
      pageInfo: {
        current: 1,
        size: 30,
        total: 0
      },
      // 数据加载状态
      loading: true,
      // 表格数据
      rowData: [],
      // 表格配置
      gridOptions: {},
      // 列配置
      columnDefs: [],
      // 公司列表
      companyList: [],
      // 销售地区列表
      saleAreaList:[],
      // 按钮权限
      btnStatus: {
        clientSearch: false,
        clientSynchronize: false,
        clientStop: false
      },
      allCompanyCode:""
    };
  },
  props: {
    addTab: {
      type: Function
    }
  },
  mounted() {
    this.init();
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
    // 查询列表数据
    search(flag) {
      if (flag) this.pageInfo.current = 1;
      const { state, name, companyCode,agencyArea } = this.searchForm;
      // if (!companyCode) {
      //   Msg.showErrorMsg("用户缺乏授权公司");
      //   this.loading = false;
      //   return;
      // }
      const { current, size } = this.pageInfo;
      let params = {
        entity: {
          userId: this.$global.user.id,
          userName: this.$global.user.loginName,
          companyCode: companyCode,
          agencyArea: agencyArea,
          keyword: name,
          state
        },
        current,
        size
      };
      this.loading = true;
      this.$http
        .clientManage_getClientList(params)
        .then(({ data }) => {
          this.loading = false;
          if (data.code == 1) {
            let rowData = data.rows;
            this.gridOptions.api.setRowData(rowData);
            this.pageInfo.total = data.total;
          } else {
            this.loading = false;
            Msg.showErrorMsg(data.info);
          }
        })
        .catch(err => {
          this.loading = false;
          Msg.showErrorMsg("获取数据失败");
        });
    },
    // 状态改变回调
    changeState(val) {
      this.search(1);
    },
    // 启用或停用
    enableClient() {
      let row = this.gridOptions.api.getSelectedRows();
      const { state } = this.searchForm;
      if (row.length <= 0) {
        this.$alert(`提示：请选择需要${state == 0 ? "启用" : "停用"}的数据`, {
          showClose: false,
          confirmButtonText: "确定",
          customClass: "alertPrompt"
        });
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
              .clientManage_updateState(params)
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
                Msg.showErrorMsg(`${state == 0 ? "停用" : "启用"}失败！`);
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
    // 同步数据
    synchronization() {
      this.loading = true;
      this.$http
        .clientManage_synchronization()
        .then(({ data }) => {
          if (data.code == 1) {
            this.$message.success(
              `已同步一级客户记录数:${data.rows.syncAgencyInfoCount}`
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
    // api获取销售区域
    getSaleArea() {
      this.searchForm.agencyArea = ''
      let companyCode
      if(!this.searchForm.companyCode){
        companyCode = this.allCompanyCode
      } else {
        companyCode = this.searchForm.companyCode
      }
      let obj = {
        companyCode: companyCode
      };
      this.$http
        .clientManage_getsaleArea(obj)
        .then(({ data }) => {
          if (data.code == 1) {
            this.saleAreaList = data.rows;
          } else {
            this.$message.error(data.info);
          }
        })
        .catch(() => {
          this.$message.error("获取销售区域失败");
        });
    },
    // 获取公司列表
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
              that.companyList = data.rows;
              // that.searchForm.companyCode = data.rows[0].companyCode;
              that.allCompanyCode = data.rows.map(val=>{
                return val.companyCode
              }).join(',')
              resolve();
            } else {
              that.$message.error("用户缺失公司信息");
              reject();
            }
          })
          .catch(({ response }) => {
            that.$message.error(response.data.info);
            reject();
          });
        this.loading = false;
      });
    },
    // 初始化表格
    initTable() {
      this.gridOptions = {
        context: {
          componentParent: this
        },
        enableColResize: true,
        localeText: localeText,
        rowSelection: "multiple",
        enableCellChangeFlash: true,
        rowMultiSelectWithClick: true,
        //uppressRowClickSelection: true,
        enableFilter: false, //列过滤器
        enableSorting: true //列排序
      };
      // 列配置
      this.columnDefs = [
        {
          headerName: "",
          field: "",
          width: 60,
          checkboxSelection: true,
          headerCheckboxSelection: true
        },
        {
          headerName:"公司编码",
          field:"companyCode",
          width:120,
          tooltipField:"companyCode"
        },
        {
          headerName:"公司名称",
          field:"companyName",
          width:320,
          tooltipField:"companyName"
        },
        {
          headerName: "客户编码",
          field: "customCode",
          width: 120,
          tooltipField: "customCode"
        },
        {
          headerName: "客户名称",
          field: "customName",
          width: 320,
          tooltipField: "customName"
        },
        {
          headerName:"销售区域",
          field:"agencyArea",
          width: 120,
          tooltipField:"agencyArea"
        },
        {
          headerName: "状态",
          width: 120,
          field: "state",
          cellRenderer: function(params) {
            if (params.value == 1) return '<span class="ag-icon">启用</span>';
            else if (params.value == 0)
              return '<span class="ag-icon">停用</span>';
            else if (params.value == 2)
              return '<span class="ag-icon">客户变更停用</span>'
          }
        }
      ];
    },
    // 初始化按钮权限
    initAuthBtn() {
      authorize1.getBtnAuth(this.name, this.btnStatus);
    },
    async init() {
      await this.getCompanyList();
      this.getSaleArea();
      this.search(1);
    }
  },
  beforeMount() {
    // 页面 ag-grid 配置
    this.initTable();
    this.initAuthBtn();
  }
};
</script>
