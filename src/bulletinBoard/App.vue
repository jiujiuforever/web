<template>
  <!-- 看板内容,另外的入口非登录 -->
  
  <div class="window-bulletinBoard-view">
    <div class="boardContainer">
      <!-- 四个拐角的样式 -->
      <span class="corner left-top"></span>
      <span class="corner right-top"></span>
      <span class="corner left-bottom"></span>
      <span class="corner right-bottom"></span>
      <!-- 头部标题 -->
      <header class="board-title">
        <div class="trapezoid">
          <span class="top"></span>
          <span class="bottom"></span>
          <!-- <marquee scrollAmount="2"> -->
          <span class="titleText">本公司经销商积分排名及实时得分</span>
          <!-- </marquee> -->
        </div>
      </header>
      <!-- 表格 -->
      <section class="board-tableContainer">
        <div class="tab-one">
          <div class="tab-title">
            <i class="el-icon-d-arrow-right arrowGra"></i>
            {{companyInfo.companyName}}前30名
          </div>
          <div class="table-warp">
            <el-table
              ref="tableOne"
              :max-height="maxTableHeight"
              :data="tableDatas.tabOneTableData"
              border
              :header-row-style="{'backgroundColor':'#062D45',color:'#00E0E4','borderColor':'black'}"
              :header-cell-style="{'backgroundColor':'#062D45',color:'#00E0E4','borderColor':'black'}"
              :row-style="{'backgroundColor':'#041630',color:'white','borderColor':'black'}"
              :cell-style="{'backgroundColor':'#041630',color:'white','borderColor':'black'}"
            >
              <el-table-column
                align="center"
                header-align="center"
                prop="rank"
                label="排名"
                width="50"
              ></el-table-column>
              <el-table-column prop="agencyName" label="客户"></el-table-column>
              <el-table-column width="80" prop="totalScore" label="得分"></el-table-column>
            </el-table>
          </div>
        </div>
        <div class="tab-two">
          <div class="tab-title">
            <i class="el-icon-d-arrow-right arrowGra"></i>
            {{companyInfo.companyName}}后30名
          </div>
          <div class="table-warp">
            <el-table
              ref="tableTwo"
              :max-height="maxTableHeight"
              :data="tableDatas.tabTwoTableData"
              border
              :header-row-style="{'backgroundColor':'#061449',color:'#1A63F8','borderColor':'black'}"
              :header-cell-style="{'backgroundColor':'#061449',color:'#1A63F8','borderColor':'black'}"
              :row-style="{'backgroundColor':'#040a33',color:'white','borderColor':'black',}"
              :cell-style="{'backgroundColor':'#040a33',color:'white','borderColor':'black',}"
            >
              <el-table-column
                align="center"
                header-align="center"
                prop="rank"
                label="排名"
                width="50"
              ></el-table-column>
              <el-table-column prop="agencyName" label="客户"></el-table-column>
              <el-table-column width="80" prop="totalScore" label="得分"></el-table-column>
            </el-table>
          </div>
        </div>

        <div class="tab-three">
          <div class="tab-title">
            <i class="el-icon-d-arrow-right arrowGra"></i>客户实时得分情况
          </div>
          <div class="table-warp">
            <el-table
              ref="tableThree"
              :max-height="maxTableHeight"
              :data="tableDatas.tabThreeTableData"
              border
              :header-row-style="{'backgroundColor':'#2F003C',color:'#DF00BB','borderColor':'black'}"
              :header-cell-style="{'backgroundColor':'#2F003C',color:'#DF00BB','borderColor':'black'}"
              :row-style="{'backgroundColor':'#18002C',color:'white','borderColor':'black',}"
              :cell-style="{'backgroundColor':'#18002C',color:'white','borderColor':'black', }"
            >
              <el-table-column prop="agencyName" label="客户"></el-table-column>
              <el-table-column prop="quotaName" label="积分项"></el-table-column>
              <el-table-column prop="handler" label="评审人"></el-table-column>
              <el-table-column width="80" prop="score" label="得分"></el-table-column>
              <el-table-column width="120" prop="updateTime" label="日期"></el-table-column>
            </el-table>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script>
