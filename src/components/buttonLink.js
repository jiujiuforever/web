/*
 * 按钮跳转
 */

function singleClickEditRenderer(){}

singleClickEditRenderer.prototype.init = function(params){
   	var template =
   	'<span><button id="theValue" class="rendererClass">'+params.value+'</button></span>';
    var tempDiv = document.createElement("div");
    tempDiv.innerHTML = template;
    this.eGui = tempDiv.firstElementChild;

    this.params = params;
    this.eValue = this.eGui.querySelector("#theValue");
    this.eValue.innerHTML = params.value;
    // this.eButton = this.eGui.querySelector("#theButton");
    this.buttonClickListener = this.onButtonClicked.bind(this);
    this.eValue.addEventListener("click", this.buttonClickListener);
}

singleClickEditRenderer.prototype.onButtonClicked = function(event) {
	//var value =this.params.value;
    if(this.params.context.componentParent.setClickValue)
        this.params.context.componentParent.setClickValue(this.params);
    else
        this.params.context.componentParent.$parent.setClickValue(this.params);
//	phyApp.__vue__.setClickValue(this.params.data);
};

singleClickEditRenderer.prototype.createGui = function() {
}

singleClickEditRenderer.prototype.getGui = function(){
	return this.eGui;
}

singleClickEditRenderer.prototype.afterGuiAttached = function(){
}

singleClickEditRenderer.prototype.destroy = function(){
}

singleClickEditRenderer.prototype.isPopup = function(){
	return false;
}

export default singleClickEditRenderer;