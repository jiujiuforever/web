<!-- 新增或者编辑积分项弹窗 -->
<template>
  <div class="m-setScoreItem-dialog">
    <el-dialog
      :title="editTitle"
      :visible.sync="dialogVisible"
      width="60%"
      :before-close="dialogClose"
      v-dialogDrag
      :close-on-click-modal="false"
      :close-on-press-escape="false"
    >
      <el-form
        :model="ruleForm"
        :disabled="onlyRead"
        ref="ruleForm"
        label-width="100px"
        class="demo-ruleForm"
        :rules="rules"
        v-loading="loading"
      >
        <el-row>
          <!-- 第一列:名称，分类，排序，评价部门，积分类型，备注，加减分 -->
          <el-col :span="24">
            <el-row v-if="editTitle == '编辑积分项'">
              <el-form-item label="积分项编码" prop="quotaCode">
                <el-input v-model.trim="ruleForm.quotaCode" maxlength="100" :disabled="true"></el-input>
              </el-form-item>
            </el-row>
            <!-- 1-1 名称 -->
            <el-row>
              <el-form-item label="名称" prop="quotaName">
                <el-input v-model.trim="ruleForm.quotaName" maxlength="100"></el-input>
              </el-form-item>
            </el-row>
            <!-- 1-4 评价部门 & 积分类型-->
            <el-row>
              <el-col :span="12">
                <el-form-item label="评价部门" prop="roleCode">
                  <el-select
                    value-key="id"
                    v-model="ruleForm.roleCode"
                    ref="content"
                    @change="handleSelectRole"
                  >
                    <el-option
                      v-for="(departitem, index) in departOptions"
                      :key="index"
                      :label="departitem.name"
                      :value="departitem.code"
                    ></el-option>
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="录入频率" prop="quotaType">
                  <el-select value-key="id" v-model="ruleForm.quotaType" ref="content">
                    <el-option
                      v-for="(assessitem, index) in assessOptions"
                      :key="index"
                      :label="assessitem.label"
                      :value="assessitem.value"
                    ></el-option>
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
            <!-- 1-3 最高分最低分 -->
            <el-row>
              <el-col :span="8">
                <el-form-item label="最高分" prop="up">
                  <el-input v-model.trim="ruleForm.up" maxlength="20"></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="最低分" prop="down">
                  <el-input v-model.trim="ruleForm.down" maxlength="20"></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="整数倍" prop="chushu">
                  <el-input v-model.trim="ruleForm.chushu" maxlength="20"></el-input>
                </el-form-item>
              </el-col>
            </el-row>
            <!-- 1-4 分值说明 -->
            <el-row>
              <el-form-item label="分值说明" prop="scoreDescription">
                <el-input v-model.trim="ruleForm.scoreDescription" maxlength="150"></el-input>
              </el-form-item>
            </el-row>
            <!-- 1-5 备注-->
            <el-row>
              <el-form-item label="备注" prop="remark">
                <el-input type="textarea" v-model.trim="ruleForm.remark" maxlength="150"></el-input>
              </el-form-item>
            </el-row>
            <!-- 1-6 加减分项-->
            <!-- <el-row>
              <el-form-item prop="scoreType">
                <el-radio-group v-model="ruleForm.scoreType">
                  <el-radio :label="1">加分项</el-radio>
                  <el-radio :label="0">减分项</el-radio>
                </el-radio-group>
              </el-form-item>
            </el-row>-->
          </el-col>
        </el-row>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogClose" :disabled="loading">取消</el-button>
        <el-button type="primary" @click="saveData" :disabled="loading" v-if="!onlyRead">保存</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import Msg from "@/public/message";
