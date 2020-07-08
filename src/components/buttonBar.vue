<template>
	<div class="m-view-formula">
        <div class="condition">
            <el-row :gutter="10">
                <el-col :span="2">
                    <el-button type="primary" @click="addNewRow" :disabled.sync="aDisable">新增</el-button>
                </el-col>
                <el-col :span="2">
                    <el-button type="primary" @click="editRowData" v-bind:class="{show:isEdit}" :disabled.sync="eDisable">编辑</el-button>
                </el-col>
                <el-col :span="2">
                    <el-button type="primary" @click="cancelEdit" v-bind:class="{show:isCancel}" :disabled.sync="cDisable">取消</el-button>
                </el-col>
                <el-col :span="2">
                    <el-button type="primary" @click="delRowData" v-bind:class="{show:isStop}" :disabled.sync="sDisable">停用</el-button>
                </el-col>
                <el-col :span="2">
                    <el-button type="primary" @click="setUsable" v-bind:class="{show:isUse}" :disabled.sync="uDisable">启用</el-button>
                </el-col>
                <el-col :span="2">
                    <el-button type="primary" @click="SaveDataToRdb" :disabled.sync="bDisable">保存</el-button>
                </el-col>
                <el-col :span="2">
					<el-button type="primary" @click="queryListData" :disabled.sync="qDisable">查询</el-button>
                </el-col>
                <el-col :span="2">
					<el-checkbox v-model="state" @change="queryUnuseData">显示停用</el-checkbox>
                </el-col>

                <el-col :span="2">
                    <el-button type="text" @click="dialogVisible = true">导入数据</el-button>
                </el-col>
            </el-row>
        </div>
        
        <el-dialog title="导入" :visible.sync="dialogVisible" width="90%" :before-close="handleClose">
            <excel ref="excel"></excel>
            <span slot="footer" class="dialog-footer">
                <el-button @click="dialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="importExcel">确 定</el-button>
            </span>
        </el-dialog>
        
    </div>
</template>

<style lang="less">
.m-view-buttonBar {
    .m-agTable {
        position: absolute;
        left: 0;
        right: 0;
        top: 47px;
        bottom: 0;
    }
}
.show{
	display: none;
}
</style>

<script>
import Vue from 'vue'
import excel from "@/views/excel";
export default Vue.extend({
    data() {
        return {
            tbName:'',
            columnDefs:[],
            dialogVisible:false,
            isNewData:true,
            isEdit:false,
            isCancel:true,
            isStop:false,
            isUse:true,
            state:false,
            aDisable:false,
            sDisable:false,
            uDisable:false,
            bDisable:false,
            eDisable:false,
            cDisable:false,
            qDisable:false
        };
    },
    components: {
        excel
    },
    methods: {
        editRowData(){
        	var rows = this.$parent.gridOptions.api.getSelectedRows();
            if(!rows || rows.length < 1){
//              alert("请选择编辑的数据。");
                return;
            }

            this.isCancel = false;
            this.isNewData = false;
            this.isEdit = true;
            this.aDisable = true;
            this.qDisable = true;
            this.uDisable = true;
            this.sDisable = true;

            this.cDisable = false;
            this.bDisable = false;

            this.$parent.createColumnDefs(true, false);
        },
        delRowData(){
            var rows = this.$parent.gridOptions.api.getSelectedRows();
            if(!rows || rows.length < 1){
//              alert("请选择要删除的数据。");
                return;
            }

            this.$parent.delRowData();
        },
        setUsable(){
            var rows = this.$parent.gridOptions.api.getSelectedRows();
            if(rows.length < 1){
//              alert('请选择要重新启用的数据。');
                return;
            }
            this.$parent.setUsable();
        },
        SaveDataToRdb(){
            this.$parent.SaveDataToRdb();
        },
        queryListData(){
            this.$parent.queryListData();
        },
        cancelEdit(){
            this.isCancel = true;
            this.isEdit = false;

            this.aDisable = false;
            this.sDisable = false;
            this.qDisable = false;
            this.uDisable = false;

            this.queryListData();
        },
        queryUnuseData(){
            if(this.state){
                this.isStop = true;
                this.isUse = false;

                this.bDisable = true;
                this.aDisable = true;
                this.eDisable = true;
                this.cDisable = true;
                this.qDisable = true;
            }
            else{
                this.isStop = false;
                this.isUse = true;

                this.bDisable = false;
                this.aDisable = false;
                this.eDisable = false;
                this.cDisable = false;
                this.qDisable = false;
            }
            this.$parent.queryUnuseData();
        },
        importExcel(){
            this.$refs.excel.importToRdb(this.tbName);
        	this.dialogVisible = false;
        },
        handleClose(done) {
	        this.$confirm("确认关闭？").then(_ => {done();}).catch(_ => {});
        },
        addNewRow(){
			var rowStr = "";
			for(var i = 0; i < this.columnDefs.length; i++){
				rowStr += '"' + this.columnDefs[i].field + '":"",';
			}
			rowStr = rowStr.substring(0, rowStr.length - 1);
			var newRow = JSON.parse('{'+rowStr+'}');

			if(this.$parent.rowData && this.$parent.rowData.length > 0){
				this.$parent.rowData.push(newRow);
			}
			else{
				var rd = [];
				rd.push(newRow);
				this.$parent.rowData = rd;
            }
            
            this.isNewData = true;
            this.isEdit = true;
            this.isCancel = false;
            
            this.sDisable = true;
            this.qDisable = true;

            this.$parent.createColumnDefs(true, true);
        }

    },
    created(){
        this.columnDefs = this.$parent.columnDefs;
        this.tbName = this.$parent.tbName;
    },
    beforeMount() {
        
    },
    mounted() {

    }
});
</script>
