<!-- Excel文件上传 -->
<template>
  <div class="m-importData" ref="importContainerPage">
    <!--  -->
    <el-row :gutter="10" class="m-condition">
      <el-col :span="3">
        <el-select
          value-key="id"
          v-model="selectRoleCode"
          placeholder="导入部门"
          clearable
          :disabled="selectDisabled"
        >
          <el-option
            v-for="(departitem, index) in departOptions"
            :key="index"
            :label="departitem.codeCn"
            :value="departitem.code"
          ></el-option>
        </el-select>
      </el-col>
      <el-col :span="4">
        积分项数据导入：
        <el-radio-group v-model="importController">
          <el-radio :label="1">启用</el-radio>
          <el-radio :label="0">禁用</el-radio>
        </el-radio-group>
      </el-col>
      <el-col :span="4">
        积分项数据修改：
        <el-radio-group v-model="changeController">
          <el-radio :label="1">启用</el-radio>
          <el-radio :label="0">禁用</el-radio>
        </el-radio-group>
      </el-col>
      <el-col :span="2" class="pull-right">
        <el-button type="primary" @click="importClick">导入用户</el-button>
        <input type="file" name id style="display:none" ref="uploadFile" @change="importUserExcel" />
      </el-col>
      <el-col :span="4" class="pull-right">
        <el-button type="primary" @click="downTemplate">下载导入用户模板</el-button>
      </el-col>
    </el-row>
    <template v-if="tableDataShow">
      <div class="m-agTable m-modifyBottom">
        <ag-grid-vue
          class="m-agTableContent ag-theme-balham"
          :gridOptions="agGridData.gridOptions"
          :columnDefs="agGridData.columnDefs"
          :rowData="agGridData.rowData"
          rowSelection="single"
        ></ag-grid-vue>
      </div>
      <!-- <div class="m-page">
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="pagination.currentPage"
          :page-sizes="pagination.pageSizes"
          :page-size="pagination.pageSize"
          :layout="pagination.layout"
          :total="pagination.totalCount"
        ></el-pagination>
      </div>-->
    </template>
    <template v-else>
      <div class="emptyTip" v-loading="loading">
        <span style="font-size:24px">请点击上传需要的文件</span>
      </div>
    </template>
    <div class="bottomBtn">
      <el-button type="plain" @click="goBack">返回</el-button>
      <el-button type="primary" @click="saveData" :disabled="saveEnable">保存</el-button>
    </div>
    <!-- 错误报告 -->
    <el-dialog title="数据报告" :visible.sync="errorTableVisible" :close-on-click-modal="false">
      <div style="padding: 15px 0">数据总条目：{{vailateDatalength}}</div>
      <el-tabs type="border-card">
        <el-tab-pane :label="`用户已存在(${existUserList.length})`">
          <el-table :data="existUserList" border max-height="350">
            <el-table-column property="userNum" label="oa号/工号" width="150"></el-table-column>
            <el-table-column property="userName" label="姓名"></el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane :label="`用户不存在(${nonExistUserList.length})`">
          <el-table :data="nonExistUserList" border max-height="350">
            <el-table-column property="userNum" label="oa号/工号" width="150"></el-table-column>
            <el-table-column property="userName" label="姓名"></el-table-column>
          </el-table>
        </el-tab-pane>
        <!-- <el-tab-pane :label="`导入重复用户(${repeatUserList.length})`">
          <el-table :data="repeatUserList" border max-height="350">
            <el-table-column property="userNum" label="oa号/工号" width="150"></el-table-column>
            <el-table-column property="userName" label="姓名"></el-table-column>
          </el-table>
        </el-tab-pane>-->
        <el-tab-pane :label="`导入数据存在空值(${nullUserList.length})`">
          <el-table :data="nullUserList" border max-height="350">
            <el-table-column property="count" label="行数"></el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-dialog>
  </div>
