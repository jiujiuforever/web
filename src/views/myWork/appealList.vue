<template>
  <!-- 申诉列表 -->
  <div class="m-view-baseScoreInput m-window">
    <div>
      <el-row :gutter="10">
        <el-col :span="4">
          <el-select v-model="searchCondiction.companyCode" filterable placeholder="选择公司" clearable>
            <el-option
              v-for="(item,index) in  selectData.companyList"
              :key="index"
              :label="item.companyName"
              :value="item.companyCode"
            ></el-option>
          </el-select>
        </el-col>
        <el-col :span="2">
          <el-select v-model="searchCondiction.roleCode" placeholder="选择部门" clearable>
            <el-option
              v-for="(item,index) in  selectData.deparmentList"
              :key="index"
              :label="item.name"
              :value="item.code"
            ></el-option>
          </el-select>
        </el-col>
        <el-col :span="2">
          <el-select v-model="searchCondiction.shensuStatus" placeholder="处理状态" :clearable="true">
            <el-option label="未处理" :value="0"></el-option>
            <el-option label="已处理" :value="1"></el-option>
            <el-option label="已撤销" :value="2"></el-option>
          </el-select>
        </el-col>
        <el-col :span="4">
          <el-input
            placeholder="输入客户编码或名称"
            v-model="searchCondiction.customCode"
            clearable
            @keyup.native.enter="search"
          ></el-input>
        </el-col>
        <el-col :span="2" class="pull-right">
          <el-button type="primary" @click="handleAppeal" v-if="btnStatus.appealHandle">处理</el-button>
        </el-col>
        <el-col :span="2" class="pull-right">
          <el-button
            type="primary"
            @click="cancelAppealStatus"
            :disabled="cancelDisable"
            v-if="btnStatus.appealCancel"
          >撤销</el-button>
        </el-col>
        <el-col :span="2" class="pull-right">
          <el-button type="primary" @click="search" v-if="btnStatus.appealSearch">查询</el-button>
        </el-col>
      </el-row>

      <div class="m-agTable">
        <ag-grid-vue
          class="m-agTableContent ag-theme-balham"
          :gridOptions="agGridData.gridOptions"
          :columnDefs="agGridData.columnDefs"
          :suppressDragLeaveHidesColumns="true"
          :suppressMakeColumnVisibleAfterUnGroup="true"
          :rowMultiSelectWithClick="true"
          :rowData="agGridData.rowData"
          @gridReady="onGridReady"
          @selectionChanged="onRowSelected"
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
      title="申诉详细"
      :visible.sync="browsdialog.appealDetailVisible"
      width="60%"
      v-dialogDrag
      custom-class="dialog-body"
      :close-on-click-modal="false"
      @close="handleClose"
    >
      <!-- 外部dialog内容 -->
      <el-row type="flex" align="middle" style="height:40px">
        <el-col :span="12">申诉编号：{{appealDetail.shensuCode}}</el-col>
        <el-col
          :span="12"
        >申诉状态：{{appealDetail.shensuStatus?(appealDetail.shensuStatus==1?'已处理':'已撤销'):'未处理'}}</el-col>
      </el-row>
      <el-row type="flex" align="middle" style="height:40px">申诉原因：{{appealDetail.creatorRemark}}</el-row>
      <el-row type="flex" align="middle" style="height:40px">
        <el-col :span="12">公司：{{appealDetail.companyName}}</el-col>
        <el-col :span="12">客户：{{appealDetail.customName}}</el-col>
      </el-row>
      <el-row type="flex" align="middle" style="height:40px">
        <el-col>积分项：{{appealDetail.quotaName}}</el-col>
      </el-row>
      <!-- 录入记录表 -->
      <div style="margin:10px 0;">
        <div style="padding-bottom:10px;font-size:16px">录入记录表</div>
        <el-table :data="scoreGridData" size="mini" border style="width:100%;">
          <el-table-column property="recordTime" label="录入日期" width="200"></el-table-column>
          <el-table-column property="filed" label="得分"></el-table-column>
          <el-table-column label="新得分" v-if="appealDetail.shensuStatus != 1">
            <template slot-scope="scope">
              <el-form :model="socreSubmit" ref="socreSubmit" :rules="socreRules">
                <el-form-item prop="newFiled">
                  <el-input v-model="socreSubmit.newFiled" clearable></el-input>
                </el-form-item>
              </el-form>
            </template>
          </el-table-column>
          <el-table-column label="说明" v-if="appealDetail.shensuStatus != 1">
            <template slot-scope="scope">
              <el-input type="textarea" v-model="socreSubmit.newFiledRemark" maxlength="100"></el-input>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <el-row type="flex" align="middle" style="height:40px">
        <el-col :span="2">处理结果</el-col>
        <el-col>
          <el-input
            v-model.trim="appealDetail.dealerRemark"
            maxlength="100"
            :disabled="this.appealDetail.shensuStatus != 0"
          ></el-input>
        </el-col>
      </el-row>
      <!-- 修改记录表 -->
      <div style="margin: 10px 0;padding: 10px 0">
        <div style="padding-bottom:10px;font-size:16px">修改记录表</div>
        <el-table
          :data="modifyRecord"
          size="mini"
          border
          style="width:100%;"
          v-show="true"
          max-height="200"
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
      <div slot="footer" class="dialog-footer">
        <el-button @click="browsdialog.appealDetailVisible = false">取消</el-button>
        <el-button
          type="primary"
          v-if="this.appealDetail.shensuStatus == 0"
          @click="submitAppeal"
        >提交</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import localeText from "@/i18n/agGridText";
