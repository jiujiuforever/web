//日期选择
import Vue from "vue";
import serviceTime from "@/public/serverTime.js";

export default Vue.extend({
	template: `<input :ref="'input'" v-model="value" type="date" :max="maxDate" :min="minDate" style ="width:100%;height:100%"/>`,
	data(){
		return{
			value:'',
			cancelBeforeStart:true,
            maxDate:"9999-12-31",
            minDate:''
		}
	},
	methods: {
        getValue() {
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
	        return /^\d+(?:.\d{1,2})?$/.test(charStr);
			//return /\d/.test(charStr);
        },

        isKeyPressedNumeric(event) {
			return this.isCharNumeric(event.key);
        }
    },
    created() {
        if(this.params.value != "" && this.params.value)
            this.value = new Date(this.params.value).Format("yyyy-MM-dd");
        this.cancelBeforeStart = this.params.charPress && ('1234567890'.indexOf(this.params.charPress) < 0);
        var that = this;
        if(that.params.context.componentParent.name=="plan"){
            serviceTime.getServiceTime().then((serviceTime)=>{
                that.minDate = serviceTime.Format("yyyy-MM-dd");
            });
            that.maxDate = "9999-12-31";
        } else {
            serviceTime.getServiceTime().then((serviceTime)=>{
                that.maxDate = serviceTime.Format("yyyy-MM-dd");
            });
            that.minDate = ""
        }
    },
    mounted() {
        Vue.nextTick(() => {
            if (this.$refs.input) {
                this.$refs.input.focus();
            }
        });
    }
})

	Date.prototype.Format = function (fmt) {
	    var o = {
	        "M+": this.getMonth() + 1, //月份 
	        "d+": this.getDate(), //日 
	        "H+": this.getHours(), //小时 
	        "m+": this.getMinutes(), //分 
	        "s+": this.getSeconds(), //秒 
	        "q+": Math.floor((this.getMonth() + 3) / 3), //季度 
	        "S": this.getMilliseconds() //毫秒 
	    };
	    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
	    for (var k in o)
	    	if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
	    return fmt;
	}