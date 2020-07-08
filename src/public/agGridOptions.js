import localeText from "@/i18n/agGridText"

//单行需传入"single"
function gridOptions(rowSelection){
	let options = {
		enableRangeSelection: true, //允许拖动选择单元格
		suppressRowClickSelection: true, //单击选定单元格，false默认选定整行
		enableColResize: true, //支持列拖动
		localeText: localeText, //表格字体汉化
		enableFilter: true, //列过滤器
		enableSorting: true, //列排序
		animateRows: true //排序动画
	};
	if(!rowSelection)
		options.rowSelection = 'multiple'; //表格多行选择
	else
		options.rowSelection = 'single';
	return options;
}

export default {
	gridOptions:gridOptions
}
