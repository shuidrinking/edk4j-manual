/*
the encoding of this js file must be 'utf-8'
decription: provide ajax functions
@author:liuxiaosong
@email: shuidrinking@126.com
@date: 2018-09-18
*/
/**
 * 原生ajax引擎
 */
var Server = Server||{};
Server.getXMLHttpRequest = function(){
	try{
		return new XMLHttpRequest();
	}
	catch(e){
		try {
			return new ActiveXObject("Microsoft.XMLHTTP");
		}
		catch(e){
			return new ActiveXObject("Msxml2.XMLHTTP");
		}
	}
}
let searchRequestDomain="https://search.edk4j.com";
searchRequestDomain="http://120.26.168.13:19999/edk4jsearchdog/";
/**
 * 发起ajax请求
 * @param ajaxRegist mvc.config-1.0.0.js中定义的注册项，ajaxRegister原型：{"someAjaxId":{model:"/someAjaxService",view:"some.html",script:"some.js"}, ...}
 * @param 请求数据的json对象
 * @param 回调函数
 * @param 是否异步 true异步，false同步，默认为true
 * @param headMap 报文头定义的map
 */
Server.doSearch = function(ajaxRegistId, jsonDataObject , callBackFunction, async, headMap){
	if(async==null || async===""){
		async=true;
	}
	var Request = Server.getXMLHttpRequest();
	var header = Request.getAllResponseHeaders();
	
	Request.onerror = function(message){
		if(callBackFunction){
			callBackFunction({"resultCode": "_server::Error", "resultMessage": "访问故障：无法连接到服务器！" });
		}
		else{
			return "访问出错了：" + message;
		}
		return;
	}
	
	//define status change event
	Request.onreadystatechange=function(){
		/*
		 * readyState：
			0	 未发送
			1	 已发送但未发送完
			2	 发送完毕
			3	 开始接收数据但是没有接收完
			4	 接收完数据
		*/
		if(Request.readyState==4){
			/*
			 * status:
				200：请求成功 
				404：没有发现文件、查询或url 
				400~499：客户端问题 
				500 ：服务端问题 
			 */
			if(Request.status!=200){
				let returnCode=Request.status;
				if(returnCode=="0"){
					returnCode = "_server::Error";
				}
				if(callBackFunction){
					callBackFunction({"resultCode": returnCode, "resultMessage": Request.statusText});
				}
				else{
					return Request.statusText;
				}
				return;
			}
			if(callBackFunction){
				var responseData = Request.responseText;
				var responseJsonObject = JSON.parse(responseData);
				if(typeof(responseJsonObject.resultCode)!="undefined" && responseJsonObject.resultCode=="960001"){
					//登录超时
					if(window.opener && typeof(window.opener)!="undefined"){
						if(window.opener.parent && typeof(window.opener.parent)!="undefined"){
							window.opener.parent.location.replace(Server.projectUrl);
						}
						else{
							window.opener.location.replace(Server.projectUrl);
						}
						window.close();
					}
					else if(parent && typeof(parent)!="undefined"){
						parent.location.replace(Server.projectUrl);
					}
				}
				callBackFunction(responseJsonObject);
			}
			else{
				return JSON.parse(Request.responseText);
			}
		}
		//other Request.readyState value do noting
		else{}
	}
	Server.projectUrl = "http://search.edk4j.com:8080/edk4jsearchdog";
	//请求URL后添加随机数，防止获取的是缓存结果
	var requestUrl = searchRequestDomain + ajaxRegister[ajaxRegistId].model;
	if(ajaxRegister[ajaxRegistId].model.indexOf("/")!=0){
		requestUrl = searchRequestDomain + "/" + ajaxRegister[ajaxRegistId].model;
	}
	Request.open("POST", requestUrl+"?t="+Math.random() ,async);
	//设置请求head
	if(headMap && Map.prototype.isPrototypeOf(headMap)){
		//遍历map，设置到head里
		let hasContentType = false;
		for (let[k, v] of theMap) {
			Request.setRequestHeader(k, v);
			if("content-type" == k.toLowerCase()){
				hasContentType = true;
			}
		}
		if(!hasContentType){
			Request.setRequestHeader("Content-type", "application/json");
		}
	}
	else{
		Request.setRequestHeader("Content-type", "application/json");
	}

	if(!jsonDataObject){
		jsonDataObject={};
	}
	if(typeof(window.opener)!="undefined" && window.opener!=null && window.opener!="_self"){
		if(window.opener.parent && typeof(window.opener.parent)!="undefined" && typeof(window.opener.parent.mettingUser)!="undefined"){
			jsonDataObject.requestToken=window.opener.parent.mettingUser.requestToken;
		}
	}
	else if(typeof(parent)!="undefined" && typeof(parent.mettingUser)!="undefined"){
		jsonDataObject.requestToken=parent.mettingUser.requestToken;
	}
	Request.send(JSON.stringify(jsonDataObject));
}
Server.fetchTextContent = async function (url , callbackFunction, callTheCallbackFunctionAtDown=true) {
	if(!callbackFunction){
		callbackFunction=(data)=>{console.log(`Received data :\n${data}`)};
	}
	const response = await fetch(url);
	//response.body instanceof ReadableStream
	const reader = response.body.getReader();
	const decoder = new TextDecoder('UTF-8');
	// 读取数据块
	let chunks = [];
	while (true) {
		const { done, value } = await reader.read();
		if (done) {
			console.debug("Stream finished.");
			break;
		}
		console.debug(`Received ${value.length} bytes`)
		if(callTheCallbackFunctionAtDown){
			chunks.push(decoder.decode(value));
		}
		else{
			callbackFunction(decoder.decode(value));
		}
	}
	if(callTheCallbackFunctionAtDown){
		callbackFunction(chunks.join(""));
	}
}