import _APIS from "@/api";
export default {
  data() {
    let validateNumberUp = (rule, value, callback) => {
      var regu = /^(\-|\+)?\d+(\.\d+)?$/;
      if (regu.test(value)) {
        if (Number(value) > Number(this.ruleForm.down)) {
          callback();
        } else {
          return callback(new Error("不能低于最低分"));
        }
      } else {
        return callback(new Error("不能为字符串"));
      }
    };
    let validateNumberDown = (rule, value, callback) => {
      var regu = /^(\-|\+)?\d+(\.\d+)?$/;
      if (regu.test(value)) {
        if (Number(value) < Number(this.ruleForm.up)) {
          callback();
        } else {
          return callback(new Error("不能高于最高分"));
        }
      } else {
        return callback(new Error("不能为字符串"));
      }
    };
    let validateNumberchushu = (rule, value, callback) => {
      // var regu = /^[1-9]|[1-9][0-9]+$/
      var regu = /^\+?[1-9]\d*$/;
      if (regu.test(value)) {
        callback();
      } else {
        return callback(new Error("请填写非0正整数"));
      }
    };
    return {
      // 表单项
      ruleForm: {
        id: "", //指标项id
        quotaCode: "",
        quotaName: "", //积分项名称
        parentClassId: "", //分类名
        sort: "", //排序
        remark: "", //备注
        roleCode: "", //角色编码
        roleName: "", //角色名
        quotaType: "", //积分类型
        state: 1,
        scoreDescription: "",
        up: "",
        down: "",
        chushu: ""
        // scoreType: 1 //加分：1 ，减分：0
      },

      comLabel: "",
      headClassId: "", //顶级ID
      parentName: "",
      // 所有的表单校验规则
      rules: {
        quotaName: [
          {
            required: true,
            message: "请输入积分项名称",
            trigger: ["blur", "change"]
          }
        ],
        quotaType: [
          { required: true, message: "请选择录入频率", trigger: "change" }
        ],
        roleCode: [
          { required: true, message: "请选择部门角色", trigger: "change" }
        ],
        up: [
          {
            required: true,
            message: "最高分不能为空",
            trigger: ["blur", "change"]
          },
          { validator: validateNumberUp, trigger: ["blur", "change"] }
        ],
        down: [
          {
            required: true,
            message: "最低分不能为空",
            trigger: ["blur", "change"]
          },
          { validator: validateNumberDown, trigger: ["blur", "change"] }
        ],
        chushu: [
          {
            required: true,
            message: "整数倍不能为空",
            trigger: ["blur", "change"]
          },
          { validator: validateNumberchushu, trigger: ["blur", "change"] }
        ]
      },

      //  积分类型选项
      assessOptions: [],
      //   部门角色选项列表
      departOptions: [],

      //   手工填写选项
      writeOptions: [],

      //   级联选择器配置，映射输属性更改
      cascaderProps: {
        checkStrictly: true,
        value: "id",
        label: "name",
        children: "childrenList",
        emitPath: false
      },
      // 缓存前一次选中的值
      loading: false
    };
  },
  props: {
    dialogVisible: {
      type: Boolean
    },
    editTitle: {
      type: String
    },
    //   分类选项
    classfiyOptions: {
      type: Array
    },
    // 积分项详情
    scoreDetail: {
      type: Object
    },
    // 是否只读
    onlyRead: {
      type: Boolean
    }
  },
  watch: {},
  components: {},
  beforeMount() {
    this.getQuotaType();
    this.getRoleGroup();
  },
  mounted() {
    // 初始化渲染的时候需要回显数据
    if (this.editTitle == "编辑积分项") {
      let {
        quotaType, //积分类型
        quotaInputType, //手工填写方式选项
        quotaInputIf //默认选项是或否
      } = this.scoreDetail;
      Object.assign(this.ruleForm, this.scoreDetail);
      console.log(this.ruleForm);
    }
  },

  methods: {
    // 获取各种下拉框的枚举值
    getEnumList(type, flag) {
      let data = {
        current: 1,
        entity: {
          type,
          state: 1
        },
        size: 999
      };
      return new Promise((resolve, reject) => {
        _APIS
          .getEnumList(data)
          .then(res => {
            const { code, rows, info } = res.data;
            if (code == 1) {
              rows.map(v => {
                v.label = v.codeCn;
                if (flag) {
                  v.value = v.code - 0;
                } else {
                  v.value = v.code;
                }
              });
              resolve(rows);
            } else {
              reject(info);
            }
          })
          .catch(err => {
            Msg.showErrorMsg("获取数据失败");
          });
      });
    },
    // 获取各种下拉框的枚举值，角色组
    getRoleGroup() {
      // this.getEnumList("role_group")
      //   .then(res => {
      //     this.departOptions = res;
      //   })
      //   .catch(err => {
      //     Msg.showErrorMsg(err);
      //     //  Msg.showErrorMsg("获取部门选项失败");
      //   });
      let that = this;
      let obj = {
        userId: this.$global.user.id
      };
      this.$http
        .ScoreInput_getDeparmentAuth(obj)
        .then(({ data }) => {
          if (data.code == 1) {
            if (data.rows.length == 0) {
              Msg.showErrorMsg("用户缺乏授权部门");
              return;
            }
            this.departOptions = data.rows;
          } else {
            Msg.showErrorMsg("获取授权部门失败");
          }
        })
        .catch(err => {
          console.log(err);
          Msg.showErrorMsg("获取授权部门失败");
        });
    },
    // 获取各种下拉框的枚举值
    getQuotaType() {
      this.getEnumList("quota_type", true)
        .then(res => {
          this.assessOptions = res;
        })
        .catch(err => {
          Msg.showErrorMsg(err);
          // Msg.showErrorMsg("获取积分类型失败");
        });
    },
    // 角色（评价部门）选择回调
    handleSelectRole(val) {
      this.departOptions.forEach(ele => {
        if (ele.code == val) this.ruleForm.roleName = ele.name;
      });
    },
    // 通知上层关闭当前数据编辑窗口
    dialogClose() {
      this.$emit("dialogClose");
    },
    // 独立方法，获取当前编辑的积分项所在结构的位置信息，
    getSecondId(children) {
      children.forEach((v, i) => {
        if (v.name == this.comLabel) {
          this.headClassId = v.id;
          this.parentName = v.name;
          return;
        } else if (v.childrenList && v.childrenList.length > 0) {
          this.getSecondId(v.childrenList);
        }
      });
    },
    // 保存数据
    saveData() {
      console.log(this.ruleForm);
      let that = this;
      that.$refs["ruleForm"].validate(valid => {
        if (valid) {
          let params = {
            ...that.ruleForm
          };
          // let tem = that.$refs.myTree.getCheckedNodes()[0];
          // if (that.$refs.myTree.getCheckedNodes().length > 0) {
          //   if (tem.pathNodes[1]) {
          //     that.comLabel = tem.pathNodes[1].label;
          //     that.classfiyOptions.forEach(v => {
          //       if (v.name == that.comLabel) {
          //         that.headClassId = v.id;
          //         that.parentName = v.name;
          //       } else if (v.childrenList && v.childrenList.length > 0) {
          //         that.getSecondId(v.childrenList);
          //       }
          //       return;
          //     });
          //   }
          //   if (that.$refs.myTree.getCheckedNodes()[0].level <= 2) {
          //     that.headClassId = "";
          //   }
          // }

          params.headClassId = that.headClassId;
          params.updateBy = that.$global.user.employeeName;
          params.updateId = that.$global.user.id;
          that.loading = true;
          that.$http
            .scoreItem_saveScoreItem(params)
            .then(({ data }) => {
              that.loading = false;
              if (data.code == 1) {
                that.dialogClose();
                that.$emit("saveSuccess");
                that.$message.success("保存成功");
              } else {
                Msg.showErrorMsg(data.info);
              }
            })
            .catch(err => {
              that.loading = false;
              Msg.showErrorMsg("保存数据失败");
            });
        }
      });
    }
  }
};
</script>
<style lang="less" scoped>
.m-setScoreItem-dialog {
  .el-dialog__body {
    max-height: 525px;
    overflow: scroll;
  }
}
/deep/.el-table .DisabledSelection .cell .el-checkbox .el-checkbox__inner {
  display: none;
  position: relative;
}
.moveleft {
  /deep/.el-form-item__content {
    margin-left: 2px !important;
  }
}
.moveleft2 {
  /deep/.el-form-item__content {
    margin-left: 15px !important;
  }
}

.fontControl {
  word-wrap: break-word;
  word-break: break-all;
}
</style>
