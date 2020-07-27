<!-- 引入数据弹窗-->
<template>
  <el-dialog
    title="选择授权客户"
    v-if="dialogVisible"
    :visible.sync="dialogVisible"
    width="60%"
    :before-close="handleClose"
    v-dialogDrag
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    class="authCompanyDialog"
  >
    <!-- <el-transfer
      style="text-align: left; display: inline-block"
      filterable
      filter-placeholder="请输入关键字"
      v-model="value"
      :data="transferData"
      :titles="['待选客户', '已选客户']"
      :props="props"
    >
    </el-transfer>-->
    <div style="display:flex;justify-content:space-around;align-items:center">
      <div class="m-modelLeft" style="width:40%">
        <el-row type="flex" justify="space-between" align="center" style="background:#F5F7FA;padding: 10px;border:1px solid #EBEEF5;margin-bottom:5px">
          <span>待选客户</span>
          <span>{{leftGrid.selectRow}}/{{leftGrid.rowData.length}}</span>
        </el-row>
        <el-row :gutter="10">
          <el-col :span="24">
            <el-input type="text" v-model="leftSearchConditon" placeholder="请输入客户编码或客户名称" @input="agencyLeftSearch" ></el-input>
          </el-col>
        </el-row>
        <div class="m-agTableModel">
          <ag-grid-vue
            class="m-agTableContent ag-theme-balham"
            :gridOptions="leftGrid.gridOptions"
            :columnDefs="leftGrid.columnDefs"
            :rowData="leftGrid.rowData"
            @rowSelected="rowLeftSelected"
            v-loading="leftLoading"
          ></ag-grid-vue>
        </div>
      </div>
      <div class="m-modelMidlle">
        <div style="margin:10px 0">
          <el-button
            type="primary"
            icon="el-icon-arrow-left"
            circle
            style="width:36px;height:36px"
            @click="rightToLeftDebounce"
            :loading="leftButtonLoading"
            :disabled="leftButton"
          ></el-button>
        </div>
        <div style="margin:10px 0">
          <el-button
            type="primary"
            icon="el-icon-arrow-right"
            circle
            style="width:36px;height:36px"
            @click="leftToRightDebounce"
            :loading="rightButtonLoading"
            :disabled="rightButton"
          ></el-button>
        </div>
      </div>
      <div class="m-modelRight" style="width:40%">
                <el-row type="flex" justify="space-between" align="center" style="background:#F5F7FA;padding: 10px;border:1px solid #EBEEF5;margin-bottom:5px">
          <span>已选客户</span>
          <span>{{rightGrid.selectRow}}/{{rightGrid.rowData.length}}</span>
        </el-row>
        <el-row :gutter="10">
          <el-col :span="24">
            <el-input type="text" v-model.trim="rightSearchConditon" placeholder="请输入客户编码或客户名称" @input="agencyRightSearch" ></el-input>
          </el-col>
        </el-row>
        <div class="m-agTableModel">
          <ag-grid-vue
            class="m-agTableContent ag-theme-balham"
            :gridOptions="rightGrid.gridOptions"
            :columnDefs="rightGrid.columnDefs"
            :rowData="rightGrid.rowData"
            @rowSelected="rowRightSelected"
          ></ag-grid-vue>
        </div>
      </div>
    </div>
    <!-- 底部操作栏 -->
    <span slot="footer" class="dialog-footer">
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" @click="confrim">确定</el-button>
    </span>
  </el-dialog>
</template>

