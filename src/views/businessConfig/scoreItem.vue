<!-- 积分项管理 -->
<template>
  <div class="m-view-scoreItem m-window">
    <!-- 页面主体内容 -->
    <div class="m-rightContent">
      <div class="m-condition">
        <el-row :gutter="10">
          <el-form :inline-message="true" label-position="left" @submit.native.prevent>
            <el-col :span="3">
              <el-select value-key="id" v-model="searchForm.roleCode" placeholder="评价部门" clearable>
                <el-option
                  v-for="(departitem, index) in departOptions"
                  :key="index"
                  :label="departitem.name"
                  :value="departitem.code"
                ></el-option>
              </el-select>
            </el-col>
            <el-col :span="3">
              <el-select value-key="id" v-model="searchForm.quotaType" placeholder="录入频率" clearable>
                <el-option
                  v-for="(assessitem, index) in assessOptions"
                  :key="index"
                  :label="assessitem.label"
                  :value="assessitem.value"
                ></el-option>
              </el-select>
            </el-col>
            <el-col :span="4">
              <el-input
                placeholder="输入编码/名称"
                v-model.trim="searchForm.keyWord"
                clearable
                maxlength="20"
                @keyup.native.enter="search(selectedNodeId,1)"
              ></el-input>
            </el-col>
            <el-col :span="2" class="pull-right">
              <el-button
                type="primary"
                @click="changeEnableState"
                v-if="btnStatus.scoreStop"
              >{{ searchForm.state == 1 ? "停用" : "启用" }}</el-button>
            </el-col>
            <el-col :span="2" class="pull-right">
              <el-button
                type="primary"
                @click="editScoreItem(0)"
                :disabled="searchForm.state == 0"
                v-if="btnStatus.scoreCheck"
              >查看</el-button>
            </el-col>
            <el-col :span="2" class="pull-right">
              <el-button type="primary" @click="editScoreItem(1)" :disabled="searchForm.state == 0" v-if="btnStatus.scoreEdit">编辑</el-button>
            </el-col>
            <el-col :span="2" class="pull-right">
              <el-button
                type="primary"
                @click="addNewScoreItem"
                :disabled="searchForm.state == 0"
                v-if="btnStatus.scoreAdd"
              >新增</el-button>
            </el-col>
            <el-col :span="2" class="pull-right">
              <el-button
                type="primary"
                @click="search(selectedNodeId,1)"
                v-if="btnStatus.scoreSearch"
              >查询</el-button>
            </el-col>
            <el-col :span="2" class="pull-right">
              <el-checkbox
                v-model="searchForm.state"
                true-label="0"
                false-label="1"
                @change="changeState"
              >显示停用</el-checkbox>
            </el-col>
          </el-form>
        </el-row>
      </div>
      <div class="m-agTable m-bottom">
        <ag-grid-vue
          class="m-agTableContent ag-theme-balham"
          :columnDefs="columnDefs"
          rowSelection="multiple"
          :gridOptions="gridOptions"
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
    <!-- 新增或者编辑弹窗 -->
    <setScoreItemDialog
      v-if="dialogVisible"
      :dialogVisible="dialogVisible"
      @dialogClose="dialogVisible = false"
      @saveSuccess="search(selectedNodeId)"
      :editTitle="editTitle"
      :classfiyOptions="treeData"
      :scoreDetail="scoreDetail"
      :oaList="oaList"
      :onlyRead="readOnly"
    ></setScoreItemDialog>
  </div>
</template>

