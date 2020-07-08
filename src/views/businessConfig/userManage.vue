<!-- 用户管理界面 -->
<template>
  <div>
    <div class="m-view-userManage m-window" v-show="showMasterTable">
      <div class="m-condition">
        <el-row :gutter="10">
          <el-col :span="4">
            <el-input
              v-model.trim="searchForm.name"
              placeholder="请输入工号/姓名"
              clearable
              maxlength="20"
              @keyup.enter.native="search(1)"
            ></el-input>
          </el-col>
          <el-col :span="4">
            <el-select v-model="searchForm.companyCode" filterable placeholder="选择公司" clearable>
              <el-option
                v-for="(item,index) in selectCompanyList"
                :key="index"
                :label="item.companyName"
                :value="item.companyCode"
              ></el-option>
            </el-select>
          </el-col>
          <el-col :span="3">
            <el-select value-key="id" v-model="searchForm.roleCode" placeholder="评价部门" clearable>
              <el-option
                v-for="(departitem, index) in selectRoleList"
                :key="index"
                :label="departitem.codeCn"
                :value="departitem.code"
              ></el-option>
            </el-select>
          </el-col>
          <el-col :span="2" class="pull-right">
            <el-button type="primary" @click="enableUser" v-if="btnStatus.userStop">
              {{
              searchForm.state ? "停用" : "启用"
              }}
            </el-button>
          </el-col>
          <el-col :span="2" class="pull-right">
            <el-button
              type="primary"
              @click="editUser"
              :disabled="searchForm.state==0"
              v-if="btnStatus.userEdit"
            >修改</el-button>
          </el-col>
          <el-col :span="2" class="pull-right">
            <el-button
              type="primary"
              @click="importUser"
              :disabled="searchForm.state==0"
              v-if="btnStatus.userAdd"
            >引入</el-button>
          </el-col>
          <el-col :span="2" class="pull-right">
            <el-button
              type="primary"
              @click="showMasterTable = false"
              :disabled="searchForm.state==0"
              v-if="btnStatus.userAdd"
            >批量导入</el-button>
          </el-col>
          <el-col :span="2" class="pull-right">
            <el-button type="primary" @click="search(1)" v-if="btnStatus.userSearch">查询</el-button>
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
          @prev-click="handlePrevClick"
          @next-click="handleNextClick"
          :current-page="pageInfo.current"
          :page-sizes="[30, 50, 100, 150, 200]"
          :page-size="pageInfo.size"
          layout="total, sizes, prev, pager, next, jumper"
          :total="pageInfo.total"
        ></el-pagination>
      </div>
    </div>
    <!-- 用户引入、修改弹窗 -->
    <el-dialog
      :title="editTitle"
      v-if="dialogVisible"
      :visible.sync="dialogVisible"
      width="50%"
      :before-close="handleClose"
      v-dialogDrag
      :close-on-click-modal="false"
      :close-on-press-escape="false"
    >
      <el-form
        :model="ruleForm"
        ref="ruleForm"
        label-width="100px"
        class="demo-ruleForm"
        :rules="rules"
        v-loading="authCompanyLoaing"
      >
        <el-form-item label="工号" prop="sapNum">
          <el-input
            v-model="ruleForm.sapNum"
            placeholder="工号"
            clearable
            @focus="showImportDialog"
            disabled
          >
            <el-button
              slot="append"
              icon="el-icon-search"
              @click="showImportDialog"
              :disabled="addOrEdit"
            ></el-button>
          </el-input>
        </el-form-item>
        <el-form-item label="姓名" prop="employeeName">
          <el-input v-model="ruleForm.employeeName" placeholder="姓名" clearable disabled></el-input>
        </el-form-item>
        <el-form-item label="公司" prop="companyName">
          <el-input v-model="ruleForm.companyName" placeholder="公司" clearable disabled></el-input>
        </el-form-item>
        <el-form-item label="授权部门">
          <el-input
            class="showControl"
            v-model="ruleForm.roleName"
            placeholder="授权部门"
            @focus="departmentVisible = true"
            readonly
          ></el-input>
        </el-form-item>

        <el-form-item label="授权公司">
          <el-input
            :disabled="authCompanyDisabled"
            class="showControl"
            v-model="ruleForm.authCompanyName"
            placeholder="授权公司"
            @focus="authDialogVisible = true"
            readonly
          ></el-input>
        </el-form-item>

        <el-form-item label="授权客户">
          <el-input
            :disabled="authAgencyDisabled"
            class="showControl"
            v-model="ruleForm.showauthAgency"
            placeholder="授权客户"
            @focus="authAgencyDialogVisible = true"
            readonly
          ></el-input>
        </el-form-item>

        <el-form-item label="积分数据导入">
          <el-radio-group v-model="ruleForm.quotaAuth">
            <el-radio label="禁用"></el-radio>
            <el-radio label="启用"></el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="积分数据修改">
          <el-radio-group v-model="ruleForm.quotaAuth2">
            <el-radio label="禁用"></el-radio>
            <el-radio label="启用"></el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="handleClose" :disabled.sync="authCompanyLoaing">取消</el-button>
        <el-button type="primary" @click="saveData" :disabled.sync="authCompanyLoaing">保存</el-button>
      </span>
    </el-dialog>

    <!-- 选择引入用户数据弹窗 -->
    <importClientDialog
      :dialogVisible="importDialogVisible"
      title="引入用户"
      @setSelectedValue="getSelectedValue"
      @dialogClose="handleimportDialogVisible"
      v-if="importDialogVisible"
    ></importClientDialog>

    <!-- 选择授权公司弹窗 -->
    <authCompanyDialog
      v-if="authDialogVisible"
      :dialogVisible="authDialogVisible"
      :transferData="companyList"
      :selectedValue="ruleForm.authCompanyCode"
      @dailogClose="closeAuthCompany"
      @setAuthCompany="setAuthCompany"
    ></authCompanyDialog>

    <!-- 选择授权部门 -->
    <departmentDialog
      v-if="departmentVisible"
      :selectionOptions="roleOptions"
      :selectData="ruleForm.roleCode"
      @departmentailogClose="departmentailogClose"
      @confirmDepartment="confirmDepartment"
    ></departmentDialog>

    <!-- 选择授权客户 -->
    <authAgencyDialog
      v-if="authAgencyDialogVisible"
      :dialogVisible="authAgencyDialogVisible"
      :companyCode="this.ruleForm.authCompanyCode"
      :selectedValue="selectedValue"
      @dailogClose="closeAuthAgency"
      @setAuthAgency="setAuthAgency"
    ></authAgencyDialog>

    <!-- 批量导入 -->
    <importUserExcel v-show="!showMasterTable" @closeImportPlane="closeImportPlane"></importUserExcel>
  </div>
