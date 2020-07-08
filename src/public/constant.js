import apienv from "../api/env";

let userAgent =
    window.navigator.userAgent.toLowerCase().indexOf("electron") > -1 ?
    "pc" :
    "web";
const { APP_ENV } = process.env
let systemId = {
    app: 197,
    qas: 216,
    dev: 665
};
// 全局变量
const constant = {
    // 程序版本号
    appVersion: "1.0.1",
    // 程序环境(app|qas|dev)
    appenv: APP_ENV ? APP_ENV : 'dev',
    // 用户id
    userId: "",
    // 用户姓名
    userName: "",
    // 用户姓名
    employeeName: "",
    // SAP号
    sapNum: "",
    // token
    token: "",
    //账号
    account: "",
    //账号类型
    accountType: "",
    //手机号
    phone: "",
    //公司编号
    bukrs: "",

    //公司名称
    butxt: "",

    //用户对象
    user: {},

    //系统ID
    //   systemId: 47,

    //电子签账号固定前缀
    signPrefix: "LS",

    //上传路径地址
    upload_url: apienv["dev"].srm + "upload/file", // "http://172.16.100.45:49231/srm/upload/file",

    // appenv: remote.getGlobal("appenv"), //从客户端读取当前程序环境

    //供应商ID
    supplierId: "",

    //供应商主账号信息
    supplierData: {},

    //二维码前缀 jjc20190220地址调整
    barCodePrex: "http://fwm.lesso.com/ls/web/lsWater.do?type=1&c=",
    // 打印方法类型 local 本地打印 online线上下载打印
    printType: "online",
    // 默认密码
    defaultPwd: "111111",
    // 浏览器信息
    userAgent: userAgent,
    // 是否是主账号
    isAccount: "",

    // 文件存储组名
    group: "CAP"
};
constant.systemId = systemId[constant.appenv];
export default constant;