/*
the encoding of this js file must be 'utf-8'
decription: provide dom element operate functions
@author:liuxiaosong
@email: shuidrinking@126.com
@date: 2018-09-18
*/
!function(){
	if(typeof(Worker) == "undefined"){
		writeWarn("您的浏览器版本过低，请使用edge、chrome、firefox等浏览器！");
		return;
	}
}();

/*
 * 服务器定义
 */
var Server = Server||{};
Server.pageUrl = window.location.href;// 当前页面URL // http://url:port/project/somePage.html
Server.pathName = window.location.pathname;// 主机之后的目录 project/somePage.html
Server.serverHostUrl = window.location.origin;// 服务器域名 http://url:port 还有一种方法Server.pageUrl.substring(0,Server.pageUrl.indexOf(Server.pathName));
Server.projectName =Server.pathName.substring(1, Server.pathName.indexOf("/", 1));// 项目名称 project
Server.projectUrl = Server.serverHostUrl + "/" + Server.projectName;//服务器域名+项目名称  http://url:port/project
Server.context = Server.context || {};//服务器返回数据缓存到网页
Server.sessionData = Server.sessionData || {};//session数据

var Client = Client||{};//客户端浏览器
Client.context = Client.context || {};//网页数据容器
var ScreenRelativeScale=1;//屏幕显示缩放的比例
/*!function(baseFontSize) {
	以匿名的方式调用；
}();*/

document.ready = function (callback) {
	///兼容FF,Google
	if (document.addEventListener) {
		document.addEventListener('DOMContentLoaded', function () {
			document.removeEventListener('DOMContentLoaded', arguments.callee, false);
			callback();
		}, false)
	}
	 //兼容IE
	else if (document.attachEvent) {
		document.attachEvent('onreadystatechange', function () {
			if (document.readyState == "complete") {
					document.detachEvent("onreadystatechange", arguments.callee);
					callback();
			}
		})
	}
	else if (document.lastChild == document.body) {
		callback();
	}
}

/**
 * 判断是否移动端
 * 调用必须使用 await isMobile()，否则获取的是一个Promise
 * 被async修饰的函数必须使用await调用，否则获取到的永远是一个Promise
 */
async function isMobile(){
	if (navigator.userAgentData) {
		const result = await navigator.userAgentData.getHighEntropyValues(["architecture","bitness","formFactor","fullVersionList","model","platformVersion","uaFullVersion","wow64"])
			.then(ua => {
				return ua.mobile;
			});
		return result;
	}
	else{
		const userAgent = navigator.userAgent || navigator.vendor || window.opera;
		const isUserAgentMobile = /android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase());
		const isMediaQueryMobile = window.matchMedia("only screen and (max-width: 760px)").matches;
		const canToutch = 'ontouchstart' in document.documentElement; //这个并不标准，有pc设备浏览器也支持拖拽
		return isUserAgentMobile || isMediaQueryMobile || canToutch;
	}
}

function writeWarn(message){
	if(!message){
		message = "stop render, but no message !"
	}
	//知识内容结构丰富，建议您在PC浏览器中阅读！
	//您的浏览器不支持html5，请使用高版本的浏览器！
	return`<div style="text-align: center;display: flex;align-items: center;height: 100%;width: 100%;justify-content: center;font-weight:bold;color:#0049a4;font-size:20px;">
	${message}
	</div>`;
}
(async () => {
	const mobile = await isMobile();
	if(mobile){
		document.documentElement.style.setProperty('--title-div-align', 'center');
		document.documentElement.style.setProperty('--title-div-fontsize', '0.6rem');
		document.documentElement.style.setProperty('--title-div-height', '0.6rem');
		document.documentElement.style.setProperty('--content-line-height', '0.5rem');
	}
})();

/* 
 * 浏览器缩放，整页内容按比例也缩放
 * 将本函数抽取出来，不以匿名函数方式执行，原因是：可以在页面上提供 +-按钮，点击时调用本函数，让客户自定义显示大小
 */
