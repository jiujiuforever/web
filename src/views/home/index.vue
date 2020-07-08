<template>
  <div class="m-view-home">
    <div class="m-top">
      <div class="m-logo">
        <img src="@/assets/ls_logo.png" v-if="!inPlatform" />
        <span class="u-goback" @click="goBack" v-else>&lt;返回&nbsp;&nbsp;应用平台</span>
        <span>{{ systemTitle }}{{ appenvZH }}</span>
      </div>
      <div class="m-topRight">
        <div class="m-user">
          <el-dropdown trigger="hover" @command="handleCommand">
            <span class="el-dropdown-link">
              <img src="@/assets/user.png" />
              <span>{{ loginInfo }}</span>
              <i class="iconfont icon-xialasanjiao"></i>
            </span>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item command="1">修改密码</el-dropdown-item>
              <el-dropdown-item command="2">退出登录</el-dropdown-item>
              <!-- <el-dropdown-item command="3">个人设置</el-dropdown-item> -->
            </el-dropdown-menu>
          </el-dropdown>
        </div>
        <div class="m-function" v-if="userAgent == 'pc'">
          <span @click="winCtrl('min')">
            <i class="iconfont icon-minimize"></i>
          </span>
          <span @click="winCtrl('max')">
            <i class="iconfont icon-maxmize"></i>
          </span>
          <span @click="winCtrl('close')">
            <i class="iconfont icon-closeWin"></i>
          </span>
        </div>
      </div>
    </div>
    <div class="m-left" :style="telescopic ? 'width: 0' : ''">
      <ul>
        <li
          v-for="(item, index) in menuList"
          :key="index"
          @click="goMenu(item)"
          :class="{ active: item.name == titleName }"
        >
          <i :class="'iconfont icon' + item.code"></i>
          <span>{{ item.name }}</span>
        </li>
      </ul>
    </div>
    <div
      class="m-right"
      :style="{ bottom: userAgent == 'pc' ? '20px' : 0, left: telescopic ? 0 : '' }"
    >
      <div class="m-telescopic">
        <button v-show="telescopic" @click="telescopicFalse">&gt;</button>
        <button v-show="!telescopic" @click="telescopicTure">&lt;</button>
      </div>
      <el-tabs v-model="editableTabsValue" @tab-remove="removeTab" @tab-add="addTab" type="card">
        <el-tab-pane :label="titleName" name="1">
          <router-view :addTab="addTab"></router-view>
        </el-tab-pane>
        <el-tab-pane
          v-for="item in editableTabs"
          :label="item.title"
          :name="item.name"
          :key="item.name"
          closable
        >
          <component
            :is="item.content"
            :addTab="addTab"
            :isRefresh="isRefresh"
            :removeTab="removeTab"
            ref="componentContent"
          ></component>
        </el-tab-pane>
      </el-tabs>
    </div>
    <div class="m-statusBar" v-if="userAgent == 'pc'">
      <span>系统支持： 黄小姐：13549960089 左先生：18675715221</span>
      <span style="float:right;">版本号：{{ version }}{{ appenv }}</span>
    </div>
    <!-- 修改密码弹窗开始 -->
    <el-dialog
      title="修改密码"
      :visible.sync="changePassword"
      v-dialogDrag
      :close-on-click-modal="false"
      :before-close="cancel"
    >
      <el-form label-width="100px" status-icon :rules="rules" ref="ruleForm" :model="ruleForm">
        <el-form-item label="旧密码" prop="oldPass">
          <el-input placeholder="请输入旧密码" type="password" v-model="ruleForm.oldPass"></el-input>
        </el-form-item>
        <el-form-item label="新密码" prop="pass">
          <el-input
            placeholder="请输入新密码"
            type="password"
            v-model="ruleForm.pass"
            auto-complete="off"
            @paste.native.capture="deletedPaste"
          ></el-input>
        </el-form-item>
        <el-form-item label="确认新密码" prop="checkPass">
          <el-input
            placeholder="再次确认新密码"
            type="password"
            v-model="ruleForm.checkPass"
            auto-complete="off"
          ></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="cancel">取消</el-button>
        <el-button type="primary" @click="confirmModify">确定</el-button>
      </span>
    </el-dialog>
    <!-- 修改密码弹窗结束 -->
    <!-- 个人设置弹窗开始 -->
    <el-dialog
      title="个人设置"
      :visible.sync="resetVisible"
      :close-on-click-modal="false"
      :before-close="handelClose"
    >
      <el-form
        label-width="80px"
        :rules="rules"
        ref="userForm"
        class="demo-ruleForm"
        :model="userForm"
      >
        <el-form-item label="账号" prop="username">
          <el-input placeholder="请输入账号" v-model="userForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="姓名" prop="employee_name">
          <el-input
            placeholder="请输入姓名"
            v-model="userForm.employee_name"
            auto-complete="off"
            disabled
          ></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email" :class="{ 'tip-form-item': emailTips }">
          <el-input placeholder="请输入邮箱号码" type="email" v-model="userForm.email" auto-complete="off"></el-input>
        </el-form-item>
        <span class="tips" v-show="emailTips">设置邮箱可用于重置密码、接收系统邮件</span>
        <el-form-item label="手机号" prop="phone" :class="{ 'tip-form-item': phoneTips }">
          <el-input placeholder="请输入11位手机号" type="phone" v-model="userForm.phone" maxlength="11"></el-input>
        </el-form-item>
        <span class="tips" v-show="phoneTips">设置手机可用于接收系统短信提醒</span>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="handelClose">取消</el-button>
        <el-button type="primary" @click="confirmSubmit" :disabled="btndis">确定</el-button>
      </span>
    </el-dialog>
    <!-- 个人设置弹窗结束 -->
    <!-- 供应商资料设置 -->
    <div v-if="editDialogVisible">
      <supplierInfoPerfect :dialogVisible="editDialogVisible" @closeDialog="closeDialog"></supplierInfoPerfect>
    </div>
  </div>
