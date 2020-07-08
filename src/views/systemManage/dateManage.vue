<template>
  <!-- 日期配置 -->
  <div class="m-view-baseScoreInput m-window">
    <div class="m-condition">
      <el-row :gutter="10">
        
        <el-col :span="2" class="pull-right">
          <el-button type="primary" @click="prohibit" v-if="btnStatus.configStop">{{showName?'启用':'停用'}}</el-button>
        </el-col>
        <el-col :span="2" class="pull-right">
          <el-button type="primary" @click="editSetting" :disabled="Boolean(showName)" v-if="btnStatus.configEdit">编辑</el-button>
        </el-col>
        <el-col :span="2" class="pull-right">
          <el-checkbox v-model="showName" :true-label="1" :false-label="0" @change="showState">显示停用</el-checkbox>
        </el-col>
      </el-row>
    </div>
    <div class="m-agTable m-bottom">
      <ag-grid-vue
        class="m-agTableContent ag-theme-balham"
        :gridOptions="agGridData.gridOptions"
        :columnDefs="agGridData.columnDefs"
        :rowData="agGridData.rowData"
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
    <el-dialog
      :title="dialogOptions.title"
      :visible.sync="dialogOptions.dialogVisible"
      width="50%"
      v-dialogDrag
      :close-on-click-modal="false"
      :close-on-press-escape="false"
    >
      <el-form :model="ruleForm" ref="ruleForm" label-width="100px">
        <el-form-item label="配置编码" prop="systemCode">{{ruleForm.systemCode}}</el-form-item>
        <el-form-item label="配置说明" prop="text">{{ruleForm.text}}</el-form-item>
        <el-form-item label="配置值" prop="systemValue">
          <el-input
            v-model="ruleForm.systemValue"
            v-if="ruleForm.systemCode != 'XTPZ003'"
            placeholder="请输入配置值"
            clearable
          ></el-input>
          <el-select
            v-model="ruleForm.systemValue"
            multiple
            placeholder="请选择"
            v-if="ruleForm.systemCode == 'XTPZ003'"
          >
            <el-option
              v-for="(item,index) in selectDept"
              :key="index"
              :label="item.codeCn"
              :value="item.code"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="配置状态">{{ruleForm.state?'已启用':'已禁用'}}</el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" @click="saveSetData">保存</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import Msg from "@/public/message";
