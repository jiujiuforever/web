<template>
  <!-- 枚举管理 -->
  <div class="m-view-companyManager m-window">
    <div class="companyManager-content" ref="box">
      <!--  按钮+{ 表格 - 翻页)}-->
      <div class="content-result-table" ref="tableRight">
        <div class="button-group">
          <el-row :gutter="10">
            <el-col :span="4">
              <el-select
                @change="checkoutData"
                v-model="serachCondiction.type"
                placeholder="选择枚举类型"
              >
                <el-option
                  v-for="item in [{ type: '', typeCn: '所有分类' }, ...selectData.typeList]"
                  :key="item.type"
                  :label="item.typeCn"
                  :value="item.type"
                ></el-option>
              </el-select>
            </el-col>
            <el-col :span="4">
              <el-input
                maxlength="60"
                placeholder="输入需要查询的项目"
                v-model="serachCondiction.codeCn"
                clearable
                @keyup.enter.native="checkoutData"
              ></el-input>
            </el-col>

            <!-- <el-col :span="2" class="pull-right">
              <el-button type="primary" @click="getType">刷新</el-button>
            </el-col>-->
            <el-col :span="2" class="pull-right">
              <el-button
                type="primary"
                @click="cancellation"
                v-if="btnStatus.enumStop"
              >{{ cancellationOrEnabel }}</el-button>
            </el-col>
            <el-col :span="2" class="pull-right">
              <el-button type="primary" @click="editCategory" v-if="btnStatus.enumEdit">编辑</el-button>
            </el-col>
            <el-col :span="2" class="pull-right">
              <el-button type="primary" @click="addCategory" v-if="btnStatus.enumAdd">新增</el-button>
            </el-col>
            <el-col :span="2" class="pull-right">
              <el-button type="primary" @click="checkoutData" v-if="btnStatus.enumSearch">查询</el-button>
            </el-col>
            <el-col :span="2.5" class="pull-right">
              <el-checkbox v-model="serachCondiction.switchStopOrNot" @change="showStopOrNot">显示停用</el-checkbox>
            </el-col>
          </el-row>
        </div>
        <div class="result-table">
          <div class="table">
            <ag-grid-vue
              class="m-agTableContent ag-theme-balham"
              :gridOptions="agGridData.gridOptions"
              :columnDefs="agGridData.columnDefs"
              :suppressDragLeaveHidesColumns="true"
              :suppressMakeColumnVisibleAfterUnGroup="true"
              :rowData="agGridData.rowData"
              rowSelection="single"
              @gridReady="onGridReady"
              @selectionChanged="onRowSelected"
              v-loading="loading"
            ></ag-grid-vue>
          </div>
          <div class="pageNavigator">
            <el-pagination
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
              :current-page="pagination.currentPage"
              :page-sizes="pagination.pageSizes"
              :page-size="pagination.pageSize"
              :layout="pagination.layout"
              :total="pagination.totalCount"
            ></el-pagination>
          </div>
        </div>
      </div>
    </div>
    <!-- 自定义项变更弹窗 开始 -->
    <el-dialog
      :title="dialog.title"
      :visible.sync="dialog.switchShow"
      width="50%"
      v-dialogDrag
      :close-on-click-modal="false"
    >
      <el-form label-width="110px" :model="categoryModel" ref="companyCategoryref">
        <el-row>
          <el-col :span="11">
            <el-form-item
              label="类别"
              prop="type"
              :rules="[{ required: true, message: '类别不能为空', trigger: 'change' }]"
            >
              <el-select v-model="categoryModel.type" placeholder="选择枚举类型" :disabled="false">
                <el-option
                  v-for="item in selectData.typeList"
                  :key="item.type"
                  :label="item.typeCn"
                  :value="item.type"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>

          <el-col :span="11">
            <el-form-item label="编码格式">
              <el-radio v-model="categoryModel.formatType" label="1">英文</el-radio>
              <el-radio v-model="categoryModel.formatType" label="2">数字</el-radio>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="11">
            <el-form-item
              label="分类编码"
              prop="code"
              :rules="[{ required: true, trigger: 'blur' , validator: validateCode}]"
            >
              <el-input
                style="width:100%"
                show-word-limit
                maxlength="30"
                type="text"
                placeholder="分类编码"
                v-model.trim="categoryModel.code"
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="11">
            <el-form-item
              label="分类名称"
              prop="codeCn"
              :rules="[{ required: true, message: '分类名称不能为空', trigger: 'change' }]"
            >
              <el-input
                style="width:100%"
                show-word-limit
                maxlength="15"
                type="text"
                v-model.trim="categoryModel.codeCn"
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="11">
            <el-form-item label="排序" prop="sortNum">
              <el-input
                style="width:100%"
                show-word-limit
                maxlength="4"
                type="text"
                @change="numInput"
                v-model.trim="categoryModel.sortNum"
              ></el-input>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="22">
            <el-form-item label="备注" prop="remark">
              <el-input
                style="width:100%"
                show-word-limit
                maxlength="40"
                type="text"
                v-model.trim="categoryModel.remark"
              ></el-input>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="cancel">取消</el-button>
        <el-button type="primary" @click="save">保存</el-button>
      </span>
    </el-dialog>
  </div>
