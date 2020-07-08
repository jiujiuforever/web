<template>
  <div class="pagination-box" :style="`justify-content:${config.justifyContent || 'center'}`" v-show="total > 0" >
    <el-pagination
      @size-change="pageSizeChanged"
      @current-change="config.pageNumberChanged"
      :current-page="getPageNum"
      :page-size="config.pageSize || 10"
      :page-sizes="config.pageSizes || [10, 30, 50, 100]"
      :layout="config.layout || 'jumper, prev, pager, next, slot, sizes'"
      :total="total || 0"
      :style="config.styles || ''">
      <span class="fr slot c-text">共 {{getTotalPage}} 页, {{total}} 条记录</span>
    </el-pagination>
  </div>
</template>

<script>
/*
  接受一个对象作为初始配置项，例如
  config: {
    pageNumber: 1, 必选
    pageSize: 30,
    total: 100,
    pageNumberChanged: func, 必选
    pageSizeChanged: func, 必选
    layout: '',
    justifyContent:string  flex-start 左边， flex-end 右边， center 中间
  }
*/
export default {
  props: {
    config: {
      type: Object,
      required: true
    },
    total: {
      type: Number,
      required: true
    }
  },
  data() {
    return {
      pageSize: this.config.pageSize || 10
    }
  },
  computed: {
    getPageNum() {
      return this.config.pageNumber
    },
    getPageSize() {
      return this.config.pageSize
    },
    getTotalPage() {
      let pages = 0
      pages = Math.floor(this.total / (this.pageSize || 10))
      if (this.total % (this.pageSize || 10) > 0) {
        pages++
      }
      return pages
    }
  },
  methods: {
    pageSizeChanged(ps) {
      this.pageNumber = 1
      this.pageSize = ps
      if (this.config.pageSizeChanged) {
        this.config.pageSizeChanged(ps)
      }
    }
  }
}
</script>

<style lang="less" rel="stylesheet/less" scoped>
  .pagination-box {
    display: flex;
    /deep/ .el-pagination{
      clear: both;
      text-align: center;
      & .c-text {
        color: #606266;
        font-weight: normal;
        float: left;
      }
      & .number{
        font-weight: 400 !important;
      }
    }
  }
</style>