function resetFontSize(increment){
	if(!increment){
		increment=0;
	}
	if(sessionStorage.getItem("baseFontSize")==null){
		sessionStorage.setItem("baseFontSize", 100);
	}
	var ajustBaseFontSize = sessionStorage.getItem("baseFontSize");
	ajustBaseFontSize = parseInt(ajustBaseFontSize, 10) + increment;
	sessionStorage.setItem("baseFontSize", ajustBaseFontSize);
	
	//var baseScreenWidth=window.screen.availWidth;//1920;
	//var screenWidth=window.screen.availWidth;
	//baseScreenWidth=baseScreenWidth*(screenWidth/baseScreenWidth);
	
	if (!document.addEventListener){
		return;
	}
	var documentElement = document.documentElement;
	//var resizeTimeout;
	var reSizeEvent = typeof window.onorientationchange === "object" ? "orientationchange" : "resize";
	var resetBaseFontSize = function() {
		var clientWidth = document.documentElement.clientWidth;
		if(!clientWidth){
			return;
		}
		if (clientWidth > 10000) {
			clientWidth = 10000;
		}
		
		//默认baseScreenWidth就是屏幕宽度
		/*let baseScreenWidth = window.screen.availWidth;
		//屏幕宽度太窄，或者把页面缩放到太窄，将按750算宽度
		if(baseScreenWidth<=1080 || clientWidth<=1080){
			baseScreenWidth = 750;
		}*/
		var baseFontSize = 100;
		if(sessionStorage.getItem("baseFontSize")){
			baseFontSize=sessionStorage.getItem("baseFontSize");
		}
		var baseScreenWidth=1620;
		var screenWidth=window.screen.availWidth;
		
		var newFontSize = baseFontSize * (clientWidth / baseScreenWidth);
		documentElement.style.fontSize = newFontSize + "px";
		
		//console.info(`baseScreenWidth=${baseScreenWidth}, screenWidth=${screenWidth}, newFontSize=${newFontSize}`)
	};
	resetBaseFontSize();
	window.addEventListener(reSizeEvent, resetBaseFontSize, false);
}
resetFontSize(0);
/**
 * 根据id或者name获取元素,如果传入的是name则获取的是数组
 * @param ele
 * @returns
 */
function $(eleKey) {
	var ele=null;
	if (typeof(eleKey) == 'string'){
		ele = document.getElementById(eleKey);
		if(!ele){
			var t = document.getElementsByName(eleKey);
			if(t && t.length>0){
				return t;
			}
			else{
				t = document.getElementsByTagName(eleKey);
				if(t && t.length>0){
					return t;
				}
				else{
					return null;
				}
			}
		}
		else{
			return ele;
		}
	}
	return eleKey;
}
/**
 * 根据像素值计算rem值
 * @param pxValue
 * @returns
 */
Client.calcRemValue=function(pxValue){
	if(!pxValue){
		return 0 ;
	}
	return pxValue * 0.01;
}
/**
 * 卷去高度
 */
Client.getScrollTop = function() {
	var scrollTop = 0, bodyScrollTop = 0, documentScrollTop = 0;
	if (document.body) {
		bodyScrollTop = document.body.scrollTop;
	}
	if (document.documentElement) {
		documentScrollTop = document.documentElement.scrollTop;
	}
	scrollTop = (bodyScrollTop - documentScrollTop > 0) ? bodyScrollTop : documentScrollTop;   
	return scrollTop;
};

/**
 * 可视窗口高度
 */
Client.getClientHeight = function() {
	var windowHeight = 0;
	if (document.compatMode == "CSS1Compat") {
		windowHeight = document.documentElement.clientHeight;
	}
	else {
		windowHeight = document.body.clientHeight;
	}
	return windowHeight;
};

/**
 * 文档的全部高度
 */