import localeText from "@/i18n/agGridText";
import authorize1 from "@/public/authorize1";
export default {
  data() {
    return {
      name:"dateManage",
      // 表格配置
      agGridData: {
        rowData: [],
        columnDefs: [],
        gridOptions: {}
      },
      // loading
      loading: true,
      // 引入和编辑dialog
      dialogOptions: {
        title: "编辑配置项",
        dialogVisible: false
      },
      // 编辑表格
      ruleForm: {
        systemCode: "",
        text: "",
        systemValue: "",
        state: 0
      },
      // 停用(false)和启用(true)控制
      showName: false,
      // 分页配置
      pagination: {
        pageSizes: [10, 20, 30, 50, 100],
        pageSize: 30,
        layout: "total, sizes, prev, pager, next, jumper",
        totalCount: 0,
        currentPage: 1
      },
      // 获取已启用的部门下拉框
      selectDept:[],
      // 初始化按钮权限
      btnStatus:{
        configEdit: false,
        configStop: false,
      }
    };
  },
  methods: {
    // 获取配置数据
    getSetData(state) {
      let obj = {
        current: this.pagination.currentPage,
        size: this.pagination.pageSize,
        entity: {
          state: state
        }
      };
      this.$http
        .dateManage_getDate(obj)
        .then(({ data }) => {
          if (data.code == 1) {
            data.rows.forEach(val=>{
              if(val.systemCode == "XTPZ003"){
                val.systemValue  = val.systemValue.split(',')
              }
            })
            this.agGridData.rowData = data.rows;
            this.pagination.totalCount = data.total;
            this.loading = false;
          } else {
            this.loading = false;
            Msg.showErrorMsg("获取日期配置失败");
          }
        })
        .catch(err => {
          this.loading = false;
          Msg.showErrorMsg("获取日期配置失败");
        });
    },
    // 保存配置数据
    saveSetData() {
      let rows = this.agGridData.gridOptions.api.getSelectedRows();
      if (rows[0].systemCode == "XTPZ001") {
        var regu = /^[1-9]\d*$/;
        if (
          isNaN(this.ruleForm.systemValue) ||
          !regu.test(this.ruleForm.systemValue)
        ) {
          Msg.showErrorMsg("请填写正确日期");
          return;
        }
        if (
          Number(this.ruleForm.systemValue) > 28 ||
          Number(this.ruleForm.systemValue) < 1
        ) {
          Msg.showErrorMsg("日期区间1到28号");
          return;
        }
      }
      let obj = {
        state: this.ruleForm.state,
        systemCode: this.ruleForm.systemCode,
        systemValue: this.ruleForm.systemCode == 'XTPZ003'?this.ruleForm.systemValue.join():this.ruleForm.systemValue
      };
      this.$http
        .dateManage_modifyDate(obj)
        .then(({ data }) => {
          if (data.code == 1) {
            this.$message.success("保存成功");
            this.getSetData(1);
          } else {
            Msg.showErrorMsg("保存失败");
          }
        })
        .catch(() => {
          Msg.showErrorMsg("保存失败");
        });
      this.handleCancel();
    },
    // 关闭dialog
    handleCancel() {
      this.dialogOptions.dialogVisible = false;
    },
    // 获取部门列表
    getDeparmentList() {
      let that = this;
      let data = {
        current: "1",
        entity: {
          type: "role_group",
          state: 1
        },
        size: "100"
      };
      this.$http.ScoreReport_getDeparmentList(data).then(({ data }) => {
        if (data.code == 1) {
          that.selectDept = data.rows;
        }
      });
    },
    // 初始化表格
    initTable() {
      this.agGridData.gridOptions = {
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
      this.agGridData.columnDefs = [
        {
          headerName: "",
          field: "",
          width: 60,
          checkboxSelection: true,
          headerCheckboxSelection: true
        },
        {
          headerName: "配置编码",
          field: "systemCode",
          width: 120,
          tooltipField: "systemCode"
        },
        {
          headerName: "配置说明",
          field: "text",
          width: 250,
          tooltipField: "text"
        },
        {
          headerName: "配置值",
          field: "systemValue",
          width: 120,
          tooltipField: "systemValue"
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
    // 编辑配置数据
    editSetting() {
      let rows = this.agGridData.gridOptions.api.getSelectedRows();
      if (rows.length == 0) {
        Msg.showPopMsg("提示：请选择一条你需要修改的数据");
        return;
      }
      this.ruleForm = rows[0];
      this.dialogOptions.dialogVisible = true;
    },
    // 禁用或启用配置数据
    prohibit() {
      let rows = this.agGridData.gridOptions.api.getSelectedRows();
      if (rows.length == 0) {
        Msg.showPopMsg("提示：请选择你需要禁用的数据");
        return;
      }
      // 批量修改配置项状态
      if (this.showName) {
        // 停用变启用
        rows.forEach(val => {
          val.state = 1;
          if(val.systemCode == 'XTPZ003'){
            val.systemValue = val.systemValue.join();
          }
        });
      } else {
        // 启用变停用
        rows.forEach(val => {
          val.state = 0;
          if(val.systemCode == 'XTPZ003'){
            val.systemValue = val.systemValue.join();
          }
        });
      }
      this.$http
        .dateManage_setState(rows)
        .then(({ data }) => {
          if (data.code == 1) {
            if (this.showName) {
              this.$message.success(`成功启用${rows.length}条配置项`);
              this.getSetData(0);
            } else {
              this.$message.success(`成功停用${rows.length}条配置项`);
              this.getSetData(1);
            }
          } else {
            Msg.showErrorMsg("停用失败");
          }
        })
        .catch(() => {
          Msg.showErrorMsg("停用失败");
        });
    },
    // 显示停用或启用
    showState(value) {
      if (value) {
        // 显示停用
        this.getSetData(0);
      } else {
        // 显示启用
        this.getSetData(1);
      }
    },
    // 分页
    sizeChange(val) {
      this.pagination.pageSize = val;
      if (this.showName) {
        this.getSetData(0);
      } else {
        this.getSetData(1);
      }
    },
    currentChange(val) {
      this.pagination.currentPage = val;
      if (this.showName) {
        this.getSetData(0);
      } else {
        this.getSetData(1);
      }
    },
    // 初始化按钮权限
    initAuthBtn() {
      authorize1.getBtnAuth(this.name, this.btnStatus);
    }
  },
  beforeMount() {
    this.initTable();
    this.initAuthBtn();
  },
  mounted() {
    this.getSetData(1);
    this.getDeparmentList()
  }
};
</script>
<style lang="less">
.m-window {
  .m-date-input {
    width: unset;
  }
}
</style>