import Vue from "vue";
import constant from "@/public/constant.js";

export default Vue.extend({
	template:`<el-button type="primary" :disabled="btnDis" @click="search">查询</el-button>`,
	data(){
		return{
			btnDis:true
		}
	},
	mounted(){
		if(this.setBtnType === 1){
			if(JSON.stringify(constant.supplierData) != "{}"){
				this.btnDis = false;
			}	
		}else if(this.setBtnType === 2){
			this.btnDis = false
		}
		
	},
	methods:{
		search(){
			this.$emit('search',true);
		}
	},
	props:['setBtnType']//类型类型：1、供应商；2、非供应商
})