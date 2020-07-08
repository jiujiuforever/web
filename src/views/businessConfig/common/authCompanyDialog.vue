<!-- 引入数据弹窗-->
<template>
  <el-dialog
    title="选择授权公司"
    v-if="dialogVisible"
    :visible.sync="dialogVisible"
    width="50%"
    :before-close="handleClose"
    v-dialogDrag
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    class="authCompanyDialog"
  >
    <el-transfer
      style="display:flex;justify-content:space-around;align-items:center"
      filterable
      :filter-method="filterMethod"
      filter-placeholder="请输入关键字"
      v-model="value"
      :data="transferData"
      :titles="['待选公司', '已选公司']"
      :props="props"
    ></el-transfer>
    <!-- 底部操作栏 -->
    <span slot="footer" class="dialog-footer">
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" @click="confrim">确定</el-button>
    </span>
  </el-dialog>
</template>

<script>
import Msg from "@/public/message";

export default {
  data() {
    return {
      //  已选择数据
      value: [],
      //  穿梭框别名配置
      props: {
        key: "companyCode",
        label: "CodePlusName"
      },
      filterMethod(query, item) {
        return item.CodePlusName.indexOf(query) > -1;
      }
    };
    // compareName:''
  },
  props: {
    dialogVisible: {
      type: Boolean
    },
    transferData: {
      type: Array
    },
    selectedValue: {
      type: Array
    }
  },
  beforeMount() {},
  mounted() {
    this.value = Object.assign([], this.selectedValue);
  },
  methods: {
    //   关闭弹窗
    handleClose() {
      this.value = [];
      this.$emit("dailogClose");
    },
    confrim() {
      // 确认选择数据
      let selectObj = this.transferData.filter(item1 => {
        let flage = false;
        this.value.forEach(item2 => {
          if (item2 == item1.companyCode) {
            flage = true;
          }
        });
        if (flage) {
          return true;
        } else {
          return false;
        }
      });
      let companyNames = selectObj.map(item => {
        return item.companyName;
      });
      this.$emit("setAuthCompany", this.value, companyNames.join(','));
      this.handleClose();
    }
  }
};
</script>

<style lang="less">
.authCompanyDialog {
  .el-dialog__body {
    padding-bottom: 30px;
    .el-transfer {
      .el-button {
        padding: 10px;
        span {
          i {
            color: #fff;
          }
        }
      }
      .el-transfer-panel {
        width: 40%;
      }
    }
  }
}
</style>
