<!-- Excel文件上传 -->
<template>
  <div class="m-importData" ref="importContainerPage">
    <!--  -->
    <el-row :gutter="10" class="m-condition">
      <el-col :span="4">
        <el-select v-model="searchCondiction.code" placeholder="选择部门">
          <el-option
            v-for="(item,index) in  selectData.deparmentList"
            :key="index"
            :label="item.codeCn"
            :value="item.code"
          ></el-option>
        </el-select>
      </el-col>
      <el-col :span="2" class="pull-right">
        <el-button type="primary" @click="importClick">导入数据</el-button>
        <template>
          <lesso-uploader
            :baseUrl="baseUrl"
            :userInfo="userInfo"
            @fileError="fileError"
            @overSize="overSizeHandler"
            @fileSuccess="fileSuccess"
            @fileAdded="onFileLoad"
            :previewBtn="false"
            :showFileList="false"
          >
            <div slot="upload-btn" ref="test">文件</div>
          </lesso-uploader>
        </template>
      </el-col>
      <el-col :span="2" class="pull-right">
        <el-button type="primary" @click="downTemplate">下载模板</el-button>
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
          @cellValueChanged="cellValueChanged"
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
      <div style="flex:1">数据总条目：{{vailateDatalength}}</div>
      <div style="flex:1">
        <el-button type="plain" @click="goBack">返回</el-button>
      <el-button type="primary" @click="saveBata" :disabled="saveEnable">保存</el-button>
      </div>
    </div>
    <!-- 错误报告 -->
    <el-dialog
      title="数据报告"
      :visible.sync="errorTableVisible"
      :close-on-click-modal="false"
      @close="handleClose"
    >
      <div style="padding: 15px 0">数据总条目：{{vailateDatalength}}</div>
      <el-tabs v-model="fristTabs" type="border-card">
        <el-tab-pane v-if="errorList.length" name="errorList" :label="`数据出错(${errorList.length})`">
          <el-table :data="errorList" border max-height="350">
            <el-table-column property="companyCode" label="公司" width="150"></el-table-column>
            <el-table-column property="customCode" label="客户" width="200"></el-table-column>
            <el-table-column property="recordTime" label="年月"></el-table-column>
            <el-table-column property="quotaCode" label="积分项出错编号"></el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane v-if="nullTable.length" name="nullTable" :label="`数据缺失(${nullTable.length})`">
          <el-table :data="nullTable" border max-height="350">
            <el-table-column property="excelCount" label="数据缺失行"></el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane
          v-if="repeatTable.length"
          name="repeatTable"
          :label="`数据重复(${repeatTable.length})`"
        >
          <el-table :data="repeatTable" border max-height="350">
            <el-table-column property="companyCode" label="公司" width="150"></el-table-column>
            <el-table-column property="customCode" label="客户" width="200"></el-table-column>
            <el-table-column property="recordTime" label="年月"></el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane
          v-if="companyCodeList.length"
          name="companyCodeList"
          :label="`公司编码不存在(${companyCodeList.length})`"
        >
          <el-table :data="companyCodeList" border max-height="350">
            <el-table-column property="companyCode" label="公司编码"></el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane
          v-if="agencyCodeList.length"
          name="agencyCodeList"
          :label="`客户编码不存在(${agencyCodeList.length})`"
        >
          <el-table :data="agencyCodeList" border max-height="350">
            <el-table-column property="customCode" label="客户编码"></el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane
          v-if="agencyNoCompanyList.length"
          name="agencyNoCompanyList"
          :label="`客户无关联公司(${agencyNoCompanyList.length})`"
        >
          <el-table :data="agencyNoCompanyList" border max-height="350">
            <el-table-column property="customCode" label="客户编码"></el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane
          v-if="authCompanyCodeList.length"
          name="authCompanyCodeList"
          :label="`用户无授权公司(${authCompanyCodeList.length})`"
        >
          <el-table :data="authCompanyCodeList" border max-height="350">
            <el-table-column property="companyCode" label="公司编码"></el-table-column>
          </el-table>
        </el-tab-pane>
                <el-tab-pane
          v-if="companyAgencyCodeNone.length"
          name="companyAgencyCodeNone"
          :label="`公司编码与客户编码无关联(${companyAgencyCodeNone.length})`"
        >
          <el-table :data="companyAgencyCodeNone" border max-height="350">
            <el-table-column property="companyCode" label="公司编码"></el-table-column>
            <el-table-column property="customCode" label="客户编码"></el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane
          v-if="quotaStopSets.length"
          name="quotaStopSets"
          :label="`异常积分项(已禁用或非当前模板积分项)(${quotaStopSets.length})`"
        >
          <el-table :data="quotaStopSets" border max-height="350">
            <el-table-column label="积分项编码">
              <template slot-scope="scope">{{quotaStopSets[scope.$index]}}</template>
            </el-table-column>
          </el-table>
          <div style="font-size:14px;color:red">请下载最新导入模板后导入</div>
        </el-tab-pane>
      </el-tabs>
    </el-dialog>
  </div>
