import { Message, MessageBox } from "element-ui";

export default {
  //成功消息提示
  showSuccessMsg(msg) {
    Message({
      message: msg,
      type: "success"
    });
  },
  //错误消息提示
  showErrorMsg(msg) {
    MessageBox.alert(msg, {
      showClose: false,
      confirmButtonText: "确定",
      customClass: "alertFailure"
    })
  },
  //提示消息提示
  showPopMsg(msg) {
    MessageBox.alert(msg, {
      showClose: false,
      confirmButtonText: "确定",
      customClass: "alertPrompt"
    })
  }
};