</template>
<script>
import Msg from "@/public/message";
import { fileDataLoad, downLoadTemplate } from "./xlsFileUploadUnit.js";
import gridOptions from "lesso-common/public/gridOptions";
export default {
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
      // 错误报告
      existUserList: [],
      nonExistUserList: [],
      repeatUserList: [],
      nullUserList: [],
      errorTableVisible: false,
      vailateDatalength: 0,
      // loading
      loading: false,
      // 导入部门
      selectRoleCode: "",
      // 导入权限
      importController: 0,
      // 修改权限
      changeController:0,
      selectDisabled: false,
      departOptions: []
    };
  },
  computed: {
    // 初始化为空的时候展示写什么东西
    tableDataShow() {
      return this.agGridData.rowData.length != 0;
    },
    // 保存的按钮使能
    saveEnable: function() {
      if (this.agGridData.rowData.length == 0) {
        return true;
      } else {
        return false;
      }
    }
  },
  methods: {
    //   数据导入
    importClick() {
      if (!this.selectRoleCode) {
        Msg.showPopMsg("请选择导入数据所属部门");
        return;
      }
      this.$refs.uploadFile.click();
    },
    // 导入
    async importUserExcel(event) {
      let existUserList = [];
      let nonExistUserList = [];
      let repeatUserList = [];
      let nullUserList = [];
      let userList = [];
      // 需要使用各种各种的工具函数处理成数据
      let File = event.target.files[0];
      let result = await fileDataLoad(File);
      let obj = result[0].sheefData;
      this.$refs.uploadFile.value = null;
      this.loading = true;
      this.vailateDatalength = obj.length;
      this.$http
        .userManage_importExcel(obj)
        .then(({ data }) => {
          if (data.code == 1) {
            if (
              data.rows.existUserList.length ||
              data.rows.nonExistUserList.length ||
              data.rows.repeatUserList.length ||
              data.rows.nullUserList.length
            ) {
              // 错误报告
              existUserList = data.rows.existUserList;
              nonExistUserList = data.rows.nonExistUserList;
              repeatUserList = data.rows.repeatUserList;
              nullUserList = data.rows.nullUserList;
            } else {
              userList = data.rows.userList;
              this.$message.success("上传成功");
            }
            this.loading = false;
            this.errorTableVisible = true;
          } else {
            this.loading = false;
            Msg.showErrorMsg("上传数据失败");
          }
          this.existUserList = existUserList;
          this.nonExistUserList = nonExistUserList;
          this.repeatUserList = repeatUserList;
          this.nullUserList = nullUserList;
          this.agGridData.rowData = userList;
        })
        .catch(err => {
          this.loading = false;
          Msg.showErrorMsg("上传数据失败");
        });
    },
    //按钮-- 返回
    goBack() {
      this.agGridData.rowData = [];
      this.selectRoleCode = "";
      this.$emit("closeImportPlane");
    },
    // 按钮--下载模板
    downTemplate() {
      downLoadTemplate(
        "/static/downloadFile/批量导入用户模板.xlsx",
        "用户批量导入模板"
      );
    },
    // 保存Excel数据
    saveData() {
      let { loginName, id } = this.$global.user;
      let obj = {
        createBy: loginName,
        createId: id,
        roleCode: this.selectRoleCode,
        quotaAuth: this.importController,
        quotaAuth2: this.changeController,
        userList: this.agGridData.rowData
      };
      this.$http
        .userManage_saveExcelData(obj)
        .then(({ data }) => {
          if (data.code == 1) {
            this.$message.success("保存成功");
            this.goBack();
          } else {
            Msg.showErrorMsg("保存失败");
          }
        })
        .catch(() => {
          Msg.showErrorMsg("保存失败");
        });
    },
    // 初始化表格
    initTable() {
      this.agGridData.columnDefs = [
        {
          headerName: "oa号",
          field: "oaNum",
          width: 200,
          tooltipField: "oaNum"
        },
        {
          headerName: "sap号",
          field: "sapNum",
          width: 200,
          tooltipField: "sapNum"
        },
        {
          headerName: "姓名",
          field: "userName",
          width: 200,
          tooltipField: "userName"
        },
        {
          headerName: "所属公司编码",
          field: "companyCode",
          width: 200,
          tooltipField: "companyCode"
        },
        {
          headerName: "授权公司编码",
          field: "companyCode",
          width: 200,
          tooltipField: "companyCode"
        }
      ];
    },
    // 获取各种下拉框的部门枚举值
    getRoleGroup() {
      let obj = {
        current: 1,
        size: 999,
        entity: {
          type: "role_group",
          state: 1
        }
      };
      this.$http
        .getEnumList(obj)
        .then(({ data }) => {
          if (data.code == 1) {
            this.departOptions = data.rows;
          } else {
            Msg.showErrorMsg("获取部门数据失败");
          }
        })
        .catch(() => {
          Msg.showErrorMsg("获取部门数据失败");
        });
    }
  },
  beforeMount() {
    this.initTable();
  },
  mounted() {
    this.getRoleGroup();
  }
};
</script>
<style lang="less">
.m-importData {
  width: 100%;
  height: 100%;
  .m-condition {
    margin-left: 0px !important;
    margin-right: 0px !important;
  }
  .m-agTable {
    position: absolute;
    left: 0;
    right: 0;
    top: 50px;
    bottom: 0;
  }
  .m-modifyBottom {
    bottom: 60px;
  }
  .m-page {
    position: absolute;
    left: 0px;
    right: 0;
    bottom: 50px;
    height: 34px;
    border: 1px solid #ecf0f0;
  }

  .bottomBtn {
    display: flex;
    position: absolute;
    bottom: 0px;
    justify-content: center;
    width: 99%;
  }
  .emptyTip {
    width: 100%;
    height: 80%;
    text-align: center;
    vertical-align: middle;
    line-height: 200px;
  }

  .el-tabs__content {
    position: relative;
    top: 0px;
    user-select: text;
  }
}
</style>