Client.getScrollHeight = function() {
	var scrollHeight = 0, bodyScrollHeight = 0, documentScrollHeight = 0;
	if (document.body) {
		bodyScrollHeight = document.body.scrollHeight;
	}
	if (document.documentElement) {
		documentScrollHeight = document.documentElement.scrollHeight;
	}
	scrollHeight = (bodyScrollHeight - documentScrollHeight > 0) ? bodyScrollHeight : documentScrollHeight;
	return scrollHeight;
};

/**
 * 是否滚动到了底部
 */
Client.isScrolledToBottom = function(){
	if(Client.getScrollHeight() == Client.getClientHeight() + Client.getScrollTop()){
		return true;
	}
	return false;
};

/**
 * 删除页面元素
 * @param element 页面元素的句柄
 */
Client.remove = function(element) {
	if(element){
		element.parentNode.removeChild(element);
	}
}
/**
 * 窗口滚动到指定的元素位置，类似页面上的<a href="#id">
 */
Client.windowScrollTo = function(elementOrId, _containner=window) {
	if(!elementOrId){
		return;
	}
	let element = null;
	if(typeof(elementOrId)==="string"){
		element = document.getElementById(elementOrId);
		if(!element){
			return;
		}
	}
	else if(elementOrId instanceof HTMLElement){
		element = elementOrId;
	}
	else{
		return;
	}
	let x = element.x ? element.x : element.offsetLeft;
	let y = element.y ? element.y : element.offsetTop;
	if(y>50){
		y -=50;
	}
	_containner.scrollTo({left: x, top: y, behavior: "smooth"});
}
/**
 * 拖动某元素
 * 用法：<xxx onmousedown="Client.drag(document.querySelector('#elementId'));">
 * @param element 页面元素句柄
 */
Client.drag=function(element){
	var event = window.event;
	var oldLeft=element.offsetLeft;
	var oldTop=element.offsetTop;
	var mouseXStart= event.clientX;
	var mouseYStart= event.clientY;
	if(!element){
		return; 
	}
	if(element.setCapture){
		element.setCapture();
	}
	else{
		window.captureEvents(event.MOUSEMOVE);
	}
	document.onmousemove=function(evt){
		evt=evt||window.event;
		element.style.left=(oldLeft+evt.clientX-mouseXStart)+"px";
		element.style.top=(oldTop+evt.clientY-mouseYStart)+"px";
	}
	document.onmouseup=function(env){
		if(element.releaseCapture){
			element.releaseCapture();
		}
		else{
			window.captureEvents(event.MOUSEMOVE|event.MOUSEUP);
		}
		document.onmousemove=null;
		document.onmouseup=null;
	}
	return false;
}
/**
 * 根据盒模型，获取页面的body
 */
Client.getBrowsertruebody=function (){
	if(document.compatMode == "CSS1Compat"){
		return document.documentElement;
	}
	return document.body;
};

/**
 * 监听滚动事件，需要的网页里抄下面一段就好了
 */
/*window.onscroll = function () {
	//文档高度=可见高度+卷去高度，此时滑动到底部了
	if(getScrollHeight() == getClientHeight() + getScrollTop()){
		alert("滚动到底部了");
	}
}*/
/**
 * 遮罩组件
 * 打开 sdMasker.progress.show();
 * 关闭 sdMasker.progress.hidden();
 * @author liuxiaosong
 * @version 201701
 */
