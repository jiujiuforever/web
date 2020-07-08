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
          v-show="list.authorize"
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
      menu: [
        {
          title: "我的工作",
          list: [
            {
              cName: "积分项排名",
              name: "scoreReport",
              completed: true,
              authorize: true
            },
            {
              cName: "积分录入",
              name: "scoreInput",
              completed: true,
              authorize: false
            },
            {
              cName: "申诉处理",
              name: "appealList",
              completed: true,
              authorize: true
            },
            {
              cName: "积分项明细",
              name: "scoreDetail",
              completed: true,
              authorize: true
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
      emptyArrayIndex.forEach(item => {
        this.menu.splice(item, 1);
      });
    },
    // 积分录入权限
    getAuthor() {
      let data = {
        entity: {
          sapNum: this.$global.user.sapNum,
          state: 1
        },
        current: 1,
        size: 10
      };
      this.$http.ScoreInput_getAuthor(data).then(({ data }) => {
        if (data.code == 1) {
          // if (data.rows.length == 0) {
          //   this.menu[0].list[1].authorize = false
          // } else if (data.rows[0].quotaAuth == 1) {
          //   this.$global.user.roleCode = data.rows[0].roleCode;
          //   this.menu[0].list[1].authorize = true
          // }
          if(data.rows[0].quotaAuth == 1){
            this.$global.user.roleCode = data.rows[0].roleCode;
            this.$global.user.quotaAuth = 1
            this.menu[0].list[1].authorize = true
          } else {
            this.$global.user.quotaAuth = 0
          }
          if(data.rows[0].quotaAuth2 == 1){
            this.$global.user.quotaAuth2 = 1
          } else {
            this.$global.user.quotaAuth2 = 0
          }
        }
      });
    }
  },
  components: {},
  beforeMount() {
    this.getMenuDetails();
    this.getAuthor();
  }
};
</script>