import directives_touch from "../directives/directives_touch";
import api from "./bulletinBoard_api.js";
export default {
  mixins: [directives_touch],
  name: "bulletinBoard",
  data() {
    return {
      // 表格的最大高度，el-table 组件必须参数
      maxTableHeight: 900,
      // 表格数据
      tableDatas: {
        // 第一个表格
        tabOneTableData: [],
        // 第二个表格
        tabTwoTableData: [],
        // 第三个表格
        tabThreeTableData: []
      },
      searchCondiction: {
        companyCode: "1010",
        agencyCode: ""
      },
      // 翻页参数
      paginations: {
        tabPagination_1: {
          pageSize: 30,
          totalCount: 0,
          currentPage: 1
        },
        tabPagination_2: {
          pageSize: 30,
          totalCount: 0,
          currentPage: 1
        },
        tabPagination_3: {
          pageSize: 30,
          totalCount: 0,
          currentPage: 1
        }
      },
      // 获取所有经销商的列表，为第三个表格查询做准备
      agencyList: [],
      // 触发器
      timetrigger: "",
      // 当前的公司信息
      companyInfo: {}
    };
  },
  methods: {
    // 初始自动调整容能够容纳的数量方法
    initAdjustmentHeight() {
      let overflow = false;
      // 获取每行的高度
      let trHeight =
        document.querySelector(".table-warp tr").clientHeight || 48;
      // 获取容器的高度
      let wrapHeight =
        document.querySelector(".table-warp").clientHeight - trHeight;
      this.maxTableHeight = wrapHeight + trHeight - 2;
      let that = this;

      Object.keys(this.paginations).forEach((item, index) => {
        that.paginations[item].pageSize = Math.floor(wrapHeight / trHeight);
      });
      let searchCondiction = this.parse_url(window.location.href);
      this.searchCondiction.companyCode = searchCondiction.companyCode;
      this.searchCondiction.agencyCode = searchCondiction.agencyCode;
      this.getCompanyInfo();
      return new Promise(function(resolve, reject) {
        resolve();
      });
    },

    // 定时获取api数据, 动态改变自身的页码
    timingGetdata(time = 5000) {
      let that = this;
      this.timetrigger2 = setInterval(() => {
        for (let item of Object.keys(this.paginations)) {
          if (
            that.paginations[item].currentPage *
              that.paginations[item].pageSize <
            that.paginations[item].totalCount
          ) {
            if (!item.includes("3")) {
              that.paginations[item].currentPage =
                Math.floor(
                  (that.paginations[item].currentPage + 1) %
                    Math.floor(30 / that.paginations[item].pageSize)
                ) || 1;
            } else {
              that.paginations[item].currentPage =
                Math.floor(
                  (that.paginations[item].currentPage + 1) %
                    Math.ceil(
                      that.paginations[item].totalCount /
                        that.paginations[item].pageSize +
                        1
                    )
                ) || 1;
            }
          } else {
            that.paginations[item].currentPage = 1;
          }
        }
      }, time);
      // 定时获取数据
      this.timetrigger = setInterval(() => {
        that.getTabOneData();
        // that.getTabTwoData();
        that.getTabThreeData();
      }, time + 1000);
    },
    // 截取url地址参数
    parse_url(_url) {
      var pattern = /(\w+)=(\w+)/gi;
      var parames = {};
      _url.replace(pattern, function(a, b, c) {
        parames[b] = c;
      });
      return parames;
    },
    // 获取表一数据
    getTabOneData() {
      let that = this;
      let data = {
        current: 1,
        size: 99999,
        entity: {
          companyCode: this.searchCondiction.companyCode,
          agencyCode: ""
        }
      };
      api
        .rank_agencyForCompany(data)
        .then(({ data }) => {
          if (data.code == 1) {
            let beforeData = data.rows.slice(0, 30);
            that.tableDatas.tabOneTableData = that.arrayPagination(
              this.paginations.tabPagination_1.currentPage,
              this.paginations.tabPagination_1.pageSize,
              beforeData
            );
            that.paginations.tabPagination_1.totalCount = beforeData.length;
            // 同一个请求同时处理两表格的数据
            let afterData = data.rows.slice(-30);
            that.tableDatas.tabTwoTableData = that.arrayPagination(
              this.paginations.tabPagination_2.currentPage,
              this.paginations.tabPagination_2.pageSize,
              afterData
            );
            that.paginations.tabPagination_2.totalCount = beforeData.length;
          } else {
            that.$message.error(data.info);
          }
        })
        .finally(rs => {});
    },
    // // 获取表二数据
    // getTabTwoData() {
    //   let that = this;
    //   let data = {
    //     current: this.paginations.tabPagination_2.currentPage,
    //     size: 99999,
    //     entity: {
    //       companyCode: this.searchCondiction.companyCode,
    //       agencyCode: ""
    //     }
    //   };
    //   api
    //     .rank_agencyForCompany(data)
    //     .then(({ data }) => {
    //       if (data.code == 1) {
    //         that.tableDatas.tabTwoTableData = data.rows;
    //         that.paginations.tabPagination_2.totalCount = data.total;
    //       } else {
    //         that.$message.error(data.info);
    //       }
    //     })
    //     .finally(rs => {});
    // },
    // 获取表三数据
    getTabThreeData() {
      let that = this;
      let data = {
        current: this.paginations.tabPagination_3.currentPage,
        size: this.paginations.tabPagination_3.pageSize,
        entity: {
          companyCode: this.searchCondiction.companyCode
          // agencyCodeOrName: ""
        }
      };
      api
        .index_geAgencyindexlList(data)
        .then(({ data }) => {
          if (data.code == 1) {
            that.tableDatas.tabThreeTableData = data.rows;
            that.paginations.tabPagination_3.totalCount = data.total;
          }
        })
        .finally(res => {});
    },
    //前端分页
    arrayPagination(currentPage = 1, pageSize, array) {
      var offset = (currentPage - 1) * pageSize;
      return offset + pageSize >= array.length
        ? array.slice(offset, array.length)
        : array.slice(offset, offset + pageSize);
    },
    // 获取所有经销商的列表,需要轮询
    getAgencyByCompanyCode() {
      let that = this;
      let data = {
        size: 9999,
        current: 1,
        entity: {
          state: 1,
          keyword: "",
          companyCode: this.searchCondiction.companyCode
        }
      };
      api
        .companyClientManage_getTabelList(data)
        .then(({ data }) => {
          if (data.code == 1) {
            that.agencyList = data.rows;
          }
        })
        .finally(res => {});
    },
    // 获取当前公司的信息
    getCompanyInfo() {
      let that = this;
      let data = {
        entity: { keyword: this.searchCondiction.companyCode, state: 1 },
        current: 1,
        size: 1
      };
      api
        .board_getCompanyInfo(data)
        .then(({ data }) => {
          if (data.code == 1) {
            that.companyInfo = data.rows[0];
          }
        })
        .finally(res => {});
    }
  },
  beforeMount() {},
  mounted() {
    this.getTabOneData();
    this.getTabThreeData();

    this.initAdjustmentHeight().then(res => {
      this.getAgencyByCompanyCode();
      this.timingGetdata(6000);
    });

    // 监听窗口大小
    window.onresize = () => {
      this.initAdjustmentHeight();
    };
  }
};
</script>

 <style lang="less" scoped>
