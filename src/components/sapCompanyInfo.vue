<!-- 获取sap公司组件 -->
<template>
    <div class="m-condition">
        <el-row :gutter="10" class="m-condition">
            <el-col :span="15">
				<!-- <el-input v-model="keyWord" placeholder="请输入关键字进行过滤" @input="onFilterChanged()"></el-input> -->
                <el-input v-model="name" placeholder="请输入公司名称/编号" clearable @keyup.enter.native="search" maxlength="20"></el-input>
		    </el-col>
            <el-col :span="4">
                <el-button type="primary" @click="search">查询</el-button>
            </el-col>
            <el-col :span="4">
				<el-button type="primary" @click="selectedCompany">确定</el-button>
			</el-col>
        </el-row>      
        <div class="m-agTableModel">
        	<ag-grid-vue class="m-agTableContent ag-theme-balham" :gridOptions="selCompanyOptions" :columnDefs="isOk?selCompanyDefs2:selCompanyDefs" :rowData="selCompanyData" rowSelection="single" v-loading="loading"></ag-grid-vue>
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
        data(){
            return {
                selCompanyDefs:[],
                selCompanyData:[],
                keyWord:"",
                row:[],
                name:"",
                currentPage:1,
				pageSize:30,
				total:0,
                isOk:false,
                loading:false
            }
        },
        beforeMount(){
        	if(this.showIsSelected)
        		this.isOk = this.showIsSelected
        	else	
        		this.isOk = false;
            this.selCompanyOptions = {
				context: {
					componentParent: this
				},
				rowSelection: "single",//multiple
        	    enableColResize: true,
                localeText: localeText,
                onRowDoubleClicked: this.rowDoubleClicked
			};
            this.selCompanyDefs = [
                {	headerName:"公司编号",field:"bukrs"},
                {	headerName:"公司名称",field:"name"}
            ];
            this.selCompanyDefs2 = [
            	{	headerName:"公司编码",field:"companyCode"},
            	{	headerName:"公司名称",field:"companyName"},
            	{	headerName:"是否已添加",field:"isSelect",
            		cellRenderer:function(params){
            			if(params.value == "1")
            				return '<span class="ag-icon">是</span>';
            			else
            				return '<span class="ag-icon">否</span>';
            		}
            	}];
        },
        methods:{
            getSapCompany(){
                console.log("根据条件获取sap公司信息")
                var that = this;
                var obj={};
                this.name = this.name.replace(/\s+/g,"");
                if(this.name != "" && this.currentPage > 1){
					this.currentPage = 1;
				}
                obj ={
                    "entity":{
                        "name":this.name,
                    },
                    "size":this.pageSize,
                    "current":this.currentPage
                }
                this.loading = true;
                _Api.companyManage_getAuthCompany(obj).then(function(response){
                    that.loading = false;
                    var data = response.data;
                    if(data.code == "1"){
                        if(data.total > 0){
                            that.selCompanyOptions.api.setRowData(data.rows.splice(0));
                            that.total = data.total;
                        }else{
                            that.selCompanyOptions.api.setRowData([]);
                            that.total = 0;
                        }
                    }else{
                        that.$alert("操作失败：" + data.info,{
							showClose:false,
							confirmButton:"确定",
							customClass:"alertFailure"
                        });
                        that.total = 0;
                    }
                }).catch(() =>{
                    that.$alert("操作失败",{
							showClose:false,
							confirmButton:"确定",
							customClass:"alertFailure"
                    });
                    that.total = 0;
                    that.loading = false;
                })
            },
            selectedCompany(){
                console.log("选择所选择公司");
			    this.row = this.selCompanyOptions.api.getSelectedRows();
				if(this.row.length <= 0 ){
					this.$alert("提示：请选择需要的数据",{
						showClose:false,
						confirmButtonText:"确定",
						customClass:"alertPrompt"
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
                this.setCompanyValue();
            },
            onFilterChanged(){
                console.log("过滤");
	        	var that = this;
	        	setTimeout(function() {
	        		that.selCompanyOptions.api.setQuickFilter(that.keyWord);
	        	}, 200);
            },
            setCompanyValue:function(){
                this.$emit('setSapCompanyInfo',this.row);
            },
            search(){
                this.getSapCompany();
            },
            handleSizeChange(params){
                this.currentPage = 1;
            	this.pageSize = params;
				this.getSapCompany();
            },
            handleCurrentChange(params){
                this.currentPage = params;
				this.getSapCompany();
            },
            handlePrevClick(params){
            	this.currentPage = params;
				this.getSapCompany();
            },
            handleNextClick(params){
            	this.currentPage = params;
				this.getSapCompany();
            },
            rowDoubleClicked(){
                this.selectedCompany();
            }
        },
        props:["showIsSelected"]
    }
</script>

<style>

</style>


