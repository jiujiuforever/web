<template>
  <el-input
    class="aggridEditInputComponent"
    maxlength="12"
    v-model="input"
    @change="dataChange"
    placeholder="输入值"
  ></el-input>
</template>
<script>
export default {
  data() {
    return {
      input: ""
    };
  },
  methods: {
    dataChange(val) {
      this.params.setValue(val);
    }
  },
  watch: {},
  mounted() {
    this.input = this.params.data[this.params.colDef.field];
  }
};
</script>
<style lang="less" scoped>
.aggridEditInputComponent {
  /deep/.el-input__inner {
    height: 28px;
    line-height: 28px;
    background-color: transparent;
    border: none;
  }
}
</style>