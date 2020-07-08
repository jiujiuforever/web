<!--流程信息组件-->
<template>
<el-dialog :title="dialogTitle" :visible.sync="stepsVisible" width="60%" :before-close="handleClose" v-dialogDrag :close-on-click-modal="false" :close-on-press-escape="false">
  <div class="m-account-steps">
        <el-row type="flex" justify="center">
          <el-col :span="24" class="steps-col">
            <div v-if="isLoading">
              <el-steps :active="activeIndex" finish-status="success"   process-status='process' align-center v-if="stepsData.length!=0" >
                <el-step v-for="(v,i) in stepsData" :key="i" :title="v.name">
                    <div slot="description">
                        <!-- {{v.title+v.prcsUser+' '+v.prcsDate}} -->
                        <p>{{v.prcsUser}}</p>
                        <p>{{v.prcsDate}}</p>
                        <p>{{v.prcsUserOther}}</p>
                        <p>{{v.prcsDateOther}}</p>
                    </div>
                </el-step>
              </el-steps>
              <div style="text-align: center" v-else>暂无流程数据</div>
            </div>
            <div style="text-align: center" v-else>数据加载中 </div>
          </el-col>
        </el-row>
      </div>
      <div slot="footer" class="dialog-footer" style="text-align: center;padding-bottom: 20px;">
        <el-button type="primary" @click="handleClose">关闭</el-button>
      </div>
  </el-dialog>
</template>

<script>

export default {
    data() {
        return {
           isLoading:true
        }
    },
    props: {
        activeIndex:{
            type:Number
        },
        stepsData:{
            type:Array
        },
        dialogTitle: {
            type:String
        },
        stepsVisible:{
            type:Boolean
        }
    },
    methods: {
        // 关闭弹窗回调
        handleClose () {
            this.$emit('dialogclose')
        }
    },
    components: {}
};
</script>

<style lang="less" scoped>
.m-account-steps {
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

