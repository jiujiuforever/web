<!--创建送货计划-->
<template>
  <div class="m-selectDialog">
    <!-- 选择采购单订单弹窗 -->
    <el-dialog
      title="选择送货计划单"
      v-if="dialogVisible"
      :visible.sync="dialogVisible"
      width="90%"
      :before-close="handleClose"
      v-dialogDrag
      :close-on-click-modal="false"
      :close-on-press-escape="false"
    >
      <el-row :gutter="10" class="m-condition">
        <el-form
          :model="ruleForm"
          ref="ruleForm"
          label-width="70px"
          :inline-message="true"
          label-position="left"
        >
          <el-col :span="6">
            <el-form-item label="客户" class="centerItem">
              <el-select
                value-key="id"
                v-model="ruleForm.selCompanyCode"
                placeholder="请选择客户"
                @change="companyChange"
                clearable
              >
                <el-option
                  v-for="item in comOptions"
                  :key="item.id"
                  :label="item.companyName"
                  :value="item"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="5">
            <el-form-item label="计划单号" class="centerItem">
              <el-input v-model="ruleForm.planNo" placeholder="请输入计划单号" clearable></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="5">
            <el-form-item label="单据日期" class="centerItem">
              <el-date-picker
                v-model="ruleForm.beginDate"
                type="date"
                :placeholder="placeholder.start"
                :picker-options="pickerOptions"
                value-format="yyyy-MM-dd"
                :editable="false"
                :clearable="false"
              ></el-date-picker>
            </el-form-item>
          </el-col>
          <el-col :span="4">
            <el-date-picker
              v-model="ruleForm.endDate"
              type="date"
              :placeholder="placeholder.end"
              value-format="yyyy-MM-dd"
              :editable="false"
              :clearable="false"
            ></el-date-picker>
          </el-col>
        </el-form>
        <el-col :span="2">
          <el-button type="primary" @click="search(1)" :disabled="btnDis">查询</el-button>
        </el-col>
        <el-col :span="2">
          <el-button type="primary" @click="add">确定</el-button>
        </el-col>
      </el-row>
      <div class="dialogBody">
        <agGridComponents
          ref="agGridComponents"
          :getGridOptions="gridOptions"
          :getColumnDefs="columnDefs"
          :getRowSelection="rowSelection"
        ></agGridComponents>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          @prev-click="handlePrevClick"
          @next-click="handleNextClick"
          :current-page="pageInfo.currentPage"
          :page-sizes="[30,50,100,150,200]"
          :page-size="pageInfo.pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="pageInfo.total"
        ></el-pagination>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import _Api from "@/api";
import localeText from "@/i18n/agGridText";
import authInfo from "@/public/authInfo.js";
import serviceTime from "@/public/serverTime.js";
import agGridComponents from "@/components/agGridComponents.js";
import addOperation from "@/public/addOperation.js";