<script>
import utils from "@/public/utils";
import localeText from "@/i18n/agGridText";
import setScoreItemDialog from "./common/setScoreItemDialog";
import gridOptions from "lesso-common/public/gridOptions";
import Msg from "@/public/message";
import _APIS from "@/api";
import authorize1 from "@/public/authorize1";
export default {
  data() {
    return {
      name: "scoreItem",
      // 查询过滤条件
      searchForm: {
        keyWord: "",
        state: 1,
        quotaType: "",
        roleCode: ""
      },
      // 新增或编辑积分项弹窗标题
      editTitle: "",
      editScoreTitle: "积分项导入",
      loading: false,
      dialogVisible: false,
      // 表格配置
      columnDefs: [],
      gridOptions: {},
      rowData: [],
      // 分类树数据
      treeData: [],
      //   分页相关
      pageInfo: {
        size: 30,
        current: 1,
        total: 0
      },
      //   当前选中树节点Id
      selectedNodeId: 0,
      // 积分项详情

      scoreDetail: {},
      // 部门选项列表
      departOptions: [],
      // 积分类型选项
      assessOptions: [],
      //oa流程下拉选项
      oaList: [],
      // 中断递归的标识
      btnStatus: {
        scoreAdd: false,
        scoreEdit: false,
        scoreCheck: false,
        scoreSearch: false,
        scoreStop: false
      },
      allDeptCode: "",
      // 查看
      readOnly: false
    };
  },
  props: {
    addTab: {
      type: Function
    }
  },
  methods: {
    //查询
    search(classId, flag) {
      let roleCode;
      if (this.searchForm.roleCode) {
        roleCode = this.searchForm.roleCode;
      } else {
        roleCode = this.allDeptCode;
      }
      if (flag) this.pageInfo.current = 1;
      const { current, size } = this.pageInfo;
      const { keyWord, state, quotaType } = this.searchForm;
      let params = {
        entity: {
          keyword: keyWord,
          state,
          parentClassId: classId,
          quotaType,
          roleCode: roleCode,
          userId: this.$global.user.id,
          userName: this.$global.user.loginName
        },
        current,
        size
      };
      this.loading = true;
      this.$http
        .scoreItem_getScoreList(params)
        .then(({ data }) => {
          this.loading = false;
          if (data.code == 1) {
            this.gridOptions.api.setRowData(data.rows);
            this.pageInfo.total = data.total;
          } else {
            Msg.showErrorMsg(data.info);
          }
        })
        .catch(err => {
          this.loading = false;
          Msg.showErrorMsg("获取列表数据失败");
        });
    },
    //新增积分项
    addNewScoreItem() {
      // if (!this.searchForm.roleCode) {
      //   Msg.showErrorMsg("用户缺乏授权部门");
      //   return;
      // }
      this.editTitle = "新增积分项";
      this.dialogVisible = true;
    }, 
    //编辑积分项
    editScoreItem(code) {
      if(code){
        this.readOnly = false
      } else {
        this.readOnly = true
      }
      this.editTitle = "编辑积分项";
      let rows = this.gridOptions.api.getSelectedRows();
      if (!rows || rows.length < 1) {
        this.$alert("提示：请选择需要编辑的数据", {
          showClose: false,
          confirmButtonText: "确定",
          customClass: "alertPrompt"
        });
        return;
      } else if (rows.length > 1) {
        this.$alert("提示：一次只能编辑一条数据", {
          showClose: false,
          confirmButtonText: "确定",
          customClass: "alertPrompt"
        });
        return;
      } else {
        this.scoreDetail = rows[0];
        this.dialogVisible = true;
      }
    },
    //停用或者启用数据
    changeEnableState() {
      let rows = this.gridOptions.api.getSelectedRows();
      if (!rows || rows.length < 1) {
        this.$alert("提示：请选择需要操作的数据", {
          showClose: false,
          confirmButtonText: "确定",
          customClass: "alertPrompt"
        });
        return;
      }
      // let ids = rows.map(row => {
      //   return row.id;
      // });
      let arr = [];
      rows.forEach(val => {
        arr.push({ id: val.id });
      });
      let msg =
        this.searchForm.state == 1
          ? "停用后该积分项依然计入评分项,是否确认停用?"
          : "是否确认启用该积分项?";
      this.$confirm(msg, "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消"
      })
        .then(_ => {
          arr.map(v => {
            (v.state = this.searchForm.state == 1 ? 0 : 1),
              (v.updateBy = this.$global.user.employeeName),
              (v.updateId = this.$global.user.id);
          });
          this.loading = true;
          this.$http
            // .scoreItem_updateScoreState(params)
            .scoreItem_newupdateScoreState(arr)
            .then(({ data }) => {
              this.loading = false;
              if (data.code == 1) {
                Msg.showSuccessMsg(
                  `提示：成功${this.searchForm.state == 1 ? "停用" : "启用"}${
                    rows.length
                  }条数据`
                );
                this.search(this.selectedNodeId);
              } else {
                Msg.showErrorMsg(data.info);
              }
            })
            .catch(err => {
              Msg.showErrorMsg(`${data.info ? data.info : "操作失败"}`);
            });
        })
        .catch(_ => {
          this.$message({
            type: "info",
            message: "已取消操作"
          });
        });
    },
    // 显示停用或启用
    changeState(val) {
      this.search(this.selectedNodeId, 1);
    },
    // 每页显示条数改变回调
    handleSizeChange(val) {
      this.pageInfo.current = 1;
      this.pageInfo.size = val;
      this.search(this.selectedNodeId);
    },
    // 页码改变
    handleCurrentChange(val) {
      this.pageInfo.current = val;
      this.search(this.selectedNodeId);
    },
    // 获取各种下拉框的枚举值
    getEnumList(type, flag) {
      let data = {
        current: 1,
        entity: {
          type,
          state: 1
        },
        size: 999
      };
      return new Promise((resolve, reject) => {
        _APIS
          .getEnumList(data)
          .then(res => {
            const { code, rows, info } = res.data;
            if (code == 1) {
              rows.map(v => {
                v.label = v.codeCn;
                if (flag) {
                  v.value = v.code - 0;
                } else {
                  v.value = v.code;
                }
              });
              resolve(rows);
            } else {
              reject(info);
            }
          })
          .catch(err => {
            Msg.showErrorMsg("获取数据失败");
          });
      });
    },
    // 获取各种下拉框的部门枚举值
    getRoleGroup() {
      return new Promise((resolve, reject) => {
        let that = this;
        let obj = {
          userId: this.$global.user.id
        };
        this.$http
          .ScoreInput_getDeparmentAuth(obj)
          .then(({ data }) => {
            if (data.code == 1) {
              if (data.rows.length == 0) {
                Msg.showErrorMsg("用户缺乏授权部门");
                this.loading = false;
                return;
              }
              this.departOptions = data.rows;
              this.allDeptCode = data.rows
                .map(val => {
                  return val.code;
                })
                .join(",");
              // this.searchForm.roleCode = data.rows[0].code;
              resolve();
            } else {
              Msg.showErrorMsg("获取授权部门失败");
              this.loading = false;
              reject();
            }
          })
          .catch(err => {
            console.log(err);
            Msg.showErrorMsg("获取授权部门失败");
            this.loading = false;
            reject();
          });
      });
    },
    // 获取各种下拉框的录入频率枚举值
    getQuotaType() {
      this.getEnumList("quota_type", true)
        .then(res => {
          this.assessOptions = res;
          this.search(this.selectedNodeId, 1);
        })
        .catch(err => {
          Msg.showErrorMsg(err);
          // Msg.showErrorMsg("获取积分类型失败");
        });
    },
    // 初始化按钮权限
    initAuthBtn() {
      authorize1.getBtnAuth(this.name, this.btnStatus);
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
          headerName: "编码",
          field: "quotaCode",
          width: 160,
          tooltipField: "quotaCode"
        },
        {
          headerName: "名称(字段描述)",
          field: "quotaName",
          width: 300,
          tooltipField: "quotaName"
        },
        {
          headerName: "录入频率",
          field: "quotaTypeCn",
          width: 120,
          tooltipField: "quotaTypeCn"
        },
        {
          headerName: "最高分",
          field: "up",
          width: 120,
          tooltipField: "up"
        },
        {
          headerName: "最低分",
          field: "down",
          width: 120,
          tooltipField: "down"
        },
        {
          headerName: "整数倍",
          field: "chushu",
          width: 120,
          tooltipField: "chushu"
        },
        {
          headerName: "评价部门",
          field: "roleCode",
          width: 120,
          tooltipField: "roleCode",
          valueGetter: params => {
            let stateType = params.data.roleCode;
            if (stateType) return params.data.roleName;
          }
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
    // 初始化下拉框
    async initSelected() {
      await this.getRoleGroup();
      this.getQuotaType();
    }
  },
  components: {
    setScoreItemDialog
  },
  beforeMount() {
    this.initTable();
    this.initAuthBtn();
    console.log(this.btnStatus);
  },
  mounted() {
    this.initSelected();
  }
};
</script>
<style lang="less" scoped>
.m-view-scoreItem {
  .m-leftTree {
    position: absolute;
    left: 0;
    width: 300px;
    top: 0;
    bottom: 0;

    .filter-tree {
      top: 48px;
    }
  }

  .m-rightContent {
    left: 0px;
  }

  .m-agTable {
    position: absolute;
    left: 0;
    right: 0;
    top: 47px;
    bottom: 35px;
    .m-agTableContent .ag-theme-balham {
      height: 100%;
    }
  }

  .m-pagination {
    position: absolute;
    bottom: 0;
    right: 0;
  }
}
</style>
