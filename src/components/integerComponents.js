//整数

import Vue from "vue";

export default Vue.extend({
    template: `<input :ref="'input'" @keydown="onKeyDown($event)" v-model="value" maxlength="20" placeholder="只能输入数字类型" style ="width:100%;height:100%"/>`,
    data() {
        return {
            value: '',
            cancelBeforeStart: true
        }
    },
    methods: {
        getValue() {
            //return this.value;
            if(this.value == "" || this.value == "-")
                return 0;
            else
                return this.value;
        },

        isCancelBeforeStart() {
            return this.cancelBeforeStart;
        },
        isCancelAfterEnd() {
			return false;
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
        	if(charStr == "-")
        	{
        		if(this.value != "") {
                    return false;
                }
        			return true;
        	}else{
        		return /\d/.test(charStr);
        	}
        },

        isKeyPressedNumeric(event) {
//          const charCode = this.getCharCodeFromEvent(event);
//          const charStr = String.fromCharCode(charCode);
//          return this.isCharNumeric(charStr);
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