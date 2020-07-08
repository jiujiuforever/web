//状态栏
function statusBarComponents(){}

statusBarComponents.prototype.init = function(params){
	this.params = params;
	this.visible = true;
    this.eGui = document.createElement('div');
    this.eGui.setAttribute("style",
        'display: flex; justify-content: center; flex-direction: column;margin: 5px;' +
        'background-color: lightgrey; padding-left: 5px; padding-right: 5px; border-radius: 5px'
    );

    var content = document.createElement('div');
    var span = document.createElement('span');
    span.innerText = '余额：';
    content.appendChild(span);

    this.eGui.appendChild(content);
}

statusBarComponents.prototype.getGui = function () {
    return this.eGui;
};

statusBarComponents.prototype.createGui = function () {
    return this.eGui;
};

statusBarComponents.prototype.isPopup = function () {
    return false;
};

statusBarComponents.prototype.destroy = function () {
};

statusBarComponents.prototype.afterGuiAttached = function () {
};


export default statusBarComponents;