//小数点类型(13,2)
import Vue from "vue";

export default Vue.extend({
	template: `<input :ref="'input'" @keydown="onKeyDown($event)" v-model="value" maxlength="13" placeholder="数字(小数点后两位)" style ="width:100%;height:100%;"/>`,
	data(){
		return{
			value:'',
			cancelBeforeStart:true
		}
	},
	methods: {
        getValue() {
            return parseFloat(this.value);
        },

        isCancelBeforeStart() {
            return this.cancelBeforeStart;
        },
        isCancelAfterEnd() {
        	return /\d/.test(parseFloat(this.value)) ? false : true;
        },

        onKeyDown(event) {
        	if(event.keyCode == 8)
        		return this.value == "";
            if (!this.isKeyPressedNumeric(event)) {
                if (event.preventDefault) event.preventDefault();
            }
        },
        getCharCodeFromEvent(event) {
            event = event || window.event;
            return (typeof event.which === "undefined") ? event.keyCode : event.which;
        },

        isCharNumeric(charStr) {
	        //return /^\d+(?:.\d{1,2})?$/.test(charStr);
			//return /\d/.test(charStr);
			// charStr = charStr.trim();
			if(this.params.node.data.busType > 1){
				//非普通采购
				if(this.value == "")
				{
					if(charStr === '-')
						return true;
					else
					{
						if(/\d/.test(charStr)){
                            return true;
                        }
						    return false;
					}
				}else{
					if(/\d/.test(charStr))
					{
						if(String(this.value).indexOf('.') > -1)
						{
							let arr = String(this.value).split('.');
							if(arr[1] === '')
								return true;
							else{
								return arr[1].length >= 2 ? false : true;
							}
						}
						else
							return true;
					}else{
						if(charStr === '.')
						{
							if(String(this.value).indexOf('.') > -1)
								return false;
							else
								return /\d/.test(this.value) ? true : false;
						}
					}
				}
			}else{
				//普通采购
				if(this.value){
					if(charStr == "."){
						if(this.value.indexOf('.') > -1) {
                            return false;
                        }
							return true;
					}else if(charStr == "0"){
						let arr = String(this.value).split('.');
						if(arr[1] === ''){
							return true;
						}else{
							if(this.value <= 0) {
                                return false;
                            }
								return true;
						}
					}else{
						//return true;
						if(/\d/.test(charStr)){
							let arr = String(this.value).split('.');
							if(arr[1]){
								if(arr[1].length >= 2) {
                                    return false;
                                }
									return true;
							}else{
								return true;
							}
						}
					}
				}else{
					return /\d/.test(charStr);
				}
			}
        },

        isKeyPressedNumeric(event) {
			return this.isCharNumeric(event.key);
        }
    },
    created() {
        this.value = this.params.value;
        this.cancelBeforeStart = this.params.charPress && ('1234567890'.indexOf(this.params.charPress) < 0);
    },
    mounted() {
        Vue.nextTick(() => {
            if (this.$refs.input) {
                this.$refs.input.focus();
            }
        });
    }
})
