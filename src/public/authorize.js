import utils from "@/public/utils";
import { showAlert } from "lesso-common/public/utils";
import constant from "@/public/constant";

// 获取权限
function getMenuAuth(orginalMenu, menuId) {
  var activeMenu = [];
  var authMenu = [];
  var auth = utils.getSession("auth");
  if (auth.constructor !== Array) {
    auth = [];
  }
  auth &&
    auth.forEach(function(aitem) {
      if (aitem.id == menuId) {
        authMenu.push(aitem.children);
      }
    });
  if (authMenu[0]) {
    orginalMenu.forEach(function(mitem, mindex) {
      authMenu[0].forEach(function(aitem, aindex) {
        if (aitem.code == mitem.name) {
          activeMenu.push(mitem);
        }
      });
    });
  }
  return activeMenu;
}
// 获取按钮权限
function getBtnAuth(pageCode, btnStatus) {
  let params = {
    resourceType: "1",
    code: pageCode,
    userName: constant.userName,
    type: "1"
  };
  _APIS.getAuthResource(params).then(function(res) {
    let data = res.data;
    if (data.code == 1) {
      let authBtn = data.rows.splice(0); //保存按钮权限
      console.log(`authBth:${JSON.stringify(authBtn)}`);
      // 遍历传入按钮状态
      for (let item in btnStatus) {
        authBtn.forEach(function(aitem) {
          if (item == aitem.code) {
            btnStatus[item] = true;
          }
        });
      }
    }
  });
}

// 获取菜单权限
// function getMenuAuth(pageName,orginalMenu,cb) {
//     let authData = [];
//     let activeMenu = [];
//     _APIS.getAuthResource({
//             resourceType: "0",
//             systemId: constant.systemId,
//             userName: constant.userName,
//             type: "1"
//         })
//         .then(function(res) {
//             console.log("authRes:", res);
//             var data = res.data;
//             if (data.code == 1) {
//                 if (data.rows.rootNodes.length != 0) {
//                     data.rows.rootNodes.forEach(nItem => {
//                         // 判断是否有 fin 权限
//                         if (nItem.code == "fin") {
//                             authData = nItem.children;
//                         }
//                     });
//                 }

//                 // 取不到直接返回
//                 if (authData.length == 0) {
//                     cb(activeMenu);
//                 }

//                 // 取出权限数据中当前页面部分
//                 authData.forEach(function(item){
//                     if(item.name == pageName){
//                         authData = item.children.splice(0);
//                     }
//                 });

//                 console.log('authData:',authData);

//                 authData.forEach(function (aitem) {
//                     orginalMenu.forEach(function (mitem) {
//                         // 当第一层菜单相同时，并且存在子菜单情况下, 加到激活的菜单中
//                         if(mitem.title == aitem.name && aitem.children != null){
//                             activeMenu.push(mitem);
//                         }
//                     });
//                 });
//                 activeMenu.forEach(function(mitem){
//                     let activeList = [];
//                     authData.forEach(function (aitem) {
//                         let tempList = deepCopy(mitem.list);
//                         // 遍历激活菜单中的子项
//                         tempList.forEach(function (titem) {
//                             if(aitem.children == null) {return;}
//                             aitem.children.forEach(function (citem) {
//                                 // 当激活菜单的子项目与权限中的子项相同时，加到激活的子项目中
//                                 if(titem.name == citem.code){
//                                     activeList.push(titem);
//                                 }
//                             });
//                         });
//                     });
//                     mitem.list = deepCopy(activeList);
//                 });

//                 cb(activeMenu);

//             }
//         })
//         .catch(function(){
//             cb(activeMenu);
//         });
// }

// 获取导航栏权限
function getNavAuth(menuList, cb) {
  let authData = [];
  let activeMenu = [];
  _APIS
    .getAuthResource({
      resourceType: "0",
      systemId: constant.systemId,
      userName: constant.userName,
      type: "1"
    })
    .then(res => {
      console.log("authRes:", res);
      var data = res.data;
      if (data.code == 1) {
        if (data.rows.rootNodes.length != 0) {
          data.rows.rootNodes.forEach(nItem => {
            // 判断是否有 fin 权限
            if (nItem.code == "fin") {
              authData = nItem.children;
            }
            authData.forEach(aitem => {
              menuList.forEach(mitem => {
                if (mitem.name == aitem.code) {
                  mitem.status = true;
                }
              });
            });
            menuList.forEach(mitem => {
              if (mitem.status) {
                activeMenu.push(mitem);
              }
            });
            cb(activeMenu);
          });
        }
        if (authData.length == 0) {
          showAlert({
            msg: "无系统权限，请联系管理员",
            type: 0
          });
        }
        console.log("auth:", authData);
      }
    })
    .catch(err => {
      showAlert({
        msg: "无系统权限，请联系管理员",
        type: 0
      });
    });
}
export default {
  getMenuAuth: getMenuAuth,
  getBtnAuth,
  getNavAuth
};
