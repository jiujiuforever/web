<template>
	    <div>
				<el-date-picker :ref="'container'" v-model="dtValue" type="date"
    	 placeholder="选择日期时间"
    	 value-format="yyyy-MM-dd"
    	 size="mini" align="left" :editable="edit" @change="onChange"></el-date-picker>
			</div>
</template>

<script>

import Vue from 'vue'

export default Vue.extend({
    data() {
      return {
        dtValue: '',
        edit:false
      };
    },
    methods: {
	    refresh(params) {
	        this.params = params;
	        this.setDate(params);
	    },
	    getValue(){
			return this.dtValue;
	    },
	    setValue(params){
			params.setValue(this.dtValue);
	    		
	    },
	    setDate(params) {
			this.dtValue = params.value;
			this.params = params;
	    },
	    onChange(){
			this.params.value = this.dtValue;//设置数据源
			this.params.stopEditing();
	    }
	},
	created() {
	    this.setDate(this.params);
	},
	mounted() {
        Vue.nextTick(() => {
            this.$refs.container.focus();
        });
    }
});
</script>

<style>
	.el-date-editor.el-input, .el-date-editor.el-input__inner
	{		
		width: 160px !important;
	}
</style>