</template>


<script>
import messageAlert from "@/public/message.js";
import gridOptions from "lesso-common/public/gridOptions";
import authorize1 from "@/public/authorize1";
export default {
  data() {
    return {
      name: "enumManage",
      enableNo: false,
      // 修改对话框
      dialog: {
        title: "",
        switchShow: false,
        operateType: "add"
      },
      // 类别模型
      categoryModel: {
        id: "",
        type: "",
        code: "",
        codeCn: "",
        sortNum: "",
        state: "",
        remark: "",
        formatType: "1"
      },
      // 表格模型
      agGridData: {
        rowData: [],
        columnDefs: [],
        gridOptions: {},
        gridApi: {},
        columnApi: {}
      },
      // 翻页模型
      pagination: {
        pageSizes: [10, 20, 30, 50, 100],
        pageSize: 30,
        layout: "total, sizes, prev, pager, next, jumper",
        totalCount: 0,
        currentPage: 1
      },
      // 搜索条件
      serachCondiction: {
        type: "",
        codeCn: "",
        switchStopOrNot: false
      },
      selectData: {
        typeList: []
      },
      cancellationOrEnabel: "停用",
      // loading
      loading: true,
      // 初始化按钮权限
      btnStatus: {
        enumSearch: false,
        enumAdd: false,
        enumEdit: false,
        enumStop: false
      }
    };
  },
  methods: {
    // 按钮动作--保存/修改动作
    save() {
      let that = this;
      this.$refs.companyCategoryref.validate(res => {
        if (res) {
          let data = Object.assign({}, that.categoryModel);
          let { userId, userName } = that.$global;
          if (that.dialog.operateType == "edit") {
            data.updateBy = userName;
            data.updateId = userId;
            that.update(data);
          } else {
            delete data.id;
            data.createBy = userName;
            data.createId = userId;
            that.add(data);
          }
        }
      });
    },

    // 请求--新增
    add(data) {
      let that = this;
      return new Promise((resolve, reject) => {
        that.$http
          .enumManage_saveEnum(data)
          .then(res => {
            that.dialog.switchShow = false;
            if (res.data.code == 1) {
              messageAlert.showSuccessMsg("修改成功");
              that.getDatailList();
              resolve();
            } else {
              messageAlert.showPopMsg(res.data.info);
              reject();
            }
          })
          .catch(res => {
            messageAlert.showErrorMsg(res.data.info);
            reject();
          });
      });
    },
    // 请求--修改
    update(data) {
      let that = this;
      return new Promise((resolve, reject) => {
        that.$http
          .enumManage_updateEnum(data)
          .then(res => {
            that.dialog.switchShow = false;
            if (res.data.code == 1) {
              messageAlert.showSuccessMsg("修改成功");
              that.getDatailList();
              resolve();
            } else {
              messageAlert.showPopMsg(res.data.info);
              reject();
            }
          })
          .catch(res => {
            messageAlert.showErrorMsg(res.data.info);
            reject();
          });
      });
    },
    // 专门校验编码
    validateCode(rule, value, callback) {
      // 英文校验
      if (this.categoryModel.formatType == "1") {
        let rex = /^[a-zA-Z_]+$/;
        if (rex.test(value)) {
          callback();
        } else {
          callback(new Error("输入英文字母"));
        }
      }
      // 数字校验
      if (this.categoryModel.formatType == "2") {
        let rex = /^\d+$/;
        if (rex.test(value)) {
          callback();
        } else {
          callback(new Error("输入数字"));
        }
      }
    },
    // 控制--取消
    cancel() {
      this.dialog.switchShow = false;
    },
    // 直接停用（停用）， 修改的另外一种形式
    cancellation() {
      if (!this.agGridData.gridApi.getSelectedRows().length) {
        this.$alert(`提示：请选择你需要${this.cancellationOrEnabel}的数据`, {
          showClose: false,
          confirmButtonText: "确定",
          customClass: "alertPrompt"
        });
        return;
      }
      this.dialog.operateType = "edit";
      let data = Object.assign({}, this.categoryModel);
      data.state = data.state == "0" ? "1" : "0";
      let { userId, userName } = this.$global;
      data.updateBy = userName;
      data.updateId = userId;
      this.update(data);
    },
    // 新增分类
    addCategory() {
      let that = this;
      Object.assign(this.categoryModel, {
        id: "",
        type: "",
        code: "",
        codeCn: "",
        sortNum: "",
        remark: "",
        state: "1"
      });
      this.dialog.operateType = "add";
      this.dialog.title = "新增分类";
      this.dialog.switchShow = true;
      this.$nextTick(res => {
        that.$refs.companyCategoryref.clearValidate();
      });
    },
    // 控制--表格修改
    editCategory() {
      if (!this.agGridData.gridApi.getSelectedRows().length) {
        this.$alert(`提示：请选择你需要编辑的数据`, {
          showClose: false,
          confirmButtonText: "确定",
          customClass: "alertPrompt"
        });
        return;
      }
      let selectData = this.agGridData.gridApi.getSelectedRows()[0];
      this.categoryModel.id = selectData.id;
      this.categoryModel.type = selectData.type;
      this.categoryModel.code = selectData.code;
      this.categoryModel.formatType = /^\d+$/.test(selectData.code) ? "2" : "1";
      this.categoryModel.codeCn = selectData.codeCn;
      this.categoryModel.sortNum = selectData.sortNum;
      this.categoryModel.remark = selectData.remark;
      this.categoryModel.state = selectData.state;

      if (selectData.type.toLowerCase() == "base") {
        this.enableNo = true;
      } else {
        this.enableNo = false;
      }
      this.dialog.title = "分类修改";
      this.dialog.switchShow = true;
      this.dialog.operateType = "edit";
      this.$nextTick(res => {
        this.$refs.companyCategoryref.clearValidate();
      });
    },
    // 请求--获取表格数据
    getDatailList() {
      let that = this;
      let data = {
        entity: {
          type: this.serachCondiction.type,
          codeCn: this.serachCondiction.codeCn,
          state: this.serachCondiction.switchStopOrNot ? "0" : "1"
        },
        current: this.pagination.currentPage,
        size: this.pagination.pageSize
      };
      this.$http
        .enumManage_getEnumList(data)
        .then(res => {
          that.agGridData.rowData = res.data.rows;
          that.pagination.totalCount = res.data.total;
          that.dialog.operateType = "add";
          that.getType();
          that.loading = false;
        })
        .catch(res => {
          messageAlert.showErrorMsg("网络请求出错，检查网络");
        });
    },
    // 请求--获取枚举类别
    getType() {
      let that = this;
      this.$http
        .enumManage_getEnumType()
        .then(res => {
          if (res.data.code == 1) {
            that.selectData.typeList = res.data.rows;
          } else {
            messageAlert.showErrorMsg(res.data.info);
          }
        })
        .catch(res => {
          messageAlert.showErrorMsg("网络请求出错，检查网络");
        });
    },
    // 控制--查询接口
    checkoutData() {
      this.pagination.currentPage = 1;
      this.getDatailList();
    },
    //行选中
    onRowSelected(params) {
      let selectRow = params.api.getSelectedRows();
      if (selectRow.length == 1) {
        this.categoryModel.id = selectRow[0].id;
        this.categoryModel.type = selectRow[0].type;
        this.categoryModel.code = selectRow[0].code;
        this.categoryModel.codeCn = selectRow[0].codeCn;
        this.categoryModel.sortNum = selectRow[0].sortNum;
        this.categoryModel.state = selectRow[0].state;
        this.categoryModel.remark = selectRow[0].remark;
      } else {
        this.categoryModel.id = "";
        this.categoryModel.type = "";
        this.categoryModel.code = "";
        this.categoryModel.codeCn = "";
        this.categoryModel.sortNum = "";
        this.categoryModel.state = "";
        this.categoryModel.remark = "";
      }
    },
    // ag-grid表格渲染完成回调
    onGridReady(params) {
      this.agGridData.gridApi = params.api;
      this.agGridData.columnApi = params.columnApi;
      this.agGridData.gridApi.sizeColumnsToFit();
    },
    // 配置--表格表头初始化
    initTable() {
      // this.agGridData.gridOptions = Object.assign(gridOptions(), {
      //   enableFilter: false,
      //   enableSorting: false,
      //   singleClickEdit: true,
      //   suppressContextMenu: true, //取消右键显示菜单
      //   context: {
      //     componentParent: this
      //   }
      // });
      this.agGridData.gridOptions = Object.assign(
        {},
        {
          rowMultiSelectWithClick: true,
          suppressCellSelection: true,
          suppressContextMenu: true, //取消右键显示菜单
          context: {
            componentParent: this
          }
        }
      );
      this.agGridData.columnDefs = [
        {
          headerCheckboxSelectionFilteredOnly: true,
          checkboxSelection: true,
          width: 50
        },

        {
          headerName: "分类编号",
          field: "code"
        },
        {
          headerName: "分类名称",
          field: "codeCn"
        },
        {
          headerName: "排序",
          field: "sortNum"
        },
        {
          headerName: "备注",
          field: "remark"
        }
        // {
        //   headerName: "状态",
        //   field: "state",
        //   valueFormatter: val => {
        //     if (val.data.state == 0) {
        //       return "停用";
        //     } else {
        //       return "启用";
        //     }
        //   }
        // },
        // {
        //   headerName: "创建人",
        //   field: "createBy"
        // },
        // {
        //   headerName: "修改人",
        //   field: "updateBy"
        // }
      ];
    },
    // 翻页--页大小
    handleSizeChange(val) {
      this.pagination.pageSize = val;
      this.getDatailList();
    },
    // 翻页--页码
    handleCurrentChange(val) {
      this.pagination.currentPage = val;
      this.getDatailList();
    },
    // 按钮--checked是否选择显示停用
    showStopOrNot(val) {
      this.pagination.currentPage = 1;
      this.serachCondiction.switchStopOrNot = val;
      this.cancellationOrEnabel = val ? "启用" : "停用";
      this.getDatailList();
    },
    // 校验--要求为数值的框输入框
    numInput(val) {
      // 要求为数值的框输入框
      if (parseInt(val).toString() == "NaN") {
        this.categoryModel.sortNum = 0;
      } else {
        this.categoryModel.sortNum = parseInt(val);
      }
    },
         // 初始化按钮权限
    initAuthBtn() {
      authorize1.getBtnAuth(this.name, this.btnStatus);
    }
  },
  beforeMount() {
    // 获取大类别
    this.getType();
    // 初始化表格
    this.initTable();
    this.getDatailList();
    this.initAuthBtn();
  },
  mounted() {}
};
</script>
<style lang="less" scoped>
.m-view-companyManager {
  overflow: auto;
  .companyManager-content {
    width: 99%;
    height: 100%;
    justify-content: right;
    display: flex;
    min-width: 600px;
    position: relative;
    .content-result-table {
      flex-grow: 1;
      flex-direction: column;
      padding-left: 20px;
      .button-group {
        height: 40px;
        line-height: 40px;
        .pull-right {
          float: right;
        }
      }
      .result-table {
        margin-top: 10px;
        height: ~"calc(100% - 52px)";
        .table {
          position: relative;
          height: ~"calc(100% - 40px)";
        }
        .pageNavigator {
          margin-top: 10px;
          .el-pagination {
            padding: 0px 20px;
            font-weight: normal;
            text-align: right;
          }
        }
      }
    }
  }
}
</style>
