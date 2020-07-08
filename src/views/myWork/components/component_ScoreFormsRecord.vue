<template>
  <div class="m-window">
    <div class="m-conditon">
      <el-row :gutter="10">
        <el-col :span="4">
          <el-input
            placeholder="输入工号/姓名"
            v-model.trim="searchForm.spaNum"
            clearable
            maxlength="20"
            @keyup.native.enter="search()"
          ></el-input>
        </el-col>
        <el-col :span="2" class="pull-right">
          <el-button type="primary" @click="search()">查询</el-button>
        </el-col>
        <el-col :span="2" class="pull-right">
          <el-button type="primary" @click="goBack()">返回</el-button>
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
  </div>
</template>
<script>
import gridOptions from "lesso-common/public/gridOptions";
import Msg from "@/public/message.js";
export default {
  data() {
    return {
      name: "ScoreFormsRecord",
      // 查询条件
      searchForm: {
        spaNum: "",
        type: 1
      },
      // agGrid参数
      agGrid: {
        gridOptions: {},
        rowData: [],
        columnDefs: []
      },
      // loading
      loading: false,
      //   换页
      pageInfo: {
        current: 1,
        pageSizes: [30, 50, 100, 150, 200],
        pageSize: 30,
        total: 0,
        layout: "total, sizes, prev, pager, next, jumper"
      }
    };
  },
  methods: {
    //   初始化表格
    initTable() {
      this.agGrid.gridOptions = Object.assign(gridOptions(), {
        context: {
          componentParent: this
        }
      });
      this.agGrid.columnDefs = [
        {
          headerName: "SAP编号",
          field: "sapNum",
          width: 120
        },
        {
          headerName: "操作人",
          field: "createBy",
          width: 120
        },
        {
          headerName: "页面昵称",
          field: "interfaceName",
          width: 240
        },
        {
          headerName: "操作设备",
          field: "type",
          width: 120,
          cellRenderer: function(params) {
            if (params.value == 1) {
              return "<span>PC端</span>";
            } else if (params.value == 2) {
              return "<span>手机端</span>";
            }
          }
        },
        {
          headerName: "操作时间",
          field: "createTime",
          width: 240
        }
      ];
    },
    // 初始化数据
    initData() {
      this.loading = true;
      let obj = {
        current: this.pageInfo.current,
        entity: {
          sapNum: this.searchForm.spaNum
        },
        size: this.pageInfo.pageSize
      };
      this.$http
        .ScoreReport_getFormsRecord(obj)
        .then(({ data }) => {
          if (data.code == 1) {
            this.loading = false;
            this.agGrid.rowData = data.rows;
            this.pageInfo.total = data.total;
          } else {
            this.loading = false;
            Msg.showErrorMsg(data.info);
          }
        })
        .catch(() => {
          this.loading = false;
          Msg.showErrorMsg("获取积分项查询日志失败");
        });
    },
    // 查询
    search() {
      this.pageInfo.current = 1;
      this.initData();
    },
    // 返回积分项明细
    goBack() {
      this.$emit("goBack");
    },
    // 分页
    handleSizeChange(val) {
      this.pageInfo.pageSize = val;
      this.initData();
    },
    handleCurrentChange(val) {
      this.pageInfo.current = val;
      this.initData();
    }
  },
  beforeMount() {
    this.initTable();
  },
  mounted() {
    this.initData();
  }
};
</script>
<style lang="less" scoped>
</style>