</template>

<script>
import localeText from "@/i18n/agGridText";
import importUserExcel from "./common/improtUserExcel";
import importClientDialog from "./common/importDataDialog";
import authCompanyDialog from "./common/authCompanyDialog";
import departmentDialog from "./common/departmentDialog";
import authAgencyDialog from "./common/authAgencyDialog";
import Msg from "@/public/message";
import authorize1 from "@/public/authorize1";
import utils from "@/public/utils";
export default {
  data() {
    return {
      name: "userManage",
      //* 这部分内容需要封装成对象， 不然难以阅读， 我就不改别人留下的东西了 */
      // 控制--公司授权使能
      authCompanyDisabled: true,
      // 控制--客户授权使能
      authAgencyDisabled: true,
      // 控制--用户按钮弹窗搜索
      addOrEdit: false,
      // 显示--引入弹窗是否
      dialogVisible: false,
      // 显示控制--引入用户数据弹窗
      importDialogVisible: false,
      // 部门控制--授权部门
      departmentVisible: false,
      // 显示控制--授权公司弹窗
      authDialogVisible: false,
      // 显示控制--授权客户弹窗
      authAgencyDialogVisible: false,
      // 查询条件
      searchForm: {
        name: "",
        state: 1, //1启用,0停用
        companyCode: "",
        roleCode: ""
      },
      // 引入用户表单
      ruleForm: {
        // 用户信息
        userId: "",
        sapNum: "",
        oaNum: "",
        employeeName: "",
        companyName: "",
        companyCode: "",
        // 部门信息
        roleCode: [],
        roleName: "",
        // 公司信息

        authDepartment: "", //授权部门
        authCompany: "", //数据传递的公司列表
        authCompanyCode:[],//授权公司编码列表
        authAgency: "", // 数据传递的已选客户列表
        showauthCompany: "", //展示出来的公司列表
        showauthAgency: "", //展示出来的客户列表
        ralUserCusCodeList: [],
        userCompanyAuthList: [],
        userAgencyAuthList: [],
        quotaAuth: "禁用",
        quotaAuth2: "禁用"
      },
      // 分页信息
      pageInfo: {
        current: 1,
        size: 30,
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
      // 校验规则
      rules: {
        sapNum: [{ required: true, message: "工号不能为空", trigger: "change" }]
      },
      //   角色下拉列表
      roleOptions: [],
      //   公司穿梭框数据
      companyList: [],
      //  已选择的公司id
      selectedIds: [],
      // 客户数据源
      agencyList: [],
      // 已选择经销商id
      selectedValue: [],

      // 设置编辑或引入弹窗标题
      editTitle: "新增用户页面",
      authCompanyLoaing: false,
      compareId: "",

      showMasterTable: true,
      // 下拉框公司列表
      selectCompanyList: [],
      // 下拉框部门列表
      selectRoleList: [],
      // 初始化按钮权限
      btnStatus: {
        userSearch: false,
        userAdd: false,
        userEdit: false,
        userStop: false
      }
    };
  },
  props: {
    addTab: {
      type: Function
    }
  },
  watch: {
    "ruleForm.userId": {
      handler(newval, oldval) {
        if (newval != "") {
          this.authCompanyDisabled = false;
          this.authAgencyDisabled = false;
        } else {
          this.authCompanyDisabled = true;
          this.authAgencyDisabled = true;
        }
      }
    }
  },
  mounted() {
    this.search(); //数据初始化
    this.getCompanyOptions(); //获取已启用公司
    this.getRoleGroup(); //获取已启用部门和下拉框的部门
    this.getCompanyList(); //用户ID获取下拉框公司列表
  },
  methods: {
    // 回调，关闭用户
    handleimportDialogVisible() {
      this.importDialogVisible = false;
      this.ruleForm = {};
      this.compareId = "";
    },
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
    handlePrevClick(val) {
      this.pageInfo.current = val;
    },
    handleNextClick(val) {
      this.pageInfo.current = val;
    },
    /**分页相关事件结束**/
    // 获取已启用公司数据
    getCompanyOptions() {
      let params = {
        entity: {
          keyword: "",
          state: 1
        },
        current: 1,
        size: 10000
      };
      this.$http
        .companyManage_getCompanyList(params)
        .then(({ data }) => {
          if (data.code == 1) {
            data.rows.map(ele => {
              ele.CodePlusName = ele.companyCode + "" + ele.companyName;
              return;
            });
            this.companyList = data.rows;
          } else {
            Msg.showErrorMsg(data.info);
          }
        })
        .catch(err => {
          Msg.showErrorMsg("获取数据失败");
        });
    },
    // 获取已启用部门
    getRoleGroup() {
      let data = {
        current: 1,
        entity: {
          type: "role_group",
          state: 1
        },
        size: 999
      };
      this.$http
        .getEnumList(data)
        .then(res => {
          const { code, rows, info } = res.data;
          if (code == 1) {
            this.selectRoleList = rows;
            // rows.map(v => {
            //   v.label = v.codeCn;
            //   v.value = v.code;
            // });
            this.roleOptions = rows;
          } else {
            Msg.showErrorMsg(info);
          }
        })
        .catch(err => {
          Msg.showErrorMsg("获取部门数据失败");
        });
    },
    // 查询列表数据
    search(flag) {
      if (flag) this.pageInfo.current = 1;
      const { state, name, companyCode, roleCode } = this.searchForm;
      const { current, size } = this.pageInfo;
      let params = {
        entity: {
          keyword: name,
          state,
          companyCode,
          roleCode
        },
        current,
        size
      };
      this.loading = true;
      this.$http
        .userManage_getUserList(params)
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
          this.loading = false;
          Msg.showErrorMsg(`获取用户数据失败!`);
        });
    },
    // 状态改变回调
    changeState(val) {
      this.search(1);
    },
    // 引入用户
    importUser() {
      this.addOrEdit = false;
      this.editTitle = "新增用户页面";
      this.dialogVisible = true;
      // 重置数据
      this.selectedIds = [];
      this.selectedValue = [];
    },
    // 编辑用户
    async editUser() {
      this.addOrEdit = true;
      let rows = this.gridOptions.api.getSelectedRows();
      if (rows.length == 0 || rows.length > 1) {
        this.$alert(`提示：请选择一条你需要修改的数据`, {
          showClose: false,
          confirmButtonText: "确定",
          customClass: "alertPrompt"
        });
        return;
      }

      this.ruleForm = {
        ...rows[0],
        authCompanyCode:
          rows[0].authCompanyCode != ""
            ? rows[0].authCompanyCode.split(",")
            : [],
        roleCode: rows[0].roleCode != "" ? rows[0].roleCode.split(",") : [],
        employeeName: rows[0].userName,
        quotaAuth: rows[0].quotaAuth ? "启用" : "禁用",
        quotaAuth2: rows[0].quotaAuth2 ? "启用" : "禁用"
      };
      this.authCompanyLoaing = true;
      let data = {
        current: 1,
        entity: {
          keyword: "",
          userId: rows[0].userId
        },
        size: 99999
      };
      this.editTitle = "修改用户信息";
      // 获取授权客户信息并过滤客户名显示
      this.authCompanyLoaing = false;
      let agencyNameList = [];
      this.ruleForm.ralUserCusCodeList.forEach(val => {
        agencyNameList.push(val.kunnrName);
      });
      this.ruleForm.showauthAgency = agencyNameList.join(",");
      this.selectedValue = this.ruleForm.ralUserCusCodeList;
      this.dialogVisible = true;
    },
    // 启用或停用
    enableUser() {
      let rows = this.gridOptions.api.getSelectedRows();
      const { state } = this.searchForm;
      if (rows.length == 0) {
        this.$alert(`提示：请选择需要${state == 1 ? "停用" : "启用"}的数据`, {
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
            // let ids = rows.map(item => {
            //   return item.id;
            // });
            // let params = {
            //   ids: ids.join(","),
            //   state: state == 0 ? 1 : 0,
            //   updateBy: this.$global.user.employeeName,
            //   updateId: this.$global.user.id
            // };
            let params = rows.map(val => {
              return {
                id: val.id,
                state: state == 0 ? 1 : 0,
                updateBy: this.$global.user.employeeName,
                updateId: this.$global.user.id,
                userId: val.userId
              };
            });
            this.loading = true;
            this.$http
              .userManage_upDateUserState(params)
              .then(({ data }) => {
                this.loading = false;
                if (data.code == 1) {
                  this.$message.success(
                    `提示：成功${state == 1 ? "停用" : "启用"}${
                      rows.length
                    }条数据`
                  );
                  let roles = utils.getSession("userData").roles;
                  let flag = false;
                  roles.forEach(val => {
                    if (val.code == "cap_admin_role") {
                      flag = true;
                    }
                  });
                  if (!flag) {
                    if (state == 1) {
                      for (let i = 0; i < params.length; i++) {
                        if (params[i].userId == this.$global.user.id) {
                          utils.removeSession("userData");
                          utils.removeSession("currentAct");
                          utils.removeSession("menuId");
                          utils.removeSession("auth");
                          location.reload();
                          break;
                        }
                      }
                    }
                  }
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
    // 保存数据
    saveData() {
      let that = this;
      this.$refs["ruleForm"].validate(valid => {
        if (valid) {
          let {
            authCompanyCode,
            userId,
            companyName,
            companyCode,
            roleCode,
            roleName,
            employeeName,
            id,
            sapNum,
            oaNum,
            userCompanyAuthList,
            ralUserCusCodeList,
            quotaAuth,
            quotaAuth2
          } = that.ruleForm;
          let authList = [];

          // id存在为修改用户数据，不存在为新增数据
          that.selectedIds.forEach(selectId => {
            if (id) {
              authList.push({
                companyId: selectId,
                userId: userId,
                updateBy: that.$global.user.employeeName,
                updateId: that.$global.user.id
              });
            } else {
              authList.push({
                companyId: selectId,
                userId: userId,
                createBy: that.$global.user.employeeName,
                createId: that.$global.user.id
              });
            }
          });
          let params = {
            // 用户信息
            id,
            userId,
            companyName,
            companyCode,
            sapNum,
            oaNum,
            userName: employeeName,
            // 部门信息
            roleCode: roleCode.join(","),
            roleName,
            // 公司信息
            authCompanyCode: authCompanyCode.join(","),
            // 客户信息
            ralUserCusCodeList,
            quotaAuth: quotaAuth == "启用" ? 1 : 0,
            quotaAuth2: quotaAuth2 == "启用" ? 1 : 0,
            updateBy: that.$global.user.employeeName,
            updateId: that.$global.user.id
          };
          // if (id) {
          //   params.updateBy = that.$global.user.employeeName;
          //   params.updateId = that.$global.user.id;
          // } else {
          //   params.createBy = that.$global.user.employeeName;
          //   params.createId = that.$global.user.id;
          // }
          that.$http
            .userManage_saveUserData(params)
            .then(({ data }) => {
              if (data.code == 1) {
                Msg.showSuccessMsg(data.info);
                that.handleClose();
                that.search();
              } else {
                Msg.showErrorMsg(data.info);
              }
            })
            .catch(err => {
              Msg.showErrorMsg("保存失败");
            });
        } else {
          console.log("error");
        }
      });
    },
    // 引入弹窗关闭
    handleClose() {
      this.dialogVisible = false;
      this.ruleForm = {
        userId: "",
        sapNum: "",
        employeeName: "",
        companyName: "",
        companyCode: "",
        authCompany: "",
        showauthCompany: "",
        roleCode: [],
        roleName: "",
        quotaAuth: "禁用",
        quotaAuth2: "禁用"
      };
    },
    // 关闭授权窗口
    closeAuthCompany() {
      this.authDialogVisible = false;
    },
    // 关闭
    closeAuthAgency() {
      this.authAgencyDialogVisible = false;
    },
    // 关闭部门弹窗
    departmentailogClose() {
      this.departmentVisible = false;
    },
    // 获取选择的数据信息
    getSelectedValue(data) {
      const { sapNum, bukrs, butxt, employeeName, id, oaNum } = data[0];
      this.ruleForm.companyName = butxt;
      this.ruleForm.companyCode = bukrs;
      this.ruleForm.authCompanyCode = bukrs.split(",");
      this.ruleForm.authCompanyName = butxt;
      this.ruleForm.oaNum = oaNum;
      this.ruleForm.sapNum = sapNum;
      this.ruleForm.employeeName = employeeName;
      this.ruleForm.userId = id;
      // this.ruleForm.showauthCompany = butxt;
      this.ruleForm.authCompany = butxt;
      this.importDialogVisible = false;
      let arr = {};
      this.companyList.forEach(v => {
        if (v.companyCode == bukrs) {
          arr = v;
        }
      });
      arr.companyId = arr.id;
      this.compareId = arr.id + "";
      this.ruleForm.userCompanyAuthList = [arr];
    },
    // 打开引入客户数据弹窗
    showImportDialog() {
      this.importDialogVisible = true;
      this.showauthAgency = "";
      this.ralUserCusCodeList = [];
      this.selectedValue = [];
    },
    // 获取已选择公司的值
    setAuthCompany(selectedIds, companyNames) {
      this.ruleForm.authCompanyName = companyNames;
      this.ruleForm.authCompanyCode = selectedIds;
      console.log(selectedIds)
    },
    // 获取已经选择经销商的值
    setAuthAgency(selectedIds, agencyNames) {
      this.ruleForm.ralUserCusCodeList = JSON.parse(
        JSON.stringify(selectedIds)
      );
      this.selectedValue = this.ruleForm.ralUserCusCodeList;
      this.ruleForm.showauthAgency = agencyNames;
    },
    // 授权部门确定回调
    confirmDepartment(roleCode, roleName) {
      this.ruleForm.roleCode = roleCode;
      this.ruleForm.roleName = roleName;
    },
    // 批量引入--返回
    closeImportPlane() {
      this.showMasterTable = true;
      this.search(1);
    },
    // 根据id查授权公司
    getCompanyList() {
      let obj = {
        current: 1,
        size: 100,
        entity: {
          userId: this.$global.user.id
        }
      };
      this.$http
        .ScoreInput_getCompanyList(obj)
        .then(({ data }) => {
          if (data.code == 1) {
            this.selectCompanyList = data.rows;
          } else {
            Msg.showErrorMsg("获取公司列表信息失败");
          }
        })
        .catch(() => {
          Msg.showErrorMsg("获取公司列表信息失败");
        });
    },
    // 初始化表格
    initTable() {
      // 页面 ag-grid 配置
      this.gridOptions = {
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
          headerName: "公司",
          field: "companyName",
          width: 250,
          tooltipField: "companyName"
        },
        {
          headerName: "工号",
          field: "sapNum",
          width: 120,
          tooltipField: "sapNum"
        },
        {
          headerName: "姓名",
          field: "userName",
          width: 90,
          tooltipField: "userName"
        },
        {
          headerName: "角色",
          field: "roleName",
          width: 90,
          tooltipField: "roleName"
        },
        {
          headerName: "积分录入状态",
          width: 150,
          field: "quotaAuth",
          cellRenderer: function(params) {
            if (params.value == 1) return '<span class="ag-icon">启用</span>';
            else if (params.value == 0)
              return '<span class="ag-icon">停用</span>';
          }
        },
        {
          headerName: "积分修改状态",
          width: 150,
          field: "quotaAuth2",
          cellRenderer: function(params) {
            if (params.value == 1) return '<span class="ag-icon">启用</span>';
            else if (params.value == 0)
              return '<span class="ag-icon">停用</span>';
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
    // 初始化按钮权限
    initAuthBtn() {
      authorize1.getBtnAuth(this.name, this.btnStatus);
    }
  },
  components: {
    authCompanyDialog,
    departmentDialog,
    importClientDialog,
    authAgencyDialog,
    importUserExcel
  },
  beforeMount() {
    this.initTable();
    this.initAuthBtn();
  }
};
</script>
<style lang="less" scoped>
/deep/.el-textarea__inner {
  resize: none;
}
.showControl {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
