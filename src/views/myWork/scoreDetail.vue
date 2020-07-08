<template>
  <!--报表查看积分项 -->
  <div class="m-view-baseScoreInput m-window">
    <div v-show="showMasterTable">
      <el-row :gutter="10">
        <el-col :span="2" class="pull-right">
          <el-button type="primary" @click="exportExcel" v-if="btnStatus.scoreExport" :disabled="!this.selectData.companyList.length">数据导出</el-button>
        </el-col>
        <el-col :span="2" class="pull-right">
          <el-button
            type="primary"
            @click="browsdialog.formRecord = true"
            v-if="btnStatus.RecordSearch"
            :disabled="!this.selectData.companyList.length"
          >查询日志</el-button>
        </el-col>
        <el-col :span="2" class="pull-right">
          <el-button type="primary" @click="search" v-if="btnStatus.DetailSearch" :disabled="!this.selectData.companyList.length">查询</el-button>
        </el-col>
                <el-col :span="2" class="pull-right">
          <el-checkbox
            v-model="searchCondiction.dateMode"
            :true-label="2"
            :false-label="1"
            :disabled="!Boolean(year)"
          >查询单年/月</el-checkbox>
        </el-col>
      </el-row>
      <el-row :gutter="10">
        <el-col :span="4">
          <el-select
            v-model="searchCondiction.companyCode"
            placeholder="选择公司"
            @change="changeCompanyCode"
          >
            <el-option
              v-for="(item,index) in  selectData.companyList"
              :key="index"
              :label="item.companyName"
              :value="item.companyCode"
            ></el-option>
          </el-select>
        </el-col>
        <el-col :span="4">
          <el-select v-model="searchCondiction.roleCode" placeholder="选择部门" :clearable="true">
            <el-option
              v-for="(item,index) in  selectData.deparmentList"
              :key="index"
              :label="item.codeCn"
              :value="item.code"
            ></el-option>
          </el-select>
        </el-col>
        <el-col :span="4">
          <el-select v-model="searchCondiction.quotaType" placeholder="录入频率" :clearable="true">
            <el-option
              v-for="(item,index) in  selectData.quotaList"
              :key="index"
              :label="item.codeCn"
              :value="item.code"
            ></el-option>
          </el-select>
        </el-col>
        <el-col :span="2">
          <el-date-picker
            v-model="year"
            type="year"
            placeholder="选择年"
            value-format="yyyy"
            :clearable="true"
          ></el-date-picker>
        </el-col>
        <el-col :span="2">
          <el-select v-model="month" placeholder="选择月" :clearable="true" :disabled="!Boolean(year)">
            <el-option
              v-for="item in 12"
              :label="item +'月'"
              :value="(item.toString().length == 1)?`0${item}`:`${item}`"
              :key="item"
            ></el-option>
          </el-select>
        </el-col>
        <el-col :span="4">
          <el-select
            v-model="searchCondiction.agencyArea"
            filterable
            placeholder="选择销售区域"
            clearable
          >
            <el-option
              v-for="(item,index) in  selectData.saleAreaList"
              :key="index"
              :label="item"
              :value="item"
            ></el-option>
          </el-select>
        </el-col>
        <el-col :span="4">
          <el-input placeholder="请输入客户编码" clearable v-model="searchCondiction.agencyCode"></el-input>
        </el-col>
      </el-row>

      <div class="m-agTable">
        <ag-grid-vue
          class="m-agTableContent ag-theme-balham"
          :gridOptions="agGridData.gridOptions"
          :columnDefs="agGridData.columnDefs"
          :rowData="agGridData.rowData"
          @gridReady="onGridReady"
          rowSelection="single"
          @cellClicked="rowSelected"
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
    </div>

    <el-dialog
      title="详细积分"
      :visible.sync="browsdialog.scoreRecordShow"
      @close="clearSelected"
      width="60%"
      custom-class="dialog-body"
      :fullscreen="true"
    >
      <!-- 内嵌修改dialog -->
      <el-dialog width="40%" title="修改得分" :visible.sync="browsdialog.innerVisible" append-to-body @close="closeInnerDialog">
        <el-form
          label-position="right"
          label-width="80px"
          :model="socreSubmit"
          ref="socreSubmit"
          :rules="socreRules"
          style="padding-bottom:10px"
        >
          <el-form-item label="得分" prop="newFiled">
            <el-input v-model="socreSubmit.newFiled" clearable></el-input>
          </el-form-item>
          <el-form-item label="说明">
            <el-input type="textarea" v-model="socreSubmit.remark" maxlength="100"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="sumbitModifyScore">提交</el-button>
          </el-form-item>
        </el-form>
      </el-dialog>
      <el-row type="flex" align="middle" style="height:40px">
        <el-col :span="10">积分项编码：{{this.scoreRecord.quotaCode}}</el-col>
        <el-col :span="10">所属部门：{{this.scoreRecord.roleName}}</el-col>
      </el-row>
      <el-row type="flex" align="middle" style="height:40px">
        <el-col :span="10">积分项：{{this.scoreRecord.quotaName}}</el-col>
        <el-col :span="10">分值说明：{{this.scoreRecord.scoreDescription}}</el-col>
        <el-col :span="4" class="pull-right">
          <el-button
            type="primary"
            @click="modifyScoreDetail"
            v-if="this.$global.user.quotaAuth2"
          >修改</el-button>
        </el-col>
      </el-row>
      <!-- 录入记录表 -->
      <div style="margin:10px 0">
        <div style="padding-bottom:10px;font-size:16px">录入记录表</div>
        <el-table 
          :data="scoreGridData"
          size="mini"
          border
          style="width:100%;margin-bottom:5px;height:250px"
          @row-click="singleElection"
          max-height="250px"
        >
          <el-table-column label width="65">
            <template slot-scope="scope">
              <el-radio class="radio" v-model="templateSelection" :label="scope.$index">&nbsp;</el-radio>
            </template>
          </el-table-column>
          <el-table-column property="recordTime" label="录入日期" width="200"></el-table-column>
          <el-table-column property="filed" label="得分"></el-table-column>
        </el-table>
        <el-pagination
          @size-change="detailSizeChange"
          @current-change="detailCurrentChange"
          :current-page="scorePagination.currentPage"
          :page-sizes="scorePagination.pageSizes"
          :page-size="scorePagination.pageSize"
          :layout="scorePagination.layout"
          :total="scorePagination.totalCount"
        ></el-pagination>
      </div>
      <!-- 修改记录表 -->
      <div style="margin: 10px 0;padding: 10px 0">
        <div style="padding-bottom:10px;font-size:16px">修改记录表</div>
        <el-table
          :data="modifyRecord"
          size="mini"
          border
          style="width:100%;;height:250px"
          v-show="true"
          max-height="250"
        >
          <el-table-column property="oldFiled" label="修改前得分" width="100"></el-table-column>
          <el-table-column property="newFiled" label="修改后得分" width="100"></el-table-column>
          <el-table-column property="creatorName" label="修改人" width="150"></el-table-column>
          <el-table-column property="recordTime" label="积分录入时间" width="150"></el-table-column>
          <el-table-column property="createTime" label="修改时间" width="200"></el-table-column>
           <el-table-column property="type" label="处理方式" width="150"></el-table-column>
          <el-table-column property="remark" label="说明" show-overflow-tooltip></el-table-column>
        </el-table>
      </div>
    </el-dialog>

    <ScoreFormsRecord v-if="browsdialog.formRecord" @goBack="goBack"></ScoreFormsRecord>
  </div>
