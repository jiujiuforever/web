<!--获取SRM公司数据组件-->
<template>
    <div class="m-condition"><!--{{selection}}-->
        <el-row :gutter="10" class="m-condition">
            <el-col :span="15">
				<!-- <el-input v-model="keyWord" placeholder="请输入关键字进行过滤" @input="onFilterChanged()"></el-input> -->
                <el-input v-model="name" placeholder="请输入公司名称" clearable @keyup.enter.native="search"></el-input>
		    </el-col>
            <el-col :span="4">
                <el-button type="primary" @click="search">查询</el-button>
            </el-col>
            <el-col :span="4">
				<el-button type="primary" @click="selectedCompany">确定</el-button>
			</el-col>
        </el-row>     
        <div class="m-agTableModel">
        	<ag-grid-vue class="m-agTableContent ag-theme-balham" :gridOptions="selCompanyOptions" :columnDefs="selCompanyDefs" :rowData="selCompanyData" :rowSelection="selRowSelection"></ag-grid-vue>
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
            return{
                selCompanyDefs:[],
                selCompanyData:[],
                row:[],
                selRowSelection:"",// multiple
                name:"",
                currentPage:1,
				pageSize:30,
				total:0
            }
        },
        beforeMount(){
            this.selCompanyOptions = {
				context: {
					componentParent: this
				},
        	    enableColResize: true,
                localeText: localeText,
                onRowDoubleClicked: this.rowDoubleClicked
			};
            this.selCompanyDefs = [
                {	headerName:"公司编号",field:"companyCode",checkboxSelection:true,headerCheckboxSelection:true,headerCheckboxSelectionFilteredOnly:true},
                {	headerName:"公司名称",field:"companyName"},
                {   headerName:"地址",field:"address"}];
        },
        methods:{
            search(){
                console.log("查询");
                this.name = this.name.replace(/\s+/g,"");
				var obj = {
					"state":0,
					"name":this.name
				};
				var that = this;
				_Api.getCompanyInfo(obj).then(function(response){
					var data = response.data;
					if(data.code == "1"){ 
						if(data.total > 0)
						{
							that.selCompanyOptions.api.setRowData(data.rows.splice(0));
							that.total = data.total;
						}
						else
						{
							that.selCompanyOptions.api.setRowData([]);
							that.total = 0;
						}
					}else{
						that.$alert("操作失败：" + data.info,{
							showClose:false,
							confirmButton:"确定",
							customClass:"alertFailure"
						});
					}
				}).catch(()=>{
					that.$alert("操作失败：" + data.info,{
						showClose:false,
						confirmButton:"确定",
						customClass:"alertFailure"
					});
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
                this.setCompanyValue();
            },
            setCompanyValue:function(){
                this.$emit('setSrmCompanyInfo',this.row);
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
            rowDoubleClicked(){
                this.selectedCompany();
            }
        },
        mounted(){
            
            if(this.selection)
                this.selRowSelection = this.selection;
            else
                this.selRowSelection = "single";
            
        },
        props:["selection"]        
    }
</script>
