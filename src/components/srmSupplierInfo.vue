<!--获取供应商数据组件-->
<template>
	<div class="m-condition">
        <el-row :gutter="10" class="m-condition">
            <el-col :span="15">
				<el-input v-model="keyWord" placeholder="请输入关键字进行过滤" @input="onFilterChanged()" clearable></el-input>
                <!-- <el-input v-model="name" placeholder="请输入供应商名称/编号" clearable @keyup.enter.native="search"></el-input> -->
		    </el-col>
            <!-- <el-col :span="4">
                <el-button type="primary" @click="search">查询</el-button>
            </el-col> -->
            <el-col :span="4">
				<el-button type="primary" @click="selectedSupplier">确定</el-button>
			</el-col>
        </el-row>
        <div class="m-agTableModel">
        	<ag-grid-vue class="m-agTableModel ag-theme-balham" :gridOptions="selSupplierOptions" :columnDefs="selSupplierDefs" :rowData="selSupplierData" rowSelection="single" v-loading="loading"></ag-grid-vue>
        </div>	
        <div class="m-pageModel m-pBottom">
        	<!-- <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" @prev-click="handlePrevClick" @next-click="handleNextClick" :current-page="currentPage" :page-sizes="[30,50,100,150,200]" :page-size="pageSize" layout="total, sizes, prev, pager, next, jumper" :total="total"></el-pagination> -->
        </div>
    </div>
</template>

<script>
    import _Api from "@/api";
    import localeText from "@/i18n/agGridText";
    
    export default {
		name:'srmSupplierInfo',
		props:['layout'],
    	data(){
    		return{
    			selSupplierDefs:[],
    			selSupplierData:[],
    			row:[],
    			name:"",
    			currentPage:1,
				pageSize:30,
				total:0,
				keyWord:"",
				loading:false
    		}
    	},
    	beforeMount(){
    		this.selSupplierOptions = {
				context: {
					componentParent: this
				},
				rowSelection: "single",
				enableColResize: true,
				localeText: localeText,
				onRowDoubleClicked: this.rowDoubleClicked
			};
            this.selSupplierDefs = [
                {	headerName:"供应商编号",field:"supplierCode"},
                {	headerName:"供应商名称",field:"supplierName"}
            ]
    	},
    	methods:{
			onFilterChanged(){
				var that = this;
	        	setTimeout(function() {
	        		that.selSupplierOptions.api.setQuickFilter(that.keyWord);
	        	}, 200);
			},
			handleSizeChange(params){
				this.pageSize = params;
				this.search();
			},
			handleCurrentChange(params){
				this.currentPage = params;
				this.search();
			},
			handlePrevClick(params){
				this.currentPage = params;
				this.search();
			},
			handleNextClick(params){
				this.currentPage = params;
				this.search();
			},
    		search(){
                var that = this;
                var obj ={};
				if(this.layout.auth){
					obj.name = this.layout.companyCode;
					//jjc
					if(this.layout.filterByUser)
						obj.id=this.$global.user.id;
					this.loading = true;
					_Api.getAuthSupplierByCompanyCode(obj).then(function(response){
						var data = response.data;
						if(data.code == "1"){
							if(data.rows!=null)
							{
								that.selSupplierOptions.api.setRowData(data.rows.splice(0));
								let allColumnIds = [];
								that.selSupplierOptions.columnApi.getAllColumns().forEach(function(column) {
									allColumnIds.push(column.colId);
								});
								that.selSupplierOptions.columnApi.autoSizeColumns(allColumnIds);
							}else{
								that.selSupplierOptions.api.setRowData([]);
							}
							that.loading = false;
						}else{
							that.$alert("操作失败！:" + data.info,{
								showClose:false,
								confirmButton:"确定",
								customClass:"alertFailure"
							});
							that.selSupplierOptions.api.setRowData([]);
							that.loading = false;
						}
					}).catch(()=>{
						that.$alert("操作失败！",{
							showClose:false,
							confirmButton:"确定",
							customClass:"alertFailure"
						});
						that.selSupplierOptions.api.setRowData([]);
						that.loading = false;
					})
				}else{
					if(this.name != "" && this.currentPage > 1){
						this.currentPage = 1;
					}
					obj ={
						"eqParams":{"state":0},
						"current":this.currentPage,
						"size":this.pageSize,
						"likeParams":{}
					}
					this.name = this.name.replace(/\s+/g,"");
					if(this.name)
					{
						obj.likeParams.supplierCode = this.name;
						obj.likeParams.supplierName = this.name;
					}
					// var that = this;
					_Api.getSupplierInfo(obj).then(function(response){
						var data = response.data;
						if(data.code == "1"){
							if(data.total > 0){
								that.selSupplierOptions.api.setRowData(data.rows.splice(0));
								that.total = data.total;
							}else{
								that.gridOptions.api.setRowData([]);
								that.total = 0;
							}
						}else{
							that.$alert("操作失败！:" + data.info,{
								showClose:false,
								confirmButton:"确定",
								customClass:"alertFailure"
							});
							that.selSupplierOptions.api.setRowData([]);
						}
					}).catch(()=>{
						that.$alert("操作失败！",{
							showClose:false,
							confirmButton:"确定",
							customClass:"alertFailure"
						});
						that.selSupplierOptions.api.setRowData([]);
					})
				}
    		},
    		selectedSupplier(){
				var row = this.selSupplierOptions.api.getSelectedRows();
				if(row.length <= 0){
					this.$alert("提示：请选择数据",{
						showClose:false,
						confirmButtonText:"确定",
						customClass:"alertPrompt"
					});
					return;
				}
				this.$emit("setSrmSupplierInfo", row);
			},
			rowDoubleClicked(){
				this.selectedSupplier();
			}
    	}
    }
</script>

<style>
</style>