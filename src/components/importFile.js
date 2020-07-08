/*
 *导入
 */

import Vue from "vue";
import localeText from "@/i18n/agGridText";
import { fieldConfigForEN } from "@/public/importFieldConfig.js";

import XLSX from "xlsx";
import _Api from "@/api";

export default Vue.extend({
  template: `<div>
            <div class="importLink" v-show="moduleName && tempUrl">
                <a :href="tempUrl" download="积分项分类列表-导入模板.xlsx" style="color:#108EE9;font-size:12px">1、下载分类列表-导入模板</a>
                <a style="color:#108EE9;font-size:12px;margin-left:20px" @click="uploadFile">2、上传导入文件</a>
                <input type="file" id="sheetjs-input" accept=".xls,.xlsx" @change="onchange"  style="display:none"/>
            </div>
			<ag-grid-vue class="m-agTableContent ag-theme-balham" style="height:300px;margin-top:10px;"
	    		:gridOptions="gridOptions" 
	    		:columnDefs="columnDefs"
	    		v-loading="loading">
    		</ag-grid-vue>
			</div>`,
  data() {
    return {
      btnDis: false,
      gridOptions: "",
      columnDefs: [],
      loading: false
    };
  },
  components: {
    // 自定义的单选
    actionCell: {
      template: '<a @click="deleteRowData" style="color:#098EEF">删除</a>',
      methods: {
        deleteRowData(val) {
          this.params.context.componentParent.deleteRowData(
            this.params.data,
            this.params.node
          );
        }
      }
    }
  },
  beforeMount() {
    this.gridOptions = {
      context: {
        componentParent: this
      },
      enableColResize: true,
      suppressContextMenu: true,
      localeText: localeText,
      defaultColDef: {
        menuTabs: []
      },
      enableSorting: true, //列排序
      animateRows: true, //排序动画
      rowSelection: "single",
      suppressCellSelection: false,
      suppressRowClickSelection: false
    };
    // this.columnDefs = [
    //   { headerName: "编码", field: "code" },
    //   { headerName: "名称", field: "name" },
    //   { headerName: "上级编码", field: "parentCode" },
    //   { headerName: "上级名称", field: "parentName" },
    //   { headerName: "排序", field: "sort" }
    // ];
  },
  watch: {
    closeImportDialog(val) {
      if (!val) {
        var elementId = document.getElementById("sheetjs-input");
        elementId.value = "";
        this.gridOptions.api.setRowData([]);
      }
    }
  },
  props: ["moduleName", "closeImportDialog", "tempUrl"],
  methods: {
    deleteRowData(rowData, node) {
      this.gridOptions.api.updateRowData({ remove: [rowData] });
      let rest = [];
      this.gridOptions.api.forEachNode((node, index) => {
        rest.push(node.data);
      });
      this.$emit("setImportData", rest);
    },
    // 上传按钮触发
    uploadFile() {
      document.getElementById("sheetjs-input").click();
    },
    // 文件本地获取触发
    onchange: function(evt) {
      var files = evt.target.files;
      if (!files || files.length == 0) return;

      //          var that = this;
      var excelFile = files[0];
      var fileType = excelFile.name.substring(
        excelFile.name.lastIndexOf(".") + 1
      );
      var elementId = document.getElementById("sheetjs-input");
      if (fileType != "" && fileType != null) {
        if (fileType != "xls" && fileType != "xlsx") {
          this.$message({
            message: "请上传Excel文件！",
            type: "warning"
          });
          // var elementId = document.getElementById("sheetjs-input");
          elementId.value = "";
          return false;
        }
      } else {
        this.$message({
          message: "请上传Excel文件！",
          type: "warning"
        });
        // var elementId = document.getElementById("sheetjs-input");
        elementId.value = "";
        return false;
      }
      const size = excelFile.size / 1024 / 1024 < 20;
      if (!size) {
        this.$message({
          message: "上传模板大小不能超过 20MB!",
          type: "warning"
        });
        // var elementId = document.getElementById("sheetjs-input");
        elementId.value = "";
        return false;
      }
      var reader = new FileReader();
      reader.onload = e => {
        // 数据预处理
        this.loading = true;
        var binary = "";
        var bytes = new Uint8Array(e.target.result);
        var length = bytes.byteLength;
        for (var i = 0; i < length; i++) {
          binary += String.fromCharCode(bytes[i]);
        }

        /* 读取 workbook */
        var wb = XLSX.read(binary, {
          type: "binary"
        });
        /* 选择第一个sheet */
        var wsname = wb.SheetNames[0];
        var ws = wb.Sheets[wsname];
        /* excel转换json数组,加上{header:1}是普通数组，不写是对象数组 */
        var json = XLSX.utils.sheet_to_json(ws);
        console.log("原始数据:", json);
        if (json.length > 100) {
          this.$message({
            message: "上传的条数不能大于100条!",
            type: "warning"
          });
          // var elementId = document.getElementById("sheetjs-input");
          elementId.value = "";
          this.loading = false;
          return false;
        }
        if (json.length === 0) {
          this.$message({
            message: "该EXCEL没有合适数据！",
            type: "warning"
          });
          // var elementId = document.getElementById("sheetjs-input");
          elementId.value = "";
          this.loading = false;
          return false;
        }
        var arr = [];
        var config = fieldConfigForEN[this.moduleName];
        // console.log(config);

        for (var a in json) {
          var obj = {};
        //   console.log(1);

          for (var key in config) {
            // console.log(2);

            // console.log(key);

            if (JSON.stringify(config[key]) != "{}") {
              if (json[a].hasOwnProperty(Object.keys(config[key]).toString())) {
                var k = Object.values(config[key]).toString(); //object Key值
                var v = json[a][Object.keys(config[key]).toString()]; //object Value值
                obj[k] = v;
              } else {
                obj[Object.values(config[key]).toString()] = "";
              }
            }
          }
          if (JSON.stringify(obj) != "{}") arr.push(obj);
        }
        // console.log(arr);

        this.gridOptions.api.setRowData(arr);
        if (this.moduleName == "classifyManager") {
          var params = {};
          var list = [];
          for (var b in arr) {
            if (JSON.stringify(arr[b]) != "{}") {
              list.push(Object.values(arr[b]).toString());
            }
          }
          params.matCodes = list;
          // this.getMatName(params)
          this.loading = false;
          this.$emit("setImportData", arr);
        } else {
          this.loading = false;
          this.$emit("setImportData", arr);
        }
      };
      reader.readAsArrayBuffer(excelFile);
    },
    getMatName(params) {
    //   console.log(params);

      var that = this;
      _Api.getBatchMatName(params).then(function(response) {
        that.loading = false;
        var data = response.data;
        if (data.code == "1") {
          that.columnDefs = [];
          var cols = JSON.parse(data.info);
          //var cols = eval('('+data.info+')');
          for (var c in cols) {
            var h = {};
            h.headerName = Object.keys(cols[c]).toString();
            h.field = Object.values(cols[c]).toString();
            that.columnDefs.push(h);
          }
          if (data.total > 0) {
            var rowData = data.rows.splice(0);
            that.gridOptions.api.setRowData(rowData);
            that.$emit("setImportData", rowData);
          }
        }
      });
    }
  },
  mounted() {
    this.gridOptions.api.hideOverlay();
    var config = fieldConfigForEN[this.moduleName];

    for (var k in config) {
      if (JSON.stringify(config[k]) != "{}") {
        var h = {};
        h.headerName = Object.keys(config[k]).toString();
        h.field = Object.values(config[k]).toString();
        if (h.headerName == "__rowNum__") {
          h.hide = true;
        }
        this.columnDefs.push(h);
      }
    }
    this.columnDefs.push({
      headerName: "操作",
      field: "action",
      pinned: "right",
      width: 90,
      cellRendererFramework: "actionCell"
    });
  }
});