export default {
  data () {
    return {
      btnDis: false,
      detailShow: false,
      ruleForm: {
        beginDate: '', //开始日期
        endDate: '', //结束日期
        selCompanyCode: '',//公司代码
        supplierCode: '', //供应商代码
        purOrdNo: ''//订单编号
      },
      pageLayOut: 'add',
      pickerOptions: {
        disabledDate (time) {
          return time.getTime() > Date.now();
        }
      },
      //分页信息   
      pageInfo: {
        pageSize: 30,//每页显示条数
        total: 0,//总数
        currentPage: 1//当前页
      },
      rowSelection: "multiple",//多选
      // 日期控件默认值   
      placeholder:{
          start:'',
          end:''
      },
      comOptions: [],
      supplierInfo: [],
      rowData: [],
      columnDefs: "",
      gridOptions: "",
      totalOrderAmount: '',
      totalCanSendAmount: '',
      getClickValue: '',
      btnShow: true,
      companyInfo: {},
      supplier: {}
    };
  },
  props: {
    dialogVisible: {
      type: Boolean
    }
  },
  beforeMount () {
    this.gridOptions = {
      context: {
        componentParent: this
      },
      enableColResize: true,
      localeText: localeText,
      getContextMenuItems: [],
      defaultColDef: {
        menuTabs: []
      },
      pinnedBottomRowData: this.createBottomRow(1, "Bottom"),
      getRowStyle: function (params) {
        if (params.node.rowPinned) {
          return { 'color': 'red', 'font-weight': "bold" }
        }
      },
      onRowSelected: this.rowSelected,
      suppressRowClickSelection: true//单元格选中,false为选中整行
    };
    this.columnDefs = [
      { headerName: "计划订单号", field: "deliveryNo", checkboxSelection: true },
      { headerName: "单据日期", field: "planDate" },
      { headerName: "物料号", field: "matCode" },
      { headerName: "物料描述", field: "matName" },
      { headerName: "计划数量", field: "planAmount" },
      { headerName: "单位", field: "unitCode" },
      { headerName: "送货区域", field: "area" },
      //jjc
      { headerName: "送货日期", field: "sendDate", cellRenderer: function (params) {
          if (params.value)
            return new Date(Date.parse(params.value.replace(/-/g,"/"))).Format("yyyy-MM-dd");
        }
      }
    ];
  },
  mounted () {
    let that = this;
    // 获取公司信息
    authInfo.getAuthInfo().then((authCompanyInfo) => {
      that.comOptions = authCompanyInfo;
    });
    // 获取服务器时间
    serviceTime.getServiceTime().then((serviceTime) => {
      that.ruleForm.beginDate = new Date((serviceTime.getTime() - 604800000)).Format("yyyy-MM-dd");
      that.ruleForm.endDate = serviceTime.Format("yyyy-MM-dd");
      that.placeholder.start = "开始日期"
      that.placeholder.end = "结束日期"
    });
  },
  components: {
    agGridComponents
  },
  methods: {
    // 选择行回调
    rowSelected (params) {
      if (params.node.selected) {
        this.$refs.agGridComponents.gridOptions.api.forEachNode(function (node) {
          if (node.data.deliveryNo === params.data.deliveryNo && node.data.area === params.data.area && node.data.deliveryDate === params.data.deliveryDate)
            node.setSelected(true);
          else
            node.setSelected(false);
        })
      } else {
        this.$refs.agGridComponents.gridOptions.api.forEachNode(function (node) {
          if (node.data.deliveryNo === params.data.deliveryNo)
            node.setSelected(false);
        })
      }
    },
    // 关闭弹窗回调
    handleClose (done) {
      this.$emit("closePlanDialog")
      // done()
    },
    // 选择公司回调
    companyChange (value) {
      this.companyInfo = value
      this.$emit("companyChange",value)
    },
    // 选择供应商回调
    supplierChange (value) {
      if (!this.companyInfo.companyCode) {
        this.$alert("提示：请先选择公司！", {
          showClose: false,
          confirmButtonText: "确定",
          customClass: "alertPrompt"
        });
        return
      }
      this.supplier = value
    },
    // 每页显示条数回调
    handleSizeChange (val) {
      this.pageInfo.pageSize = val
      this.search()
    },
    handleCurrentChange (val) {
      this.pageInfo.currentPage = val
      this.search()
    },
    handlePrevClick (val) {
      this.pageInfo.currentPage = val
    },
    handleNextClick (val) {
      this.pageInfo.currentPage = val
    },
    // 查询采购订单
    search (flag) {
      const { beginDate, endDate, selCompanyCode, supplierCode, planNo } = this.ruleForm
      if (beginDate != "" && beginDate != null && endDate != "" && endDate != null) {
        if (beginDate > endDate) {
          this.$alert("提示：开始日期不能大于结束日期", {
            showClose: false,
            confirmButtonText: "确定",
            customClass: "alertPrompt"
          });
          return;
        }
      }
      if (!selCompanyCode) {
        this.$alert("提示：请选择客户", {
          showClose: false,
          confirmButtonText: "确定",
          customClass: "alertPrompt"
        });
        return;
      }
      let obj = {};
      let that = this;
        obj.companyCode = selCompanyCode.companyCode;
      if (this.$global.user.userTypeId == "1")
        obj.supplierCode = supplierCode.supplierCode;
      if (planNo)
        obj.planNo = planNo;
      if (beginDate != "" && beginDate != null)
        obj.planSt = beginDate
      else if ((beginDate == "" || beginDate == null) && endDate != "" && endDate != null)
        obj.planSt = endDate
      if (endDate != "" && endDate != null)
        obj.planEt = endDate
      else if ((endDate == "" || endDate == null) && beginDate != "" && beginDate != null)
        obj.planEt = beginDate;
      if (flag === 1)
        this.pageInfo.currentPage = 1;
      obj.current = this.pageInfo.currentPage;//this.currentPage;
      obj.size = this.pageInfo.pageSize;
      this.$refs.agGridComponents.loading = true;
      this.btnDis = true;
      _Api.getDeliveryPlan(obj).then(function (response) {
        that.$refs.agGridComponents.loading = false;
        that.btnDis = false;
        // that.current = 0;
        // that.textChange = 0;
        let data = response.data;
        if (data.code == "1") {
          if (data.total > 0) {
            that.rowData = data.rows.splice(0);
            that.$refs.agGridComponents.gridOptions.api.setRowData(that.rowData);
            that.totalOrderAmount = 0;
            that.totalCanSendAmount = 0;
            that.$refs.agGridComponents.gridOptions.api.forEachNode(function (node) {
              that.totalCanSendAmount = addOperation.accAdd(node.data.planAmount, that.totalCanSendAmount);
              that.$refs.agGridComponents.gridOptions.api.setPinnedBottomRowData(that.createBottomRow(1, "Bottom"));
            })
            that.pageInfo.total = data.total;
            that.$refs.agGridComponents.rowDataChange = true;
          } else {
            that.rowData = [];
            that.$refs.agGridComponents.gridOptions.api.setRowData([]);
            that.pageInfo.total = 0;
            that.totalCanSendAmount = 0;
            that.$refs.agGridComponents.gridOptions.api.setPinnedBottomRowData(that.createBottomRow(1, "Bottom"));
          }
        } else {
          that.$alert(data.info, {
            showClose: false,
            confirmButton: "确定",
            customClass: "alertFailure"
          });
          that.rowData = [];
          that.$refs.agGridComponents.loading = false;
          that.$refs.agGridComponents.gridOptions.api.setRowData([]);
          that.pageInfo.total = 0;
          that.btnDis = false
        }
      }).catch((err) => {
        that.$alert(err.data.message, {
          showClose: false,
          confirmButton: "确定",
          customClass: "alertFailure"
        });
        that.$refs.agGridComponents.loading = false;
        that.$refs.agGridComponents.gridOptions.api.setRowData([]);
        that.pageInfo.total = 0;
        that.current = 0;
        that.btnDis = false
        // that.textChange = 0;
      })
    },
    // 创建底部合计栏
    createBottomRow (count, prefix) {
      let result = [{
        matName: "合计",
        planAmount: this.totalCanSendAmount
      }];
      return result;
    },
    // 确认选择送货计划单
    add () {
      let rows = this.$refs.agGridComponents.gridOptions.api.getSelectedRows();
      if (rows.length <= 0) {
        this.$alert("提示：请选择需要创建的数据", {
          showClose: false,
          confirmButtonText: "确定",
          customClass: "alertPrompt"
        });
        return;
      }
      this.$emit("addPlan", rows)
    }
  }
};
</script>

<style lang="less" scope>
.m-m-selectDialog {
  .el-dialog__body {
    height: 500px;
    position: relative;
  }
  .dialogBody {
    position: absolute;
    top: 45px;
    bottom: 0px;
    left: 0px;
    right: 0px;
  }
  .el-dialog__footer {
    padding-top: 0;
    margin-top: 0px;
    text-align: center;
    .dialog-footer {
      button {
        width: 10px;
      }
    }
  }
}
.dropMenu {
  left: 176px;
  width: 150px;
}
</style>