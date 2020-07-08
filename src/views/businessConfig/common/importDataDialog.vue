<!-- 引入数据弹窗-->
<template>
  <el-dialog
    :title="title"
    v-if="dialogVisible"
    :visible.sync="dialogVisible"
    width="50%"
    :before-close="handleClose"
    v-dialogDrag
    :close-on-click-modal="false"
    :close-on-press-escape="false"
  >
    <el-row :gutter="10" class="m-condition">
      <el-col :span="6">
        <el-input v-model="name" :placeholder="holderTitle" clearable maxlength="20" @keyup.native.enter="search(title)"></el-input>
      </el-col>
      <el-col :span="4" :offset="10">
        <el-button type="primary" @click="search(title)">查询</el-button>
      </el-col>
      <el-col :span="4">
        <el-button type="primary" @click="selectedData">确定</el-button>
      </el-col>
    </el-row>
    <div class="m-agTableModel">
      <ag-grid-vue
        class="m-agTableContent ag-theme-balham"
        :gridOptions="gridOptions"
        :columnDefs="columnDefs"
        :rowData="rowData"
        rowSelection="single"
        v-loading="loading"
      ></ag-grid-vue>
    </div>
    <div class="m-pageModel m-pBottom">
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
  </el-dialog>
</template>

<script>
import _Api from "@/api";
import localeText from "@/i18n/agGridText";
import Msg from "@/public/message";