.window-bulletinBoard-view {
  background-color: #02001c;
  height: 100%;
  padding: 20px;
  .boardContainer {
    border: 1px solid #05103e;
    width: 100%;
    height: calc(100% - 40px);
    position: relative;
    .corner {
      position: absolute;
      width: 20px;
      height: 20px;
      border: 4px solid #1a66ff;
    }
    .left-top {
      left: 0px;
      top: 0px;
      border-right: transparent;
      border-bottom: transparent;
      border-right-style: inset;
      border-bottom-style: inset;
    }
    .right-top {
      right: 0px;
      top: 0px;
      border-left: transparent;
      border-bottom: transparent;
      border-left-style: inset;
      border-bottom-style: inset;
    }
    .left-bottom {
      left: 0px;
      bottom: 0px;
      border-right: transparent;
      border-top: transparent;
      border-top-style: inset;
      border-right-style: inset;
    }
    .right-bottom {
      right: 0px;
      bottom: 0px;
      border-left: transparent;
      border-top: transparent;
      border-left-style: inset;
      border-top-style: inset;
    }

    .board-title {
      position: relative;
      // padding: 0.5em 1em 0.35em;
      .trapezoid {
        position: relative;
        color: white;
        margin: 10px auto;
        height: 50px;
        width: 40%;
        z-index: 0;
        line-height: 40px;
        font-size: 1.6em;
        text-align: center;
        .top {
          position: absolute;
          top: -6px;
          border: 1px solid #1a66ff;
          background-color: #02001c;
          border-top: none;
          z-index: 1;
          left: 50%;
          width: 30%;
          height: 6px;
          transform: translateX(-50%) perspective(0.8em) rotateX(-12deg);
          transform-origin: top;
          &::after {
            content: "";
            display: block;
            position: absolute;
            top: -2px;
            border: 1px solid #1a66ff;
            background-color: #1a66ff;
            z-index: 2;
            width: 88%;
            height: 2px;
            left: 50%;
            transform: translateX(-50%) perspective(0.8em) rotateX(-4deg);
            transform-origin: top;
          }
        }
        .bottom {
          position: absolute;
          bottom: 0px;
          border: 1px solid #1a66ff;
          background-color: #02001c;
          border-bottom: none;
          z-index: 1;
          left: 50%;
          width: 18%;
          height: 6px;
          transform: translateX(-50%) perspective(0.8em) rotateX(12deg);
          transform-origin: top;
          &::after {
            content: "";
            display: block;
            position: absolute;
            bottom: -1px;
            border: 1px solid #1a66ff;
            background-color: #1a66ff;
            z-index: 2;
            width: 88%;
            height: 1px;
            left: 50%;
            transform: translateX(-50%) perspective(0.8em) rotateX(6deg);
            transform-origin: top;
          }
        }
        .titleText {
          width: 100%;
          display: block;
          text-overflow: ellipsis;
          overflow: hidden;
          white-space: nowrap;
        }
        &:before {
          content: "";
          position: absolute;
          border-radius: 2px;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: -1;
          border: 1px solid #1a66ff;
          background: #061449;
          transform: perspective(0.7em) rotateX(-2deg);
          transform-origin: bottom;
        }
      }
    }
    .board-tableContainer {
      display: flex;
      height: calc(100% - 100px);
      .tab-one,
      .tab-two,
      .tab-three {
        padding: 2px;
        overflow: hidden;
        position: relative;
        display: flex;
        flex-direction: column;
        .tab-title {
          text-overflow: ellipsis;
          white-space: nowrap;
          overflow: hidden;
          height: 36px;
          line-height: 36px;
          margin-bottom: 10px;
          font-size: 1.5em;
        }
        .table-warp {
          flex-grow: 1;
          overflow: hidden;
          // 强制一行
          /deep/.el-table .cell {
            text-overflow: ellipsis;
            white-space: nowrap;
            overflow: hidden;
          }
        }
      }
      .tab-one {
        flex-grow: 1;
        .tab-title {
          color: #00ffff;
          .arrowGra::before {
            background: -webkit-linear-gradient(left, #016676 20%, #00ffff 40%);
            -webkit-background-clip: text;
            background-clip: text;
            -webkit-text-fill-color: transparent;
          }
        }
        /deep/.el-table--border,
        .el-table::before,
        .el-table--border::after {
          border-color: #018a8c;
          background-color: #018a8c;
        }
      }
      .tab-two {
        flex-grow: 1;
        .tab-title {
          color: #1962f4;
          .arrowGra::before {
            background: -webkit-linear-gradient(left, #0b2976 20%, #1962f4 40%);
            -webkit-background-clip: text;
            background-clip: text;
            -webkit-text-fill-color: transparent;
          }
        }
        /deep/.el-table--border,
        .el-table::before,
        .el-table--border::after {
          border-color: #0e3799;
          background-color: #0e3799;
        }
      }
      .tab-three {
        flex-grow: 2;
        .tab-title {
          color: #ce00ad;
          .arrowGra::before {
            background: -webkit-linear-gradient(left, #5d005d 20%, #ce00ad 40%);
            -webkit-background-clip: text;
            background-clip: text;
            -webkit-text-fill-color: transparent;
          }
        }
        /deep/.el-table--border,
        .el-table::before,
        .el-table--border::after {
          border-color: #73006d;
          background-color: #73006d;
        }
      }
    }
  }
}

// el-table__body-wrapper is-scrolling-none
</style>