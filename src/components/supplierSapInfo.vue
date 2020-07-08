<!--获取供应商SAP相关信息组件-->
<template>
    <div class="m-condition">
        <el-row :gutter="10" class="m-condition">
            <el-col :span="15">
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
        	<ag-grid-vue class="m-agTableModel ag-theme-balham" :gridOptions="selSupplierOptions" :columnDefs="selSupplierDefs" :rowData="selSupplierData" rowSelection="single" v-loading="loading"></ag-grid-vue>
        </div>	
    </div>
</template>

<script>
    import _Api from "@/api";
    import localeText from "@/i18n/agGridText";

    export default {
        data(){
            return{
                selSupplierDefs:[],
    	        selSupplierData:[],
                row:[],
                name:"",
                loading:false       
            }
        },
        props:['setSelectedSupplierCode'],
        beforeMount(){
    		this.selSupplierOptions = {
				context: {
					componentParent: this
				},
				rowSelection: "single",
                enableColResize: true,
                onRowDoubleClicked: this.rowDoubleClicked,
        	    localeText: localeText
			};
            this.selSupplierDefs = [
                {	headerName:"公司编号",field:"companyCode"},
                {	headerName:"公司名称",field:"companyName"}
            ]
        },
        methods:{
            search(){
                if(this.setSelectedSupplierCode){
                    var obj = {
                        "name":this.setSelectedSupplierCode
                    }
                    var that = this;
                    this.loading = true;
                    _Api.getRalSAPInfoBySupplierCode(obj).then(function(response){
                        var data = response.data;
                        if(data.code == "1"){
                            if(data.total > 0){
                                that.selSupplierOptions.api.setRowData(data.rows.l_SAPCompany.splice(0));
                            }
                            else
                                that.selSupplierOptions.api.setRowData([]);
                        }else{
                            that.$alert("操作失败：" + data.info,{
                                showClose:false,
                                confirmButton:"确定",
                                customClass:"alertFailure"
                            });
                        }
                        that.loading = false;
                    }).catch(()=>{
                        that.$alert("操作失败！",{
                            showClose:false,
                            confirmButton:"确定",
                            customClass:"alertFailure"
                        });
                        that.loading = false;
                    })
                }else{
                    this.selSupplierOptions.api.setRowData([]);
                }
            },
            selectedSupplier(){
                this.row = this.selSupplierOptions.api.getSelectedRows();
				if(this.row.length <= 0 ){
					this.$alert("提示：请选择需要的数据",{
						showClose:false,
						confirmButtonText:"确定",
						customClass:"alertPrompt"
					});
					return;
               }
               this.$emit('setSapSupplierCompanyInfo',this.row);
            },
            rowDoubleClicked(){
                this.selectedSupplier();
            }
        },
//      mounted(){
//  		this.search();
//  	}
    }
</script>

<style>

</style>