var sdMasker = {};
sdMasker.transferFlag = false;
sdMasker.showDoingMasker = function() {
	transferFlag = true;
	sdMasker.progress.show()
};
sdMasker.showDownMasker = function() {
	transferFlag = false;
	sdMasker.progress.hidden()
};
sdMasker.progress = {};
/*
下面代码段是支持CSS3的浏览器中使用，使用的是渐变动画
*/
sdMasker.progress.init = function() {
	var loading = document.createElement("div");
	loading.setAttribute("id", "pageLoadingDiv");
	document.body.appendChild(loading);
	var loadingImgDiv = document.createElement("div");
	document.body.appendChild(loadingImgDiv);
	loadingImgDiv.style.display = "none";
	loadingImgDiv.innerHTML = "<div class='loadingImgCirclediv'></div>";
	loadingImgDiv.className = "loadingImg";
	loadingImgDiv.setAttribute("id", "loadingImgDiv");
};
/*下面方法是所有浏览器中使用，使用的是gif动图
sdMasker.progress.init = function() {
	var loading = document.createElement("div");
	loading.setAttribute("id", "pageLoadingDiv");
	document.body.appendChild(loading);
	var loadingImgDiv = document.createElement("div");
	document.body.appendChild(loadingImgDiv);
	loadingImgDiv.style.display = "none";
	loadingImgDiv.innerHTML = "<div style='border:0;margin:0;padding:0;width:0.7rem;height:0.7rem;'></div>";
	loadingImgDiv.className = "loadingImgStatic";
	loadingImgDiv.setAttribute("id", "loadingImgDiv");
};
*/
sdMasker.progress.show = function() {
	if (!document.querySelector("#pageLoadingDiv")) {
		sdMasker.progress.init()
	}
	document.querySelector("#pageLoadingDiv").className = "loading";
	document.querySelector("#loadingImgDiv").style.display = "block"
};
sdMasker.progress.hidden = function() {
	if (!document.querySelector("#pageLoadingDiv")) {
		sdMasker.progress.init()
	}
	document.querySelector("#pageLoadingDiv").className = "hidden";
	document.querySelector("#loadingImgDiv").style.display = "none"
};
sdMasker.addMaskerDiv = function() {
	var maskerDiv = document.createElement("div");
	maskerDiv.setAttribute("id", "maskerDiv");
	document.body.appendChild(maskerDiv);
	maskerDiv.className = "maskerDiv"
};

/**
 * 只显示半透明遮罩，不显示进度条
 */
sdMasker.showMasker = function(){
	if (!document.querySelector("#maskerDiv")) {
		sdMasker.addMaskerDiv();
	}
	document.querySelector("#maskerDiv").style.display="";
};
sdMasker.hideMasker = function(){
	if (!document.querySelector("#maskerDiv")) {
		sdMasker.addMaskerDiv();
	}
	document.querySelector("#maskerDiv").style.display="none";
};

/**
 * 遮罩组件2
 */
sdMasker.loading = {};
sdMasker.loading.init = function() {
	if (!document.querySelector("#pageLoadingDiv")) {
		var loading = document.createElement("div");
		loading.setAttribute("id", "pageLoadingDiv");
		document.body.appendChild(loading);
	}
	
	var loadingImgDiv = document.createElement("div");
	loadingImgDiv.style.display = "none";
	loadingImgDiv.className = "loadingStatic";
	loadingImgDiv.setAttribute("id", "loadingImgDiv2");
	loadingImgDiv.innerHTML="<span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span>";
	document.body.appendChild(loadingImgDiv);
};
sdMasker.loading.show = function() {
	if (!document.querySelector("#loadingImgDiv2")) {
		sdMasker.loading.init()
	}
	document.querySelector("#pageLoadingDiv").className = "loading";
	document.querySelector("#loadingImgDiv2").style.display="block";
};
sdMasker.loading.hidden = function() {
	if (!document.querySelector("#loadingImgDiv2")) {
		sdMasker.loading.init()
	}
	document.querySelector("#pageLoadingDiv").className = "hidden";
	document.querySelector("#loadingImgDiv2").style.display="none";
};
/**
 * 屏蔽默认的alert，以Dialog组件替代
 * 要调用原始的alert时这样写：_alert(args)
 */
(function(window,undefined){
	window._alert=window.alert;
	window.alert=function(content,callbackFunction,focusId,showTitle){
		try{
			if(parent && parent.Dialog){
				parent.Dialog.alert(content,callbackFunction,focusId,showTitle);
			}
			else{
				Dialog.alert(content,callbackFunction,focusId,showTitle);
			}
		}
		catch(e){
			window._alert(content);
		}
	}
})(window);


