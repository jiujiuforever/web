<template>
  <div class="m-view-masterMenu m-window">
    <div class="m-module" v-for="(item, index) in menu" :key="index">
      <div class="m-title">{{ item.title }}</div>
      <ul>
        <li
          v-for="(list, serial) in item.list"
          :key="serial"
          @click="addTab(list)"
          :class="{ 'm-completed': list.completed }"
        >
          <i :class="'iconfont icon' + list.name"></i>
          <span>{{ list.cName }}</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import utils from "@/public/utils";
import authorize from "@/public/authorize";

export default {
  data() {
    return {
      activeMenu: [],
      menu: [
        {
          title: "用户管理",
          list: [
            {
              cName: "用户管理",
              name: "userManage",
              completed: true
            },
          ]
        },
        {
          title: "积分管理",
          list: [
            {
              cName: "积分项管理",
              name: "scoreItem",
              completed: true
            },
          ]
        },
        {
          title:"客户变更",
          list:[
            {
              cName:"客户变更",
              name:"clientChange",
              completed: true
            }
          ]
        }
      ]
    };
  },
  props: {
    addTab: {
      type: Function
    }
  },
  methods: {
    getMenuDetails() {
      var menuId = utils.getMenuId("menuId"); // 菜单ID
      var activeMenu = [];
      // 没有项目就取消掉这个项目的所有展示
      let emptyArrayIndex = [];
      this.menu.forEach((element, index) => {
        activeMenu = authorize.getMenuAuth(this.menu[index].list, menuId);
        activeMenu.length == 0 && emptyArrayIndex.unshift(index);
        this.menu[index].list = activeMenu;
      });
      // 遍历删除
      emptyArrayIndex.forEach(item => {
        this.menu.splice(item, 1);
      });
    }
  },
  components: {},
  beforeMount() {
    this.getMenuDetails();
  }
};
</script>

