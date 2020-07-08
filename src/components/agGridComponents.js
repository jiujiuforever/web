//agGrid组件

import localeText from "@/i18n/agGridText";
import localforage from 'localforage';
import constant from "@/public/constant";
import _Api from "@/api";

export default {
	template:`<ag-grid-vue class="m-agTableContent ag-theme-balham"
			:gridOptions="gridOptions"
			:columnDefs="columnDefs"
			:rowSelection="rowSelection"
			:statusBar="statusBar"
			:suppressDragLeaveHidesColumns="true"
			:suppressMakeColumnVisibleAfterUnGroup="true"
			:rowData="rowData"
			v-loading="loading"
			:gridReady="onGridReady">
			</ag-grid-vue>`,
	data(){
		return{
			columnDefs:[],
			gridOptions:{},
			dialogSize:document.body.clientWidth,
			loading:false,
			rowSelection:"single",
			rowDataChange:"",//false
            statusBar:"",
			rowData:[],
			key:`${constant.userId}-${this.tableName}`
		}
	},
	methods:{
		getContextMenuItems(){
			return [];
		},
		columnMoved:_.debounce((params,tableName) => {
			var columns = params.getAllGridColumns();
			var rowGroup = params.getRowGroupColumns();
			var arr_columns = [];
			var arr_rowGroup = [];
			var obj = {};
			columns.forEach((item)=>{
				let col_obj = {};
				if(item.colId != 'ag-Grid-AutoColumn')
				{
					col_obj.field = item.colId;
					if(item.visible)
						col_obj.hide = false;
					else
						col_obj.hide = true;
					arr_columns.push(col_obj);
				}
			})
			rowGroup.forEach((item) => {
				arr_rowGroup.push(item.colId);
			})
			obj.columnDefs = arr_columns;
			obj.rowGroup = arr_rowGroup;
			if(tableName){
				let key = `${constant.userId}-${tableName}`;
				localforage.setItem(key,obj ).then(function (value) {
					// 当值被存储后，可执行其他操作
					saveCustomClass(key,obj);
				}).catch(function(err) {
					// 当出错时，此处代码运行
				});
			}
		},2000),
		onGridReady(params){
			var that = this;
			params.api.addGlobalListener(
				(type)=>{
					if(type.indexOf('column') >= 0 && type != 'columnHoverChanged' && type != 'columnEverythingChanged'){
						that.columnMoved(that.gridOptions.columnApi,that.tableName);
					}
				}
			)
		},
		getLocalCustomClass(params){
			localforage.getItem(params).then((value) => {
				// 当离线仓库中的值被载入时，此处代码运行
				if(value){
					let rowGroup = [];
					value.rowGroup.forEach((item)=>{
						rowGroup.push(item);
					});
					value.columnDefs.forEach((item,index)=>{
						for(let i in this.getColumnDefs){
							if(this.getColumnDefs[i].field == item.field){
								this.getColumnDefs[i].sortId = index;
								this.getColumnDefs[i].hide = item.hide;
								// i == 0;
							}
						}
					});
					this.getColumnDefs = this.getColumnDefs.sort(sort('sortId'));
					this.getColumnDefs = this.setProperty(this.getColumnDefs);
					this.columnDefs = this.getColumnDefs;
					this.$nextTick(_=>{
						this.gridOptions.columnApi.setRowGroupColumns(rowGroup);
					});
				}else{
					this.getColumnDefs = this.setProperty(this.getColumnDefs);
					this.columnDefs = this.getColumnDefs;
				}
			}).catch((err) => {
				console.log("获取本地自定义样式失败！");
				this.getColumnDefs = this.setProperty(this.getColumnDefs);
				this.columnDefs = this.getColumnDefs;
			});
		},
		setProperty(params){
			if(params){
				params.forEach((item) => {
					if(item.hasOwnProperty('cellRendererFramework') || item.hasOwnProperty('cellRendererSelector')){
						item.enableValue = false;
						item.enableRowGroup = false;
					}
					if(!item.hasOwnProperty('headerCheckboxSelectionFilteredOnly')){
						if(item.hasOwnProperty('headerCheckboxSelection')){
							if(item.headerCheckboxSelection){
								item.headerCheckboxSelectionFilteredOnly = true;
							}
						}
					}
				})
			}
			return params;
		}
	},
	mounted(){
		var that = this;
		window.onresize = () =>{
            return(()=>{
                that.dialogSize = document.body.clientWidth;
            })();
        };
        if(!this.isColFit) this.gridOptions.api.sizeColumnsToFit();
		this.gridOptions.api.hideOverlay();
	},
	watch:{
		dialogSize(val){
			this.dialogSize = val;
			if(this.rowDataChange){
				let allColumnIds = [];
				this.gridOptions.columnApi.getAllColumns().forEach(function(column) {
					allColumnIds.push(column.colId);
				});
				this.gridOptions.columnApi.autoSizeColumns(allColumnIds);
			} else if(!this.isColFit){
				this.gridOptions.api.sizeColumnsToFit();
			}
			if(!this.isColFit) this.gridOptions.api.sizeColumnsToFit();
		},
		rowDataChange(val){
			if(val){
				let allColumnIds = [];
				this.gridOptions.columnApi.getAllColumns().forEach(function(column) {
					allColumnIds.push(column.colId);
				});
				this.gridOptions.columnApi.autoSizeColumns(allColumnIds);
			}else if(!this.isColFit){
				this.gridOptions.api.sizeColumnsToFit();
			}
			this.gridOptions.columnApi.setColumnWidth("remark",70);
			if(!this.isColFit) this.gridOptions.columnApi.setColumnWidth("orderAmount",150);
		}
	},
	beforeMount(){
		this.gridOptions = {
			context: {
				componentParent: this
			},
			defaultColDef:{
				menuTabs:['generalMenuTab','filterMenuTab'],
				enableRowGroup:true,
				enableValue:true,
				pivot:true,
				groupMultiAutoColumn:true
			},
			columnTypes:{
				'dateColumn':{filter:'agDateColumnFilter'},
				'textColumn':{filter:'agTextColumnFilter'},
				'numberColumn':{filter:'agNumberColumnFilter'}
			},
			enableColResize: true,
			suppressContextMenu:true,//取消右键显示菜单
    	    localeText: localeText,
    	    enableFilter :true,//允许过滤(可以插入自定义过滤控件)
			multiSortKey:'ctrl',//多列排序
    	    enableSorting: true, //列排序
			animateRows: true ,//排序动画
			suppressRowClickSelection: true//单元格选中,false为选中整行
		};
		if(this.getGridOptions)
			this.gridOptions = Object.assign(this.gridOptions,this.getGridOptions);
		if(this.getRowSelection)
			this.rowSelection = this.getRowSelection;
		else
			this.rowSelection = "single"
		if(this.tableName){
			var obj = {};
			obj.code = constant.system.code;
			obj.key = this.key;
			obj.uid = constant.user.id;
			_Api.getCustomClassStyle(obj).then((response)=>{
				if(response.data){
					if(response.data.code === 1){
						console.log("获取线上自定义样式成功！");
						var data = response.data.data;
						var jData = JSON.parse(data);
						jData.columnDefs.forEach((item,index)=>{
							for(let i in this.getColumnDefs){
								if(this.getColumnDefs[i].field == item.field){
									this.getColumnDefs[i].sortId = index;
									this.getColumnDefs[i].hide = item.hide;
									// i == 0
								}
							}
						});
						this.getColumnDefs = this.getColumnDefs.sort(sort('sortId'));
						this.getColumnDefs = this.setProperty(this.getColumnDefs);
						this.columnDefs = this.getColumnDefs;
						this.$nextTick(_=>{
							this.gridOptions.columnApi.setRowGroupColumns(jData.rowGroup);
						});
					}
				}else{
					console.log("获取线上自定义样式失败！");
					this.getLocalCustomClass(this.key);
				}
			}).catch(()=>{
				console.log("获取线上自定义样式失败！");
				this.getLocalCustomClass(this.key);
			})
		}else{
            let tips = ['companyName','supplierName','matName','creator','remark','plantName']
			this.getColumnDefs = this.setProperty(this.getColumnDefs);
            this.columnDefs = this.getColumnDefs;
            this.columnDefs.forEach(col => {
                if(tips.indexOf(col.field)>-1){
                    col.tooltipField = col.field
                }
            })
		}
		if(this.getStatusBar)
			this.statusBar = this.getStatusBar
	},
	created:function(){
	},
	props:["getGridOptions","getColumnDefs",'getRowSelection','getStatusBar',"isColFit","tableName"]
}

function sort(prop) {
	return function (obj1, obj2) 
	{
		var val1 = obj1[prop]
		var val2 = obj2[prop]
		if (!isNaN(Number(val1)) && !isNaN(Number(val2))) {
			val1 = Number(val1)
			val2 = Number(val2)
		}
		if (val1 < val2) {
			return -1
		} else if (val1 > val2) {
			return 1
		} else {
			return 0
		}
	}
}

function saveCustomClass(key,jsonData){
	if(key && jsonData){
		var obj = {};
		obj.code = constant.system.code;
		obj.jsonData = jsonData;
		obj.key = key;
		obj.uid = constant.user.id;
		_Api.saveCustomStyle(obj).then((response)=>{
			var data = response.data;
			if(data.code == 1){
				console.log("保存线上自定义样式成功！");
			}else{
				console.log("保存线上自定义样式失败！");
			}
		}).catch(()=>{
			console.log("保存线上自定义样式失败！");
		})
	}
}