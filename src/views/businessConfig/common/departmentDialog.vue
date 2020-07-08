<!-- 引入数据弹窗-->
<template>
  <el-dialog
    title="选择授部门"
    :visible="true"
    width="50%"
    v-dialogDrag
    :before-close="handleClose"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    class="departmetnDialog"
  >
    <el-transfer
      style="display:flex;justify-content:space-around;align-items:center"
      filter-placeholder="请输入关键字"
      :titles="['待选部门', '已选部门']"
      filterable
      v-model="selectedData"
      :data="selectionOptions"
      :props="props"
      @change="changeElement"
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
      selectedData: [],
      //  穿梭框别名配置
      props: {
        key: "code",
        label: "codeCn"
      }
    };
  },
  props: {
    selectionOptions: {
      type: Array
    },
    selectData: {
      type: Array
    }
  },
  mounted() {
    this.selectedData = Object.assign([], this.selectData);
  },
  methods: {
    // 穿梭框过滤方法
    filterMethod(query, item) {
      return item.label.indexOf(query) > -1;
    },
    // 穿梭框变更数据
    changeElement(currentValue, direction, movedKeys) {
      if (direction == "left") {
      } else if (direction == "right") {
      }
    },
    //   关闭弹窗
    handleClose() {
      this.selectedData = [];
      this.$emit("departmentailogClose");
    },
    // 确认数据
    confrim() {
      let selectObj = this.selectionOptions.filter(item1 => {
        let flage = false;
        this.selectedData.forEach(item2 => {
          if (item2 == item1.code) {
            flage = true;
          }
        });
        if (flage) {
          return true;
        } else {
          return false;
        }
      });
      let roleNames = selectObj.map(item => {
        return item.codeCn;
      });
      this.$emit("confirmDepartment", this.selectedData, roleNames.join(','));
      this.handleClose();
    }
  }
};
</script>

<style lang="less">
.departmetnDialog {
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