</template>

<script>
import { fileDataLoad, downLoadOnlieTemplate } from "./xlsFileUploadUnit.js";
import apienv from "@/api/env.js";
import constant from "@/public/constant";
import gridOptions from "lesso-common/public/gridOptions";
import Msg from "@/public/message";
import lessoUploader from "lesso-file-upload/lessoUploader";
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
      // 翻页
      pagination: {
        pageSizes: [10, 20, 30, 50, 100],
        pageSize: 30,
        layout: "total, sizes, prev, pager, next, jumper",
        totalCount: 0,
        currentPage: 1
      },
      // 指示当前处于哪个表格的展示状态
      currentIndindicator: 0,
      companyCode: "",
      quotaCode: "",
      roleCode: "",
      quotaType: "",
      initData: [],
      // 搜索
      customCode: "",
      fristTabs: "errorList",
      // 文件
      baseUrl: apienv[constant.appenv].file, // 上传路径
      userInfo: {
        // 用户信息
        userName: this.$global.user.userName,
        userId: this.$global.user.id,
        group: "group1"
      },
      viewPath: "",
      fileName: "",

      // 校验数据
      errorTableVisible: false,
      vailateDatalength: 0,
      nullTable: [],
      repeatTable: [],
      errorList: [],
      ruleList: [],
      companyCodeList: [],
      agencyCodeList: [],
      agencyNoCompanyList: [],
      authCompanyCodeList: [],
      quotaStopSets: [],
      companyAgencyCodeNone:[],
      dateController: "",
      dateState: 0,
      // 是否特殊模板
      isSpecialTemplate: "",
      //loading
      loading: false,

      // 部门--录入频率下拉框
      selectData: {
        deparmentList: [
          {
            codeCn: "",
            id: ""
          }
        ]
      },
      // 下载条件
      searchCondiction: {
        // companyCode: "",
        code: ""
      }
    };
  },
  props: {
    // 需要导入的sheef的名字和对应的表头的配置信息,包含多个sheef的表头配置信息
    tableColumnConfig: {
      type: Array,
      required: true
    },
    // 需要导入的sheef的名字和对应的表头的配置信息,包含多个sheef的表头配置信息
    translateData: {
      type: Object,
      required: false
    }
  },
  beforeMount() {
    // this.getScoreRuleList();
    this.initTable();
    this.getModifyDate();
    this.getDeparmentList();
    this.getCompanyList();
  },
  components: {
    lessoUploader
  },
  watch: {
    tablesDatas: {
      handler: function(newval, oldval) {
        this.showrowData(newval);
      }
      // deep: true
    }
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
    //计算当前的展示的rowdata的数据
    showrowData(dataArray) {
      dataArray.forEach((item, index) => {
        item.tableData.tableDataShow = this.arrayPagination(
          item.pageInfo.currentPage,
          item.pageInfo.size,
          item.tableData.rowData
        );
      });
    },
    //工具---前端分页
    arrayPagination(currentPage = 1, pageSize, array) {
      var offset = (currentPage - 1) * pageSize;
      return offset + pageSize >= array.length
        ? array.slice(offset, array.length)
        : array.slice(offset, offset + pageSize);
    },
    // 表格被编辑的时候，更新自己的组件
    cellValueChanged(param) {
      var rowNode = param.api.getDisplayedRowAtIndex(param.rowIndex);
      // 必须使用改方法才能连同 renderFrameWork一起刷新
      param.api.redrawRows({
        rowNodes: [rowNode],
        columns: ["inputValue"]
      });
    },

    // 按钮--翻页处理
    handleSizeChange(value) {
      //size改变
    },

    // 按钮-- 翻页处理
    handleCurrentChange(value, item, index) {
      //page改变
    },
    // 按钮--直接触发点击事件，上传文件
    triggerFile() {
      this.$refs.fileBotton.value = "";
      this.$refs.fileBotton.click();
    },
    // 搜索
    // search() {
    //   let result = []
    //   this.agGridData.rowData.forEach(val=>{
    //     if(val.customCode.includes(this.customCode)){
    //       result.push(val)
    //     }
    //   })
    //   this.agGridData.rowData = result;
    // },
    // dialog关闭回调
    handleClose() {
      console.log(1)
      this.fristTabs = "errorList";
      this.vailateDatalength = 0;
    },
    // 获取全部导入规则
    getScoreRuleList() {
      let obj = {
        entity: {
          keyword: "",
          state: 1,
          parentClassId: 0,
          quotaType: "",
          roleCode: ""
        },
        current: 1,
        size: 9999
      };
      this.$http.ScoreInput_getScoreRuleList(obj).then(({ data }) => {
        if (data.code == 1) {
          this.ruleList = data.rows;
        }
      });
    },
    //按钮-- 返回
    goBack() {
      this.$emit("closeImportPlane");
    },
    // 按钮- 保存数据
    saveBata() {
      this.$emit("saveTablesDatas", {
        rowData: this.agGridData.rowData,
        roleCode: this.roleCode,
        viewPath: this.viewPath,
        fileName: this.fileName
      });
    },
    // 模板下载
    downTemplate() {
      if (!this.searchCondiction.code) {
        this.$alert("请选择部门再下载模板", {
          showClose: false,
          confirmButtonText: "确定",
          customClass: "alertPrompt"
        });
        return;
      }
      let code = {
        roleCode: this.searchCondiction.code.split("-")[0],
        quotaType: this.searchCondiction.code.split("-")[1]
      };
      this.$http.ScoreReport_downloadTemplate(code).then(val => {
        let blob = new Blob([val.data], { type: "application/vnd.ms-excel" });
        downLoadOnlieTemplate(blob, `${code.roleCode}-template.xls`);
      });
    },
    // 获取部门--录入频率列表
    getDeparmentList() {
      let that = this;
      let data = {
        userId: this.$global.user.id
      };
      let result = [];
      this.$http
        .ScoreInput_getDeparmentQuatoList(data)
        .then(({ data }) => {
          if (data.code == 1) {
            if (data.total > 0) {
              data.rows.forEach(item => {
                let obj = {
                  codeCn: `${item.roleName}-${item.quotaTypeName}`,
                  code: `${item.roleCode}-${item.quotaType}`
                };
                result.push(obj);
              });
            } else {
              Msg.showErrorMsg("用户缺乏授权部门");
            }
            that.selectData.deparmentList = result;
          } else {
            Msg.showErrorMsg("获取部门模板类型失败");
          }
        })
        .catch(() => {
          Msg.showErrorMsg("获取部门模板类型失败");
        });
    },
    // 根据id获取授权公司
    getCompanyList() {
      let obj = {
        current: 1,
        entity: {
          userId: this.$global.user.id
        },
        size: 999
      };
      this.$http
        .ScoreInput_getCompanyList(obj)
        .then(({ data }) => {
          if (data.code == 1) {
            this.companyCode = data.rows;
          } else {
            Msg.showErrorMsg(data.info);
          }
        })
        .catch(() => {
          Msg.showErrorMsg("获取授权公司失败");
        });
    },
    // 初始化表
    initTable() {
      this.agGridData.gridOptions = gridOptions();
      this.agGridData.gridOptions.context = {
        componentParent: this
      };
    },
    // api获取导入数据的所属部门
    async getImportDataDepart() {
      let data = {
        current: 1,
        size: 10,
        entity: {
          quotaCode: this.quotaCode
        }
      };
      return new Promise((resolve, reject) => {
        this.$http
          .ScoreReport_getImportDataDepart(data)
          .then(({ data }) => {
            if (data.code == 200 && data.total > 0) {
              this.roleCode = data.rows[0].roleCode;
              this.quotaType = data.rows[0].quotaType;
              resolve();
            } else {
              reject();
            }
          })
          .catch(err => {
            reject(err);
          });
      });
    },
    // api校验公司编码和客户编码
    async getErrorList(vailateData) {
      let { id, loginName } = this.$global.user;
      let submitData = {
        data: JSON.stringify(vailateData),
        id: id,
        loginName: loginName,
        roleCode: this.roleCode,
        quotaType: this.quotaType
      };
      return new Promise((resolve, reject) => {
        this.$http
          .ScoreInput_saveImportDataCheck(submitData)
          .then(({ data }) => {
            if (data.code == 1) {
              resolve(data.rows);
            } else {
              this.$alert(data.info, {
                showClose: false,
                confirmButtonText: "确定",
                customClass: "alertPrompt"
              });
              this.loading = false;
              return;
            }
          })
          .catch(err => {
            this.$alert("系统正在开小差...", {
              showClose: false,
              confirmButtonText: "确定",
              customClass: "alertPrompt"
            });
            this.loading = false;
            return;
          });
      });
    },
    async getSpecialErrorList(vailateData) {
      let { id, loginName } = this.$global.user;
      let submitData = {
        data: JSON.stringify(vailateData),
        id: id,
        loginName: loginName,
        roleCode: this.roleCode,
        quotaType: this.quotaType
      };
      return new Promise((resolve, reject) => {
        this.$http
          .ScoreInput_saveImportSpecialDataCheck(submitData)
          .then(({ data }) => {
            if (data.code == 1) {
              resolve(data.rows);
            } else {
              this.$alert(data.info, {
                showClose: false,
                confirmButtonText: "确定",
                customClass: "alertPrompt"
              });
              this.loading = false;
              return;
            }
          })
          .catch(err => {
            this.$alert("系统正在开小差...", {
              showClose: false,
              confirmButtonText: "确定",
              customClass: "alertPrompt"
            });
            this.loading = false;
            return;
          });
      });
    },
    // api获取特殊模板部门
    async getSpecealDept(companyCode) {
      this.isSpecialTemplate = false;
      return new Promise((resolve, reject) => {
        let obj = {
          current: 1,
          entity: {
            systemCode: "XTPZ003",
            state: 1
          },
          size: 10
        };
        this.$http
          .ScoreInput_getDate(obj)
          .then(({ data }) => {
            if (data.code == 1) {
              if (data.total > 0) {
                // 启用
                if (
                  !data.rows[0].systemValue.includes(this.roleCode) &&
                  !companyCode
                ) {
                  // 不是特殊部门并且不存在公司编码
                  Msg.showErrorMsg("请导入正确的模板");
                  this.loading = false;
                  return;
                } else if (
                  data.rows[0].systemValue.includes(this.roleCode) &&
                  !companyCode
                ) {
                  this.isSpecialTemplate = true;
                }
              } else {
                // 停用
                this.isSpecialTemplate = false;
              }
              resolve();
            } else {
              Msg.showErrorMsg("获取枚举项XTPZ003错误");
              this.loading = false;
              reject();
            }
          })
          .catch(() => {
            Msg.showErrorMsg("获取枚举项XTPZ003错误");
            this.loading = false;
            reject();
          });
      });
    },
    // 文件
    fileError(file, message, chunk) {
      // 文件上传失败回调
      message = JSON.parse(message);
      this.$message.error(message.msg);
    },
    overSizeHandler(file) {
      // 文件过大回调
      this.$message.warning("选择的文件大小超出200M");
    },
    fileSuccess(file, message, chunk) {
      // 上传成功回调
      this.viewPath = file.viewPath;
      this.fileName = file.name;
      //this.onFileLoad(file)
      //this.$message.success("上传成功");
    },
    // 导入文件,数据回调
    async onFileLoad(File) {
      try {
        // 文件上传时清空原有文件
        let that = this;
        this.nullTable = [];
        this.repeatTable = [];
        this.agGridData.rowData = [];
        this.initData = [];
        this.agGridData.columnDefs = [];
        let columnDefs = [
          {
            headerName: "销售区域",
            field: "agencyArea",
            width: 120,
            tooltipField: "agencyArea"
          }
        ];
        this.loading = true;
        // 需要使用各种各种的工具函数处理成数据
        let result = await fileDataLoad(File.file);
        let headerName = result[0].sheefData[0];
        let vailateData = []; //校验数据
        let vailateId = []; //校验公司标识
        let isFlag = false; //公司标识是否为授权公司子集
        let repeatTable = []; //查重标识数据
        let nullTable = []; // 查空标识
        let errorList = []; //规则出错列表
        let recordTimeError = []; //记录日期出错
        let companyCodeList = []; //公司编码不存在列表
        let agencyCodeList = []; //客户编码不存在列表
        let agencyNoCompanyList = []; // 客户不存在关联公司列表
        let authCompanyCodeList = []; // 导入没有授权公司列表
        let quotaStopSets = []; // 导入存在停用积分项
        let companyAgencyCodeNone = [] //公司编码与客户无关联

        this.quotaCode = Object.keys(headerName).pop();
        // 后台获取导入某部门数据校验
        await this.getImportDataDepart();
        await this.getSpecealDept(headerName.companyCode);
        for (let attr in headerName) {
          columnDefs.push({
            headerName: headerName[attr],
            field: attr,
            width: 200,
            tooltipField: attr
          });
        }
        console.log(columnDefs);
        console.log(result);
        // 获取校验数据
        for (let i = 1; i < result[0].sheefData.length; i++) {
          vailateData.push(result[0].sheefData[i]);
        }
        console.log(vailateData);
        this.vailateDatalength = vailateData.length;
        // 日期配置判断
        if (this.dateState) {
          let importTime =
            vailateData[0].recordTime.substr(0, 4) +
            "-" +
            vailateData[0].recordTime.substr(4, 2);
          console.log(importTime);
          let times =
            new Date(new Date(this.dateController).Format("yyyy-MM")) -
            new Date(importTime);
          let day = times / 1000 / (60 * 60 * 24);
          // 月份判断相隔大于59天(1-3月)
          if (day > 59) {
            Msg.showErrorMsg("只能导入上个月的积分项");
            this.loading = false;
            return;
          }
          if (day < 0) {
            Msg.showErrorMsg("不能提前导入积分项数据");
            return;
          }
        }

        if (!headerName.companyCode && this.isSpecialTemplate) {
          //特殊模板
          columnDefs.unshift({
            headerName: "公司编码",
            field: "companyCode",
            width: 200,
            tooltipField: "companyCode"
          });
          let data = await this.getSpecialErrorList(vailateData);
          if (data.companyExistNone.length) {
            companyCodeList = data.companyExistNone;
          }
          if (data.agencyExistNone.length) {
            agencyCodeList = data.agencyExistNone;
          }
          if (data.ralExistNone.length) {
            agencyNoCompanyList = data.ralExistNone;
          }
          if (data.recordNull.length) {
            nullTable = data.recordNull;
          }
          if (data.recordError.length) {
            errorList = data.recordError;
          }
          if (data.repeatTarget.length) {
            repeatTable = data.repeatTarget;
          }
          if(data.companyAgencyCodeNone.length){
            companyAgencyCodeNone = data.companyAgencyCodeNone;
            console.log(1)
          }
          // if(data.recordTimeError.length){
          //   recordTimeError = data.recordTimeError
          // }
          if (data.ralExist.length) {
            vailateData = data.ralExist;
          }
        } else {
          // vailateData.forEach(value => {
          //   if (vailateId.indexOf(value.companyCode) == -1) {
          //     vailateId.push(value.companyCode);
          //   }
          // });
          // let authId = [];
          // this.companyCode.forEach(value=>{
          //   authId.push(value.companyCode)
          // })
          // isFlag = vailateId.every(val=>{
          //   return authId.includes(val)
          // })
          // if(!isFlag){
          //   Msg.showErrorMsg("禁止导入非授权公司数据")
          //   this.loading = false
          //   return;
          // }
          let data = await this.getErrorList(vailateData);
          if (data.companyExistNone.length) {
            companyCodeList = data.companyExistNone;
          }
          if (data.agencyExistNone.length) {
            agencyCodeList = data.agencyExistNone;
          }
          if (data.ralExistNone.length) {
            agencyNoCompanyList = data.ralExistNone;
          }
          if (data.recordNull.length) {
            nullTable = data.recordNull;
          }
          if (data.recordError.length) {
            errorList = data.recordError;
          }
          if (data.repeatTarget.length) {
            repeatTable = data.repeatTarget;
          }
          // if(data.recordTimeError.length){
          //   recordTimeError = data.recordTimeError
          // }
          if (data.companyAuthNone.length) {
            authCompanyCodeList = data.companyAuthNone;
          }
          if (data.quotaStopSets.length) {
            quotaStopSets = data.quotaStopSets;
          }
          if(data.companyAgencyCodeNone.length){
            companyAgencyCodeNone = data.companyAgencyCodeNone;
          }
          if (data.ralExist.length) {
            vailateData = data.ralExist;
          }
        }
        if (
          repeatTable.length == 0 &&
          nullTable.length == 0 &&
          errorList.length == 0 &&
          companyCodeList.length == 0 &&
          agencyCodeList.length == 0 &&
          agencyNoCompanyList.length == 0 &&
          authCompanyCodeList.length == 0 &&
          quotaStopSets.length == 0 &&
          companyAgencyCodeNone.length == 0
        ) {
          //无重复、无空、规则正确、公司编码正确、客户编码正确
          this.initData = vailateData;
          this.agGridData.rowData = vailateData;
          this.agGridData.columnDefs = columnDefs;
          this.repeatTable = [];
          this.nullTable = [];
          this.errorList = [];
          this.companyCodeList = [];
          this.agencyCodeList = [];
          this.agencyNoCompanyList = [];
          this.authCompanyCodeList = [];
          this.quotaStopSets = [];
        } else {
          this.repeatTable = repeatTable;
          this.nullTable = nullTable;
          this.errorList = errorList;
          this.companyCodeList = companyCodeList;
          this.agencyCodeList = agencyCodeList;
          this.agencyNoCompanyList = agencyNoCompanyList;
          this.authCompanyCodeList = authCompanyCodeList;
          this.quotaStopSets = quotaStopSets;
          this.companyAgencyCodeNone = companyAgencyCodeNone;
        }
        this.loading = false;
        if (errorList.length) {
          this.fristTabs = "errorList";
          this.errorTableVisible = true;
          return;
        }
        if (nullTable.length) {
          this.fristTabs = "nullTable";
          this.errorTableVisible = true;
          return;
        }
        if (repeatTable.length) {
          this.fristTabs = "repeatTable";
          this.errorTableVisible = true;
          return;
        }
        if (companyCodeList.length) {
          this.fristTabs = "companyCodeList";
          this.errorTableVisible = true;
          return;
        }
        if (agencyCodeList.length) {
          this.fristTabs = "agencyCodeList";
          this.errorTableVisible = true;
          return;
        }
        if (agencyNoCompanyList.length) {
          this.fristTabs = "agencyNoCompanyList";
          this.errorTableVisible = true;
          return;
        }
        if (authCompanyCodeList.length) {
          this.fristTabs = "authCompanyCodeList";
          this.errorTableVisible = true;
          return;
        }
        if (quotaStopSets.length) {
          this.fristTabs = "quotaStopSets";
          this.errorTableVisible = true;
          return;
        }
        if(companyAgencyCodeNone.length){
          this.fristTabs = "companyAgencyCodeNone",
          this.errorTableVisible = true;
          return;
        }
        this.errorTableVisible = false;
      } catch (err) {
        console.log(err);
        this.$alert(`请导入正确的文件`, {
          showClose: false,
          confirmButtonText: "确定",
          customClass: "alertPrompt"
        });
        this.loading = false;
      }
    },
    // 获取修改期限
    getModifyDate() {
      return new Promise((resolve, reject) => {
        let obj = {
          current: 1,
          size: 1,
          entity: {
            systemCode: "XTPZ001"
          }
        };
        this.$http
          .dateManage_getDate(obj)
          .then(({ data }) => {
            if (data.code == 1 && data.total > 0) {
              let day = data.rows[0].systemValue;
              this.dateController = new Date().Format("yyyy-MM") + "-" + day;
              this.dateState = data.rows[0].state;
              resolve();
            } else {
              Msg.showErrorMsg("获取日期配置失败");
            }
          })
          .catch(() => {
            Msg.showErrorMsg("获取日期配置失败");
            reject();
          });
      });
    },
    async importClick() {
      if (this.dateState) {
        let timestamp =
          new Date(this.dateController) -
          new Date(new Date().Format("yyyy-MM-dd"));
        if (timestamp < 0) {
          Msg.showErrorMsg("修改积分项日期已截止");
          return;
        }
      }

      if (this.selectData.deparmentList.length == 0) {
        Msg.showErrorMsg("用户缺乏授权部门");
        return;
      }
      if (this.companyCode.length == 0) {
        Msg.showErrorMsg("用户缺乏授权公司");
        return;
      }
      this.$refs.test.click();
    }
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
    align-items: center;
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