import Msg from "@/public/message";
import authorize1 from "@/public/authorize1";
export default {
  name: "appealList",
  data() {
    var checkScore = (rule, value, callback) => {
      if (!value) {
        callback(new Error("分数不能为空"));
      }
      if (!isNaN(value)) {
        //数字
        this.ruleList.forEach(item => {
          if (this.appealDetail.quotaCode == item.quotaCode) {
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
      }
      else {
        //字符串
        return callback(new Error("请正确填写分值"));
      }
    };
    return {
      name: "appealList",
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
      // 搜索条件
      searchCondiction: {
        companyCode: "",
        customCode: "",
        userId: "",
        roleCode: "",
        shensuStatus: ""
      },
      //   选择公司源
      selectData: {
        companyList: [],
        deparmentList: []
      },
      // 弹窗传递控制对象
      browsdialog: {
        appealDetailVisible: false,
      },
      //   选择结果查看
      appealDetail: {},
      //   录入记录表
      scoreGridData: [],
      // 选择后的值
      templateSelection: "",
      //   修改分值提交
      socreSubmit: {
        newFiled:"",
        newFiledRemark:""
      },
      // 全部规则
      ruleList: [],
      // 提交修改规则校验
      socreRules: {
        newFiled: [{ validator: checkScore, trigger: ["blur","change"] }]
      },
      //   修改记录表数据
      modifyRecord: [],
      loading: true,
      cancelDisable: false,
      // 初始化按钮权限
      btnStatus: {
        appealSearch: false,
        appealHandle: false,
        appealCancel: false
      }
    };
  },
  computed: {
    // 主表是否展示
    // showMasterTable() {
    //   return !this.browsdialog.appealDetailVisible;
    // }
  },
  methods: {
    // 表格渲染回调
    onGridReady(params) {
      this.agGridData.gridApi = params.api;
      this.agGridData.columnApi = params.columnApi;
    },
    // 获取主表数据
    getTableDataList() {
      let that = this;
      this.searchCondiction.userId = this.$global.user.id;
      let data = {
        current: this.pagination.currentPage,
        entity: this.searchCondiction,
        size: this.pagination.pageSize
      };
      this.$http
        .Appeal_getPageList(data)
        .then(({ data }) => {
          if (data.code == 1) {
            that.agGridData.rowData = data.rows;
            that.pagination.totalCount = data.total;
            
          } else {
            Msg.showErrorMsg(data.info)
          }
          this.loading = false;
        })
        .catch(({ response }) => {
          that.$message.error(response.data.info);
        });
    },
    // 搜索
    search() {
      if (
        !this.selectData.companyList.length ||
        !this.selectData.deparmentList.length
      ) {
        Msg.showErrorMsg("用户缺乏授权公司或部门,请联系管理员");
        return;
      }
      this.pagination.currentPage = 1;
      this.getTableDataList();
    },
    onRowSelected(params) {
      this.cancelDisable = true;
      let selectRow = params.api.getSelectedRows();
      if (selectRow.length && selectRow[0].shensuStatus == 1) {
        this.cancelDisable = false;
      }
    },
    // 处理申诉
    handleAppeal() {
      let rows = this.agGridData.gridOptions.api.getSelectedRows();
      if (rows.length == 0 || rows.length > 1) {
        this.$alert(`提示：请选择一条你需要处理的数据`, {
          showClose: false,
          confirmButtonText: "确定",
          customClass: "alertPrompt"
        });
        return;
      } else {
        this.appealDetail = rows[0];
        this.getRecordList();
        this.getModifyList();
        this.browsdialog.appealDetailVisible = true;
      }
    },
    // 撤销处理结果
    cancelAppealStatus() {
      let rows = this.agGridData.gridOptions.api.getSelectedRows();
      if (rows.length == 0 || rows.length > 1) {
        this.$alert(`提示：请选择一条你需要撤销的数据`, {
          showClose: false,
          confirmButtonText: "确定",
          customClass: "alertPrompt"
        });
        return;
      } else {
        let obj = {
          shensuCode: rows[0].shensuCode,
          userId: this.$global.user.id
        };
        this.$http
          .Appeal_cancelAppeal(obj)
          .then(({ data }) => {
            if (data.code == 1) {
              this.$message.success("撤销成功");
              this.search();
            } else {
              Msg.showErrorMsg(data.info);
            }
          })
          .catch(() => {
            Msg.showErrorMsg("撤销失败");
          });
      }
    },
    //  ag-grid表格表头初始化
    initTable() {
      // 配置
      this.agGridData.gridOptions = {
        context: {
          componentParent: this
        },
        enableColResize: true,
        localeText: localeText,
        rowSelection: "single", //设置单行选中
        enableCellChangeFlash: true,
        rowMultiSelectWithClick: true,
        enableFilter: false, //列过滤器
        enableSorting: true //列排序
      };
      // 头部
      this.agGridData.columnDefs = [
        {
          checkboxSelection: true,
          width: 40,
          suppressResize: false,
          pinned: "left"
        },
        {
          headerName: "申诉编码",
          field: "shensuCode",
          width: 200,
          tooltipField: "shensuCode"
        },
        {
          headerName: "公司",
          field: "companyName",
          width: 200,
          tooltipField: "companyName"
        },
        {
          headerName: "客户编码",
          field: "customCode",
          width: 120,
          tooltipField: "customCode"
        },
        {
          headerName: "客户",
          field: "customName",
          width: 200,
          tooltipField: "customName"
        },
        {
          headerName: "评价部门",
          field: "roleName",
          width: 120,
          tooltipField: "roleName"
        },
        {
          headerName: "积分项收集时间",
          field: "recordTime",
          width: 180,
          tooltipField: "recordTime"
        },
        {
          headerName: "积分项",
          field: "quotaName",
          width: 250,
          tooltipField: "quotaName"
        },
        {
          headerName: "申诉时间",
          field: "createTime",
          width: 250,
          tooltipField: "createTime"
        },
        {
          headerName: "处理状态",
          width: 120,
          field: "shensuStatus",
          cellRenderer: function(params) {
            if (params.value == 0) {
              return "未处理";
            } else if (params.value == 1) {
              return "已处理";
            } else if (params.value == 2) {
              return "已撤销";
            }
          }
        }
      ];
    },
    // 记录表获取
    getRecordList() {
      let data = {
        current: 1,
        entity: {
          customCode: this.appealDetail.customCode,
          companyCode: this.appealDetail.companyCode,
          date: this.appealDetail.recordTime,
          quotaCode: this.appealDetail.quotaCode
        },
        size: 30
      };
      this.$http
        .ScoreReport_getScoreDetail(data)
        .then(({ data }) => {
          this.browsdialog.scoreRecordShow = true;
          let changeData = data.rows;
          changeData.forEach(val => {
            val.recordTime = new Date(val.recordTime.replace(/-/g, "/")).Format(
              "yyyy-MM-dd"
            );
          });
          this.scoreGridData = changeData;
        })
        .catch();
    },
    // 关闭回调
    handleClose() {
      this.search(); 
      this.socreSubmit.newFiled = ""
      this.socreSubmit.newFiledRemark = ""
      this.appealDetail.dealerRemark = "";
    },
    // 修改得分记录
    getModifyList() {
      // 显示修改记录表格
      let obj = {
        current: 1,
        entity: {
          companyCode: this.appealDetail.companyCode,
          customCode: this.appealDetail.customCode,
          quotaCode: this.appealDetail.quotaCode,
          recordTime: this.appealDetail.recordTime
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
            } else if(val.type == 4){
              val.type = "客户编码变更"
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
    // 申诉提交
    submitAppeal() {
      this.$refs["socreSubmit"].validate(valid => {
        if (valid) {
          if (!this.appealDetail.dealerRemark) {
            this.$alert("处理结果不能为空", {
              showClose: false,
              confirmButtonText: "确定",
              customClass: "alertPrompt"
            });
            return;
          } else {
            this.$confirm(`确定提交吗？`, "提示", {
              confirmButtonText: "确定",
              cancelButtonText: "取消"
            })
              .then(() => {
                let obj = {
                  shensuCode: this.appealDetail.shensuCode,
                  dealer: this.$global.user.sapNum,
                  dealerRemark: this.appealDetail.dealerRemark,
                  newFiled: this.socreSubmit.newFiled,
                  newFiledRemark: this.socreSubmit.newFiledRemark,
                  updateId: this.$global.user.id,
                  updateBy: this.$global.user.loginName
                };
                this.$http
                  .Appeal_submitAppeal(obj)
                  .then(({ data }) => {
                    if (data.code == 1) {
                      this.$message.success("提交成功");
                      this.browsdialog.appealDetailVisible = false;
                      this.socreSubmit.newFiled = "",
                      this.socreSubmit.newFiledRemark = ""
                      this.getTableDataList();
                    } else {
                      Msg.showErrorMsg(data.info);
                    }
                  })
                  .catch(response => {
                    this.$message.error(response.data.info);
                  });
              })
              .catch(() => {
                this.$message({
                  type: "info",
                  message: "已取消操作"
                });
              });
          }
        }
      });
    },
    // 行点击选中
    singleElection(row) {
      if (this.templateSelection === 0) {
        this.templateSelection = "";
      } else {
        this.templateSelection = this.scoreGridData.indexOf(row);
      }
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
            userName: this.$global.user.loginName
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
    // 翻页
    sizeChange(val) {
      this.pagination.pageSize = val;
      this.getTableDataList();
    },
    // 当前页便变化
    currentChange(val) {
      this.pagination.currentPage = val;
      this.getTableDataList();
    },
    // api获取公司列表
    getCompanyList() {
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
            that.selectData.companyList = data.rows;
            // that.searchCondiction.companyCode = data.rows[0].companyCode;
            that.getTableDataList();
          } else {
            Msg.showErrorMsg("用户缺少公司权限,请联系管理员");
            that.loading = false;
          }
        })
        .catch(({ response }) => {
          that.$message.error(response.data.info);
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
      this.$http.ScoreReport_getDeparmentList(data).then(({ data }) => {
        if (data.code == 1) {
          that.selectData.deparmentList = data.rows;
        }
      });
    },
    // 初始化数据
    async initData() {
      await this.getDepartmentAuth();
      this.getCompanyList();
      // this.getDeparmentList();
    },
    // 根据id获取部门
    getDepartmentAuth() {
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
                Msg.showErrorMsg("您没有权限，请联系管理员");
                this.loading = false;
                return;
              }
              this.selectData.deparmentList = data.rows;
              // this.searchCondiction.roleCode = data.rows[0].code;
              resolve();
            } else {
              Msg.showErrorMsg("获取授权部门失败");
              this.loading = false;
              reject();
            }
          })
          .catch(err => {
            Msg.showErrorMsg("获取授权部门失败");
            this.loading = false;
            reject();
          });
      });
    },
    // 初始化按钮权限
    initAuthBtn() {
      authorize1.getBtnAuth(this.name, this.btnStatus);
    }
  },
  beforeMount() {
    // 初始话表格
    this.initTable();
    // 初始化数据
    this.initData();
    // 获取全部规则
    this.getScoreRuleList();
    this.initAuthBtn();
  }
};
</script>
<style lang="less" scoped>
.m-view-baseScoreInput {
  .m-agTable {
    position: absolute;
    left: 0;
    right: 0;
    top: 50px;
    bottom: 35px;
  }
}
</style>