<script>
import Msg from "@/public/message";
import localeText from "@/i18n/agGridText";
export default {
  data() {
    return {
      value: [],
      //  穿梭框别名配置
      props: {
        key: "customCode",
        label: "CodePlusName"
      },
      leftLoading: false,
      startIndex: 1,
      pageSize: 30,
      allData: [],
      // filterMethod(query, item) {
      //   return item.CodePlusName.indexOf(query) > -1;
      // }

      // 左搜索
      leftSearchConditon: "",
      // 右搜索
      rightSearchConditon: "",
      // 左翻页
      leftPagination: {
        pageSizes: [500, 600, 700, 800],
        pageSize: 500,
        layout: "sizes, prev, pager, next, jumper",
        totalCount: 0,
        currentPage: 1
      },
      // 右翻页
      rightPagination: {
        pageSizes: [500, 600, 700, 800],
        pageSize: 500,
        layout: "prev, pager, next, jumper",
        totalCount: 0,
        currentPage: 1
      },
      // 左表格配置
      leftGrid: {
        gridOptions: {},
        columnDefs: [],
        rowData: [],
        selectRow: 0
      },
      // 右表格配置
      rightGrid: {
        gridOptions: {},
        columnDefs: [],
        rowData: [],
        copyData: [],
        selectRow: 0
      },
      // 向右按钮控制
      rightButton: true,
      rightButtonLoading: false,
      rightTimer: null,
      // 向左按钮控制
      leftButton: true,
      leftButtonLoading: false,
      leftTimer: null,
    };
  },
  props: {
    dialogVisible: {
      type: Boolean
    },
    selectedValue: {
      type: Array
    },
    companyCode: {
      type: Array
    }
  },
  beforeMount() {
    this.initTable();
  },
  mounted() {
    this.value = this.selectedValue;
    this.rightGrid.rowData = JSON.parse(JSON.stringify(this.selectedValue));
    console.log(this.rightGrid.rowData)
    this.rightGrid.copyData = JSON.parse(JSON.stringify(this.selectedValue));
    this.agencyLeftSearch();
  },
  watch: {
    selectedValue(newVal, oldVal) {
      this.value = newVal;
    }
  },
  methods: {
    //   关闭弹窗
    handleClose() {
      this.rightGrid.rowData = [];
      this.rightGrid.copyData = [];
      this.$emit("dailogClose");
    },
    confrim() {
      // 确认选择数据
      console.log(this.rightGrid.copyData);
      let agencyNames = [];
      this.rightGrid.copyData.forEach(val => {
        agencyNames.push(val.customName);
      });
      this.$emit(
        "setAuthAgency",
        this.rightGrid.copyData,
        agencyNames.join(",")
      );
      this.handleClose();
    },
    //  分页
    handleSizeChange(val) {
      console.log(val);
    },
    handleCurrentChange() {},
    // 根据右列表筛选搜索
    async agencyLeftSearch() {
      this.leftLoading = true;
      let params = {
        entity: {
          state: 1,
          keyword: this.leftSearchConditon,
          companyCodeList: this.companyCode
        },
        current: 1,
        size: 999999
      };
      this.$http
        .clientManage_getClientList1(params)
        .then(({ data }) => {
          if (data.code == 1) {
            // 过滤
            this.rightGrid.rowData.forEach(val => {
              let index = data.rows.findIndex(
                v => v.customCode == val.customCode
              );
              if(index > -1){
                data.rows.splice(index, 1);
              }
            });
            this.leftGrid.rowData = data.rows;
            this.leftLoading = false
          } else {
            Msg.showErrorMsg(data.info);
            this.leftLoading = false
          }
        })
        .catch(err => {
          console.log(err);
          this.leftLoading = false
          Msg.showErrorMsg("获取数据失败");
        });
    },
    // 根据右列表筛选搜索
    agencyRightSearch() {
      let result = this.rightGrid.copyData.filter(val => {
        if (
          val.customCode.includes(this.rightSearchConditon) ||
          val.customName.includes(this.rightSearchConditon)
        ) {
          return val;
        }
      });
      this.rightGrid.rowData = result;
    },
    initTable() {
      let columnDefs = [
        {
          headerName: "",
          field: "",
          width: 60,
          checkboxSelection: true,
          headerCheckboxSelection: true
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
          tooltipField: "customName"
        }
      ];
      let gridOptions = {
        context: {
          componentParent: this
        },
        enableColResize: true,
        localeText: localeText,
        rowSelection: "multiple",
        enableCellChangeFlash: true,
        rowMultiSelectWithClick: true,
        enableFilter: false, //列过滤器
        enableSorting: true //列排序
      };
      this.leftGrid.columnDefs = JSON.parse(JSON.stringify(columnDefs));
      this.rightGrid.columnDefs = JSON.parse(JSON.stringify(columnDefs));
      this.leftGrid.gridOptions = Object.assign({}, gridOptions);
      this.rightGrid.gridOptions = Object.assign({}, gridOptions);
    },
    rightToLeft() {
      let rows = this.rightGrid.gridOptions.api.getSelectedRows();
      let rowData = JSON.parse(JSON.stringify(this.rightGrid.rowData));
      rows.forEach(val => {
        let index = this.rightGrid.rowData.indexOf(val);
        if (index > -1) {
          this.rightGrid.rowData.splice(index, 1);
          this.rightGrid.copyData.splice(index,1)
        }
      });
      rows.forEach(val => {
        this.leftGrid.rowData.unshift(val);
      });
      // console.log(this.rightGrid.copyData)
      this.leftButton = true;
      this.leftButtonLoading = false
      this.rightGrid.selectRow = 0
    },
    rightToLeftDebounce(){
      let context = this;
      let args = arguments;
      this.leftButtonLoading = true
      if(this.leftTimer){
        clearTimeout(this.leftTimer)
      }
      this.leftTimer = setTimeout(function(){
        context.rightToLeft();
      },1000)
    },
    leftToRight() {
      let rows = this.leftGrid.gridOptions.api.getSelectedRows();
      rows.forEach(val => {
        val.kunnr = val.customCode,
        val.kunnrName = val.customName
        this.rightGrid.rowData.push(val);
        this.rightGrid.copyData.push(val)
      });
      rows.forEach(val => {
        let index = this.leftGrid.rowData.indexOf(val);
        if (index > -1) {
          this.leftGrid.rowData.splice(index, 1);
        }
      });
      this.leftGrid.selectRow = 0;
      this.rightButton = true;
      this.rightButtonLoading = false
    },
    leftToRightDebounce() {
      let context = this;
      let args = arguments;
      this.rightButtonLoading = true
      if(this.rightTimer){
        clearTimeout(this.rightTimer)
      }
      this.rightTimer = setTimeout(function(){
        context.leftToRight();
      },1000)
    },
    // 获取全部数据
    async getAgencyAllList() {
      return new Promise((resolve, reject) => {
        let params = {
          entity: {
            state: 1,
            companyCode: this.companyCode
          },
          current: 1,
          size: 99999
        };
        this.$http
          .clientManage_getClientList1(params)
          .then(({ data }) => {
            if (data.code == 1) {
              // this.allData = JSON.parse(JSON.stringify(data.rows)); //深拷贝
              resolve(data.rows);
            } else {
              Msg.showErrorMsg(data.info);
            }
          })
          .catch(err => {
            Msg.showErrorMsg("获取数据失败");
          });
      });
    },
    // 行选中
    rowLeftSelected() {
      let rows = this.leftGrid.gridOptions.api.getSelectedRows();
      this.leftGrid.selectRow = rows.length
      if (this.leftGrid.selectRow) {
        this.rightButton = false;
      } else {
        this.rightButton = true
      }
    },
    rowRightSelected() {
      let rows = this.rightGrid.gridOptions.api.getSelectedRows();
      this.rightGrid.selectRow = rows.length
      if (this.rightGrid.selectRow) {
        this.leftButton = false;
      } else {
        this.leftButton = true
      }
    }
  }
};
</script>

<style lang="less">
.authCompanyDialog {
  .el-dialog__body {
    padding-bottom: 30px;
    .el-transfer {
      .el-button {
        padding: 10px;
        span {
          i {
            color: #fff;
          }
        }
      }
      .el-transfer-panel {
        width: 40%;
      }
    }
  }
}
</style>
