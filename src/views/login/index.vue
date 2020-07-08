<template>
  <div class="m-view-login">
    <!-- </div> -->
    <div class="m-content">
      <!-- <div class="m-leftImg"> -->
      <!-- <img src="@/assets/slices.png"> -->
      <!-- <el-carousel>
          <el-carousel-item v-for="(item,index) in swipers" :key="index">
            <img :src="item.url" :alt="item.title" />
      </el-carousel-item>-->
      <!-- <el-carousel-item>
            <img src="@/assets/swiper1.png">
      </el-carousel-item>-->
      <!-- </el-carousel> -->
      <!-- </div> -->
      <div class="m-rightFrom">
        <div class="m-form">
          <div class="m-form-header">
            <img src="../../../static/image/srm_logo.png" />
            <p>联塑积分管理系统</p>
            <p>Integration management</p>
          </div>
          <el-input v-model.trim="user" type="text" maxlength="20" placeholder="用户名" ref="content"></el-input>
          <el-input
            v-model.trim="pwd"
            type="password"
            maxlength="20"
            placeholder="密码"
            @keyup.enter.native="login"
          ></el-input>
          <div class="m-text" @click="openResetPass">忘记密码?去找回</div>
          <el-button type="primary" @click="login">登录</el-button>
          <div class="m-tips">为保障使用流畅,推荐使用谷歌(Google)浏览器。</div>
        </div>
      </div>
    </div>
    <div class="m-footer">©联塑 粤ICP备16025414号-3</div>
    <!-- 重置密码弹窗 -->
    <el-dialog
      title="重置密码"
      :visible.sync="resetPassword"
      :close-on-click-modal="false"
      :before-close="cancel"
    >
      <el-form label-width="100px" status-icon :rules="rules" ref="ruleForm" :model="ruleForm">
        <el-form-item label="账号" prop="username">
          <el-input placeholder="请输入账号" v-model="ruleForm.username"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input placeholder="请输入邮箱" type="email" v-model="ruleForm.email" auto-complete="off"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="cancel">取消</el-button>
        <el-button type="primary" @click="confirmModify" :disabled="btndis">确定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<style lang="less">
.m-view-login {
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  bottom: 0;
  overflow-y: auto;
  padding-bottom: 137px;
  .m-header {
    height: 26px;
    padding: 40px 0 0 40px;
    -webkit-app-region: drag;
    .m-function {
      position: absolute;
      right: 0;
      top: 0;
      margin: 15px;
      margin-left: 0;
      -webkit-app-region: no-drag;
      span {
        float: left;
        width: 30px;
        height: 30px;
        text-align: center;
        line-height: 30px;
        font-size: 20px;
        cursor: pointer;
        &:hover {
          background: #ddd;
        }
      }
    }
  }
  .m-content {
    // position: absolute;
    top: 60px;
    bottom: 137px;
    left: 0;
    right: 0;
    padding-left: 10px;
    margin-top: 60px;
    display: flex;
    padding-right: 15px;
    justify-content: center;
    // flex-wrap: wrap-reverse;
    .m-leftImg {
      position: relative;
      //   float: left;
      width: 800px;
      //   flex: 1;
      height: 480px;
      .el-carousel {
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        .el-carousel__container {
          height: 100%;
          img {
            width: 100%;
            height: 100%;
            object-fit: fill;
          }
        }
      }
    }
    .m-rightFrom {
      position: relative;
      //   float: right;
      //   width: 40%;
      //   flex: 1;
      border: 1px solid #ebebeb;
      padding-right: 40px;
      //   height: 100%;
      //   padding-top: 40px;
      .m-form {
        width: 280px;
        // height: 256px;
        // position: absolute;
        // // left: 50px;
        // top: 40px;
        margin: 40px 0 0 50px;
        .m-form-header {
          text-align: center;
          margin-bottom: 17px;
          p:nth-of-type(1) {
            font-size: 25px;
            font-weight: bold;
            color: #8a8f99;
            margin-top: 20px;
          }
          p:nth-of-type(2) {
            font-size: 14px;
            color: #8a8f99;
            margin-top: 5px;
          }
        }
        .m-text {
          margin-top: 10px;
          font-size: 12px;
          color: #999999;
          cursor: pointer;
          text-align: right;
        }
        input {
          margin-top: 23px;
        }
        button {
          width: 100%;
          margin-top: 10px;
        }
        .m-tips {
          font-size: 13px;
          color: #24b36b;
          margin-top: 20px;
        }
      }
    }
  }
  .m-footer {
    //   height: 137px;
    //   line-height: 137px;
    width: 100%;
    color: #cccccc;
    font-size: 13px;
    text-align: center;
    position: absolute;
    bottom: 30px;
  }
}
@media screen and (max-width: 960px) {
  .m-content {
    justify-content: center;
    .m-leftImg {
      display: none;
    }
    .m-rightFrom {
      width: 480px;
      padding: 40px 0 20px 0;
      justify-content: center;
      border: 1px solid #ebebeb;
      .m-form {
        margin: auto !important;
      }
    }
  }
}
</style>

