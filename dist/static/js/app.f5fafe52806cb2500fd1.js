webpackJsonp([1],{0:function(t,e){},1:function(t,e){},NHnr:function(t,e,n){"use strict";Object.defineProperty(e,"__esModule",{value:!0});var i=n("7+uW"),s=n("NYxO");i.a.use(s.a);var a={name:"App",store:new s.a.Store({state:{count:0},mutations:{increment:function(t){t.count+=1}},actions:{increment:function(t){t.commit("increment")}},getters:{getCount:function(t){return t.count}}}),methods:{}},o={render:function(){var t=this.$createElement,e=this._self._c||t;return e("div",{attrs:{id:"app"}},[e("router-view")],1)},staticRenderFns:[]};var r=n("VU/8")(a,o,!1,function(t){n("YWXz")},null,null).exports,l=n("/ocq"),c=n("Xxa5"),u=n.n(c),d=n("exGp"),m=n.n(d),f=n("//Fk"),v=n.n(f),p=n("vwbq"),g=n("7t+N"),x=n("gApy"),h=n.n(x),C=n("lFpG"),y=n.n(C),D=n("Zzkc"),_=n("M4fF"),N=n.n(_),w=n("m2OQ"),b=n.n(w),k=n("6tGF"),R=n.n(k);n("OUwY");var E=p.g().domain([-1,0,1]).range([p.f("#E53935"),p.f("#fff"),p.f("#1E88E5")]),S=p.g().domain([0,1]).interpolate(p.d).range([p.f("#007AFF"),p.f("#ffe011")]),F=p.e().x(function(t){return t.x}).y(function(t){return t.y}).curve(p.a);function A(t,e){var n=t/180*Math.PI;return{x:Math.cos(n)*e,y:Math.sin(n)*e}}function M(t){return 180*Math.atan2(t.y-0,t.x-0)/Math.PI}function T(t){return new v.a(function(e){setTimeout(function(){e()},t)})}var I=p.e().x(function(t){return t.x}).y(function(t){return t.y}),z={name:"radvis",components:{picker:D.Compact},data:function(){return{fillRadvis:!1,nodeRadius:5,nodeOpacity:50,clusters:[],makeClusterCount:2,isUseA:!1,dimensionFontSize:12,positions:{radvisCenterX:590,radvisCenterY:540},color:{start:{hex:"#007AFF"},end:{hex:"#FFF500"}},colorDimension:"",raw:[],dimensions:[{text:"A",x:0,y:15}],nodes:[],rc:{x:0},x:10,selectDimension:{}}},computed:{getRadvisCenterTransform:function(){return"translate("+this.positions.radvisCenterX+","+this.positions.radvisCenterY+")"},isSelectedDimension:function(){return!N.a.isEmpty(this.selectDimension)},getNodeDistributionGraph:function(){return N.a.isEmpty(this.selectDimension)?0:(this.renderNodeDistribution(),this.selectDimension.distribution.length)},getLineData:function(){var t=this.raw,e=p.g().domain([0,t.length]).interpolate(p.d).range([p.f(this.color.start),p.f(this.color.end)]),n=this.dimensions,i=N.a.filter(n,function(t){return t.usage});return N.a.chain(t).map(function(t,n){return{coord:N.a.map(i,function(e,n){var s=e.getRatio(t[e.text]);return{x:1100/(i.length-1)*n,y:220*s}}),color:e(n)}}).value()}},methods:{colorDimensionCluster:function(t,e){return S(t/e)},getCorrelationColor:function(t){return E(t)},changeDimensionUsage:function(t){t.usage=!t.usage,this.updateNodes()},getDimensionGroupAngle:function(t){return"rotate("+(t+90)+")"},getDimensionTextTransform:function(t){return"translate(0,-30) rotate("+(t<0||t>180?0:180)+")"},getDimensionTextTransformReverse:function(t){return"translate(0,-30) rotate("+(t<0||t>180?180:0)+")"},getDimensionTextVisible:function(t){return t<0||t>180?0:1},onFillRadvis:function(){this.updateNodes()},lining:function(t){return I(t)},doClusterDimension:function(){var t=N.a.filter(this.dimensions,function(t){return t.usage}),e=N.a.filter(this.dimensions,function(t){return!t.usage}),n=N.a.isNil(this.makeClusterCount)?Math.floor(Math.sqrt(t.length)):this.makeClusterCount;R.a.k(n),R.a.iterations(100);var i=N.a.map(t,function(t){return N.a.map(t.correlation,function(t){return t})}),s=N.a.map(t,function(t){return{name:t.name,vals:N.a.map(t.correlation,function(t){return t})}});R.a.data(i),this.clusters=N.a.map(R.a.clusters(),function(t){var e=N.a.map(t.points,function(t){return N.a.find(s,function(e){return N.a.isEqual(e.vals,t)}).name});return{centroid:t.centroid,dimensions:e}});var a=[],o=180/this.clusters.length,r=180/this.dimensions.length,l=0;N.a.map(this.clusters,function(e){N.a.forEach(e.dimensions,function(e){l+=.5*r;var n=N.a.find(t,function(t){return t.name===e});a.push(n);var i=A(l,400);n.x=i.x,n.y=i.y,n.angle=l,l+=.5*r}),l+=o}),N.a.forEach(e,function(t){return a.push(t)}),this.updateNodes(),this.dimensions=a},setColorDimensionCurrentDimension:function(){this.colorDimension=this.selectDimension,this.updateNodes()},setSelectDimension:function(t){N.a.isNil(t)||(this.selectDimension=this.getDimensionByName(t),this.setColorDimensionCurrentDimension(),this.renderNodeDistribution())},makeNodeData:function(){var t=this,e=this.raw;N.a.isEmpty(this.colorDimension)&&(this.colorDimension=this.dimensions[0]);var n=p.g().domain([this.colorDimension.min,this.colorDimension.max]).interpolate(p.d).range([p.f(this.color.start.hex),p.f(this.color.end.hex)]),i=this.dimensions,s=N.a.filter(i,function(t){return t.usage}),a=N.a.chain(e).map(function(e,i){var a=N.a.map(s,function(t){var n=t.getRatioByApplier(e[t.text]);return{x:t.x*n,y:t.y*n}}),o=N.a.sumBy(a,function(t){return t.x})/s.length,r=N.a.sumBy(a,function(t){return t.y})/s.length;return{cx:o,cy:r,dist:Math.sqrt(o*o+r*r),fill:n(e[t.colorDimension.text]),dataIndex:i}}).filter(function(t){return!N.a.isNaN(t.cx)||!N.a.isNaN(t.cy)}).value();if(N.a.isEmpty(a))return[];if(this.fillRadvis){var o=350/N.a.maxBy(a,function(t){return t.dist}).dist;N.a.forEach(a,function(t){t.cx*=o,t.cy*=o})}return a},updateNodes:function(){this.nodes=this.makeNodeData()},getDimensionData:function(t){return N.a.find(this.dimensions,function(e){return e.uid===t})},getActiveDimensionSize:function(){return N.a.filter(this.dimensions,function(t){return t.usage}).length},getDimensionByName:function(t){return N.a.find(this.dimensions,function(e){return e.name===t})},initDimensions:function(){var t=this.raw,e=N.a.keys(t[0]),n=N.a.chain(e).map(function(e,n){var i={type:Number,usage:!0};if(N.a.forEach(t,function(t){N.a.isNaN(1*t[e])&&(i.type=String,i.usage=!1)}),i.type!==Number)return null;var s=N.a.map(t,function(t){return 1*t[e]});i.min=N.a.minBy(s),i.values=s,i.max=N.a.maxBy(s),i.sigma=(a=s,o=N.a.map(a,function(t){return 1*t}),r=N.a.sum(o)/o.length,Math.sqrt(N.a.sum(N.a.map(o,function(t){return(t-r)*(t-r)/o.length})))),i.mean=N.a.sum(s)/s.length,i.text=e,i.name=e,i.x=0,i.y=0,i.calcurate="Normal",i.getRatio=function(t){return(t-i.min)/(i.max-i.min)},i.getRatio2=function(t){return t/i.max},i.getNormalizeValue=function(t){return i.getRatio2(t)},i.uid=h()(),i.selected=!1;var a,o,r,l=[],c=[],u=N.a.chain(s).countBy(function(t){return t}).size().value();u>=10&&(u=10);for(var d=(i.max-i.min)/u,m=d/2,f=0;f<=u;f+=1){var v=(i.min+d*f+m).toFixed(2);l[f]={key:v,count:0},c[f]={min:i.min+d*f,max:i.min+d*(f+1),mean:1*v,power:f*(10/u),index:f}}return N.a.forEach(s,function(t){var e=Math.floor((t-i.min)/d);l[e].count+=1}),i.distribution=l,i.powerApplier=c,i.getRatioByApplier=function(t){var e=N.a.find(c,function(e){return t>=e.min&&t<=e.max});if(0===e.index||e.index===u)return.1*e.power;var n=void 0,i=void 0,s=Math.abs((t-e.mean)/d);return t<e.min?(n=e.power,i=c[e.index-1].power):(n=e.power,i=c[e.index+1].power),.1*(n*(1-s)+i*s)},i}).filter(function(t){return null!==t}).value();N.a.forEach(n,function(t){var e={};N.a.forEach(n,function(n){var i=b()(t.values,n.values);e[n.name]=i[0][1]}),t.correlation=e}),N.a.forEach(n,function(t,e){var i=e/n.length*360,s=A(i,400);t.x=s.x,t.y=s.y,t.angle=i}),this.dimensions=n,this.makeClusterCount=Math.floor(Math.sqrt(n.length)),this.selectDimension=n[0]},onSelectFileButton:function(){var t=this,e=g("#fileInput");e.trigger("click"),e.on("change",function(e){var n=e.target.files[0],i=new FileReader;i.addEventListener("load",function(){var e=y.a.toObject(i.result);t.raw=e,t.initDimensions(),t.updateNodes(),t.render()}),i.readAsText(n)})},render:function(){var t=this;return m()(u.a.mark(function e(){var n,i,s,a;return u.a.wrap(function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,T(1e3);case 2:n=null,i=t,s=p.i("g.dimension"),a=p.b().on("start",function(){n=i.getDimensionData(p.h(this).attr("uid")),i.selectDimension=n,n.selected=!0}).on("drag",function(){var t=M({x:p.c.x,y:p.c.y}),e=A(t,400);n.angle=t,n.x=e.x,n.y=e.y}).on("end",function(){n.selected=!1,n=null,i.updateNodes()}),s.call(a);case 7:case"end":return e.stop()}},e,t)}))()},renderNodeDistribution:function(){var t=this,e=p.h("svg.distribution");e.selectAll("*").remove();var n=this.selectDimension.distribution,i=this.selectDimension.powerApplier,s=this.selectDimension.distribution.length,a=N.a.maxBy(n,function(t){return t.count}).count,o=150/a,r=300/s,l=p.g().domain([0,s]).interpolate(p.d).range([p.f(this.color.start.hex),p.f(this.color.end.hex)]);N.a.forEach(n,function(t,n){e.append("rect").attrs({class:"distribution",x:20+n*r,y:180,width:r-1,height:0,fill:l(n)}).transition(t.count/a*2e3).delay(50*n).attrs({y:180-t.count*o,height:t.count*o}),e.append("text").attrs({class:"central",x:20+n*r+r/2,y:170,"font-size":"11px","font-weight":600,fill:l(n),opacity:0}).text(t.count).transition(t.count/a*1e3).delay(50*n).attrs({y:170-t.count*o,opacity:1}),e.append("text").attrs({class:"central dimensionKey",x:20+n*r+r/2,y:190,"font-size":"11px","font-weight":600,fill:"#555",opacity:0}).text(t.key<10?(1*t.key).toFixed(1):Math.floor(t.key)).transition(t.count/a*1e3).delay(50*n).attrs({opacity:1})});N.a.map(i,function(t,e){return{x:e*r+20+.5*r,y:180-10*e,power:t.power}});var c=N.a.map(i,function(t,e){return{x:e*r+20+.5*r,y:180-10*t.power,power:t.power}}),u=e.append("g");function d(){u.selectAll("*").remove(),u.append("path").attrs({class:"power-applier",d:F(c)}),N.a.forEach(c,function(t){u.append("text").attrs({class:"central power-applier-text",x:t.x,y:t.y-12}).text((1*t.power).toFixed(2))})}d();var m=null,f=p.b().on("start",function(){m=p.h(this)}).on("drag",function(){var t=p.c.y;t<30&&(t=30),t>180&&(t=180),m.attr("cy",t)}).on("end",function(){var e=p.c.y;e<30&&(e=30),e>180&&(e=180),m.attr("cy",e);var n=-(e-180)/10;i[1*m.attr("idx")].power=n,m=null,d(),t.updateNodes()});N.a.forEach(c,function(t,n){e.append("circle").attrs({class:"power-applier",idx:n,cx:t.x,cy:t.y}).call(f)})}}},O={render:function(){var t=this,e=t.$createElement,n=t._self._c||e;return n("div",{staticClass:"section"},[n("input",{attrs:{type:"file",id:"fileInput"}}),n("div",{staticClass:"graph-field"},[n("div",{staticClass:"selection-dimension-group"},[n("div",{staticClass:"command",on:{click:t.onSelectFileButton}},[t._v("Generate RADVIS from csv file")]),n("div",{staticClass:"category"},[t._v("NODE SETTINGS")]),n("div",{staticClass:"flex-group"},[n("div",{staticClass:"flex-name large"},[t._v("Node Opacity")]),n("input",{directives:[{name:"model",rawName:"v-model",value:t.nodeOpacity,expression:"nodeOpacity"}],attrs:{type:"number",min:"0",max:"100",step:"10"},domProps:{value:t.nodeOpacity},on:{input:function(e){e.target.composing||(t.nodeOpacity=e.target.value)}}})]),n("div",{staticClass:"flex-group"},[n("div",{staticClass:"flex-name large"},[t._v("Node Radius")]),n("input",{directives:[{name:"model",rawName:"v-model",value:t.nodeRadius,expression:"nodeRadius"}],attrs:{type:"number"},domProps:{value:t.nodeRadius},on:{input:function(e){e.target.composing||(t.nodeRadius=e.target.value)}}})]),n("div",{staticClass:"category-end"}),n("div",{staticClass:"category"},[t._v("DIMENSION SETTINGS")]),n("div",{staticClass:"flex-group"},[n("div",{staticClass:"flex-name large"},[t._v("Dimension FontSize")]),n("input",{directives:[{name:"model",rawName:"v-model",value:t.dimensionFontSize,expression:"dimensionFontSize"}],domProps:{value:t.dimensionFontSize},on:{input:function(e){e.target.composing||(t.dimensionFontSize=e.target.value)}}})]),n("div",{staticClass:"flex-group"},[n("div",{staticClass:"flex-name"},[t._v("High Color")]),n("input",{directives:[{name:"model",rawName:"v-model",value:t.color.end.hex,expression:"color.end.hex"}],attrs:{type:"color"},domProps:{value:t.color.end.hex},on:{change:t.updateNodes,input:function(e){e.target.composing||t.$set(t.color.end,"hex",e.target.value)}}})]),n("div",{staticClass:"flex-group"},[n("div",{staticClass:"flex-name"},[t._v("Low Color")]),n("input",{directives:[{name:"model",rawName:"v-model",value:t.color.start.hex,expression:"color.start.hex"}],attrs:{type:"color"},domProps:{value:t.color.start.hex},on:{change:t.updateNodes,input:function(e){e.target.composing||t.$set(t.color.start,"hex",e.target.value)}}})]),n("div",{staticClass:"category-end"}),n("div",{staticClass:"category"},[t._v("SELECTED DIMENSION")]),t.isSelectedDimension?n("div",{staticClass:"group-info"},[n("div",{staticClass:"flex-group"},[n("div",{staticClass:"flex-name"},[t._v("NAME")]),n("div",{staticClass:"flex-text"},[t._v(": "+t._s(t.selectDimension.name))])]),n("div",{staticClass:"flex-group"},[n("div",{staticClass:"flex-name"},[t._v("ANGLE")]),n("div",{staticClass:"flex-text"},[t._v(": "+t._s(t.selectDimension.angle.toFixed(1))+"'")])]),n("div",{staticClass:"flex-group"},[n("div",{staticClass:"flex-name"},[t._v("MIN")]),n("div",{staticClass:"flex-text"},[t._v(": "+t._s(t.selectDimension.min.toFixed(2)))])]),n("div",{staticClass:"flex-group"},[n("div",{staticClass:"flex-name"},[t._v("MAX")]),n("div",{staticClass:"flex-text"},[t._v(": "+t._s(t.selectDimension.max.toFixed(2)))])]),n("div",{staticClass:"flex-group"},[n("div",{staticClass:"flex-name"},[t._v("SIGMA")]),n("div",{staticClass:"flex-text"},[t._v(": "+t._s(t.selectDimension.sigma.toFixed(2)))])]),n("div",{staticClass:"category small"},[t._v("DIMENSION ACTION")]),n("div",{staticClass:"command",on:{click:t.setColorDimensionCurrentDimension}},[t._v("Set Color Dimension")]),t.selectDimension.usage?n("div",{staticClass:"command",on:{click:function(e){t.changeDimensionUsage(t.selectDimension)}}},[t._v("Disable Dimension")]):t._e(),t.selectDimension.usage?t._e():n("div",{staticClass:"command",on:{click:function(e){t.changeDimensionUsage(t.selectDimension)}}},[t._v("Activate Dimension")]),n("div",{staticClass:"category small"},[t._v("NODE DISTRIBUTION ["+t._s(t.getNodeDistributionGraph)+"]")]),n("svg",{staticClass:"distribution"})]):t._e(),n("div",{staticClass:"category-end"}),n("div",{staticClass:"category"},[t._v("Logging Field")]),n("div",{staticClass:"flex-group debug"},[n("div",{staticClass:"flex-name"},[t._v("isSelect Dimension")]),n("div",{staticClass:"flex-text"},[t._v(": "+t._s(t.isSelectedDimension))])]),n("div",{staticClass:"flex-group debug"},[n("div",{staticClass:"flex-name"},[t._v("Start Color")]),n("div",{staticClass:"flex-text"},[t._v(": "+t._s(t.color.start.hex))])]),n("div",{staticClass:"flex-group debug"},[n("div",{staticClass:"flex-name"},[t._v("End Color")]),n("div",{staticClass:"flex-text"},[t._v(": "+t._s(t.color.end.hex))])]),n("div",{staticClass:"flex-group debug"},[n("div",{staticClass:"flex-name"},[t._v("Color Std Dimension")]),n("div",{staticClass:"flex-text"},[t._v(": "+t._s(t.colorDimension.text))])]),n("div",{staticClass:"flex-group debug"},[n("div",{staticClass:"flex-name"},[t._v("Dimension Cluster Size")]),n("div",{staticClass:"flex-text"},[t._v(": "+t._s(t.clusters.length))])])]),n("div",{staticClass:"svg-group"},[n("svg",{staticClass:"radvis"},[n("g",{staticClass:"gBackground",attrs:{transform:t.getRadvisCenterTransform}},[n("circle",{attrs:{cx:"0",cy:"0",r:"400",fill:"none",stroke:"#333","stroke-dasharray":"3,6"}})]),n("g",{staticClass:"gDimensions",attrs:{transform:t.getRadvisCenterTransform}},[t._l(t.dimensions,function(e){return[n("g",{staticClass:"dimension",class:{selection:t.selectDimension===e,disable:!e.usage},attrs:{transform:"translate("+e.x+","+e.y+")",uid:e.uid}},[n("g",{attrs:{transform:t.getDimensionGroupAngle(e.angle)}},[n("text",{staticClass:"dimension",attrs:{transform:t.getDimensionTextTransform(e.angle),"alignment-baseline":"middle","font-size":t.dimensionFontSize}},[t._v(t._s(e.text))])]),n("circle",{staticClass:"inner"}),n("circle",{staticClass:"dimension-normal",attrs:{r:e.selected?12:8}}),e===t.colorDimension?n("rect",{attrs:{width:"8px",height:"8px",x:"35px",y:"-35px",transform:"rotate("+(e.angle+45)+")",fill:t.color.end.hex,stroke:"none"}}):t._e(),e===t.colorDimension?n("rect",{attrs:{width:"8px",height:"8px",x:"25px",y:"-45px",transform:"rotate("+(e.angle+45)+")",fill:t.color.start.hex,stroke:"none"}}):t._e()])]})],2),n("g",{staticClass:"gNodes",attrs:{transform:t.getRadvisCenterTransform}},[t._l(t.nodes,function(e){return[n("circle",t._b({staticClass:"node",attrs:{r:t.nodeRadius,opacity:.01*t.nodeOpacity}},"circle",e,!1))]})],2)])]),n("div",{staticClass:"side-view"},[n("input",{directives:[{name:"model",rawName:"v-model",value:t.fillRadvis,expression:"fillRadvis"}],attrs:{type:"checkbox"},domProps:{checked:Array.isArray(t.fillRadvis)?t._i(t.fillRadvis,null)>-1:t.fillRadvis},on:{change:[function(e){var n=t.fillRadvis,i=e.target,s=!!i.checked;if(Array.isArray(n)){var a=t._i(n,null);i.checked?a<0&&(t.fillRadvis=n.concat([null])):a>-1&&(t.fillRadvis=n.slice(0,a).concat(n.slice(a+1)))}else t.fillRadvis=s},t.onFillRadvis]}}),n("div",{staticClass:"flex-group"},[n("input",{directives:[{name:"model",rawName:"v-model",value:t.makeClusterCount,expression:"makeClusterCount"}],staticClass:"cluster-number",attrs:{type:"number"},domProps:{value:t.makeClusterCount},on:{input:function(e){e.target.composing||(t.makeClusterCount=e.target.value)}}}),n("div",{staticClass:"command",on:{click:t.doClusterDimension}},[t._v("Dimension Clustering")])]),n("div",{staticClass:"category"},[t._v("Dimension Correlation")]),n("div",{staticClass:"correlation-field"},[n("div",{staticClass:"first-group"},[t._l(t.dimensions,function(e){return[e.usage?n("div",{staticClass:"name-horizontal"},[n("div",{staticClass:"name"},[t._v(t._s(e.name))])]):t._e()]}),n("div",{staticClass:"empty-group"})],2),t._l(t.dimensions,function(e){return[e.usage?n("div",{staticClass:"correlation-group",style:{height:264/t.getActiveDimensionSize()+"px"}},[t._l(t.dimensions,function(i){return[t.getDimensionByName(i.name).usage?n("div",{staticClass:"correlation-block"},[n("div",{staticClass:"circle",style:{background:t.getCorrelationColor(e.correlation[i.name])}})]):t._e()]}),n("div",{staticClass:"name-vertical"},[n("div",{staticClass:"name"},[t._v(t._s(e.name))])])],2):t._e()]}),n("div",{staticClass:"correlation-group cluster"},[t._l(t.clusters,function(e,i){return[t._l(e.dimensions,function(e,s){return[n("div",t._b({staticClass:"correlation-block cluster",style:{background:t.colorDimensionCluster(i,t.clusters.length)}},"div",{index:s},!1))]})]}),n("div",{staticClass:"name-vertical"})],2)],2),n("div",{staticClass:"category"},[t._v("Dimension Clusters")]),t._l(t.clusters,function(e,i){return[n("div",{staticClass:"flex-group debug"}),n("div",{staticClass:"flex-group-dimension"},[n("div",{staticClass:"flex-cluster-color",style:{background:t.colorDimensionCluster(i,t.clusters.length)}}),n("div",{staticClass:"flex-dimension-list"},[t._l(e.dimensions,function(e){return[n("div",{staticClass:"flex-dimension",class:{selected:e===t.selectDimension.name},on:{click:function(n){t.setSelectDimension(e)}}},[t._v(t._s(e))])]})],2)])]})],2)])])},staticRenderFns:[]};var B=n("VU/8")(z,O,!1,function(t){n("Z2qa")},null,null).exports;i.a.use(l.a);var G=new l.a({mode:"history",routes:[{path:"/",name:"Radvis",component:B}]});i.a.config.productionTip=!1,new i.a({el:"#app",router:G,components:{App:r},template:"<App/>"})},YWXz:function(t,e){},Z2qa:function(t,e){}},["NHnr"]);
//# sourceMappingURL=app.f5fafe52806cb2500fd1.js.map