/**
 * 更改被点击的tr的背景色，如果参数中未指定新颜色，则默认使用淡橙色
 * dom.css中有同等效果的table专用的样式table-highlight-active-tr二者区别：
 * （1）纯css使用时需要为table中所有的td设置tabindex="-1"属性
 * （2）纯css局限于tr获得焦点，一旦点击其他地方则效果消失
 * （3）本方法实现高亮后不会因为鼠标点了事发行所属table外的地方而消失效果
 * （4）本方法能够提供对多表格区分高亮着色互不干扰的支持
 */
var sdTabel={};
sdTabel._actorMap=new Map(); //原型{_oldTr : 上次点击的tr, oldBgColor: 上次点击的tr的原背景色}
sdTabel.autoId=1;
sdTabel.changeTrBgcolor = function (_tr, highlightColor){
	if(!_tr){
		return;
	}
	
	/**如果tr的parentNode没有id时，自动为其设置id */
	let _parentNode = _tr.parentNode;
	if(!_parentNode.getAttribute("id")){
		_parentNode.setAttribute("id", "sdtabel-autoid-" + (sdTabel.autoId++));
	}
	
	let actorId=_parentNode.getAttribute("id");
	let _oneActor=null;
	
	//恢复同一个table里的上次变过底色的tr
	if(sdTabel._actorMap.has(actorId)){
		_oneActor = sdTabel._actorMap.get(actorId);
		//恢复上一次点击过的tr的背景色
		_oneActor._oldTr.style.backgroundColor = _oneActor.oldBgColor;
	}
	else{
		_oneActor={};
	}
	
	_oneActor.oldBgColor=_tr.style.backgroundColor;
	_oneActor._oldTr = _tr;
	//如果有指定新颜色，则使用，否则使用默认色
	if(highlightColor){
		_tr.style.backgroundColor=highlightColor;
	}
	else{
		_tr.style.backgroundColor="#fff0c8";
	}
	
	//更新“上一次点击的tr”
	sdTabel._actorMap.set(actorId , _oneActor);
}
/**
 * 关闭页面
 */
function closeWindow() {
	if(window.opener!=null){
		window.close();
	}
	else{
		try {
			window.open("", "_self", "");
			window.close();
		}
		catch (ex) {
			//console.error("无法关闭页面！");
			alert("无法关闭页面！");
		}
	}
}
/**
 * 检查浏览器是否支持HTML5
 */
!function(){ 
	if(typeof(Worker) == "undefined"){
		setTimeout(
			function(){document.body.innerHTML="<BR><BR>　　对不起！您的浏览器版本过低，请使用IE9及以上的版本的IE浏览器，或者使用chrome、firefox等浏览器！"},
			100);
		return false;
	};
	return true;
}();

/**
 * 获取url参数，返回一个对象，参数提取后作为对象的属性
 * @returns {key1:value1, key2:value2 ...}
 */
function getQueryParams(){
	var urlParamStr=document.location.search.substring(1);
	if(urlParamStr.indexOf("#")>0){
		urlParamStr=urlParamStr.substring(0,urlParamStr.indexOf("#"));
	}
	var urlParams=urlParamStr.split("&");
	var queryParamMap={};
	for(var i=0;i<urlParams.length;i++){
		var values=urlParams[i].split("=");
		queryParamMap[values[0]]=decodeURIComponent(values[1]);
	}
	return queryParamMap;
}

/**
 * 获取url参数，返回URLSearchParams类型的map
 * @returns URLSearchParams
 */
function getUrlSearchParams(){
	let url = new URL(document.location.href);
	return url.searchParams;
}

/**
 * 复制元素内的文本
 * @param elementId
 * @returns
 */