export default {
  data() {
    return {
      columnDefs: [],
      keyWord: "",
      row: [],
      rowData: [],
      name: "",
      pageInfo: {
        current: 1,
        size: 30,
        total: 0
      },
      isOk: false,
      loading: false,
      holderTitle:''
    };
  },
  props: {
    dialogVisible: {
      type: Boolean
    },
    title: {
      type: String
    }
  },
  beforeMount() {
    // 表格配置
    this.gridOptions = {
      context: {
        componentParent: this
      },
      rowSelection: "single",
      enableColResize: true,
      localeText: localeText,
      onRowDoubleClicked: this.rowDoubleClicked
    };
    if (this.title == "选择公司") {
      this.holderTitle = '请输入公司编码或名称'
      this.columnDefs = [
        { headerName: "公司编号", field: "companyCode" },
        { headerName: "公司名称", field: "companyName" }
      ];
    } else if (this.title == "引入客户") {
      this.holderTitle = '请输入编号或名称'
      this.columnDefs = [
        { headerName: "客户编号", field: "clientCode" },
        { headerName: "客户名称", field: "clientName" }
      ];
    } else {
      this.holderTitle = '请输入工号或oa号或名称'
      this.columnDefs = [
        { headerName: "工号", field: "sapNum" },
        { headerName: "oa号", field: "oaNum" },
        { headerName: "名称", field: "employeeName" },
        { headerName: "所属公司", field: "butxt" }
        // {headerName: "是否启用", field: "butxt"}
      ];
    }
  },
  mounted() {
    this.search(this.title);
  },
  methods: {
    // 获取已启用公司列表数据
    getCompanyOptions() {
      const { current, size } = this.pageInfo;
      let params = {
        entity: {
          keyword: this.name,
          userId: this.$global.user.id, //调权限
          state: 1
        },
        current,
        size
      };
      this.loading = true;
      this.$http
        .userWithScoreItems_getCompanyByUserId(params)
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
          console.log(err);

          this.loading = false;
          Msg.showErrorMsg("获取数据失败");
        });
    },
    // //获取授权公司
    // getCompanyAuthList(){
    //    let params = {
    //     entity: {
    //       keyword: this.name,
    //       userId:this.$global.user.id,//调权限
    //       state: 1
    //     },
    //     current:1,
    //     size:999999
    //   };
    //   return new Promise((res,rej) => {
    //      this.$http
    //     .userWithScoreItems_getCompanyByUserId(params)
    //     .then(({ data }) => {
    //       this.loading = false;
    //       if (data.code == 1) {
    //         console.log(data.rows);
    //         res(data.rows)
    //       } else {
    //         // Msg.showErrorMsg(data.info);
    //         rej(data.info);
    //       }
    //     })
    //     .catch(err => {
    //       console.log(err);

    //       this.loading = false;
    //       Msg.showErrorMsg("获取数据失败");
    //     });
    //   })

    // },
    //  //前端分页
    // arrayPagination(currentPage = 1, pageSize, array) {
    //   var offset = (currentPage - 1) * pageSize;
    //   return offset + pageSize >= array.length ? array.slice(offset, array.length) : array.slice(offset, offset + pageSize);
    // },

    // 获取权限用户数据
    getAuthUsers() {
      const { current, size } = this.pageInfo;
      // let queryParams = {
      //   current,
      //   params: {state: 1, key:this.name, unable: 1},
      //   size
      // };
      // console.log(this.$global.user.id);
      
      let data = {
        current,
        entity: {
          employeeName:this.name
          // userId: this.$global.user.id,
          // keyword: this.name,
          // state: 1
        },
        size,
      };
      this.loading = true;
      this.$http
        .userManage_importUserList(data)
        .then(({ data }) => {
          // console.log(data);
          this.loading = false;
              if (data.code == 1) {
            this.gridOptions.api.setRowData(data.rows)
            this.pageInfo.total = data.total
          } else {
            Msg.showErrorMsg(data.info);
          this.loading = false;

          }

        })
        .catch(err => {
          // console.log(err);
          this.loading = false;
          Msg.showErrorMsg('获取数据失败');

        });
      // this.$http.userManage_getAuthUser(queryParams).then(({ data }) => {
      //     this.loading = false;
      //     if (data.code == 1) {
      //       this.gridOptions.api.setRowData(data.rows)
      //       this.pageInfo.total = data.total
      //     } else {
      //       Msg.showErrorMsg(data.info);
      //     }
      //   })
      //   .catch(err => {
      //     console.log(err);

      //     this.loading = false;
      //     Msg.showErrorMsg("获取数据失败");
      //   });
    },
    // 选择数据
    selectedData() {
      this.row = this.gridOptions.api.getSelectedRows();
      if (this.row.length <= 0) {
        this.$alert("提示：请选择需要的数据", {
          showClose: false,
          confirmButtonText: "确定",
          customClass: "alertPrompt"
        });
        return;
      }
      if (this.row[0].isSelect == "1") {
        this.$alert("提示：该数据已被添加！", {
          showClose: false,
          confirmButtonText: "确定",
          customClass: "alertPrompt"
        });
        return;
      }
      this.setSelectValue();
    },
    // 过滤数据
    onFilterChanged() {
      setTimeout(() => {
        this.gridOptions.api.setQuickFilter(this.keyWord);
      }, 200);
    },
    // 设置选中的值
    setSelectValue() {
      this.$emit("setSelectedValue", this.row);
    },
    // 查询
    search(title) {
      switch (title) {
        case "选择公司":
          this.getCompanyOptions();
          break;
        case "引入客户":
          console.log("引入客户");
          break;
        case "引入用户":
          this.getAuthUsers();
          console.log("引入用户");
          break;
        default:
          return false;
      }
    },
    handleSizeChange(params) {
      this.pageInfo.size = params;
      this.pageInfo.current = 1;
      this.search(this.title);
    },
    handleCurrentChange(params) {
      this.pageInfo.current = params;
      this.search(this.title);
    },
    handlePrevClick(params) {
      this.pageInfo.current = params;
      this.search(this.title);
    },
    handleNextClick(params) {
      this.pageInfo.current = params;
      this.search(this.title);
    },
    // 双击行
    rowDoubleClicked() {
      this.selectedData();
    },
    handleClose() {
      this.$emit("dialogClose");
    }
  }
};
</script>

<style></style>
