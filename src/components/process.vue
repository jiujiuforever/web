<template>
  <div>
    <!-- 流程图 -->
      <div class="accept-col"  :class="{'accept-col-height':isCus}">
        <el-row type="flex" justify="center">
          <el-col :span="24" class="steps-col" v-show="!statusDialog">
            <div v-if="!isLoading">
              <el-steps :active="activeIndex" finish-status="success"   process-status='process' align-center v-if="longSteps.length!=0" >
                <el-step v-for="(v,i) in longSteps" :key="i" :title="v.name" :description="v.title+v.prcsUser+' '+v.prcsDate">
                </el-step>
              </el-steps>
              <div style="text-align: center" v-else>暂无流程数据</div>
            </div>
            <div style="text-align: center" v-else>数据加载中 </div>
          </el-col>
          <el-col :span="24" class="steps-col" v-show="statusDialog">
            <div v-if="!isLoading">
              <el-steps :active="activeIndex" finish-status="success"  process-status='error' align-center v-if="longSteps.length!=0">
                <el-step v-for="(v,i) in longSteps" :key="i" :title="v.name"  :description="v.title+v.prcsUser+' '+v.prcsDate" >
                </el-step>
              </el-steps>
              <div style="text-align: center" v-else>暂无流程数据</div>
            </div>
            <div style="text-align: center" v-else>数据加载中</div>
          </el-col>
        </el-row>
      </div>
      <div slot="footer" class="dialog-footer" style="text-align: center;padding-bottom: 20px;">
        <el-button type="primary" @click="$emit('dialogclose')">关闭</el-button>
      </div>
  </div>
</template>
<style lang="less" scoped>
 .accept-col {
   margin-bottom: 200px;
    .steps-col {
      height: 65px;
      margin-top: 30px;

      /deep/.el-steps {
        .el-step {
          .el-step__head {
            .el-step__icon.is-text {
              border-width: 1px;

              .el-step__icon-inner {
                font-size: 12px;
              }
            }

            &.is-success {
              .el-step__line {
                background: #409EFF;
              }
            }

            &.is-success{
              color: #fff;
              border-color: #409EFF;

              .el-step__icon.is-text {
                background: #0C82D7;

                .el-step__icon-inner {
                  color: #fff;
                  font-weight: 400;
                }
              }
            }
            &.is-process {
              color: #fff;
              border-color: #da40d6;

              .el-step__icon.is-text {
                background: #da40d6;

                .el-step__icon-inner {
                  color: #fff;
                  font-weight: 400;
                }
              }
            }
          }

          .el-step__main {
            .el-step__title {
              line-height: 35px;

              &.is-success{
                color: #409EFF;
              }
              &.is-process {
                color: #da40d6;
              }
            }
            .el-step__description.is-process{
              color: #da40d6 !important;
            }
          }
        }

        .el-step__title {
          font-size: 14px;
          font-weight: 400;
          color: #666;
        }
        .el-step__title.is-error{
            color: #f56c6c !important;
          }
      }
    }
  }
  .accept-col-height{
    margin-bottom: 100px;
  }
</style>

<script>
export default {
  props: {
    applyId: {   //传入当前的applyid
      type: String,
      required: true   
    },
    status: {   //传入当前选中的数据状态
      type: Boolean,
      required: true
    },
    process: {   //传入显示隐藏弹窗
      type: Boolean,
      required: true
    },
    isCus:{    //传入当前是哪个角色请求
      type: Boolean,
      required: true
    }
  },
  data() {
    return {
      longSteps: [],
      activeIndex: 0,
      showDialog:false,
      statusDialog:true,
      isLoading:true,   //流程图数据加载显示判断
    }
  },
  created(){
    
  },
  watch:{
    process:{
     　handler(val, oldVal) {
          if(val == true){
            this.statusDialog = this.status   
            if(this.isCus){
              this.getLineProCus()
            }else{
              this.getLinePro()
            }
          }
    　　},
    　　immediate: true
    }
  },
  mounted(){
    this.$tap.$on('getLineProFn', function () {
        //_this.showDialog = _this.process
        // _this.statusDialog = _this.status       
        // if(_this.isCus){
        //   _this.getLineProCus()
        // }else{
        //   _this.getLinePro()
        // }
        
    })

    
  },
  methods: {
      getLineProCus() {
        let params = {
          "applyId": this.applyId
        }
        let that = this
        that.longSteps=[];
        this.isLoading =true;
        this.$http.getCustActivityByApplyId(params).then(res => {
            this.isLoading =false;
            if (res.data.code == 200) {
              let lineArr = res.data.rows;
              lineArr.map((val,index)=>{
                val['title']=""
                val['prcsUser']=""
              })
              that.longSteps = lineArr;
              lineArr.map(function (v, i) {
                if (v.result == 2) {
                  that.activeIndex = i + 1
                } else if (v.result == 1||v.result == 3||v.result ==4) {
                  that.activeIndex = i
                }
              })
            }
          })
          .catch(errror => {
            this.$alert("查询流程图数据失败，请检查网络！", {
              confirmButtonText: "确定",
              customClass: "alertFailure"
            });
          });
      },
      getLinePro() {
        let params = {
          "applyId": this.applyId
        }
        let that = this
        that.longSteps=[];
        this.isLoading =true;
        this.$http.getAllActivityByApplyId(params).then(res => {
          this.isLoading =false;
            if (res.data.code == 200) {
              let lineArr = res.data.rows;
              lineArr.map((val,index)=>{
                val['title']="操作人："
              })
              that.longSteps = lineArr;
              lineArr.map(function (v, i) {
                if (v.result == 2) {
                  that.activeIndex = i + 1
                } else if (v.result == 1||v.result == 3||v.result ==4) {
                  that.activeIndex = i
                }
              })
            }
          })
          .catch(errror => {
            this.$alert("查询流程图数据失败，请检查网络！", {
              confirmButtonText: "确定",
              customClass: "alertFailure"
            });
          });
      },
      closeDialog() {
        this.showDialog = false
      },
      
  },
 
}
</script>

