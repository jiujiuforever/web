<template>
  <div class="m-window m-clientChange">
    <div class="m-conditon">
      <el-row :gutter="10">
        <el-col :span="4">
          <el-input
            placeholder="输入客户旧编码"
            v-model.trim="searchForm.oldCustomCode"
            clearable
            maxlength="20"
            @keyup.native.enter="search()"
          ></el-input>
        </el-col>
        <el-col :span="2" class="pull-right">
          <el-button type="primary" v-if="btnStatus.changeAdd" @click="dialogVisible = true">新增变更</el-button>
        </el-col>
        <el-col :span="2" class="pull-right">
          <el-button type="primary" v-if="btnStatus.changeRecovery" @click="changeRecovery">撤销变更</el-button>
        </el-col>
        <el-col :span="2" class="pull-right">
          <el-button type="primary" @click="search()" v-if="btnStatus.changeSearch">查询</el-button>
        </el-col>
      </el-row>
    </div>
    <div class="m-agTable m-bottom">
      <ag-grid-vue
        class="m-agTableContent ag-theme-balham"
        :gridOptions="agGrid.gridOptions"
        :columnDefs="agGrid.columnDefs"
        :rowData="agGrid.rowData"
        v-loading="loading"
      ></ag-grid-vue>
    </div>
    <div class="m-page">
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="pageInfo.current"
        :page-sizes="pageInfo.pageSizes"
        :page-size="pageInfo.pageSize"
        :layout="pageInfo.layout"
        :total="pageInfo.total"
      ></el-pagination>
    </div>

    <el-dialog
      v-dialogDrag
      title="新增客户变更信息"
      :visible="dialogVisible"
      width="50%"
      @closed="handleClose"
      :close-on-click-modal="false"
    >
      <!-- 内嵌dialog -->
      <el-dialog
        v-dialogDrag
        width="70%"
        title="积分项重叠数据"
        :visible.sync="innerDialogVisible"
        append-to-body
        :close-on-click-modal="false"
      >
        <el-tabs type="border-card" @tab-click="changeTabs">
          <el-tab-pane v-for="(item,index) in tabList" :key="index" :label="item.recordTime"></el-tab-pane>
        </el-tabs>
        <div class="m-agTable m-bottom" style="height:300px">
          <ag-grid-vue
            class="m-agTableContent ag-theme-balham"
            :gridOptions="innerGrid.gridOptions"
            :columnDefs="innerGrid.columnDefs"
            :rowData="innerGrid.rowData"
            v-loading="loading"
          ></ag-grid-vue>
        </div>
        <div>
          <label>变更模式：</label>
          <el-radio v-model="addForm.model" label="1">覆盖</el-radio>
          <el-radio v-model="addForm.model" v-if="authAdd()" label="2">叠加</el-radio>
        </div>
        <div slot="footer" class="dialog-footer">
          <el-button @click="innerDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="replaceOrOverlay()" v-if="!saveLoading">保存</el-button>
          <el-button
            type="primary"
            @click="replaceOrOverlay()"
            :loading="saveLoading"
            v-if="saveLoading"
          >保存中</el-button>
        </div>
      </el-dialog>
      <!-- 表单 -->
      <el-form :model="addForm" ref="addForm" label-width="100px" class="demo-ruleForm">
        <el-row>
          <el-col :span="10">
            <el-form-item label="客户旧编号" prop="oldCustomCode">
              <el-input
                v-model.trim="addForm.oldCustomCode"
                maxlength="10"
                placeholder="客户号旧编码"
                disabled
                @focus="showImportDialog(true)"
              >
                <el-button slot="append" icon="el-icon-search" @click="showImportDialog(true)"></el-button>
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="旧客户名称">{{addForm.oldCustomName}}</el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="10">
            <el-form-item label="客户新编号" prop="newCustomCode">
              <el-input
                v-model.trim="addForm.newCustomCode"
                maxlength="10"
                placeholder="客户号新编码"
                disabled
                @focus="showImportDialog(false)"
              >
                <el-button slot="append" icon="el-icon-search" @click="showImportDialog(false)"></el-button>
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="新客户名称">{{addForm.newCustomName}}</el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="handleClose()">取消</el-button>
        <el-button type="primary" @click="changeAdd" v-if="!saveLoading">保存</el-button>
        <el-button type="primary" @click="changeAdd" :loading="saveLoading" v-if="saveLoading">保存中</el-button>
      </span>
    </el-dialog>

    <importDataDialog
      v-if="importDialogVisible"
      :dialogVisible="importDialogVisible"
      title="引入客户"
      :isOldCustomCode="isOldCustomCode"
      @setSelectedValue="getSelectedValue"
      @dialogClose="handleimportDialogVisible"
    ></importDataDialog>
  </div>
