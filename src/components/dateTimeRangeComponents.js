//页面时间段选择空间 20181229 by lxh

import serviceTime from "@/public/serverTime.js";
import Vue from "vue";

export default Vue.extend({
	template:`<div>
			<el-col :span="4">
				<el-date-picker v-model="beginDate"  type="date" placeholder="开始日期" value-format="yyyy-MM-dd" :editable=false  :picker-options="po1" ></el-date-picker>
			</el-col>
			<el-col :span="4">
				<el-date-picker v-model="endDate"  type="date" placeholder="结束日期" value-format="yyyy-MM-dd" :editable=false :picker-options="po2"></el-date-picker>
			</el-col>
		</div>`,
	data(){
		return {
			beginDate:"",
			endDate:"",
			serviceTime:"",
			po1:{
				disabledDate:this.disabledDate1
			},
			po2:{
				disabledDate:this.disabledDate2
			}
		}
	},
	created(){
		var that = this;
		serviceTime.getServiceTime().then((serviceTime)=>{
//			that.beginDate = new Date((serviceTime.getTime() - 604800000)).Format("yyyy-MM-dd");
//			that.endDate = serviceTime.Format("yyyy-MM-dd");
			that.serviceTime = serviceTime.getTime();
		});
	},
	watch:{
		beginDate(value){
			if(value == null)
				this.beginDate = "";
			this.$emit("dateValueChanged",true);
		},
		endDate(value){
			if(value == null)
				this.endDate = "";
			this.$emit("dateValueChanged",true);
		}
	},
	methods:{
		disabledDate1(time){
			if(this.endDate)
				return time.getTime() > new Date(this.endDate).getTime();
		},
		disabledDate2(time){
			if(this.beginDate)
				return time.getTime() < (new Date(this.beginDate).getTime()- 3600 * 1000 * 24);
		}
	},
})
