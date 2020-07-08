//发票号码
import Vue from "vue";

export default Vue.extend({
	template: `<input :ref="'input'" @keydown="onKeyDown($event)" v-model="value" maxlength="50" placeholder="连号时可用~隔开" style ="width:100%;height:100%"/>`,
	data() {
        return {
            value: '',
            cancelBeforeStart: true
        }
    },
    methods: {
        getValue() {
            //return this.value;
//          if(/\d|~/.test(this.value))
//          	return this.value;
//          else
//          	return 0;
			if(/^\d+([0-9]*[~][0-9]*)*[0-9]$/.test(this.value))
				return this.value;
			else
				return '00';
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
            return /\d|~/.test(charStr);
//        	return /^\d|([1-9]*[~][1-9]*)*[1-9]$/.test(charStr)
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
