//过滤
function purOrdNoFilter(){}

purOrdNoFilter.prototype.init = function(params){
    this.valueGetter = params.valueGetter;
    this.filterText = null;
    this.setupGui(params);
}

purOrdNoFilter.prototype.setupGui = function(params){
    this.gui = document.createElement('div');
    this.gui.innerHTML =
    `<div style="padding: 4px; width: 200px;">
    <input style="margin: 4px 0px 4px 0px;" type="text" id="filterText" placeholder="请输入需要过滤的信息..."/>
    </div>`;
    this.eFilterText = this.gui.querySelector('#filterText');
    this.eFilterText.addEventListener("changed", listener);
    this.eFilterText.addEventListener("paste", listener);
    this.eFilterText.addEventListener("input", listener);
    this.eFilterText.addEventListener("keydown", listener);
    this.eFilterText.addEventListener("keyup", listener);

    var that = this;
    function listener(event) {
        that.filterText = event.target.value;
        params.filterChangedCallback();
    }
}

purOrdNoFilter.prototype.getGui = function () {
    return this.gui;
};

purOrdNoFilter.prototype.doesFilterPass = function (params) {
    var passed = true;
    var valueGetter = this.valueGetter;
    this.filterText.toLowerCase().split(" ").forEach(function(filterWord) {
        var value = valueGetter(params);
        if (value.toString().toLowerCase().indexOf(filterWord)<0) {
            passed = false;
        }
    });

    return passed;
};

purOrdNoFilter.prototype.changed = function(params){
	if(!params)
		return true;
}

purOrdNoFilter.prototype.keydown = function(params){
	let evn = e || event;
    let key = evn.keyCode || evn.which || evn.charCode;
    if(key === 70 && e.ctrlKey){
        console.log("Ctrl + F");
    }
}

purOrdNoFilter.prototype.isFilterActive = function () {
    return this.filterText !== null && this.filterText !== undefined && this.filterText !== '';
};

purOrdNoFilter.prototype.getModel = function() {
    var model = {value: this.filterText.value};
    return model;
};

purOrdNoFilter.prototype.setModel = function(model) {
    if(model)
    	this.eFilterText.value = model.value;
};

export default purOrdNoFilter;