</template>
<script>
import authorize1 from "@/public/authorize1";
import gridOptions from "lesso-common/public/gridOptions";
import Msg from "@/public/message.js";
import importDataDialog from "@/views/baseData/common/importDataDialog.vue";
import utils from "@/public/utils";
export default {
  data() {
    return {
      name: "clientChange",
      // 初始化权限
      btnStatus: {
        changeSearch: false,
        changeAdd: false,
        changeRecovery: false
      },
      //   查询条件
      searchForm: {
        oldCustomCode: "",
        newCustomCode: ""
      },
      //   agGrid参数
      agGrid: {
        gridOptions: {},
        rowData: [],
        columnDefs: []
      },
      innerGrid: {
        gridOptions: {},
        rowData: [],
        columnDefs: []
      },
      // innerGridTabs
      tabList: [],
      loading: "",
      saveLoading: "",
      //   换页
      pageInfo: {
        current: 1,
        pageSizes: [30, 50, 100, 150, 200],
        pageSize: 30,
        total: 0,
        layout: "total, sizes, prev, pager, next, jumper"
      },
      //   新增变更信息
      addForm: {
        createBy: "",
        createId: "",
        oldCustomCode: "",
        oldCustomName: "无",
        newCustomCode: "",
        newCustomName: "无",
        model: "1"
      },
      // 规则
      addFormRule: {
        oldCustomCode: [
          {
            required: true,
            message: "请选择客户旧编码",
            trigger: ["change"]
          }
        ],
        newCustomCode: [
          {
            required: true,
            message: "请选择客户新编码",
            trigger: ["change"]
          }
        ]
      },
      //   新增弹窗
      dialogVisible: false,
      innerDialogVisible: false,

      importDialogVisible: false,
      isOldCustomCode: true
    };
  },
  components: {
    importDataDialog
  },
  methods: {
    // 初始化表格
    initTable() {
      this.agGrid.gridOptions = Object.assign(gridOptions(), {
        context: {
          componentParent: this
        },
        rowSelection: "single"
      });
      this.agGrid.columnDefs = [
        {
          headerName: "",
          field: "",
          width: 60,
          checkboxSelection: true,
          headerCheckboxSelection: true
        },
        {
          headerName: "客户旧编号",
          field: "oldCustomCode",
          width: 120
        },
        {
          headerName: "旧客户名称",
          field: "oldCustomName",
          width: 240
        },
        {
          headerName: "客户新编号",
          field: "newCustomCode",
          width: 120
        },
        {
          headerName: "新客户名称",
          field: "newCustomName",
          width: 240
        },
        {
          headerName: "变更类型",
          field: "model",
          width: 120,
          cellRenderer: function(params) {
            if (params.value == 1) return '<span class="ag-icon">覆盖</span>';
            else if (params.value == 2)
              return '<span class="ag-icon">叠加</span>';
          }
        },
        {
          headerName: "变更状态",
          field: "state",
          width: 120,
          cellRenderer: params => {
            if (params.value == 0) {
              return "<span>撤销变更</span>";
            } else if (params.value == 1) {
              return "<span>已变更</span>";
            }
          }
        },
        {
          headerName: "操作人",
          field: "createBy",
          width: 120
        },
        {
          headerName: "操作时间",
          field: "createTime",
          width: 240
        }
      ];
      this.innerGrid.gridOptions = Object.assign(gridOptions(), {
        context: {
          componentParent: this
        }
      });
      this.innerGrid.columnDefs = [
        {
          headerName: "公司编码",
          field: "companyCode",
          width: 120
        },
        {
          headerName: "客户旧编号",
          field: "oldCustomCode",
          width: 120
        },
        {
          headerName: "旧客户名称",
          field: "oldCustomName",
          width: 240
        },
        {
          headerName: "客户新编号",
          field: "newCustomCode",
          width: 120
        },
        {
          headerName: "新客户名称",
          field: "newCustomName",
          width: 240
        },
        {
          headerName: "积分项名称",
          field: "quotaName",
          width: 120
        },
        {
          headerName: "积分项编码",
          field: "quotaCode",
          width: 120
        },
        {
          headerName: "录入频率",
          field: "quotaType",
          width: 90,
          cellRenderer: function(params) {
            if (params.value == 1) return '<span class="ag-icon">初始分</span>';
            else if (params.value == 2)
              return '<span class="ag-icon">按月</span>';
            else if (params.value == 3)
              return '<span class="ag-icon>按年</span>';
            else if (params.value == 4)
              return '<span class="ag-icon>按季</span>';
          }
        },
        {
          headerName: "部门名称",
          field: "roleName",
          width: 120
        },
        {
          headerName: "旧客户分数",
          field: "oldFiled",
          width: 120
        },
        {
          headerName: "新客户分数",
          field: "newFiled",
          width: 120
        },
        {
          headerName: "录入时间",
          field: "recordTime",
          width: 240
        }
      ];
    },
    handleClose() {
      this.dialogVisible = false;
      this.initDialog();
    },
    // dialog关闭数据初始化
    initDialog() {
      this.addForm.oldCustomCode = "";
      this.addForm.newCustomCode = "";
      this.addForm.model = "1";
      this.addForm.oldCustomName = "无";
      this.addForm.newCustomName = "无";
    },
    // 初始化权限按钮
    initAuthBtn() {
      authorize1.getBtnAuth(this.name, this.btnStatus);
    },
    // 初始化数据
    initData() {
      this.loading = true;
      let obj = {
        current: this.pageInfo.current,
        entity: this.searchForm,
        size: this.pageInfo.pageSize
      };
      this.$http
        .clientChange_getPagelist(obj)
        .then(({ data }) => {
          if (data.code == 1) {
            this.agGrid.rowData = data.rows;
            this.pageInfo.total = data.total;
          } else {
            Msg.showErrorMsg(data.info);
          }
          this.loading = false;
        })
        .catch(() => {
          this.loading = false;
          Msg.showErrorMsg("获取变更日志失败");
        });
    },
    // 查询
    search() {
      this.pageInfo.current = 1;
      this.initData();
    },
    // 查看交集
    scoreMixed() {
      let obj = {
        oldCustomCode: this.addForm.oldCustomCode,
        newCustomCode: this.addForm.newCustomCode
      };
      return new Promise((resolve, reject) => {
        this.$http
          .clientChange_scoreMixed(obj)
          .then(({ data }) => {
            if (data.code == 1) {
              if (data.total > 0) {
                this.tabList = data.rows.map(val => {
                  return {
                    recordTime: new Date(val.recordTime).Format("yyyy-MM"),
                    sameQuotaList: val.sameQuotaList
                  };
                });
                this.innerGrid.rowData = data.rows[0].sameQuotaList;
                resolve(true);
              } else {
                resolve(false);
              }
            } else {
              Msg.showErrorMsg(data.info);
            }
          })
          .catch(e => {
            Msg.showErrorMsg(e.response.data.info);
          });
      });
    },
    // 增加变更
    async changeAdd() {
      // 调用查看是否有交集接口
      let flag = await this.scoreMixed();
      if (flag) {
        // 有交集
        this.innerDialogVisible = true;
        console.log("有交集");
      } else {
        // 无交集
        this.replaceOrOverlay();
      }
    },
    // 叠加或者替换
    replaceOrOverlay(model) {
      this.$refs["addForm"].validate(valid => {
        if (valid) {
          this.saveLoading = true;
          let obj = {
            createBy: this.addForm.createBy,
            createId: this.addForm.createId,
            oldCustomCode: this.addForm.oldCustomCode,
            newCustomCode: this.addForm.newCustomCode,
            model: this.addForm.model //1-覆盖 2-叠加
          };
          this.$http
            .clientChange_customCodeChange(obj)
            .then(({ data }) => {
              if (data.code == 1) {
                this.initData();
                this.handleClose();
                this.$message.success("变更成功");
                this.innerDialogVisible = false;
                this.saveLoading = false;
              } else {
                this.saveLoading = false;
                Msg.showErrorMsg(data.info);
              }
            })
            .catch(err => {
              console.log(err);
              this.saveLoading = false;
              Msg.showErrorMsg("变更失败");
            });
        }
      });
    },
    // 还原变更
    changeRecovery() {
      let selectRows = this.agGrid.gridOptions.api.getSelectedRows();
      if (selectRows.length == 0) {
        this.$alert(`提示：请选择你需要还原的数据`, {
          showClose: false,
          confirmButtonText: "确定",
          customClass: "alertPrompt"
        });
        return;
      } else {
        this.$confirm(`确定还原吗?`, "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消"
        }).then(() => {
          // 调用还原接口
          if (selectRows[0].state == 1) {
            let obj = {
              id: selectRows[0].id,
              userId: this.$global.user.id,
              userName: this.$global.user.employeeName
            };
            this.$http
              .clientChange_undoCustomCodeChange(obj)
              .then(({ data }) => {
                if (data.code == 1) {
                  this.$message.success(data.info);
                } else {
                  Msg.showErrorMsg(data.info);
                }
                this.initData();
              })
              .catch(e => {
                Msg.showErrorMsg("还原失败");
              });
          } else {
            Msg.showPopMsg("当前变更状态为已撤销");
          }
        });
      }
    },
    // 操作人初始化
    initOperator() {
      this.addForm.createId = this.$global.user.id;
      this.addForm.createBy = this.$global.user.employeeName;
    },
    // 打开引入客户数据弹窗
    showImportDialog(isOldCustomCode) {
      this.isOldCustomCode = isOldCustomCode;
      this.importDialogVisible = true;
    },
    // 获取选择数据
    getSelectedValue(data) {
      if (this.isOldCustomCode) {
        // 旧编码
        this.addForm.oldCustomName = data[0].customName;
        if (data[0].customCode == this.addForm.newCustomCode) {
          Msg.showErrorMsg("新旧编码不能一致");
          return;
        }
        this.addForm.oldCustomCode = data[0].customCode;
      } else {
        this.addForm.newCustomName = data[0].customName;
        if (data[0].customCode == this.addForm.oldCustomCode) {
          Msg.showErrorMsg("新旧编码不能一致");
          return;
        }
        this.addForm.newCustomCode = data[0].customCode;
      }
      console.log();
      this.handleimportDialogVisible();
    },
    handleimportDialogVisible() {
      this.importDialogVisible = false;
    },

    handleSizeChange(val) {
      this.pageInfo.pageSize = val;
      this.initData();
    },
    handleCurrentChange(val) {
      this.pageInfo.current = val;
      this.initData();
    },
    changeTabs(tab) {
      console.log(tab.index);
      this.innerGrid.rowData = this.tabList[tab.index].sameQuotaList;
    },
    // 叠加权限
    authAdd() {
      let roles = utils.getSession("userData").roles;
      let flag = false;
      roles.forEach(val => {
        if (val.code == "cap_admin_role") {
          flag = true;
        }
      });
      return flag
    }
  },
  beforeMount() {
    this.initTable();
    this.initAuthBtn();
  },
  mounted() {
    this.initData();
    this.initOperator();
  }
};
</script>
<style lang="less">
.el-dialog {
  .el-tabs__content {
    position: relative;
    padding: 0px !important;
    top: 0px;
    bottom: 0px;
    left: 0px;
    right: 0px;
  }
}
</style>