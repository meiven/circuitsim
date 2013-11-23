CSimElement = function(menuName, x, y){
	this.type = menuName.charAt(0);
	name = this.type+CSim.elemDef[this.type]['counter'];
	if (this.type == "G") name = "";
	this.name = name;
	this.node1 = null;
	this.node2 = null;
	this.value = CSim.elemDef[this.type]['defValue'];
	this.v = null;
	this.r = null;
	this.i = null;
	this.x = x;
	this.y = y;
	
	CSim.elemDef[this.type]['counter'] ++;
	CSim.elements[this.name] = this;
	
	CSimCanvas._addElement(this);
	
}
CSimElement.prototype._addStyle = function(){
	this.image.on("mouseover", function(){ document.body.style.cursor =  "pointer"; });
	this.image.on("mouseout", function() { document.body.style.cursor = "default"; });
}
CSimElement.prototype._addListeners = function(){
	this.image.on( 'dblclick' , this._dblclick );
	this.image.on( 'mousedown', this._dragstart );
	this.image.on( 'mouseup', this._dragend );
}
CSimElement.prototype._dblclick = function(){
	CSimEditor.show(this);
}
CSimElement.prototype._dragstart = function(e){
	CSim._selectedimg = this;
	this.setAttr("strokeEnabled", true);
	CSimCanvas._circuitlayer.draw();

	CSimCanvas._wiring = false;
	
	var imagepos = [this.getAttr("x"), this.getAttr("y")];
	var labelpos = [this.getAttr("label").getAttr("x"), this.getAttr("label").getAttr("y")];
	CSim._labeloffset = [labelpos[0]-imagepos[0],labelpos[1]-imagepos[1]];
}
CSimElement.prototype._dragend = function(e){
	CSimCanvas._wiring = true;
	
	var x = this.getAttr("x");
	var y = this.getAttr("y");
	
	var p = CSimCanvas._ajustaramalla(x,y);
	
	this.setAttr("x",p[0]);
	this.setAttr("y",p[1]);
	
	CSimCanvas._circuitlayer.draw();
	
	var elem = this.getAttr('elem');
		elem.x = p[0];
		elem.y = p[1];
	
	this.getAttr("label").setAttr("x", p[0] + CSim._labeloffset[0]);
	this.getAttr("label").setAttr("y", p[1] + CSim._labeloffset[1]);
	CSimCanvas._labellayer.draw();
	CSim._clearSolution(); //
	CSim._mostrarnodos(); //
}
CSimElement.prototype._loadLabel = function(){

	this._getelemcoordinates();
	
	if (x0==xf){
		tx = x0 - 35;
		ty = (y0 + yf)/2;
	} else {
		tx = (x0 + xf)/2;
		ty = y0 - 30;
	}
	
	var str = (this.type == "G") ? "" : this.name + " = " + this.value + CSim.elemDef[this.type].symbol;
	var text = new Kinetic.Text({
		x: tx-35,
		y: ty-12,
		text: str,
		fontSize: 22,//TODO ajustar a tamaño pantalla
		fontFamily: 'calibri',
		fill: '#000099',
		name: this.name,
		draggable: true
	});
	
	text.on('mousedown', function(){
		CSimCanvas._wiring = false;
	});
	text.on('mouseup', function(){
		CSimCanvas._wiring = true;
	});	
	
	this.label = text;
	
	CSimCanvas._labellayer.add(text);
	CSimCanvas._labellayer.draw();
	
	return text;
}
CSimElement.prototype._getelemcoordinates = function(){
	
	var p=[this.image.getAttr("x"), this.image.getAttr("y")];
	var rotation = this.image.getAttr("rotation") + CSim.elemDef[this.type].iniRotation;
	
	if (rotation % Math.PI == 0){
	
		x0 = p[0] - CSim._elemsize/2;
		xf = p[0] + CSim._elemsize/2;
		y0 = yf = y1 = y2 = p[1];
		
		x1 = x0 + CSim._malla;
		x2 = xf - CSim._malla;
		
	} else {
	
		x0 = xf = x1 = x2 = p[0];
		y0 = p[1] - CSim._elemsize/2;
		yf = p[1] + CSim._elemsize/2;
		
		y1 = y0 + CSim._malla;
		y2 = yf - CSim._malla;
	}
	
	if (rotation % (2*Math.PI) >= Math.PI){
		x0t = xf; xf = x0; x0 = x0t;
		x1t = x2; x2 = x1; x1 = x1t;	
		y0t = yf; yf = y0; y0 = y0t;
		y1t = y2; y2 = y1; y1 = y1t;			
	}
}
CSimEditor = {
	elem: null,
	input: document.getElementById('value'),
	label: document.getElementById('label'),
	init: function(){
		document.getElementById('save').addEventListener('click', CSimEditor.save );
	  	document.getElementById('cancel').addEventListener('click', CSimEditor.hide );
	},
	save: function(){
		CSimEditor.elem.value = CSimEditor.input.value;
		CSimEditor.elem.label.setAttr("text", CSimEditor.elem.name + " = " + CSimEditor.elem.value + CSim.elemDef[CSimEditor.elem.type].symbol);
		CSimCanvas._labellayer.draw();
		CSimEditor.hide();
	},
	cancel: function(){
		CSimEditor.hide();
	},
	show : function(image){
		$('#editor').dialog({modal: true});
		
		CSimEditor.elem = image.getAttr('elem');
		CSimEditor.label.innerHTML = CSim.elemDef[CSimEditor.elem.type]['label']+ '('+CSim.elemDef[CSimEditor.elem.type]['unit']+')'
		CSimEditor.input.value = CSimEditor.elem.value;
	},
	hide : function(){
		$('#editor').dialog('close');
	}
}
CSimDragop = {
	allowDrop : function(e){
		e.preventDefault();
	},
	drag : function(e){
		var mpos = [e.clientX, e.clientY];
		var ipos = $("#" + e.target.id).offset();
		var offset = [mpos[0]-ipos.left-CSim._elemsize/2, mpos[1]-ipos.top-CSim._elemsize/2];

		e.dataTransfer.setData("data", JSON.stringify({"text": e.target.id, "offset": offset}));
	},
	drop : function(e){
		e.preventDefault();
		var data = JSON.parse(e.dataTransfer.getData("data"));

	  	var id = data.text;
		var offset = data.offset;
		
	  	if(id.indexOf('menu') <= 0) return true;
	  	var pos = CSimCanvas._getcoordinates(e);
		var pos = CSimCanvas._ajustaramalla(pos[0] - offset[0], pos[1] - offset[1]); //
	  	
		elem = new CSimElement(id, pos[0], pos[1]);
	}
}
CSimCanvas = {
	_wiring: true,
	_drawing : false,
	_dragging : false,
	_load : function(){
		this.anchura = Math.min(1100,$(window).width())-200;
		this.altura = Math.min(600,$(window).height())-50;
		
		//TODO: incluir elemento contenedor si no existe
		this.contenedor=document.getElementById("contenedor");
		
		$("#contenedor").width(this.anchura);
		$("#contenedor").height(this.altura);
		
		$("#contenedor").offset({
			top: ($(window).height() - this.altura)/2, 
			left: ($(window).width() - this.anchura)/2 + 70
		});
		this._stage = new Kinetic.Stage({
			container: 'contenedor',
			width: this.anchura,
			height: this.altura
		});
		
		this._backgroundlayer = new Kinetic.Layer();
		this._circuitlayer = new Kinetic.Layer();
		this._labellayer = new Kinetic.Layer();
		this._nodeslayer = new Kinetic.Layer();
		this._solutionlayer = new Kinetic.Layer();
		
		this._stage.add(this._backgroundlayer);
		this._stage.add(this._circuitlayer);
		this._stage.add(this._labellayer);
		this._stage.add(this._nodeslayer);
		this._stage.add(this._solutionlayer);
	},
	_dibujarMalla : function(){
		var fondo = new Kinetic.Rect({
			x: 0,
			y: 0,
			width: this.anchura,
			height: this.altura,
			fill: "white",
			stroke: "black",
			strokeWidth: 4
		});
		this._backgroundlayer.add(fondo);		 
		
		for (var i=CSim._malla; i<this.anchura; i+=CSim._malla){
			for (var j=CSim._malla; j<this.altura; j+=CSim._malla){	
				var rect = new Kinetic.Rect({
					x: i-1,
					y: j-1,
					width: 2,
					height: 2,
					fill: "darkgray",
				});
				
				this._backgroundlayer.add(rect);
			}
		}
		this._backgroundlayer.draw();
	},
	_initListeners : function(){
		this.contenedor.addEventListener('mousedown', this._mousedown, false);
		this.contenedor.addEventListener('mousemove', this._mousemove, false);
		this.contenedor.addEventListener('mouseup', this._mouseup, false);
	},
	_addElement : function(elem){
		imageObj = new Image();
		imageObj.name = elem.name;
		imageObj.onload = function(e) {
			var elem = CSim.elements[e.target.name];
			var image = new Kinetic.Image({
				x: elem.x,
				y: elem.y,
				image: imageObj,
				width: CSim._elemsize,
				height: CSim._elemsize,
				offset: [CSim._elemsize/2, CSim._elemsize/2],
				stroke: "blue",
				strokeWidth: 0.5,
				strokeEnabled: false,
				draggable: true
			});

			image.setAttr("selected", true);
			CSim._selectedimg = image;
			
			elem.image = image;
			image.setAttr('elem', elem);
			
			var label = elem._loadLabel();
			elem.label = label;
			image.setAttr('label', label);
			
			elem._addListeners();
			elem._addStyle();
			
			CSimCanvas._circuitlayer.add(image);
			CSimCanvas._stage.add(CSimCanvas._circuitlayer);
			
			CSim._clearSolution(); //
			CSim._mostrarnodos(); //
		};
		imageObj.src = "img/"+elem.type+".png";
	},
	_getcoordinates : function (ev){
			return [ev.clientX - $("#contenedor").position().left,
					ev.clientY - $("#contenedor").position().top];
	},
	_ajustaramalla : function (x,y){
			return [Math.round(x/CSim._malla)*CSim._malla,
					Math.round(y/CSim._malla)*CSim._malla];
	},
	_mousedown : function (ev){
			
		if ( ! CSimCanvas._wiring ){return;}
		
		var p = CSimCanvas._getcoordinates(ev);	
		p = CSimCanvas._ajustaramalla(p[0],p[1]);
		var x = p[0]; var y = p[1];
		
		groundnode = {x: x*2/CSim._malla, y: y*2/CSim._malla};
		
		CSimCanvas._drawing = true;
		CSimCanvas._dir = "";
		
		CSimCanvas._x0 = x;
		CSimCanvas._y0 = y;
		CSimCanvas._x1 = x;
		CSimCanvas._y1 = y;
		
		CSimCanvas._drawinglayer = new Kinetic.Layer();
		
		CSimCanvas._templine = new Kinetic.Line({
			points: [CSimCanvas._x0, CSimCanvas._y0, CSimCanvas._x0, CSimCanvas._y0],
	        stroke: "black",
	        strokeWidth: CSim._cablewidth,
	        lineCap: 'round',
	        lineJoin: 'round'
	    });
		 
		// if (CSim._selectedimg != ""){
			// CSim._selectedimg.setAttr("strokeEnabled", false);
			// CSimCanvas._circuitlayer.draw();
			// CSim._selectedimg = "";
		// }
		
	    CSimCanvas._drawinglayer.add(CSimCanvas._templine); 
		CSimCanvas._stage.add(CSimCanvas._drawinglayer);
		
	},
	_mousemove : function (ev){
		
		if (CSimCanvas._drawing){
		
			var p = CSimCanvas._getcoordinates(ev);
			p = CSimCanvas._ajustaramalla(p[0], p[1]);
			var x = p[0]; var y = p[1];
			
			if (CSimCanvas._dir == "" && Math.abs(x-CSimCanvas._x0) + Math.abs(y-CSimCanvas._y0) > 3*CSim._malla){
				(Math.abs(x-CSimCanvas._x0)>2*CSim._malla) ? CSimCanvas._dir = "horizontal" : CSimCanvas._dir = "vertical";
			}
			
			// si la dirección ya está clara, la mantiene
			switch (CSimCanvas._dir){
				
				case "horizontal":
					CSimCanvas._x1 = x;
					CSimCanvas._y1 = CSimCanvas._y0;
					break;
					
				case "vertical":
					CSimCanvas._x1 = CSimCanvas._x0;
					CSimCanvas._y1 = y;
					break;
					
				default:
					if (Math.abs(x-CSimCanvas._x0) > Math.abs(y-CSimCanvas._y0)){
						CSimCanvas._x1 = x;
						CSimCanvas._y1 = CSimCanvas._y0;
					} else {
						CSimCanvas._x1 = CSimCanvas._x0;
						CSimCanvas._y1 = y;
					}
					break;
			}	
			
			
			CSimCanvas._x2 = x;
			CSimCanvas._y2 = y;
				
			CSimCanvas._templine.setAttr("points", [CSimCanvas._x0, CSimCanvas._y0,
													CSimCanvas._x1, CSimCanvas._y1,
													CSimCanvas._x2, CSimCanvas._y2]);
			
			CSimCanvas._drawinglayer.draw();
			
		}
	},
	_mouseup : function (ev){
		
		var p = CSimCanvas._getcoordinates(ev);
		p = CSimCanvas._ajustaramalla(p[0], p[1]);
		
		if (CSimCanvas._drawing){
		
			if (CSimCanvas._x0 != CSimCanvas._x1 || CSimCanvas._y0 != CSimCanvas._y1){
				
				CSimCanvas._circuitlayer.add(CSimCanvas._templine);
				CSimCanvas._circuitlayer.draw();
				
				CSim._addtomatrix(CSimCanvas._x0, CSimCanvas._y0, CSimCanvas._x1, CSimCanvas._y1, 'w', CSim._matrizcables);
				CSim._addtomatrix(CSimCanvas._x1, CSimCanvas._y1, CSimCanvas._x2, CSimCanvas._y2, 'w', CSim._matrizcables);
			}
	
			CSimCanvas._drawing = false;
			CSimCanvas._drawinglayer.remove();	

			CSim._clearSolution(); //
			CSim._mostrarnodos(); //			
		}
		
		// if (CSim._selectedimg != ""){
			// CSim._selectedimg.setAttr("strokeEnabled", false);
			// CSimCanvas._circuitlayer.draw();
			// CSim._selectedimg = "";
		// }

	}
}
