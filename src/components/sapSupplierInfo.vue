<!--sap获取供应商数据组件-->
<template>
	<div class="m-condition">
		<el-row :gutter="10" class="m-condition">
			<el-col :span="15">
				<!-- <el-input v-model="keyWord" placeholder="请输入关键字进行过滤" @input="onFilterChanged()"></el-input> -->
				<el-input v-model="name" placeholder="请输入供应商名称/编号" clearable @keyup.enter.native="search"></el-input>
			</el-col>
			<el-col :span="4">
				<el-button type="primary" @click="search">查询</el-button>
			</el-col>
			<el-col :span="4">
				<el-button type="primary" @click="selectedSupplier">确定</el-button>
			</el-col>
		</el-row>
		<div class="m-agTableModel">
			<ag-grid-vue class="m-agTableContent ag-theme-balham" :gridOptions="selSupplierOptions" :columnDefs=isOk?selSupplierDefs2:selSupplierDefs :rowData="selSupplierData" rowSelection="single" v-loading="loading"></ag-grid-vue>
		</div>
		<div class="m-pageModel m-pBottom">
			<el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" @prev-click="handlePrevClick" @next-click="handleNextClick" :current-page="currentPage" :page-sizes="[30,50,100,150,200]" :page-size="pageSize" layout="total, sizes, prev, pager, next, jumper" :total="total"></el-pagination>
		</div>
	</div>
</template>

<script>
	import _Api from "@/api";
	import localeText from "@/i18n/agGridText";

export default {
    data() {
        return {
            selSupplierDefs: [],
            selSupplierData: [],
            row: [],
            name: "",
            currentPage: 1,
            pageSize: 30,
            total: 0,
            loading: false,
            isOk: false
        };
    },
    beforeMount() {
        if (this.showIsSelected) this.isOk = this.showIsSelected;
        else this.isOk = false;
        this.selSupplierOptions = {
            context: {
                componentParent: this
            },
            onRowDoubleClicked: this.rowDoubleClicked,
            rowSelection: "single",
            enableColResize: true,
            localeText: localeText
        };
        this.selSupplierDefs = [
            { headerName: "供应商编号", field: "supplierCode" },
            { headerName: "供应商名称", field: "supplierName" }
        ];
        this.selSupplierDefs2 = [
            { headerName: "供应商编号", field: "supplierCode" },
            { headerName: "供应商名称", field: "supplierName" },
            {
                headerName: "是否已添加",
                field: "isSelect",
                cellRenderer: function(params) {
                    if (params.value == "1")
                        return '<span class="ag-icon">是</span>';
                    else return '<span class="ag-icon">否</span>';
                }
            }
        ];
    },
    methods: {
        search() {
            this.name = this.name.replace(/\s+/g, "");
            if (this.name != "" && this.currentPage > 1) {
                this.currentPage = 1;
            }
            var obj = {
                name: this.name,
                size: this.pageSize,
                current: this.currentPage
            };
//          if(this.name){
//          	this.pageSize = 30;
//          	this.currentPage = 1;
//          }
//          obj.size = this.pageSize;
//          obj.current = this.currentPage;
            var that = this;
            this.loading = true;
            _Api.getSAPSupplierInfo(obj).then(function(response) {
                    var data = response.data;
                    if (data.code == "1") {
                        if (data.total > 0) {
                            that.selSupplierOptions.api.setRowData(
                                data.rows.splice(0)
                            );
                            that.total = data.total;
                        } else {
                            that.gridOptions.api.setRowData([]);
                            that.total = 0;
                        }
                    } else {
                        that.$alert("操作失败：" + data.info, {
                            showClose: false,
                            confirmButton: "确定",
                            customClass: "alertFailure"
                        });
                    }                    
                    that.loading = false;
                })
                .catch(() => {
                    that.$alert("操作失败！", {
                        showClose: false,
                        confirmButton: "确定",
                        customClass: "alertFailure"
                    });
                    that.loading = false;
                });
        },
        selectedSupplier() {
            this.row = this.selSupplierOptions.api.getSelectedRows();
            if (this.row.length <= 0) {
                this.$alert("提示：请选择需要的数据", {
                    showClose: false,
                    confirmButtonText: "确定",
                    customClass: "alertPrompt"
                });
                return;
            }
            if(this.row[0].isSelect == "1")
                {
                	this.$alert("提示：该数据已被添加！",{
						showClose:false,
						confirmButtonText:"确定",
						customClass:"alertPrompt"
					});
                	return;
                }
            this.setSupplierValue();
        },
        setSupplierValue: function() {
            this.$emit("setSapSupplierInfo", this.row);
        },
        handleSizeChange(params) {
            this.pageSize = params;
            this.search();
        },
        handleCurrentChange(params) {
            this.currentPage = params;
            this.search();
        },
        handlePrevClick(params) {
            this.currentPage = params;
            this.search();
        },
        handleNextClick(params) {
            this.currentPage = params;
            this.search();
        },
        rowDoubleClicked() {
            this.selectedSupplier();
        }
    },
    mounted(){
        this.search();
    },
    props: ["showIsSelected"]
};
</script>

<style>
</style>