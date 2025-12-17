var menuMap={}; 
var menuPathKeyedMap={};
Client.context.isMobile=false;
async function init(){
	let _link=document.querySelector("#indexcss");
	let _arrowLink=document.querySelector("#arrowcss");
	Client.context.isMobile = !await isMobile();
	if(Client.context.isMobile){
		_link.href="css/index.m.css";
		_arrowLink.href="css/arrow.m.css";
		document.querySelector("#workAreaDiv").classList.add("workAreaDivMax");
		document.querySelector("#leftDiv").classList.add("menuDivHidden");
		document.querySelector(".arrow").classList.remove("arrow-to-left");
		document.querySelector(".arrow").classList.add("arrow-to-right");
	}
	else{
		_link.href="css/index.css";
		_arrowLink.href="css/arrow.css";
	}
	_link.onload=()=>{
		document.body.style.display="";
	};
	//生成菜单树控件
	var menu = new MenuTree();
	menu.Container = "menuContent";//指定容器
	menu.addNode("0", null, "系统功能", "0");
	for(var p in menuList){
		menuMap[menuList[p].menuCode]=menuList[p];
		menuPathKeyedMap[menuList[p].url]=menuList[p];
		menu.addNode(menuList[p].menuCode, menuList[p].parentMenuCode, menuList[p].showText, menuList[p].menuCode);
	}
	var iframe = $("workAreaFrame");
	iframe.src = "view/welcome.html";
	menu.expandAllFlag=false;//是否在加载时默认展开所有
	menu.URLProxy = "gotoView";
	menu.RootNodeId = "0";//设置跟结点
	menu.generateMenu();//勾画菜单树
}
/**
 * iframe onload事件调整大小
 */
function reSize(){
	
}
/**
 * 点击菜单后在iframe中加载目标页面
 * @returns
 */
function gotoView(menuCode, _element){
	if(Client.context.isMobile){
		toggleMenu();
	}
	var url=null;
	if(menuMap[menuCode]){
		url=menuMap[menuCode].url;
	}
	else{
		return;
	}
	
	let _oldelement = document.querySelector(".activeMenu");
	if(_oldelement){
		_oldelement.classList.remove("activeMenu");
	}
	_element.className="activeMenu";
	
	//document.workAreaFrame这种写法，你必须把iframe放到form里
	var iframe = $("workAreaFrame");
	iframe.src=url;
}
/**
 * 设置菜单显示状态
 * @returns
 */
function toggleMenu(){
	let _arrow=document.querySelector(".arrow");
	if(_arrow.classList.contains("arrow-to-left")){
		_arrow.classList.replace("arrow-to-left", "arrow-to-right");
		$("leftDiv").classList.add("menuDivHidden");
		if(!Client.context.isMobile){
			$("workAreaDiv").classList.add("workAreaDivMax");
		}
		$("menuToggleDiv").classList.remove("showMenuIcon");
	}
	else{
		_arrow.classList.replace("arrow-to-right", "arrow-to-left");
		$("leftDiv").classList.remove("menuDivHidden");
		if(!Client.context.isMobile){
			$("workAreaDiv").classList.remove("workAreaDivMax");
		}
		$("menuToggleDiv").classList.add("showMenuIcon")
	}
}

/**
 * 指定URL后在iframe中加载目标页面
 * @returns
 */
function changeWorkAreaTarget(destUrl){
	var iframe = $("workAreaFrame");
	iframe.location.replace(destUrl);
}