</template>

<script>
import ScoreFormsRecord from "./components/component_ScoreFormsRecord.vue";
import gridOptions from "lesso-common/public/gridOptions";
import { downLoadOnlieTemplate } from "./components/xlsFileUploadUnit.js";
import Msg from "@/public/message";
import authorize1 from "@/public/authorize1";
export default {
  name: "socreDetail",
  components: {
    ScoreFormsRecord
  },
  data() {
    var checkScore = (rule, value, callback) => {
      if (!value) {
        return callback(new Error("得分数值不能为空"));
      }
      if (!isNaN(value)) {
        //数字
        this.ruleList.forEach(item => {
          if (this.socreSubmit.quotaCode == item.quotaCode) {
            if (value > Number(item.up)) {
              return callback(new Error(`最高分值不超过${item.up}`));
            }
            if (value < Number(item.down)) {
              return callback(new Error(`最低分值不低于${item.down}`));
            }
            if (value % item.chushu != 0) {
              return callback(new Error(`修改分值应为${item.chushu}整数倍`));
            }
          }
        });
        callback();
      } else {
        //字符串
        return callback(new Error("请正确填写分值"));
      }
    };
    return {
      name: "scoreDetail",
      year: "",
      month: "",
      // 表格
      agGridData: {
        rowData: [],
        columnDefs: [],
        gridOptions: {},
        gridApi: {},
        columnApi: {}
      },
      // 分页
      pagination: {
        pageSizes: [100, 300, 500, 1000, 2000],
        pageSize: 100,
        layout:"total, sizes, prev, pager, next, jumper",
        totalCount: 0,
        currentPage: 1
      },
      // 分页总数据
      gridData: [],
      // 搜索条件
      searchCondiction: {
        companyCode: "",
        agencyCode: "",
        agencyArea: "",
        endDate: "",
        isOneYear: "",
        quotaType: "",
        roleCode: "",
        dateMode: 1
      },
      agencyCode: "",
      //   获取选择的数据源
      selectData: {
        companyList: [],
        deparmentList: [],
        quotaList: [],
        saleAreaList: []
      },
      // 弹窗传递信息,有两个弹窗
      browsdialog: {
        operatorType: "edit",
        detailShow: false,
        scoreRecordShow: false,
        innerVisible: false,
        DetailScoreisvisible: false,
        formRecord: false
      },
      transmitData: {},

      // 点击后积分项分数详细记录表头
      scoreRecord: {
        agencyCode: "",
        companyCode: "",
        quotaCode: "",
        quotaName: "",
        scoreDescription: ""
      },
      // 点击后积分项分数详细记录数据
      scoreGridData: [],
      // 选择后的值
      templateSelection: 0,
      // 修改记录
      modifyRecord: [],
      // 详细得分分页
      scorePagination: {
        pageSizes: [10, 20, 30, 50, 100],
        pageSize: 10,
        layout: "total, sizes, prev, pager, next, jumper",
        totalCount: 0,
        currentPage: 1
      },
      // 修改分值
      socreSubmit: {},
      // 全部规则
      ruleList: [],
      // 提交修改规则校验
      socreRules: {
        newFiled: [{ validator: checkScore, trigger: "blur" }]
      },
      // 修改日期控制
      dateController: "",
      // 日期启用控制
      dataState: 0,
      // 修改部门权限
      authDeparment: false,
      // loading
      loading: false,
      // 初始化按钮权限
      btnStatus: {
        scoreExport: false,
        DetailSearch: false,
        RecordSearch: false
      }
    };
  },
  computed: {
    // 主表是否展示
    showMasterTable() {
      return !this.browsdialog.detailShow && !this.browsdialog.formRecord;
    }
  },
  watch: {
    year: function() {
      if (!this.year) {
        this.month = "";
        // this.searchCondiction.isOneYear = 0;
        this.searchCondiction.dateMode = 1;
      }
    },
    month: function() {
      if (!this.month) {
        this.searchCondiction.isOneYear = 1;
      } else {
        this.searchCondiction.isOneYear = 0;
      }
    }
  },
  methods: {
    //单行选中
    rowSelected(params) {
      console.log(params)
      this.scoreRecord.agencyCode = params.data.agencyCode;
      this.scoreRecord.companyCode = this.searchCondiction.companyCode;
      this.scoreRecord.quotaCode = params.colDef.tooltipField;
      this.scoreRecord.quotaName = params.colDef.quotaName;
      this.scoreRecord.scoreDescription = params.colDef.scoreDescription;
      this.scoreRecord.roleName = params.colDef.roleName;
      if (this.scoreRecord.quotaName && params.value != undefined) {
        this.openDialog();
      } else {
        this.$message.warning("请选择积分项数据值");
      }
    },
    // 表格渲染回调
    onGridReady(params) {
      this.agGridData.gridApi = params.api;
      this.agGridData.columnApi = params.columnApi;
      // this.agGridData.gridApi.sizeColumnsToFit()
    },
    // 获取主表数据
    getTableDataList() {
      this.loading = true;
      let that = this;
      let initRequestData;
      let gridData = [];
      if (this.year && this.month) {
        this.searchCondiction.isOneYear = 0;
        this.searchCondiction.endDate = `${this.year}-${this.month}`;
      } else if (this.month) {
        Msg.showPopMsg("请选择年份后选择月份");
        return;
      } else if (this.year) {
        this.searchCondiction.isOneYear = 1;
        this.searchCondiction.endDate = `${this.year}-01`;
      } else {
        this.searchCondiction.isOneYear = 0;
        this.searchCondiction.endDate = "";
      }
      initRequestData = {
        current: this.pagination.currentPage,
        size: this.pagination.pageSize,
        companyCode: this.searchCondiction.companyCode,
        agencyCode: this.searchCondiction.agencyCode,
        endDate: this.searchCondiction.endDate,
        roleCode: this.searchCondiction.roleCode,
        quotaType: this.searchCondiction.quotaType,
        isOneYear: this.searchCondiction.isOneYear,
        agencyArea: this.searchCondiction.agencyArea,
        dateMode: this.searchCondiction.dateMode,
        sapNum: this.$global.user.sapNum,
        createId: this.$global.user.id,
        createBy: this.$global.user.loginName
      };
      this.$http
        .ScoreReport_getTotalScore(initRequestData)
        .then(({ data }) => {
          if (data.code == 1) {
            data.rows.forEach((item, index) => {
              gridData.push({
                agencyCode: item.agencyCode,
                agencyName: item.agencyName,
                agencyArea: item.agencyArea,
                totalScore: item.totalScore,
                rank: item.rank
              });
              item.list.forEach((it, idx) => {
                that.agGridData.columnDefs.forEach(val => {
                  if (it.quotaCode == val.field) {
                    gridData[index][`${it.quotaCode}`] = it.totalScore;
                  }
                });
              });
            });
            that.agGridData.rowData = gridData;
            that.gridData = gridData;
            console.log(gridData);
            that.pagination.totalCount = data.total;
            this.loading = false;
          } else {
            this.loading = false;
            Msg.showErrorMsg(data.info);
          }
        })
        .catch(() => {
          this.loading = false;
          Msg.showErrorMsg("获取详细积分项数据失败");
        });
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
              this.dataState = data.rows[0].state;
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
    // 搜索
    async search() {
      this.searchCondiction.endDate = "";
      this.initTable();
      await this.getHeaderName();
      this.getTableDataList();
    },
    // 数据导出
    exportExcel() {
      let obj = {
        ...this.searchCondiction,
        sapNum: this.$global.user.sapNum,
        createId: this.$global.user.id,
        createBy: this.$global.user.loginName
      };
      let companyMessage = this.selectData.companyList.filter(val => {
        if (val.companyCode == this.searchCondiction.companyCode) {
          return val;
        }
      });
      let companyName = companyMessage[0].companyName;
      let date = this.searchCondiction.isOneYear
        ? `${new Date(this.searchCondiction.endDate).Format("yyyy")}年`
        : `${new Date(this.searchCondiction.endDate).Format("yyyy")}年` +
          `${new Date(this.searchCondiction.endDate).Format("MM")}月`;
      let model = this.searchCondiction.dateMode == 1 ? "截止至" : "";
      this.$http.ScoreReport_exportExcel(obj).then(val => {
        let blob = new Blob([val.data], { type: "application/vnd.ms-excel" });
        downLoadOnlieTemplate(
          blob,
          `${companyName}${model}${date}的积分明细表`
        );
      });
    },
    // 获取全部导入规则
    getScoreRuleList() {
      return new Promise((resolve, reject) => {
        let obj = {
          entity: {
            keyword: "",
            // state: 1,
            parentClassId: 0,
            quotaType: "",
            roleCode: "",
            userId: this.$global.user.id,
            userName: this.$global.user.loginName,
          },
          current: 1,
          size: 9999
        };
        this.$http
          .ScoreInput_getScoreRuleList(obj)
          .then(({ data }) => {
            if (data.code == 1) {
              this.ruleList = data.rows;
              resolve();
            } else {
              Msg.showErrorMsg(data.info);
              reject();
            }
          })
          .catch(() => {
            Msg.showErrorMsg("获取积分项规则失败");
            reject();
          });
      });
    },
    // 返回该页面回调
    goBack() {
      this.browsdialog.formRecord = false;
    },
    // 打开积分项详细记录
    openDialog() {
      this.authDeparment = false;
      let data = {
        current: this.scorePagination.currentPage,
        entity: {
          agencyCode: this.scoreRecord.agencyCode,
          companyCode: this.scoreRecord.companyCode,
          quotaCode: this.scoreRecord.quotaCode,
          endDate: this.searchCondiction.endDate,
          isOneYear: this.searchCondiction.isOneYear,
          dateMode: this.searchCondiction.dateMode,
        },
        size: this.scorePagination.pageSize
      };
      this.$http
        .ScoreReport_getScoreDetailPc(data)
        .then(async ({ data }) => {
          this.browsdialog.scoreRecordShow = true;
          let changeData = data.rows;
          changeData.forEach(val => {
            val.recordTime = new Date(val.recordTime.replace(/-/g, "/")).Format(
              "yyyy-MM-dd"
            );
          });
          this.scoreGridData = changeData;
          this.singleElection(changeData[0])
          this.scorePagination.totalCount = data.total;
          let authData = await this.getDepartmentAuth();
          authData.forEach(val => {
            if (val.code == changeData[0].roleCode) {
              this.authDeparment = true;
            }
          });
        })
        .catch();
    },
    //  ag-grid表格表头初始化
    initTable(type) {
      // 配置
      if (type == "init") {
        this.agGridData.gridOptions = gridOptions();
        this.agGridData.gridOptions.context = {
          componentParent: this
        };
      }
      this.agGridData.columnDefs = [
        {
          headerName: "",
          field: "",
          width: 60,
          checkboxSelection: true,
          headerCheckboxSelection: true
        },
        {
          headerName: "客户编码",
          field: "agencyCode",
          width: 200,
          tooltipField: "agencyCode"
        },
        {
          headerName: "客户",
          field: "agencyName",
          width: 200,
          tooltipField: "agencyName"
        },
        {
          headerName: "销售区域",
          field: "agencyArea",
          width: 120,
          tooltipField: "agencyArea"
        },
        {
          headerName: "总分",
          field: "totalScore",
          width: 200,
          tooltipField: "totalScore",
        },
        {
          headerName: "排名",
          field: "rank",
          width: 200,
          tooltipField: "rank",
        },
      ];
    },
    // 动态获取表头
    getHeaderName() {
      return new Promise((resolve, reject) => {
        let that = this;
        let initRequestData = {
          companyCode: this.searchCondiction.companyCode,
          endDate: this.searchCondiction.endDate,
          roleCode: this.searchCondiction.roleCode,
          quotaType: this.searchCondiction.quotaType,
          isOneYear: this.searchCondiction.isOneYear
        };
        this.$http
          .ScoreReport_getHeaderName(initRequestData)
          .then(({ data }) => {
            if (data.code == 1) {
              data.rows.forEach((item, index) => {
                that.agGridData.columnDefs.push({
                  headerName: item.quotaName,
                  field: item.quotaCode,
                  width: 200,
                  tooltipField: item.quotaCode,
                  quotaName: item.quotaName,
                  scoreDescription: item.scoreDescription,
                  roleName: item.roleName,
                });
              });
              resolve();
            } else {
              Msg.showErrorMsg(data.info)
              reject()
            }
          }).catch(()=>{
            Msg.showErrorMsg("获取表头失败")
            reject();
          })
      });
    },
    // 翻页
    sizeChange(val) {
      this.pagination.pageSize = val;
      this.getTableDataList();
    },
    // 当前页便变化
    currentChange(val) {
      this.pagination.currentPage = val;
      this.getTableDataList()
    },
    // 根据id查公司列表
    getCompanyList() {
      return new Promise((resolve, reject) => {
        let obj = {
          current: "1",
          entity: {
            userId: this.$global.user.id
          },
          size: "100"
        };
        this.$http
          .ScoreInput_getCompanyList(obj)
          .then(({ data }) => {
            if (data.code == 1) {
              if (data.total > 0) {
                // 有授权公司
                this.selectData.companyList = data.rows;
                this.searchCondiction.companyCode = data.rows[0].companyCode;
                resolve();
              } else {
                Msg.showErrorMsg("用户缺乏授权公司");
              }
            } else {
              Msg.showErrorMsg(data.info);
            }
          })
          .catch(() => {
            Msg.showErrorMsg("获取用户授权公司失败");
          });
      });
    },
    // 更换选择公司编号
    changeCompanyCode() {
      (this.searchCondiction.agencyArea = ""),
        (this.selectData.saleAreaList = []);
      this.getSaleArea();
    },
    // api获取销售区域
    getSaleArea() {
      let obj = {
        companyCode: this.searchCondiction.companyCode
      };
      this.$http
        .ScoreReport_getSaleArea(obj)
        .then(({ data }) => {
          if (data.code == 1) {
            this.selectData.saleAreaList = data.rows;
          } else {
            this.$message.error(data.info);
          }
        })
        .catch(() => {
          this.$message.error("获取销售区域失败");
        });
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
      this.$http
        .ScoreReport_getDeparmentList(data)
        .then(({ data }) => {
          if (data.code == 1) {
            that.selectData.deparmentList = data.rows;
          } else {
            Msg.showErrorMsg(data.info);
          }
        })
        .catch(() => {
          Msg.showErrorMsg("获取部门失败");
        });
    },
    // 获取录入频率列表
    getquotaType() {
      let that = this;
      let data = {
        current: "1",
        entity: {
          type: "quota_type",
          state: 1
        },
        size: "100"
      };
      this.$http
        .ScoreReport_getDeparmentList(data)
        .then(({ data }) => {
          if (data.code == 1) {
            that.selectData.quotaList = data.rows;
          } else {
            Msg.showErrorMsg(data.info);
          }
        })
        .catch(() => {
          Msg.showErrorMsg("获取录入频率失败");
        });
    },
    // 选择修改得分
    singleElection(row) {
      this.templateSelection = this.scoreGridData.indexOf(row);
      // 显示修改记录表格
      let obj = {
        current: 1,
        entity: {
          companyCode: row.companyCode,
          customCode: row.customCode,
          quotaCode: row.quotaCode,
          recordTime: row.recordTime
        },
        size: 100
      };
      this.$http.ScoreReport_getDetailRecord(obj).then(({ data }) => {
        if (data.code == 1) {
          this.modifyRecord = data.rows.map(val=>{
            if(val.type == 1){
              val.type = "积分修改"
            } else if(val.type == 2){
              val.type = "申诉修改"
            } else if (val.type == 3){
              val.type = "撤销申诉修改"
            }
            return val
          });
          this.browsdialog.DetailScoreisvisible = true;
        } else {
          Msg.showErrorMsg(data.info)
        }
      }).catch(()=>{
        Msg.showErrorMsg("获取修改数据表失败")
      })
    },
    // 获得修改权限
    getDepartmentAuth() {
      return new Promise((resolve, reject) => {
        let obj = {
          userId: this.$global.user.id
        };
        this.$http
          .ScoreInput_getDeparmentAuth(obj)
          .then(({ data }) => {
            if (data.code == 1) {
              resolve(data.rows);
            } else {
              reject();
              Msg.showErrorMsg("获取授权部门失败");
            }
          })
          .catch(() => {
            reject();
            Msg.showErrorMsg("获取授权部门失败");
          });
      });
    },
    // 清空选择项
    clearSelected() {
      this.templateSelection = 0;
      this.modifyRecord = [];
    },
    // 关闭内嵌dialog
    closeInnerDialog(){
      this.$refs['socreSubmit'].resetFields();
    },
    // 得分详细翻页
    detailSizeChange(val) {
      this.scorePagination.pageSize = val;
      this.openDialog();
    },
    // 得分当前页更改
    detailCurrentChange(val) {
      this.scorePagination.currentPage = val;
      this.openDialog();
    },
    // 详情得分弹窗
    async modifyScoreDetail() {
      if (!this.authDeparment) {
        Msg.showErrorMsg("用户缺少该积分项的修改权限");
        return;
      }
      await this.getScoreRuleList();
      if (this.dataState) {
        let timestamp =
          new Date(this.dateController) -
          new Date(new Date().Format("yyyy-MM-dd"));
        if (timestamp < 0) {
          Msg.showErrorMsg("修改积分项日期已截止");
          return;
        }
      }
      if (this.templateSelection || this.templateSelection === 0) {
        let data = this.scoreGridData[this.templateSelection];
        if (this.dataState) {
          let times =
            new Date(new Date(this.dateController).Format("yyyy-MM")) -
            new Date(data.recordTime);
          let day = times / 1000 / (60 * 60 * 24);
          if (day > 59) {
            Msg.showErrorMsg("只能修改上个月的积分项");
            return;
          }
        }
        this.browsdialog.innerVisible = true;
        let obj = {
          companyCode: data.companyCode,
          creator: this.$global.user.sapNum,
          customCode: data.customCode,
          newFiled: "",
          oldFiled: data.filed,
          quotaCode: data.quotaCode,
          recordTime: data.recordTime,
          remark: "",
          createId: this.$global.user.id,
          createBy: this.$global.user.loginName,
          agencyArea: data.agencyArea
        };
        this.socreSubmit = obj;
      } else {
        this.$alert("请选择一条数据", {
          showClose: false,
          confirmButtonText: "确定",
          customClass: "alertPrompt"
        });
      }
    },
    // 提交修改分数
    sumbitModifyScore() {
      this.$refs["socreSubmit"].validate(valid => {
        if (valid) {
          let obj = {};
          this.$http
            .ScoreReport_modifyScore(this.socreSubmit)
            .then(({ data }) => {
              if (data.code == 1) {
                this.$message.success("修改成功");
                this.browsdialog.innerVisible = false;
                //this.browsdialog.scoreRecordShow = false;
                let row = this.scoreGridData[this.templateSelection];
                this.openDialog();
                this.singleElection(row);
                // this.pagination.currentPage = 1;
                // this.searchCondiction.current = 1;
                this.searchCondiction.size = this.pagination.pageSize;
                this.getTableDataList();
              } else {
                this.browsdialog.innerVisible = false;
                Msg.showErrorMsg(data.info);
              }
            })
            .catch(() => {
              Msg.showErrorMsg("提交分数失败");
            });
        }
      });
    },
    // 获取积分修改权限
    getAuthor() {
      let data = {
        entity: {
          sapNum: this.$global.user.sapNum,
          state: 1
        },
        current: 1,
        size: 10
      };
      this.$http.ScoreInput_getAuthor(data).then(({ data }) => {
        if (data.code == 1) {
          if (data.rows[0].quotaAuth2 == 1) {
            this.$global.user.quotaAuth2 = 1;
          } else {
            this.$global.user.quotaAuth2 = 0;
          }
        }
      });
    },
    // 初始化按钮权限
    initAuthBtn() {
      authorize1.getBtnAuth(this.name, this.btnStatus);
    },
    // 初始化月份
    initYearMon() {
      if (new Date().getMonth()) {
        //1-11(2月-12月)
        this.year = new Date().Format("yyyy");
        this.month =
          new Date().getMonth().toString().length == 1
            ? `0${new Date().getMonth()}`
            : new Date().getMonth();
      } else {
        //0(1月)
        this.year = new Date().Format("yyyy") - 1;
        this.month = 12;
      }
    },
    // 初始化
    async init() {
      this.initYearMon();
      this.initTable("init");
      this.initAuthBtn();
      this.getDeparmentList();
      this.getquotaType();
      this.getModifyDate();
      this.getAuthor();
      // this.getScoreRuleList();
      await this.getCompanyList();
      this.getSaleArea();
      await this.getHeaderName();
      this.getTableDataList();
    }
  },
  beforeMount() {
    this.init();
  }
};
</script>
<style lang="less" scoped>
.m-view-baseScoreInput {
  .m-agTable {
    position: absolute;
    left: 0;
    right: 0;
    top: 100px;
    bottom: 35px;
  }
}
</style>
