//下拉选择
import Vue from "vue";

export default Vue.extend({
	template:`<select v-model="selValue" style ="width:100%;height:100%" @change="valueChanged">
			<option v-for="item in busType" :value="item.value" :label="item.label"></option>
			</select>`,
	data(){
		return {
			selValue:'',
			busType:[
			{label:"普通采购",value:1},
			{label:"预付款",value:2},
			{label:"期初",value:3},
			{label:"调整",value:4}
			]
		}
	},
	methods:{
		valueChanged(){
			return this.selValue;
		},
		getValue(){
			return this.selValue;
		}
	},
	mounted(){
		this.selValue = this.params.value;
	}
})