function doCopyText(elementId) {
	var _ele = document.getElementById(elementId);
	if(!_ele){
		return;
	}
	if (document.body.createTextRange) {
		var range = document.body.createTextRange();
		range.moveToElementText(_ele);
		range.select();
	}
	else if (window.getSelection) {
		var selection = window.getSelection();
		var range = document.createRange();
		range.selectNodeContents(_ele);
		selection.removeAllRanges();
		selection.addRange(range);
	}
	else{
		//无法复制
		return;
	}
	/*
	document.execCommand不是标准函数，已经被废弃
	document.execCommand('Copy');
	alert('复制成功');
	*/
	navigator.clipboard.writeText(_ele.textContent).then(()=>{
		alert('复制成功');
	},
	()=>{
		alert('复制失败');
	},
	);
}

/**
 * 禁用按键
 * @param 事件发生对象
 * @returns
 */
function forbidSpecialKeys(e) {  
	var ev = e || window.event; //获取event对象  
	var obj = ev.target || ev.srcElement; //获取事件源  
	var t = obj.tagName.toLowerCase(); //获取输入元素事件源类型  
	//禁止F5
	/*if(ev.keyCode == 116){
		ev.keyCode=0;
		ev.cancelBubble=true;
		return false;
	}
	//禁止F11
	else if(ev.keyCode == 122){
		ev.keyCode=0;
		ev.returnValue=false;
		return false;
	}*/
	//禁止ctrl+n
	if(ev.ctrlKey && ev.keyCode == 78){
		ev.keyCode=0;
		ev.returnValue=false;
		return false;
	}
	//禁止shift+F10
	else if(ev.shiftKey && ev.keyCode == 121){
		ev.keyCode=0;
		ev.returnValue=false;
		return false;
	}
	//禁止shift再点链接新开窗口
	else if(obj.tagName.toLowerCase()=="a" && ev.shiftKey ){
		ev.keyCode=0;
		ev.returnValue=false;
		return false;
	}
	//禁止ctrl+R
	else if (ev.ctrlKey && ev.keyCode == 82){
		ev.keyCode=0;
		ev.returnValue=false;
		return false;
	}
	//禁止alt+方向键
	else if (ev.altKey && (ev.keyCode == 37 || ev.keyCode == 39)){
		ev.keyCode=0;
		ev.returnValue=false;
		return false;
	}
	
	//获取作为判断条件的事件类型  
	var vReadOnly = obj.readOnly;  
	var vDisabled = obj.disabled;  
	//处理undefined值情况  
	vReadOnly = (vReadOnly == undefined) ? false : vReadOnly;  
	vDisabled = (vDisabled == undefined) ? true : vDisabled;  
	//当敲Backspace键时，事件源类型为密码或单行、多行文本的，  
	//并且readOnly属性为true或disabled属性为true的，则退格键失效  
	var flag1 = ev.keyCode == 8 && (t == "input" || t == "textarea") && (vReadOnly == true || vDisabled == true);  
	//当敲Backspace键时，事件源类型非密码或单行、多行文本的，则退格键失效  
	var flag2 = ev.keyCode == 8 && t != "input" && t != "textarea";  
	//判断  
	if (flag2 || flag1) return false;  
}

//禁止后退键 作用于Firefox、Opera  
document.onkeypress = forbidSpecialKeys;
//禁止后退键  作用于IE、Chrome  
document.onkeydown = forbidSpecialKeys;
/**
 * 获取打开页面的属性的字符串，即：使用window.open函数的第三个参数，通过本函数获得
 * window.open("../2/2.2.html", null, theproperty);
 * @returns
 */
function getWindowOpenFeature(top, left){
	var printtop = top;
	var printleft = left;
	var width = screen.width - 2*top;
	var height = screen.height - 2*left;
	var theproperty = 'width='+width+',height='+height+',center=yes,help=no,status=no,scrollbars=yes,resizable=no,left='+ printleft + ',top="' + printtop + ',screenx=' + printleft + ',screeny=' + printtop;
	return theproperty;
}