</template>

<style lang="less">
</style>

<script>
import { mapState, mapMutations } from "vuex";
import sendMain from "lesso-common/event/ipcRenderer";
import components from "./components";
import utils from "@/public/utils";
import constant from "@/public/constant";
import waterfall from "async-es/waterfall";
import aes from "@/public/aes";
import env from "@/api/env";
import websocketClient from "lesso-common/public/websocketClient";
import { showAlert } from "lesso-common/public/utils";
import authorize from "@/public/authorize";
import Msg from "@/public/message";

const valid = {
  validatePass1() {
    return function(rule, value, callback) {
      if (value === "") {
        callback(new Error("请输入旧密码"));
      } else {
        callback();
      }
    };
  },
  validatePass3() {
    return function(rule, value, callback) {
      if (value === "") {
        callback(new Error("请再次输入密码"));
      } else {
        callback();
      }
    };
  }
};

export default {
  data() {
    let validatePass2 = (rule, value, callback) => {
      if (value === "") {
        callback(new Error("请输入密码"));
      } else if (value != "") {
        //jjc20181112
        let reg = new RegExp(
          "^(?![d]+$)(?![a-zA-Z]+$)(?![^da-zA-Z]+$).{6,20}$"
        );
        let regCn = new RegExp("[\\u4E00-\\u9FFF]+", "g");
        if (!reg.test(value)) {
          callback(new Error("密码必须6~20位长度，且要包含数字和字母！"));
        } else if (regCn.test(value)) {
          callback(new Error("密码不能包含汉字！"));
        } else if (value.indexOf(" ") > -1) {
          callback(new Error("密码不能输入空格，只能是数字跟字母的组合！"));
        } else if (this.ruleForm.oldPass === value) {
          callback(new Error("新密码不能跟旧密码相同"));
        } else {
          callback();
        }
      }
    };
    let vaildPhone = (rule, value, callback) => {
      setTimeout(() => {
        if (value) {
          let reg = new RegExp("^((1[0-9]))\\d{9}$");
          if (!reg.test(value)) {
            this.phoneTips = false;
            callback(new Error("请输入11位符合要求的手机号码"));
          } else {
            this.phoneTips = true;
            callback();
          }
        } else {
          this.phoneTips = true;
          callback();
        }
      }, 100);
    };
    let checkMail = (rule, value, callback) => {
      setTimeout(() => {
        if (value) {
          // let reg = new RegExp('^([0-9A-Za-z-_.]+)@([0-9a-z]+.[a-z]{2,3}(.[a-z]{2})?)$')
          let reg = /^([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,3}$/;
          if (!reg.test(value)) {
            this.emailTips = false;
            callback(new Error("请输入正确的邮箱地址"));
          } else this.emailTips = true;
          callback();
        } else {
          this.emailTips = true;
          callback();
        }
      }, 100);
    };
    return {
      inPlatform: navigator.userAgent.indexOf("lslap") > -1, // 是否在应用平台中运行
      systemTitle: "联塑积分管理系统",
      loading: true,
      menuList: [],
      editableTabsValue: "1",
      editableTabs: [],
      tabIndex: 1,
      titleName: "基础数据",
      version: "",
      appenv: `(${constant.appenv})`,
      appenvZH: "",
      loginInfo: "",
      //新密码
      ruleForm: {
        oldPass: "",
        pass: "",
        checkPass: ""
      },
      rules: {
        oldPass: [
          {
            validator: valid.validatePass1(),
            trigger: "blur",
            required: true
          }
        ],
        pass: [
          {
            validator: validatePass2,
            trigger: "blur",
            required: true
          }
        ],
        checkPass: [
          {
            validator: valid.validatePass3(),
            trigger: "blur",
            required: true
          }
        ],
        email: [
          {
            type: "email",
            validator: checkMail,
            trigger: "blur"
          }
        ],
        phone: [
          {
            validator: vaildPhone,
            trigger: "blur"
          }
        ]
      },
      userForm: {
        username: "",
        employee_name: "",
        email: "",
        phone: ""
      }, //个人信息表单
      userInfo: "",
      resetVisible: false, //个人信息重置
      btndis: false,
      changePassword: false,
      supplierInfo: "",
      keyWord: "",
      inputFilter: false,
      telescopic: false,
      wsClient: "",
      isRefresh: false,
      // 用户数据
      userData: {},
      emailTips: true,
      phoneTips: true,
      // 供应商资料编辑
      editDialogVisible: false,
      // 当前环境
      userAgent: constant.userAgent
    };
  },
  computed: {
    ...mapState({
      app: state => state.app
    })
  },
  watch: {
    // 监控路由变化，设置进度标签和保存当前路由名称
    $route: {
      handler({ name }) {
        this.setCurrentRoute(name);
        for (let i in this.menuList) {
          if (this.menuList[i].code == name) {
            this.goMenu(this.menuList[i]);
            return;
          }
        }
      }
    }
  },
  methods: {
    ...mapMutations(["setCurrentRoute", "loginOut", "setUserData"]),
    // 返回菜单窗口
    goBack() {
      sendMain("openMenuWin");
    },
    winCtrl(type) {
      //console.log(type);
      switch (type) {
        case "min":
          sendMain("minWin");
          break;
        case "max":
          sendMain("maxWin");
          break;
        case "close":
          this.$confirm("是否确定退出程序", "消息提示", {
            distinguishCancelAndClose: true,
            showClose: false,
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            customClass: "confirmAsk"
          })
            .then(() => {
              sendMain("closeWin");
            })
            .catch(action => {});
          break;
      }
    },
    // 阻止输入框粘贴事件
    deletedPaste(event) {
      event.preventDefault();
    },
    removeTab(targetName, pecial) {
      if (!targetName) {
        targetName = this.editableTabsValue;
      }
      let tabs = this.editableTabs;
      let activeName = this.editableTabsValue;
      //console.log(tabs, activeName);
      if (activeName === targetName) {
        tabs.forEach((tab, index) => {
          if (tab.name === targetName) {
            let nextTab = tabs[index + 1] || tabs[index - 1];
            if (nextTab) {
              activeName = nextTab.name;
            }
          }
        });
      }
      if (tabs.length <= 1) {
        this.editableTabsValue = "1";
        if (pecial != undefined) {
          this.editableTabs = tabs.filter(tab => tab.content !== targetName);
        } else {
          this.editableTabs = tabs.filter(tab => tab.name !== targetName);
        }
        return;
      }
      this.editableTabsValue = activeName;
      if (pecial != undefined) {
        this.editableTabs = tabs.filter(tab => tab.content !== targetName);
      } else {
        this.editableTabs = tabs.filter(tab => tab.name !== targetName);
      }
    },
    addTab(data) {
      if (data.cName) {
        this.creationTab(data);
        return;
      }
    },
    creationTab(data) {
      if (this.editableTabs.length > 0) {
        let flag = false;
        let item;
        for (let i = 0; i < this.editableTabs.length; i++) {
          if (data.cName == this.editableTabs[i].title) {
            flag = true;
            item = this.editableTabs[i];
            break;
          }
        }
        if (flag) {
          this.editableTabsValue = item.name;
        } else {
          let newTabName = ++this.tabIndex + "";
          this.editableTabs.push({
            title: data.cName,
            name: newTabName,
            content: data.name
          });
          this.editableTabsValue = newTabName;
        }
      } else {
        let newTabName = ++this.tabIndex + "";
        this.editableTabs.push({
          title: data.cName,
          name: newTabName,
          content: data.name
        });
        this.editableTabsValue = newTabName;
      }
    },
    // 跳转路由
    goMenu(data) {
      this.editableTabsValue = "1";
      let routePath = `/home/${data.code}`;
      this.$router.push({
        path: routePath,
        query: {
          pid: data.id
        }
      });
      this.titleName = data.name;
      utils.saveMenuId("menuId", data.id);
    },
    // 获取主菜单数据
    getMenu() {
      let that = this;
      // 获取主菜单数据
      let obj = {
        resourceType: 0,
        type: 1
      };
      this.$http
        .getMenu(obj)
        .then(async response => {
          let data = response;
          if (data.data.code == "1") {
            if (data.data.rows.rootNodes.length > 0) {
              let flag = await this.getSystemAuth();
              console.log(flag);
              if (flag) {
                let initMenu = {};
                that.menuList = data.data.rows.rootNodes;
                let currentRouterName = that.$route.name;
                initMenu =
                  that.menuList.filter(item => {
                    return item.code == currentRouterName;
                  })[0] || that.menuList[0];
                that.$nextTick(res => {
                  that.goMenu(initMenu);
                });
                utils.saveSession("auth", that.menuList);
              } else {
                this.$alert("无系统权限,请联系管理员", {
                  showClose: false,
                  confirmButton: "确定",
                  customClass: "alertFailure"
                });
              }
            } else {
              this.$alert("无系统权限,请联系管理员", {
                showClose: false,
                confirmButton: "确定",
                customClass: "alertFailure"
              });
            }
          } else {
            this.$alert(data.data.msg, {
              showClose: false,
              confirmButton: "确定",
              customClass: "alertFailure"
            });
          }
        })
        .catch(err => {
          this.$alert(err.data.message, {
            showClose: false,
            confirmButton: "确定",
            customClass: "alertFailure"
          });
        });
    },
    // 积分系统权限校验
    getSystemAuth() {
      let roles = utils.getSession("userData").roles;
      let flag = false;
      roles.forEach(val => {
        if (val.code == "cap_admin_role") {
          flag = true;
        }
      });
      return new Promise((resolve, reject) => {
        if (!flag) {
          let obj = {
            userId: this.$global.user.id
          };
          this.$http
            .homeRouter_getSystemAuth(obj)
            .then(({ data }) => {
              if (data.code == 1) {
                resolve(data.rows.state);
              } else {
                Msg.showErrorMsg(data.info);
                resolve(false);
              }
            })
            .catch(e => {
              reject();
              Msg.showErrorMsg(e.response.data.info);
            });
        } else {
          resolve(true);
        }
      });
    },
    getUserId() {
      this.userInfo = constant.user;
      const { userName, employeeName, email, phone } = this.userInfo;
      this.userForm = {
        username: userName,
        employee_name: employeeName,
        email,
        phone
      };
      if (this.userData.user.userTypeId == 4) {
        console.log("当前登录用户：供应商");
        let obj = {
          mainAccount: this.userData.user.userName
        };
        this.$http
          .getSupplierDetailByAccount(obj)
          .then(response => {
            let data = response.data;
            if (data.code == "1") {
              if (data.rows.length > 0) {
                this.supplierInfo = data.rows[0];
                constant.supplierId = this.supplierInfo.id;
                constant.supplierData = this.supplierInfo;
              } else {
                constant.supplierId = "";
                constant.supplierData = {};
              }
            }
          })
          .catch(err => {
            this.$alert(err.data.message, {
              showClose: false,
              confirmButtonText: "确定",
              customClass: "alertFailure"
            });
          });
      } else {
        constant.supplierId = "";
        constant.supplierData = {};
      }
    },
    handleCommand(command) {
      switch (command) {
        case "1":
          this.getIdmModifyUrl();
          break;
        case "2":
          this.$confirm("是否确定退出登录？", "消息提示", {
            distinguishCancelAndClose: true,
            showClose: false,
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            customClass: "confirmAsk"
          })
            .then(() => {
              this.$http
                .userLogout({
                  uid: this.userData.user.id,
                  systemId: constant.systemId
                })
                .then(res => {
                  this.loginOut();
                  constant.token = "";
                  if (this.userAgent == "web") {
                    this.$router.push({
                      name: "login"
                    });
                    utils.removeSession("userData");
                    utils.removeSession("currentAct");
                    utils.removeSession("menuId");
                    utils.removeSession("auth");
                  } else {
                    sendMain("openLoginWin");
                  }
                })
                .catch(err => {
                  this.loginOut();
                  constant.token = "";
                  if (this.userAgent == "web") {
                    this.$router.push({
                      name: "login"
                    });
                  } else {
                    sendMain("openLoginWin");
                  }
                });
            })
            .catch(action => {});
          break;
        case "3":
          this.resetVisible = true;
          this.emailTips = true;
          this.phoneTips = true;
          break;
      }
    },
    // 获取idm接口修改地址
    getIdmModifyUrl() {
      this.$http.modifyPassword().then(({ data }) => {
        let userName = "";
        let url = "";
        if (this.userAgent == "web") {
          userName = utils.getSession("currentAct");
          url = `${data}?userid=${userName}`;
          window.open(url, "_blank");
        } else {
          userName = remote.getGlobal("balance");
          url = `${data}?userid=${userName}`;
          shell.openExternal(url);
        }
      });
    },
    confirmModify() {
      let that = this;
      if (
        this.ruleForm.checkPass != "" &&
        this.ruleForm.pass != this.ruleForm.checkPass
      ) {
        this.$alert("两次输入密码不一致!", {
          showClose: false,
          confirmButtonText: "确定",
          customClass: "alertFailure"
        });
        return;
      }
      this.$refs["ruleForm"].validate(valid => {
        if (valid) {
          waterfall(
            [
              function getTokeapin(callback) {
                that.$http.getToken({ tokenkey: "get" }).then(
                  function success(res) {
                    let data = res.data;
                    if (data.meta.code === 200) {
                      callback(null, data);
                    } else {
                      callback(res, 1);
                    }
                  },
                  function error(err) {
                    callback(err, 0);
                  }
                );
              },
              function editPassword(tokenData, callback) {
                if (
                  constant.isAccount == "是" &&
                  that.userData.user.userTypeId == 4
                ) {
                  that.$http
                    .validatePassword({
                      password: aes.encrypt(
                        that.ruleForm.oldPass,
                        tokenData.data.tokenKey
                      ),
                      userkey: tokenData.data.userKey,
                      tokenKey: tokenData.data.tokenKey
                    })
                    .then(
                      function success(res) {
                        if (res.data.code == 1) {
                          let obj = {
                            tokenkey: tokenData.data.tokenKey,
                            userkey: tokenData.data.userKey,
                            password: aes.encrypt(
                              that.ruleForm.pass,
                              tokenData.data.tokenKey
                            ),
                            userName: that.userData.user.userName,
                            //                                                  id: constant.userId
                            id: that.userData.user.id
                          };
                          that.$http.editPassword(obj).then(
                            function success(res) {
                              if (res.data.code == 1) {
                                that.$alert("操作成功,请重新登录", {
                                  showClose: false,
                                  confirmButtonText: "确定",
                                  customClass: "alertSuccess",
                                  callback: function() {
                                    that.loginOut();
                                    that.$router.push({
                                      name: "login"
                                    });
                                  }
                                });
                              } else {
                                callback(res, 2);
                              }
                            },
                            function error(err) {
                              callback(err, 3);
                            }
                          );
                        } else {
                          callback(res, 4);
                        }
                      },
                      function error(err) {
                        callback(err, 5);
                      }
                    );
                } else {
                  let obj = {
                    oldpwd: aes.encryptEcb(
                      that.ruleForm.oldPass,
                      1234567812345678
                    ),
                    newpwd: aes.encryptEcb(
                      that.ruleForm.pass,
                      1234567812345678
                    ),
                    username: that.userData.user.userName
                  };
                  that.$http.editPasswordIdm(obj).then(
                    function success(res) {
                      if (res.data.code == 1) {
                        that.$alert("密码修改成功,请重新登录", {
                          showClose: false,
                          confirmButtonText: "确定",
                          customClass: "alertSuccess",
                          callback: function() {
                            that.loginOut();
                            that.$router.push({
                              name: "login"
                            });
                          }
                        });
                      } else {
                        callback(res, 2);
                      }
                    },
                    function error(err) {
                      callback(err, 6);
                    }
                  );
                }
              },
              function editPassword1(tokenData, callback) {}
            ],
            function(err, result) {
              let errMsg;
              switch (result) {
                case 0:
                case 1:
                  errMsg = err.data.meta.msg;
                  break;
                case 2:
                  errMsg = err.data.info;
                  break;
                case 3:
                  errMsg = "修改密码失败，请检查网络";
                  break;
                case 4:
                  errMsg = "旧密码验证错误，请重新输入";
                  break;
                case 5:
                  errMsg = "旧密码验证失败，请检查网络";
                  break;
                case 6:
                  errMsg = err.data.message;
                  break;
              }
              that.$alert(errMsg, {
                showClose: false,
                confirmButtonText: "确定",
                customClass: "alertFailure"
              });
            }
          );
        }
      });
    },
    // 确认提交个人设置信息
    confirmSubmit() {
      this.$refs["userForm"].validate(vaild => {
        if (vaild) {
          const { username, email, phone } = this.userForm;
          let pramas = {
            username,
            email,
            phone
          };
          this.btndis = true;
          this.$http
            .personalReset(pramas)
            .then(res => {
              let data = res.data;
              if (data.code == 1) {
                constant.user.phone = phone;
                constant.user.email = email;
                this.$alert("个人信息设置成功!", {
                  showClose: false,
                  confirmButtonText: "确定"
                });
                this.handelClose();
                this.btndis = false;
              } else {
                this.$alert(data.info, {
                  showClose: false,
                  confirmButtonText: "确定",
                  customClass: "alertFailure"
                });
                this.btndis = false;
              }
            })
            .catch(err => {
              console.log("异常", err);
              this.$alert(err.data.message, {
                showClose: false,
                confirmButtonText: "确定",
                customClass: "alertFailure"
              });
              this.btndis = false;
            });
        } else {
          this.btndis = false;
        }
      });
    },
    // 关闭个人设置弹窗
    handelClose() {
      this.resetVisible = false;
      this.$refs.userForm.resetFields();
      const { email, phone } = constant.user;
      this.userForm.email = email;
      this.userForm.phone = phone;
    },
    //取消按钮关闭模态框
    cancel() {
      this.changePassword = false;
      this.ruleForm.oldPass = "";
      this.ruleForm.pass = "";
      this.ruleForm.checkPass = "";
      this.$refs.ruleForm.resetFields();
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
      return this.appenvZH;
      //console.log(this.appenvZH)
    },
    // 存储全局变量
    saveConstant() {
      let localData = utils.getSession("userData");
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
    telescopicTure() {
      this.telescopic = true;
    },
    telescopicFalse() {
      this.telescopic = false;
    }
  },
  components: components,
  created: function() {
    let that = this;
    if (constant.userAgent == "pc") {
      let userData = remote.getGlobal("userData");
      this.setUserData(userData);
    }
    this.saveConstant();
    this.userData = utils.getSession("userData");
    this.version = constant.appVersion;
    this.wsClient = new websocketClient({
      systemEnv: constant.appenv,
      userId: constant.userId,
      systemCode: "cap",
      loginTimestamp: this.userData.timestamp,
      fanoutCallback: msg => {
        let res = JSON.parse(msg.body);
        console.log("ws res:", msg);
        this.$notify({
          title: `系统通知`,
          message: res.message,
          type: "warning",
          duration: 0,
          position: "bottom-right"
        });
      },
      topicCallback: msg => {
        let res = JSON.parse(msg.body);
        console.log("ws res:", msg);
        this.$notify({
          title: `来自${res.userName}的通知`,
          message: res.message,
          type: "warning",
          duration: 0,
          position: "bottom-right"
        });
      },
      logoutCallback: forceOffline => {
        if (constant.appenv != "dev") {
          if (forceOffline) {
            this.$alert("帐号已被强制下线", {
              showClose: false,
              confirmButtonText: "确定",
              customClass: "alertPrompt"
            }).then(() => {
              this.$http
                .userLogout({
                  uid: constant.userId,
                  systemId: constant.systemId
                })
                .then(function(res) {
                  that.$store.commit("loginOut");
                  if (that.userAgent == "web") {
                    that.$router.push({
                      name: "login"
                    });
                  } else {
                    sendMain("openLoginWin");
                  }
                })
                .catch(function(err) {
                  that.$store.commit("loginOut");
                  if (that.userAgent == "web") {
                    that.$router.push({
                      name: "login"
                    });
                  } else {
                    sendMain("openLoginWin");
                  }
                });
            });
          } else {
            this.$alert("帐号已在别处登录", {
              showClose: false,
              confirmButtonText: "确定",
              customClass: "alertPrompt"
            }).then(() => {
              that.$store.commit("loginOut");
              if (that.userAgent == "web") {
                that.$router.push({
                  name: "login"
                });
              } else {
                sendMain("openLoginWin");
              }
            });
          }
        }
      }
    });
    this.wsClient.connect();
  },
  beforeMount() {
    this.getMenu();
    this.getAppenvZH();
  },
  mounted() {
    if (this.userData.user.isDefaultPwd == true) this.changePassword = true;
    // this.getUserId()
    this.loginInfo =
      this.userData.user.loginName + "(" + this.userData.user.userName + ")";
    let _this = this;
    this.$tap.$on("removeTabFn", function() {
      _this.removeTab();
    });
  },
  destroyed() {
    this.wsClient.disconnent();
  }
};
</script>