<script>
import _APIS from "@/api";
import aes from "@/public/aes";
import waterfall from "async-es/waterfall";
import constant from "@/public/constant";
import _utils from "@/public/utils";
import { mapMutations } from "vuex";
import { decryptSSO } from "lesso-common/public/utils";
export default {
  data() {
    return {
      // user: "lhr",
      // pwd: "admin"
      user: "", //6100852
      pwd: "", //111111
      appenvZH: "",
      resetPassword: false,
      btndis: false,
      rules: {
        username: [
          {
            message: "请输入账号",
            trigger: ["blur", "change"],
            required: true
          }
        ],
        email: [
          {
            type: "email",
            message: "请输入正确的邮箱号码",
            trigger: ["blur", "change"],
            required: true
          }
        ]
      },
      ruleForm: {
        username: "",
        email: ""
      },
      //  轮播图信息
      swipers: [
        { url: require("@/assets/swiper1.png"), title: "供应链" },
        { url: require("@/assets/swiper2.png"), title: "联塑金融" }
      ]
    };
  },
  created() {
    if (localStorage.loginAccount == undefined) {
      _utils.saveStorage("loginAccount", []);
    }
    this.sourceArr = JSON.parse(
      JSON.stringify(_utils.getStorage("loginAccount"))
    );
    if (this.sourceArr[0] != undefined) {
      this.user = this.sourceArr[0]["value"];
    }
    this.getAppenvZH();
    // 增加单点登录的配置代码
    if (this.$route.query.param) {
      let ssoKey = this.$route.query.param;
      let { username, password } = decryptSSO(ssoKey);
      this.user = username;
      this.pwd = password;
      this.login();
    }
  },
  beforeMount() {
    //this.getAppenvZH();
  },
  computed: {},
  methods: {
    ...mapMutations(["setUserData", "setCurrentRoute"]),
    winCtrl(type) {
      //          console.log(type);
      switch (type) {
        //最小化登录窗口
        case "min":
          sendMain("minLoginWin");
          break;
        //关闭登录窗口
        case "close":
          sendMain("closeLoginWin");
          break;
      }
    },
    // 打开重置密码弹窗
    openResetPass() {
      this.getIdmRetrieveUrl();
    },
    // 获取IDM找回密码地址
    getIdmRetrieveUrl(name) {
      _APIS
        .retrievePassword()
        .then(({ data }) => {
          window.open(data, "_blank");
        })
        .catch(err => {
          this.$alert("操作失败,请检查网络！", {
            confirmButtonText: "确定"
          });
        });
    },
    // 关闭重置密码弹窗并重置
    cancel() {
      this.resetPassword = false;
      this.btndis = false;
      this.$refs["ruleForm"].resetFields();
    },
    // 确认重置密码
    confirmModify() {
      this.$refs["ruleForm"].validate(valid => {
        if (valid) {
          this.btndis = true;
          _APIS
            .resetPassword({
              username: this.ruleForm.username,
              email: this.ruleForm.email
            })
            .then(res => {
              let data = res.data;
              if (data.code == 1) {
                this.$alert("密码重置成功，重置后的密码为111111", {
                  confirmButtonText: "确定"
                });
                this.cancel();
              } else {
                this.$alert(data.info, {
                  confirmButtonText: "确定"
                });
                this.btndis = false;
              }
            })
            .catch(err => {
              this.$alert("操作失败，请检查输入的账号和邮箱是否正确！", {
                confirmButtonText: "确定"
              });
              this.btndis = false;
            });
        }
      });
    },
    login() {
      var that = this;
      if (!that.user) {
        that.$alert("请输入用户名", {
          confirmButtonText: "确定"
        });
        return;
      }
      if (!that.pwd) {
        that.$alert("请输入密码", {
          confirmButtonText: "确定"
        });
        return;
      }
      //jwt登录方法
      waterfall(
        [
          function getToken(callback) {
            // 获取 Token
            _APIS
              .getToken({
                tokenkey: "get"
              })
              .then(
                function success(res) {
                  //                      console.log('getToken:',res);
                  var data = res.data;
                  //                      console.log(data);
                  if (data.meta.code == 200) {
                    //加密
                    callback(null, true, data);
                  } else {
                    callback(res);
                  }
                },
                function error(err) {
                  callback(err);
                }
              );
          },
          function login(status, tokenData, callback) {
            if (!status) {
              return;
            }
            // 登录
            _APIS
              .login({
                password: aes.encrypt(that.pwd, tokenData.data.tokenKey),
                methodName: "login",
                userName: that.user,
                userKey: tokenData.data.userKey,
                timestamp: tokenData.meta.timestamp,
                systemId: constant.systemId,
                deviceInfo: "PC",
                isIdm: 1
              })
              .then(
                function success(res) {
                  //                      console.log('login:',res)
                  var data = res.data;
                  var duplicate = false;
                  if (data.meta.code == 200) {
                    //登錄成功，把賬號存入本地存儲
                    var obj = that.user;
                    var sourceArr = _utils.getStorage("loginAccount");
                    for (var i = 0; i < sourceArr.length; i++) {
                      if (obj == sourceArr[i]["value"]) {
                        sourceArr.splice(i, 1);
                        i = i - 1;
                        sourceArr.unshift({ value: obj });
                        _utils.saveStorage("loginAccount", sourceArr);
                        duplicate = true;
                        break;
                      }
                    }
                    if (!duplicate) {
                      var list = [];
                      if (sourceArr.length >= 5) {
                        for (var j = 0; j < 4; j++) {
                          list.push(sourceArr[j]);
                        }
                      } else {
                        for (var k = 0; k < sourceArr.length; k++) {
                          list.push(sourceArr[k]);
                        }
                      }
                      list.unshift({ value: obj });
                      _utils.saveStorage("loginAccount", list);
                    }
                    // 字段映射，兼容旧代码使用字段
                    data.data.user.userId = parseInt(data.data.user.username);
                    data.data.user.loginName = data.data.user.employeeName;
                    //jjc20181112
                    if (that.pwd == constant.defaultPwd)
                      data.data.user.isDefaultPwd = true;

                    // let userData = {
                    //   user: data.data.user,
                    //   token: data.data.jwt,
                    //   roles: data.data.roles,
                    // };
                    let userData = data.data;
                    userData.token = data.data.jwt;
                    _utils.saveSession("currentAct", that.user);
                    that.setUserData(userData);
                    that.saveConstant();
                    callback(null, userData);
                  } else if (data.meta.code == 301) {
                    const { msg } = data.meta;
                    that
                      .$confirm("首次登陆,请先修改密码！", {
                        confirmButtonText: "确定",
                        cancelButtonText: "取消"
                      })
                      .then(() => {
                        window.open(`${msg}?userid=${that.user}`, "_blank");
                      })
                      .catch(() => {
                        console.log("已取消修改");
                      });
                  } else if (data.meta.code == 302) {
                    const { msg } = data.meta;
                    that
                      .$confirm("密码太久没有更换了，请先修改密码！", {
                        confirmButtonText: "确定",
                        cancelButtonText: "取消"
                      })
                      .then(() => {
                        window.open(`${msg}?userid=${that.user}`, "_blank");
                      })
                      .catch(() => {
                        console.log("已取消修改");
                      });
                  } else {
                    callback(res);
                  }
                },
                function error(err) {
                  that.$message({
                    message: err.response.data.info,
                    type: "error"
                  });
                  callback(err);
                }
              );
          },
          function getTimestamp(userData, callback) {
            //获取时间戳(websocket 对比使用)
            _APIS.getTimestamp().then(
              function success(res) {
                userData.timestamp = res.data;
                that.setUserData(userData);
                that.saveConstant();
                that.$router.push({
                  name: "home"
                });
                that.loading = false;
              },
              function error(err) {
                callback(err, 0);
              }
            );
          }
        ],
        function(err, result) {
          //              console.log('waterfall err:',err,result)
          let errMsg;
          //              if(result == 0){
          //                  errMsg = "登陆失败,请检查网络";
          //              } else if(result==1){
          //                  errMsg = err.data.meta.msg;
          //              }
          if (err.data.meta.code == 500) {
            errMsg = err.data.meta.msg;
            that.$refs.content.focus();
          }
          that.$alert(errMsg, {
            confirmButtonText: "确定"
          });
        }
      );
    },
    // 存储全局变量
    saveConstant() {
      let localData = _utils.getSession("userData");
      constant.userId = localData.user.id;
      constant.userName = localData.user.employeeName;
      constant.employeeName = localData.user.employeeName;
      constant.sapNum = localData.user.sapNum;
      constant.token = localData.token;
      constant.account = localData.user.userName;
      constant.accountType = localData.user.userTypeId;
      constant.phone = localData.user.phone;
      constant.bukrs = localData.user.bukrs;
      constant.butxt = localData.user.butxt;
      constant.user = localData.user;
      constant.system = localData.system;
    },
    // 显示当前程序环境
    getAppenvZH() {
      if (constant.appenv == "dev") {
        this.appenvZH = "(开发环境)";
      } else if (constant.appenv == "qas") {
        this.appenvZH = "(测试环境)";
      } else if (constant.appenv == "app") {
        this.appenvZH = "(正式环境)";
      }
      //          console.log(this.appenvZH)
    }
  }
};
</script>