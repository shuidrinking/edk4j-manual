function MenuTree(){this.Container="MenuContainer",MenuTree._TempBranch=null,this.expandAllFlag=!0,this.RootNodeId="00",this.Nodes=[],this.NodeStack=[],this.NodesCount=0,this.rootFlag=!0,this.URLProxy=null,this.showRootFlag=!1,MenuTree.prototype.addNode=function(e,t,o,s){var i={};i.ID=e,i.PID=t,i.TEXT=o,i.URL=s,i.EF=!1,this.Nodes.push(i),this.NodesCount++},MenuTree.prototype.generateRoot=function(){var e=document.createElement("div");if(e.setAttribute("expand","1"),e.setAttribute("id",this.RootNodeId),this.showRootFlag){for(var t=document.createElement("div"),o=document.createElement("ul"),s=0;s<this.NodesCount;s++)if(this.Nodes[s].ID==this.RootNodeId){e.setAttribute("id",this.Nodes[s].ID),e.innerHTML="<div class='treeControlOpenFolder'></div><a href=javascript:MenuTree.ShowHide('"+this.RootNodeId+"');>"+this.Nodes[s].TEXT+"</a>";break}t.appendChild(e)}document.getElementById(this.Container).appendChild(e),0<this.NodesCount&&this.Nodes.reverse();for(s=0;s<this.NodesCount;s++)this.Nodes[s].PID==this.RootNodeId&&this.NodeStack.push(this.Nodes[s]);o=document.createElement("ul");this.showRootFlag||(o.className="treeControlFirstUl"),e.appendChild(o),this.rootFlag=!0},MenuTree.prototype.generateTree=function(){if(this.rootFlag)for(;null!=this.NodeStack[0];){var e=this.NodeStack.pop(),t=document.createElement("li");t.setAttribute("id",e.ID),t.innerHTML="<div class='treeControlItem'></div><a onclick=\""+this.URLProxy+"('"+e.URL+"', this);\">"+e.TEXT+"</a>",e.PID!=this.RootNodeId||this.showRootFlag||(t.className="treeControlFirstLi");for(var o=0;o<this.NodesCount;o++)if(e.ID==this.Nodes[o].PID){e.EF=!0;break}if(e.EF){for(var s=0;s<this.NodesCount;s++)this.Nodes[s].PID==e.ID&&this.NodeStack.push(this.Nodes[s]);var i=document.createElement("ul"),n="treeControlCloseFolder";this.expandAllFlag&&(n="treeControlOpenFolder"),t.innerHTML="<div class='"+n+"'></div><a href=\"javascript:MenuTree.ShowHide('"+e.ID+"');\">"+e.TEXT+"</a>",t.appendChild(i),this.expandAllFlag?(t.setAttribute("expand","1"),i.style.display="block"):(t.setAttribute("expand","0"),i.style.display="none")}document.getElementById(e.PID).lastChild.appendChild(t)}else alert("MenuTree.generateTree()error：root is not exist !")},MenuTree.prototype.generateMenu=function(){if(null!=this.URLProxy){var e=document.getElementById(this.Container).className;document.getElementById(this.Container).className=void 0!==e&&e?e+" treeControl":"treeControl",this.generateRoot(),this.generateTree()}else alert("URLProxy is not defined")},MenuTree.ShowHide=function(e){var t=document.getElementById(e),o=t.childNodes;"1"==t.getAttribute("expand")?(o[0].className="treeControlCloseFolder",t.lastChild.style.display="none",t.setAttribute("expand","0")):(o[0].className="treeControlOpenFolder",t.lastChild.style.display="block",t.setAttribute("expand","1"))}}