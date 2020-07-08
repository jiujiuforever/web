<!-- echarts图表组件 -->
<template>
  <div class="m-echarts" style="height:100%">
    <div :id="id" :style="{width:width, height:height,background:'#f5f6fa'}"></div>
  </div>
</template>

<script>
import echarts from 'echarts'
export default {
  data () {
    return {
      chartOption: {},
      screenWidth: document.body.clientWidth,
      myChart: ''
    }
  },
  props: {
    options: {
      type: Object
    },
    id: {
      type: String
    },
    width: {
      type: String
    },
    height: {
      type: String
    }
  },
  mounted () {
    // 初始化图表  
    this.myChart = echarts.init(document.getElementById(this.id))
    this.myChart.on('pieselected', (parmas) => {
      this.$emit('pieselected', parmas)
    })
    window.addEventListener('resize', () => {
      this.myChart.resize()
    })
  },
  watch: {
    options: {
      deep: true,
      handler (val, oldVal) {
        this.chartOption = val
        this.drawCharts()
      }
    },
    screenWidth (val) {
      if (val) {
        this.drawCharts()
      }
    }
  },
  methods: {
    drawCharts () {
      //   绘制图表
      this.myChart.setOption(this.chartOption)
      //  图表事件监听
      let that = this
      this.myChart.on('click', function (parmas) {
        that.$emit('chartClick', parmas)
      })
      //   this.myChart.dispatchAction({
      //     type: 'pieSelect',
      //     // 可选，系列 index，可以是一个数组指定多个系列
      //     seriesIndex: 0,
      //     // 数据的 index，如果不指定也可以通过 name 属性根据名称指定数据
      //     dataIndex: 0
      //     // 可选，数据名称，在有 dataIndex 的时候忽略
      //   })
      this.myChart.dispatchAction({
        type: 'highlight',
        // 可选，系列 index，可以是一个数组指定多个系列
        seriesIndex: 0,
        // 可选，数据的 index
        dataIndex: 0
      })
    }
  }
}
</script>

<style>
</style>