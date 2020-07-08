<!-- 上传文件组件 -->
<template>
	<el-upload
		class="upload-demo"
		ref="upload"
		:action="upload_url"
		:on-preview="handlePreview"
		:on-remove="handleRemove"
		:file-list="fileList"
		:before-remove="beforeRemove"
		:before-upload="beforeAvatarUpload"
		:auto-upload="false"
		:onSuccess="uploadSuccess"
		:on-change="change"
		:limit="1"
		accept=".pdf,.doc,.docx,.xls,.xlsx,.txt">
		<el-button slot="trigger" size="small" type="primary">选取文件</el-button>
		<el-button style="margin-left: 10px;" size="small" type="success" @click="submitUpload">上传到服务器</el-button>
		<div slot="tip" class="el-upload__tip">文件大小不允许超过20MB</div>
	</el-upload>
</template>

<script>
//	import _Api from "@/api";
	import constant from "@/public/constant";
	
	export default{
		data(){
			return{
				fileList:[],
				upload_url:constant.upload_url,  //jjc
				//upload_url:"http://172.16.100.45:49231/srm/upload/file",
				filename:""
			}
		},
		methods:{
			handleRemove(file,fileList){
				this.filename = "";
			},
			submitUpload(obj){
				if(obj.filename){
					//?filename=" + this.filename
					this.$refs.upload.submit();
				}else{
					this.$message({
						message: '请选择需要上传的文件！',
						type: 'warning'
					});
				}
			},
			beforeRemove(file, fileList) {
				// return this.$confirm(`确定移除 ${ file.name }？`).catch(()=>{});
			},
			handlePreview(file) {
				console.log(file);
			},
			beforeAvatarUpload(file){
				var fileType=file.name.substring(file.name.lastIndexOf('.')+1)
				if(fileType!="txt" && fileType != "pdf" && fileType != "doc" && fileType != "docx" && fileType != "xls" && fileType != "xlsx"){
					this.$message({
						message: '上传文件类型只支持.txt/.pdf/.doc/.docx/.xls/.xlsx！',
						type: 'warning'
					});
					return false;
				}
				const size = file.size / 1024 / 1024 < 20;
				if (!size) {
					this.$message({
						message: '上传模板大小不能超过 20MB!',
						type: 'warning'
					});
					return false;
				}
			},
			uploadSuccess(response, file, fileList){
				if(response.code == 1){
					this.$message({
						message: "上传成功",
						type: "success"
				});
				console.log(response.rows[0]);
				console.log(response.rows[0].fileName);
				this.$emit('getFileInfo',response.rows[0]);
				this.$refs.upload.clearFiles();
				this.clearUpLoadList();
				}else{
					this.$alert("操作失败",{
						showClose:false,
						confirmButton:"确定",
						customClass:"alertFailure"
					});
				}
			},
			change(file){
				this.upload_url=constant.upload_url;  //jjc
				//this.upload_url="http://172.16.100.45:49231/srm/upload/file";
				this.filename = file.name
			},
			clearUpLoadList () {
				this.$refs.upload.clearFiles();
			}
		}
	}
</script>

<style>
</style>