//UEditor
import Vue from "vue";

export default Vue.extend({
	template:`<div>
			<script id="editor" type="text/plain"></script>
		</div>`,
	name:'UE',
	data(){
		return{
			editor:null
		}
	},
	props:{
		defaultMsg: {
	        type: String
	      },
	      config: {
	        type: Object
	      }
	},
	mounted(){
		const _this = this;
		this.editor = UE.getEditor('editor', this.config); // 初始化UE
		this.editor.addListener("ready", function () {
			_this.editor.setContent(_this.defaultMsg); // 确保UE加载完成后，放入内容。
		});
		//文本框获取焦点时清空默认显示的内容
        this.editor.addListener("focus", function(){
            ue.setContent('');
        });
	},
	methods:{
		getUEContent() { // 获取内容方法
    		return this.editor.getContent()
    	}
	},
	destroyed() {
      this.editor.destroy();
    }
})
