/*
 *		^^^^			ACTIVIDAD	^^^^^^^^^^^^^^^^^^^^
 *  	+++				CSim		++++++++++++++++++++
 * 		---  CSimCanvas, CSimElement, CSimEditor	----
 * 		..		CSimCircuit, CSimCircuitElement  .......
 */

CSim = {
	contenedor : 'contenedor',
	elemDef : {
		R:{
			counter:0,
			unit:'ohms',
			symbol:'Ω',
			name:'resistencia',
			defValue: 10,
			iniRotation: 0,
			label: true,
			editable: true,
			csymbol: 'R'
		},
		V:{
			counter:0,
			unit:'voltios',
			symbol:'V',
			name:'Fuente Tensión Ideal',
			defValue: 1.5,
			iniRotation: 0,
			label: true,
			editable: true,
			csymbol: 'V'
		},
		C:{
			counter:0,
			unit:'faradios',
			symbol:'F',
			name:'Condensador',
			defValue: 2,
			iniRotation: 0,
			label: true,
			editable: true,
			csymbol: 'C'
		},
		I:{
			counter:0,
			unit:'amperios',
			symbol:'A',
			name:'Fuente de corriente ideal',
			defValue: 10,
			iniRotation: 0,
			label: true,
			editable: true,
			csymbol: 'I'
		},
		G:{
			counter:0,
			unit:'',
			symbol:'',
			name:'Nodo tierra',
			defValue: 0,
			iniRotation: Math.PI/2,
			label: false,
			editable: false,
			csymbol: 'w'
		},
		Rvar:{
			counter:0,
			unit:'Ohms',
			symbol:'Ω',
			name:'Resistencia variable',
			defValue: 10,
			iniRotation: 0,
			label: true,
			editable: true,
			csymbol: 'R'
		},
		Ireal:{
			counter:0,
			unit:['Amperios','Ohms'],
			symbol:'A',
			name:'Fuente de corriente real',
			defValue: [2,10],
			iniRotation: 0,
			label: true,
			editable: true,
			csymbol: ['I','R']
		},
		Fuse:{
			counter:0,
			unit:'Ohms',
			symbol:'Ω',
			name:'Fusible',
			defValue: 0,
			iniRotation: 0,
			label: false,
			editable: true,
			csymbol: 'V'
		},
		Amp:{
			counter:0,
			unit:'',
			symbol:'',
			name:'Amperímetro',
			defValue: 0,
			iniRotation: Math.PI/2,
			label: false,
			editable: true,
			csymbol: 'V'
		},
		Volt:{
			counter:0,
			unit:'Voltios',
			symbol:'V',
			name:'Voltímetro',
			defValue: Infinity,
			iniRotation: Math.PI/2,
			label: false,
			editable: true,
			csymbol: 'R'
		},
		Switch:{
			counter:0,
			unit:'',
			symbol:'',
			name:'Interruptor',
			defValue: 'off',
			iniRotation: 0,
			label: true,
			editable: true,
			csymbol: '.'
		},
		Rrec:{
			counter:0,
			unit:'',
			symbol:'Ω',
			name:'Receptor de corriente',
			defValue: 10,
			iniRotation: 0,
			label: true,
			editable: true,
			csymbol: 'R'
		}
	},
	_wires: [],
	_elements : [],
	_wirecounter: 0,
	_selectedwire : "",
	_selectedelem : "",
	_selectedimg : "",
	load : function(){
		
		this.say('iniciando..');
		
		CSimCanvas._load();
		
		this._initListeners();
		
		CSimCircuit._init();

		CSimCanvas._dibujarMalla();
	},
	_initListeners : function(){
		CSimCanvas._initListeners();
		
		$('img[id*="menu"]').draggable({ helper: 'clone'});
	  
		$('#contenedor').droppable({
			drop: CSimCanvas._onDrop
		});
		
		document.getElementById('solve').addEventListener('click', CSimCircuit._solve );
		document.getElementById('saveCircuit').addEventListener('click', CSimCircuit._saveCircuit);
		document.getElementById('loadCircuit').addEventListener('click', CSimCircuit._loadCircuit);
	    
	    window.addEventListener('keydown', this._onKeyPressed, false);
	    window.addEventListener('contextmenu', function(e){
	    	e.preventDefault();
	    	return false;
	    }, false);
	    
	    window.onerror = function (msg, url, line){
			console.error(this,'error event not catched: '+msg+' en '+url+' linea '+line);
			CSim.onError(msg);
			return false;
		}
	},
	onError : function(m){
		this.say(m, 'error');
	},
	deleteAll : function(){
		CSim.say('borrando...');
		with(CSimCanvas){
			_circuitlayer.remove();
			_labellayer.remove();
			_nodeslayer.remove();
			_solutionlayer.remove();
			_circuitlayer = new Kinetic.Layer();
			_labellayer = new Kinetic.Layer();
			_nodeslayer = new Kinetic.Layer();
			_solutionlayer = new Kinetic.Layer();
			
			_stage.add(_circuitlayer);
			_stage.add(_labellayer);
			_stage.add(_nodeslayer);
			_stage.add(_solutionlayer);
			_createIconsGroup();
		}
		CSim._wires = [];
		CSim._elements = [];
		CSimCircuit._elements = [];
		CSim._resetCounters();
		
		CSimCircuit._init();
	},
	_resetCounters : function(){
		for (i in CSim.elemDef )
			CSim.elemDef[i]['counter'] = 0;
	},
	_update : function(){
		
	},
	_onKeyPressed : function(e){
		//console.info(e.which);
			if (e.which == 82){// test - tecla 'r' para rotar elementos
				if (CSim._selectedelem != "") CSim._selectedelem._rotate();
			};
			
			if (e.which == 77){// test - tecla 'm' para mostrar los nodos por consola
				CSimCircuit._mostrarmatriznodos();
			}
			if (e.which == 67)// test - tecla 'c' para mostrar la matriz de circuito
				CSimCircuit._mostrarmatrizcircuito();
			
			if (e.which == 83)// test - tecla 's' para resolver
				CSimCircuit._solve();
			
			if (e.which == 68)// test - tecla 'd' para borrar todo
				CSim.deleteAll();
				
			if (e.which == 46){// test - tecla 'supr' para borrar elementos
				if (CSim._selectedelem != "") CSim._selectedelem._delete();
				if (CSim._selectedwire != "") CSim._selectedwire._delete();
			};
	},
	say : function(m, t){
		switch (t){
			case 'error':
				t = 'showErrorToast';
				break;
			case 'debug': break;
			default:
				t = 'showNoticeToast';
		}
		if ( t == 'debug' )
			console.debug(m);
		else
			$().toastmessage(t, m);
	}
}

CSimWire = function(x0, y0, x1, y1){
	this._x0 = x0;
	this._y0 = y0;
	this._x1 = x1;
	this._y1 = y1;
	this._color = CSimCanvas.wirecolor,
	this._label = false;
	this._labelText = "";
	this._name = "w" + CSim._wirecounter;
	CSim._wirecounter++;
	
	CSim._wires[this._name] = this;
	CSimCanvas._addWire(this);
}
CSimWire.prototype._select = function(){
	CSimCanvas._deselectAll();
	CSim._selectedwire = this.getAttr("wire");
	this.setAttr("stroke", "red");
	CSimCanvas._circuitlayer.draw();
}
CSimWire.prototype._deselect = function(){
	CSim._selectedwire = "";
	this.setAttr("stroke", "black");
	CSimCanvas._circuitlayer.draw();
}
CSimWire.prototype._delete = function(){
	delete CSim._wires[this._name];
	this.image.destroy();
	CSimCircuit._mostrarnodos(); //
	CSim._selectedwire = "";
	CSimCanvas._circuitlayer.draw();
}
CSimElement = function(p){
	this._pos = p;
}
CSimElement.prototype._create = function( type, name, value, rotation ){
	this._celements = [];
	this._type = type;
	this._name = name || this._type+CSim.elemDef[this._type]['counter'];
	this._value = value || this._getDef('defValue');
	this._rotation = rotation || 0;
	this._x = this._pos[0];
	this._y = this._pos[1];
	
	CSim._elements[this._name] = this;
	CSimCanvas._addElement(this);
}
CSimElement.prototype._rotate = function(){
	this.image.rotate(Math.PI/2);
	this._rotation = this.image.getAttr("rotation");
	CSimCircuit._mostrarnodos();
	CSimCanvas._circuitlayer.draw();
}
CSimElement.prototype._delete = function(){
	delete CSim._elements[this._name];
	delete CSimCircuit._elements[this._name];
	this.label.destroy();
	this.image.destroy();
	CSimCanvas._iconsGroup.hide();
	CSimCanvas._circuitlayer.draw();
	CSimCanvas._labellayer.draw();
	CSimCircuit._mostrarnodos(); //
	CSim._selectedelem = "";
	CSim._selectedimg = "";
}
CSimElement.prototype._addElement = function(){
	if ( CSimCircuit._elemtypes.indexOf(this._getDef('csymbol')) != -1){
		this._celements = [new CSimCircuitElement( this._getDef('csymbol'), this, this._value )];
		var e = this._celements[0]._name;
	}else
		var e = this._getDef('csymbol');
		
	CSimCircuit._addtomatrix(x0, y0, x1, y1, "w", CSimCircuit._matrizcircuito);
	CSimCircuit._addtomatrix(x1, y1, x2, y2, e, CSimCircuit._matrizcircuito); 
	CSimCircuit._addtomatrix(x2, y2, xf, yf, "w", CSimCircuit._matrizcircuito);
}
CSimElement.prototype._addListeners = function(){
	this.image.on( 'dblclick dbltap' , this._dblclick );
	this.image.on( 'dragstart', this._dragstart );
	this.image.on( 'dragend', this._dragend );
}
CSimElement.prototype._dblclick = function(e){
	CSimEditor._show(this);
}
CSimElement.prototype._dragstart = function(e){

	CSimCanvas._setWiring ( false );
	
	var imagepos = [this.getAttr("x"), this.getAttr("y")];
	var labelpos = [this.getAttr("label").getAttr("x"), this.getAttr("label").getAttr("y")];
	
	CSim._labeloffset = [labelpos[0]-imagepos[0],labelpos[1]-imagepos[1]];
}
CSimElement.prototype._getDef = function(prop){
	return CSim.elemDef[this._type][prop];
}
CSimElement.prototype._dragend = function(e){
	var x = this.getAttr("x");
	var y = this.getAttr("y");
	
	var p = CSimCanvas._ajustaramalla( [x,y] );
	
	this.setAttr("x",p[0]);
	this.setAttr("y",p[1]);
	
	CSimCanvas._circuitlayer.draw();
	
	var elem = this.getAttr('elem');
	elem._x = p[0];
	elem._y = p[1];
	elem._pos = p;	
	
	this.getAttr("label").setAttr("x", p[0] + CSim._labeloffset[0]);
	this.getAttr("label").setAttr("y", p[1] + CSim._labeloffset[1]);
	CSimCanvas._iconsGroup.setAttr("x", p[0]);
	CSimCanvas._iconsGroup.setAttr("y", p[1]);
		
	CSimCanvas._labellayer.draw();
	CSimCanvas._circuitlayer.draw();
	CSimCircuit._clearSolution(); //
	CSimCircuit._mostrarnodos(); //
}

CSimElement.prototype._loadLabel = function(){

	this._getelemcoordinates();
	
	if (x0==xf){
		tx = (x0 + xf)/2-5;
		ty = y0 - 5;
	} else {
		tx = (x0 + xf)/2-5;
		ty = y0 - 40;
	}
	
	var str = ( this._getDef('label') ) ? this._name + " = " + this._value + this._getDef('symbol') : "";
	
	var text = new Kinetic.Text({
		x: tx-35,
		y: ty-12,
		text: str,
		fontSize: 22,//TODO ajustar a tamaño pantalla
		fontFamily: 'calibri',
		fill: '#000099',
		name: this._name,
		draggable: true
	});
	text.on('mousedown touchstart', function(){
		CSimCanvas._setWiring ( false );
	});
	text.on('mouseup touchend', function(){
		CSimCanvas._setWiring ( true );
	});	
	
	this._label = text;
	CSimCanvas._labellayer.add(text);
	CSimCanvas._labellayer.draw();
	
	return text;
}
CSimElement.prototype._getelemcoordinates = function(){
	
	if (this.image == null){return;}
	
	var p=[this.image.getAttr("x"), this.image.getAttr("y")];
	var rotation = this.image.getAttr("rotation") + CSim.elemDef[this._type].iniRotation;
	
	if (rotation % Math.PI == 0){
	
		x0 = p[0] - CSimCanvas.elemsize/2;
		xf = p[0] + CSimCanvas.elemsize/2;
		xm = (x0+xf)/2; xm0 = xm - CSimCanvas.malla; xm1 = xm + CSimCanvas.malla;
		y0 = yf = y1 = y2 = ym = ym0 = ym1 = p[1];
		
		x1 = x0 + CSimCanvas.malla;
		x2 = xf - CSimCanvas.malla;
		
	} else {
	
		x0 = xf = x1 = x2 = xm = xm0 = xm1 = p[0];
		y0 = p[1] - CSimCanvas.elemsize/2;
		yf = p[1] + CSimCanvas.elemsize/2;
		ym = (y0 + yf)/2; ym0 = ym - CSimCanvas.malla; ym1 = ym + CSimCanvas.malla;
		
		y1 = y0 + CSimCanvas.malla;
		y2 = yf - CSimCanvas.malla;
	}
	
	if (rotation % (2*Math.PI) >= Math.PI){
		x0t = xf; xf = x0; x0 = x0t;
		x1t = x2; x2 = x1; x1 = x1t;	
		y0t = yf; yf = y0; y0 = y0t;
		y1t = y2; y2 = y1; y1 = y1t;			
	}
}
CSimElement.prototype._getLabelPosition = function(){
	return [this._label.getAttr('x') , this._label.getAttr('y')]
}
CSimElement.prototype._editHTML = function(){
	return "<li><label for='value' id='label'>"+
						CSim.elemDef[CSimEditor.elem._type]['name']+ '('
						+CSim.elemDef[CSimEditor.elem._type]['unit']
						+")</label><input type='number' id='cs3m-value' value='"+
						CSimEditor.elem._value+"'/></li>"+
			"<li><button id='cs3m-rotate'>rotar</button></li>";
}
CSimElement.prototype._editListeners = function(){
	$('#cs3m-value').change( CSimEditor._save );
	$('#cs3m-rotate').on('click tap', CSimCanvas._rotate );
}
CSimElement.prototype._save = function(){
	CSimEditor.elem._value = $('#cs3m-value').val();
	if(CSimEditor.elem._celements != null )
		CSimEditor.elem._celements[0]._value =$('#cs3m-value').val();
}
CSimElement.prototype._generateNetlist = function(){
	if(this._celements == null ) return;
	
	this._getelemcoordinates();
	
	var nodo1x = x0 * 2/CSimCanvas.malla;
	var nodo1y = y0 * 2/CSimCanvas.malla;
	var node1 = CSimCircuit._nearestnode(nodo1x, nodo1y);
	this._celements[0].node1 = node1;
	
	var nodo2x = xf * 2/CSimCanvas.malla;
	var nodo2y = yf * 2/CSimCanvas.malla;	
	var node2 = CSimCircuit._nearestnode(nodo2x, nodo2y);
	this._celements[0].node2 = node2;
	
	CSimCircuit._netlist.push([this._celements[0]._name, node1, node2, this._celements[0]._value])
}
CSimElementIreal = function(p){
	CSimElement.call(this,p);
	this._type = 'Ireal';
	this._name = this._type+CSim.elemDef[this._type]['counter'];
	this._value = CSim.elemDef[this._type]['defValue'];
}
CSimElementIreal.prototype = new CSimElement();
CSimElementIreal.prototype._editHTML = function(){
	return "<li><label for='value0'>"+
				CSim.elemDef['I']['name']+ '('
				+CSim.elemDef['I']['unit']
				+")</label><input type='number' id='cs3m-value0' value='"+
				CSimEditor.elem._value[0]+"'/></li>"+
			"<li><label for='value1'>"+
				CSim.elemDef['R']['name']+ '('
				+CSim.elemDef['R']['unit']
				+")</label><input type='number' id='cs3m-value1' value='"+
				CSimEditor.elem._value[1]+"'/></li>"+
			"<li><button id='cs3m-rotate'>rotar</button></li>";;
}
CSimElementIreal.prototype._editListeners = function(){
	$('#cs3m-value0').change( CSimEditor._save );
	$('#cs3m-value1').change( CSimEditor._save );
	$('#cs3m-rotate').on('click tap', CSimCanvas._rotate );
}
CSimElementIreal.prototype._save = function(){
	CSimEditor.elem._value[0] = $('#cs3m-value0').val();
		CSimEditor.elem._celements[0]._value =$('#cs3m-value0').val();
	CSimEditor.elem._value[1] = $('#cs3m-value1').val();
		CSimEditor.elem._celements[1]._value =$('#vcsimelement-value1').val();	
}
CSimElementIreal.prototype._addElement = function(){
	var i = new CSimCircuitElement('I', this, this._value[0]);
	var r = new CSimCircuitElement('R', this, this._value[1]);
	this._celements = [i,r];
	
	CSimCircuit._addtomatrix(x0, y0, x1, y1, "w", CSimCircuit._matrizcircuito); 
	CSimCircuit._addtomatrix(x1, y1, xm0, ym0, i._name, CSimCircuit._matrizcircuito);
	CSimCircuit._addtomatrix(xm0, ym0, xm, ym, "w", CSimCircuit._matrizcircuito); 
	CSimCircuit._addtomatrix(xm, ym, xm1, ym1, r._name, CSimCircuit._matrizcircuito);
	CSimCircuit._addtomatrix(x2, y2, xf, yf, "w", CSimCircuit._matrizcircuito);
}
CSimElementIreal.prototype._generateNetlist = function(){
	this._getelemcoordinates();
	
	var node1 = CSimCircuit._nearestnode(x0 * 2/CSimCanvas.malla, y0 * 2/CSimCanvas.malla);
	this._celements[0].node1 = node1;
	
	var node2 = CSimCircuit._nearestnode(xm * 2/CSimCanvas.malla, ym * 2/CSimCanvas.malla);
	this._celements[0].node2 = node2;
	
	var node3 = CSimCircuit._nearestnode( xf * 2/CSimCanvas.malla, yf * 2/CSimCanvas.malla );
	this._celements[0].node2 = node2;
	
	CSimCircuit._netlist.push([this._celements[0]._name, node1, node2, this._celements[0]._value]);
	CSimCircuit._netlist.push([this._celements[1]._name, node2, node3, this._celements[1]._value]);
}
CSimElementG = function(p){
	CSimElement.call(this,p);
	this._type = 'G';
	this._name = "";
}
CSimElementG.prototype = new CSimElement();
CSimElementG.prototype._addElement = function(){
	CSimCircuit._groundnode = {x: x0, y: y0};
}
CSimElementSwitch = function(p){
	CSimElement.call(this,p);
	this._type = 'Switch';
}
CSimElementSwitch.prototype = new CSimElement();
CSimElementSwitch.prototype._editHTML = function(){
	return "<li><button id='cs3m-onoff'>"+this._getDef('defValue')+"</button></li>"+
			"<li><button id='cs3m-rotate'>rotar</button></li>";
}
CSimElementSwitch.prototype._editListeners = function(){
	$('#cs3m-onoff').on('click tap', function(){
		var val = ( this.innerHTML == "on" ) ? "off" : "on";
		
		CSimEditor.elem._value = this.innerHTML = val;
		CSimCanvas._updateLabel( CSimEditor.elem );
		CSim.elemDef['Switch'].csymbol = ( this.innerHTML == "on" ) ? 'w' : '.';
	});
	$('#cs3m-rotate').on('click tap', CSimCanvas._rotate );
}
CSimEditor = {
	elem: null,
	_save: function(){
		CSimEditor.elem._save();
		
		CSimCanvas._updateLabel( CSimEditor.elem );
	},
	_cancel: function(){
		CSimEditor._hide();
	},
	_show : function(image){
		CSimEditor.elem = image.getAttr('elem');
		if( ! CSim.elemDef[CSimEditor.elem._type].editable ) return;
		
		$('#csimeditor-items').html( CSimEditor.elem._editHTML() );
		
		CSimEditor.elem._editListeners();
		
		$('#csimeditor').dialog({modal: true});
	},
	_hide : function(){
		$('#csimeditor').dialog('close');
	}
}

CSimCanvas = {
	malla : 12,
	elemsize : 12 * 6,
	iconsize : 16,
	cablewidth : 2,
	wirecolor : "black",
	_wiring: true,
	_drawing : false,
	_dragging : false,
	_labeloffset : [],
	_clicktimeout : 0,
	_load : function(){
		this._anchura = $("#"+CSim.contenedor).width();
		this._altura = $("#"+CSim.contenedor).height();
		
		//TODO: incluir elemento contenedor si no existe
		this._contenedor=document.getElementById(CSim.contenedor);

		this._stage = new Kinetic.Stage({
			container: this._contenedor.id,
			width: this._anchura,
			height: this._altura
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
		
		this._backgroundlayer.on("click", CSimCanvas._deselectAll);
		this._createIconsGroup();
		//this._setContextMenu();
	},
	_dibujarMalla : function(){
		var fondo = new Kinetic.Rect({
			x: 0,
			y: 0,
			width: this._anchura,
			height: this._altura,
			fill: "white",
			stroke: "black",
			strokeWidth: 4
		});
		this._backgroundlayer.add(fondo);		 
		
		for (var i=this.malla; i<this._anchura; i+=this.malla){
			for (var j=this.malla; j<this._altura; j+=this.malla){	
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
	_createIconsGroup : function(){
		var imgloaded = 0;
		
		var icondelete = new Image();
		icondelete.onload = function() {
			icon_d = new Kinetic.Image({
				x: -CSimCanvas.elemsize/2,
				y: CSimCanvas.elemsize/2-CSimCanvas.iconsize,
				image: icondelete,
				width: CSimCanvas.iconsize,
				height: CSimCanvas.iconsize,
			});
			icon_d.on("click", function(){
				CSim._selectedelem._delete();
			});
			imgloaded++;
		};
		icondelete.src = "img/icon_delete2.png";
		
		var iconrotate = new Image();
		iconrotate.onload = function() {
			icon_r = new Kinetic.Image({
				x: -CSimCanvas.elemsize/2+50,
				y: CSimCanvas.elemsize/2-CSimCanvas.iconsize,
				image: iconrotate,
				width: CSimCanvas.iconsize,
				height: CSimCanvas.iconsize,
			});
			icon_r.on("click", function(){
				CSim._selectedelem._rotate();
			});
			imgloaded++;
		};
		iconrotate.src = "img/icon_rotate2.png";
		
		var iconedit = new Image();
		iconedit.onload = function() {
			icon_e = new Kinetic.Image({
				x: -CSimCanvas.elemsize/2+25,
				y: CSimCanvas.elemsize/2-CSimCanvas.iconsize,
				image: iconedit,
				width: CSimCanvas.iconsize,
				height: CSimCanvas.iconsize,
			});
			icon_e.on("click", function(){
				CSimEditor._show(CSim._selectedimg);
			});
			imgloaded++;
		};
		iconedit.src = "img/icon_edit2.png";
		
		var waitforicons = setInterval(function(){
			if (imgloaded==3){ 
				CSimCanvas._iconsGroup = new Kinetic.Group({
					x: 0,
					y: 0,
					offset: [-3, 3]
				});
				CSimCanvas._iconsGroup.add(icon_d);
				CSimCanvas._iconsGroup.add(icon_e);
				CSimCanvas._iconsGroup.add(icon_r);

				CSimCanvas._iconsGroup.on("mouseenter", function(){
					clearTimeout(waitout);
				});	

				CSimCanvas._circuitlayer.add(CSimCanvas._iconsGroup);				
				clearInterval(waitforicons);
			}
		}, 100);
	},
	_initListeners : function(){
		this._stage.on('mousedown touchstart', this._mousedown);
		this._stage.on('mousemove touchmove', this._mousemove);
		this._stage.on('mouseup touchend', this._mouseup);
	},
	_addWire: function(wire){
		var wireimage = new Kinetic.Line({
			points: [wire._x0, wire._y0, wire._x1, wire._y1],
	        stroke: CSimCanvas.wirecolor,
	        strokeWidth: CSimCanvas.cablewidth,
	        lineCap: 'round',
	        lineJoin: 'round'
	    });		
		
		wireimage.setAttr("wire", wire);
		wire.image = wireimage;
		wireimage.on("click", wire._select);
		CSimCanvas._circuitlayer.add(wireimage);
		CSimCanvas._circuitlayer.draw();	
	},
	_addElement : function(elem){
		var imageObj = new Image();
		imageObj.name = elem._name;
		imageObj.onload = function(e) {
			var elem = CSim._elements[e.target.name];
			var image = new Kinetic.Image({
				x: elem._x,
				y: elem._y,
				image: imageObj,
				width: CSimCanvas.elemsize,
				height: CSimCanvas.elemsize,
				offset: [CSimCanvas.elemsize/2, CSimCanvas.elemsize/2],
				rotation: elem._rotation,
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
			image.on("mouseover", function(){CSimCanvas._onOverImage(image);});
			image.on("mouseleave", CSimCanvas._onOutImage );
			
			CSimCanvas._circuitlayer.add(image);
			CSimCanvas._stage.add(CSimCanvas._circuitlayer);
			
			CSimCircuit._clearSolution(); //
			CSimCircuit._mostrarnodos(); //
			
			CSimCanvas._onOverImage(image);
		};
		imageObj.src = "img/"+elem._type+".png";
	},
	_getcoordinates : function (ev){
			try{
				if( $.support.touch && event.touches.item(0) != null) 
					ev = event.touches.item(0);
				
			}catch(e){ console.error(e); }
			
			return [ev.clientX - $("#"+CSim.contenedor).position().left,
					ev.clientY - $("#"+CSim.contenedor).position().top];
	},
	_ajustaramalla : function (p){
			return [Math.round(p[0]/CSimCanvas.malla)*CSimCanvas.malla,
					Math.round(p[1]/CSimCanvas.malla)*CSimCanvas.malla];
	},
	_mousedown : function (ev){
		if ( ! CSimCanvas._wiring ){ return; }
		
		var p = CSimCanvas._getcoordinates(ev);	
		p = CSimCanvas._ajustaramalla( p );
		var x = p[0]; var y = p[1];
		
		CSimCanvas._drawing = true;
		CSimCanvas._dir = "";
		
		x0 = x1 = x2 = x; 
		y0 = y1 = y2 = y;
		
		CSimCanvas._drawinglayer = new Kinetic.Layer();
		
		CSimCanvas._templine = new Kinetic.Line({
			points: [x0, y0, x0, y0],
	        stroke: CSimCanvas.wirecolor,
	        strokeWidth: CSimCanvas.cablewidth,
	        lineCap: 'round',
	        lineJoin: 'round'
	    });
		CSimCanvas._templine.hide();
		
	    CSimCanvas._drawinglayer.add(CSimCanvas._templine); 
		CSimCanvas._stage.add(CSimCanvas._drawinglayer);
		
	},
	_mousemove : function (ev){
		
		if (CSimCanvas._drawing){
		
			var p = CSimCanvas._getcoordinates(ev);
			p = CSimCanvas._ajustaramalla( p );
			var x = p[0]; var y = p[1];
			
			if (CSimCanvas._dir == "" && Math.abs(x-x0) + Math.abs(y-y0) > 3*CSimCanvas.malla)
				(Math.abs(x-x0)>2*CSimCanvas.malla) ? CSimCanvas._dir = "horizontal" : CSimCanvas._dir = "vertical";
			
			switch (CSimCanvas._dir){
				case "horizontal":
					x1 = x; y1 = y0;
					break;
				case "vertical":
					x1 = x0; y1 = y;
					break;
				default:
					if (Math.abs(x-x0) > Math.abs(y-y0)){
						x1 = x;	y1 = y0;
					} else {
						x1 = x0; y1 = y;
					}
					break;
			}	
			x2 = x;	y2 = y;
				
			CSimCanvas._templine.setAttr("points", [x0, y0,	x1, y1,	x2, y2]);
			CSimCanvas._templine.show();
			CSimCanvas._drawinglayer.draw();
		}
	},
	_mouseup : function (ev){
		
		var p = CSimCanvas._getcoordinates(ev);
		p = CSimCanvas._ajustaramalla(p);
		
		if (CSimCanvas._drawing){

			if ( x0 != x1 || y0 != y1)
				new CSimWire(x0, y0, x1, y1);
				
			if ( x1 != x2 || y1 != y2)
				new CSimWire(x1, y1, x2, y2);
				
			CSimCanvas._drawing = false;
			CSimCanvas._drawinglayer.remove();	

			CSimCircuit._clearSolution();
			CSimCircuit._mostrarnodos();			
		}
	},
	_clearSolution : function(){
		CSimCanvas._solutionlayer.remove();
		CSimCanvas._solutionlayer = new Kinetic.Layer();
		CSimCanvas._stage.add(CSimCanvas._solutionlayer);
	},
	_showSolution : function(){
		CSimCanvas._solutionlayer.remove();
		CSimCanvas._solutionlayer = new Kinetic.Layer();
		CSimCanvas._stage.add(CSimCanvas._solutionlayer);
		
		var nsources = CSimCircuit._numnodes;
		
		for (var i=0; i<CSimCircuit._netlist.length; i++){
		
			var elemname = CSimCircuit._netlist[i][0];
			var elem = CSimCircuit._elements[elemname];
			var labelpos = elem._father._getLabelPosition();
			
			switch(elem._type){
				case "R":
					var valr = CSimCircuit._netlist[i][3];
					var valv = CSimCircuit._significantDigits(CSimCircuit._solution[CSimCircuit._netlist[i][1]]-CSimCircuit._solution[CSimCircuit._netlist[i][2]], 4);
					var vali = CSimCircuit._significantDigits(valv / CSimCircuit._netlist[i][3], 4);
					var soltext = "I=" + vali + "  ∆V=" + valv;
					break;
				case "V":
					var valv = CSimCircuit._netlist[i][3];
					var vali = CSimCircuit._solution[nsources];
					nsources++;
					var soltext = "I=" + vali;
					break;				
				default:
					var soltext = "";
					break;
			}
			
			var text = new Kinetic.Text({
				x: labelpos[0],
				y: labelpos[1]-20,
				text:  soltext,
				fontSize: 18, //TODO ajustar a tamaño pantalla
				fontFamily: 'calibri',
				fontStyle: 'bold',
				fill: 'darkblue',
				draggable: true
			});
			text.on('mousedown dragstart', function(){
				CSimCanvas._wiring = false;
			});
			text.on('mouseup dragend', function(){
				CSimCanvas._wiring = true;
			});	
			
			CSimCanvas._solutionlayer.add(text);
		}
		CSimCanvas._solutionlayer.draw();
	},
	_onDrop : function(e,ui){
		
	  	var id = ui.draggable.context.id;
	  		if(id.indexOf('menu') < 0) return true;
	  	
		var mpos = [e.clientX, e.clientY];
		var ipos = ui.helper.offset();
		var offset = [mpos[0]-ipos.left-CSimCanvas.elemsize/2+CSimCanvas.malla, mpos[1]-ipos.top-CSimCanvas.elemsize/2+CSimCanvas.malla];
		
		e.preventDefault();
	  	
	  	var pos = CSimCanvas._getcoordinates(e);
		pos = CSimCanvas._ajustaramalla( [ pos[0] - offset[0], pos[1] - offset[1] ] );
	  	
	  	var type = id.substr(id.indexOf('_')+1, id.length);
		switch (type){
			case 'Ireal':
				elem = new CSimElementIreal(pos);
				break;
				
			case 'G':
				elem = new CSimElementG(pos); //
				break;
			case 'Switch':
				elem = new CSimElementSwitch(pos);
				break;
			default:
				elem = new CSimElement(pos);
		};
		elem._create( type );
	},
	_onOverImage : function(img){
		CSimCanvas._setWiring(false);
		CSim._selectedimg = img;
		CSim._selectedelem = CSim._selectedimg.getAttr("elem");
		CSim._selectedimg.setAttr("strokeEnabled", true);

		CSimCanvas._iconsGroup.setAttr("x", CSim._selectedimg.getAttr("x"));
		CSimCanvas._iconsGroup.setAttr("y", CSim._selectedimg.getAttr("y"));
		CSimCanvas._iconsGroup.moveToTop();
		CSimCanvas._iconsGroup.show();

		CSimCanvas._circuitlayer.draw();
	},
	_onOutImage : function(){
		waitout = setTimeout(function(){
			// CSimCanvas._wiring = true;
			// if (CSim._selectedimg != "") CSim._selectedimg.setAttr("strokeEnabled", false);
			// CSimCanvas._iconsGroup.hide();
			// CSimCanvas._circuitlayer.draw();
			// CSim._selectedimg = "";
			// CSim._selectedelem = "";
			CSimCanvas._deselectAll();
		}, 20);
	},
	_setWiring : function(toogle){ this._wiring = toogle; },
	_updateLabel : function(elem){
		elem.label.setAttr("text", elem._name + " = " + elem._value + CSim.elemDef[elem._type].symbol);
		CSimCanvas._labellayer.draw();
	},
	_rotate : function(){
	 	CSimEditor.elem.image.rotate(Math.PI/2);
		CSimCanvas._circuitlayer.draw();
	},
	_deselectAll : function (){
		CSim._selectedimg = "";
		CSim._selectedelem = "";
		CSim._selectedwire = "";
		CSimCanvas._wiring = true;
		
		for (var i in CSim._elements){
			CSim._elements[i].image.setAttr("strokeEnabled", false);
		}
		for (var i in CSim._wires){
			CSim._wires[i].image.setAttr("stroke", "black");
		}
		
		CSimCanvas._iconsGroup.hide();
		CSimCanvas._circuitlayer.draw();
	}
}
CSimCircuit = {
	_elements : [],
	_init : function (){
		this._elementdrag = false;
		this._mostrandonodos = false;
		this._tipoelemento = "w";
		this._groundnode = "";
		
		this._matrizcables = [];
		this._matrizcircuito = [];
		this._matriznodos = [];
	
		this._netlist = [];
		
		this._numelemarray = [];
		this._elemtypes = "RVCI";
	
		this._numelemtotal = 0;
		this._numnodes = 0;
	
		this._xmin = 10000;
		this._ymin = 10000;
		this._xmax = 0;
		this._ymax = 0;
		
		this._solution = "";
		this._inicialiazarmatrices();
	},
	_inicialiazarmatrices : function (){
		for (var i=0; i<CSimCanvas._anchura*2/CSimCanvas.malla; i++){
			this._matrizcables[i] = [];
			this._matrizcircuito[i] = [];
			this._matriznodos[i] = [];
			for (var j=0; j<CSimCanvas._altura*2/CSimCanvas.malla; j++){	
				this._matrizcables[i][j] = ".";
				this._matrizcircuito[i][j] = ".";
				this._matriznodos[i][j] = ".";
			}
		}
	},
	_addtomatrix : function (x0, y0, xf, yf, tipo, matriz){
		for (var i=Math.min(x0,xf)*2/CSimCanvas.malla; i<=Math.max(x0,xf)*2/CSimCanvas.malla; i++){
			for (var j=Math.min(y0,yf)*2/CSimCanvas.malla; j<=Math.max(y0,yf)*2/CSimCanvas.malla; j++){
				matriz[i][j] = tipo;
			}
		}
		this._xmin = Math.min(this._xmin, x0, xf);
		this._ymin = Math.min(this._ymin, y0, yf);
		this._xmax = Math.max(this._xmax, x0, xf);
		this._ymax = Math.max(this._ymax, y0, yf);
	},
	_solve : function(){
		with ( CSimCircuit ) {
			_addwirestomatrix();
			_addelementstomatrix();
			_encontrarnodos();
			_generarnetlist();
			
			if(_everythingfine){
				_mostrarmatriznodos();//test
				_solveMNA(_netlist);
				_mostrarnodos();
				console.debug(this._solution);
			}else
				CSim.onError('no se ha encontrado solución.');
		}
		if(CSimCircuit._everythingfine)
			CSimCanvas._showSolution();
		
	},
	_foreachGrid : function( onEachPoint, onEachRow ){
		for (var j=this._ymin*2/CSimCanvas.malla; j<=this._ymax*2/CSimCanvas.malla; j++){	
			for (var i=this._xmin*2/CSimCanvas.malla; i<=this._xmax*2/CSimCanvas.malla; i++){
				onEachPoint(i,j);
			}
			if (onEachRow != null ) onEachRow(j);
		}
	},
	_addwirestomatrix : function (){
		
		this._foreachGrid (function(i,j){
			CSimCircuit._matrizcables[i][j] = ".";
		});
		
		for (var w in CSim._wires){
			var wire = CSim._wires[w];
			CSimCircuit._addtomatrix(wire._x0, wire._y0, wire._x1, wire._y1, 'w', CSimCircuit._matrizcables);
		}
	},
	_addelementstomatrix : function (){
	
		this._groundnode = "";	
		CSim._resetCounters();
		
		this._foreachGrid (function(i,j){
			CSimCircuit._matrizcircuito[i][j] = CSimCircuit._matrizcables[i][j];
		});
		
		for (var i in CSim._elements){
			var elem = CSim._elements[i];		
			elem._getelemcoordinates();		
			elem._addElement();		
			if (elem._type == "V" && this._groundnode == ""){
				this._groundnode = {x: xf, y: yf};	
			}
		}
	},
	_mostrarnodos : function (){
		this._mostrandonodos = true;
		this._addwirestomatrix();
		this._addelementstomatrix();
		this._encontrarnodos();
		
		CSimCanvas._nodeslayer.remove();
		CSimCanvas._nodeslayer = new Kinetic.Layer();
		
		var nodosmostrados = [];
		
		this._foreachGrid ( function(i,j) {
			
				var nodenumber = CSimCircuit._matriznodos[i][j];
				
				var str = (CSimCircuit._solution == "") ? nodenumber : "(" + CSimCircuit._solution[nodenumber] + "V)";
				if (typeof nodenumber == "number" && nodosmostrados.indexOf(nodenumber) < 0){
					var text = new Kinetic.Text({
						x: i*CSimCanvas.malla/2+2,
						y: j*CSimCanvas.malla/2+1,
						text: str,
						fontSize: 15,
						fontFamily: 'calibri',
						fontStyle: 'bold',
						fill: 'darkgreen'
					});
					CSimCanvas._nodeslayer.add(text);
					nodosmostrados.push(nodenumber);
				}
		});
		CSimCanvas._stage.add(CSimCanvas._nodeslayer);
		CSimCanvas._nodeslayer.draw();
	},
	
	_generarnetlist : function (){
		
		this._netlist = [];
		this._everythingfine = true;
		
		for (var i in CSim._elements){
			if (CSim._elements[i]._celements.length > 0)
				CSim._elements[i]._generateNetlist();
		}
		
		//comprobar conectividad
		var conected = 0;
		for (var i=0; i<this._numnodes; i++){
			var conected = 0;
			for (var j=0; j<this._netlist.length; j++){
				if (this._netlist[j][1] == i || this._netlist[j][2] == i) conected++;
			}
			if (conected < 2) this._everythingfine = false;	
		}
		if (!this._everythingfine) CSim.say("el circuito está abierto", 'error');
	},
	
	_nearestnode : function (i, j){

		if (typeof this._matriznodos[i-1][j] == "number"){
			return this._matriznodos[i-1][j];
			
		} else if (typeof this._matriznodos[i+1][j] == "number"){
			return this._matriznodos[i+1][j];
			
		} else if (typeof this._matriznodos[i][j-1] == "number"){
			return this._matriznodos[i][j-1];
			
		} else if (typeof this._matriznodos[i][j+1] == "number"){
			return this._matriznodos[i][j+1];
			
		} else {
			this._everythingfine = false;
		}
	},

	_encontrarnodos : function(){

		var nodetemp = 0;
		var node = 0;
		var temptoreal = [];
	
		this._foreachGrid ( function(i,j){
			CSimCircuit._matriznodos[i][j] = CSimCircuit._matrizcircuito[i][j];
		});
		
		this._foreachGrid ( function(i,j){
			
			if( CSimCircuit._matriznodos[i][j] == "w"){
			
				var vtop = CSimCircuit._matriznodos[i][j-1];	
				var vleft = CSimCircuit._matriznodos[i-1][j];
			
				if (vtop=="." && vleft=="."){
					CSimCircuit._matriznodos[i][j] = nodetemp;
					temptoreal[nodetemp]= nodetemp;
					nodetemp ++;
				}
				
				if (vtop=="." && typeof vleft == "number"){
					CSimCircuit._matriznodos[i][j] = vleft;
				}
				
				if (vleft=="." && typeof vtop == "number"){
					CSimCircuit._matriznodos[i][j] = vtop;
				}
				
				if (typeof vtop == "number" && typeof vleft == "number"){
					
					if (vtop==vleft){
						CSimCircuit._matriznodos[i][j] = vtop;
						
					}else {
						CSimCircuit._matriznodos[i][j] = nodetemp;
						
						for (var k=0; k<nodetemp; k++){
							if (k!=vtop && k!=vleft && (temptoreal[k]==temptoreal[vtop] || temptoreal[k]==temptoreal[vleft])){
								temptoreal[k]=nodetemp;
							}
						}						
						temptoreal[nodetemp]=nodetemp;
						temptoreal[vtop]=nodetemp;
						temptoreal[vleft]=nodetemp;
						nodetemp++;
					}
				}				
				if (CSimCircuit._elemtypes.indexOf(vtop[0]) != -1 || CSimCircuit._elemtypes.indexOf(vleft[0]) != -1){
					CSimCircuit._matriznodos[i][j] = nodetemp;
					temptoreal[nodetemp]=nodetemp;		
					nodetemp ++;			
				}
			}			
		});
		
		for (var i=0; i<nodetemp; i++){
			var nodoocupado = false;
			
			for (var j=0; j<nodetemp; j++){
				if (temptoreal[j]==i){
					temptoreal[j]=node;
					nodoocupado = true;
				}
			}
			if (nodoocupado){node++;}
		}
	
		if (this._groundnode != ""){
			var gcel = this._matriznodos[this._groundnode.x*2/CSimCanvas.malla]
										[this._groundnode.y*2/CSimCanvas.malla];
			
			if (typeof gcel == "number"){
				var gnode = temptoreal[gcel];
			
				for (var j=0; j<nodetemp; j++){
					if (temptoreal[j]==0){
						temptoreal[j]=gnode;
					} else if (temptoreal[j]==gnode){
						temptoreal[j]=0;
					}
				}	
			}			
		}
		
		this._foreachGrid ( function(i,j){
			if (typeof CSimCircuit._matriznodos[i][j] == "number"){
				CSimCircuit._matriznodos[i][j] = temptoreal[CSimCircuit._matriznodos[i][j]] ;
			}
		});
		
		this._numnodes = node;
	},
	
	_solveMNA : function (netlist){
		console.debug('solveMNA started -- please be patient.');//z
		var tic = new Date().getTime();//z
		
		var nl = $M(eval(netlist));
		
		var numElem = 0; 	// Number of passive elements.
		var numV = 0;		// Number of independent voltage sources
		var numO= 0;		// Number of op amps
		var numI = 0;		// Number of independent current sources
		var numNode = 0;	// Number of nodes, not including ground (node 0)
		
		var Elements = [];
		var Vsources = [];
		var Isources = [];
			
		for (i=0;i<nl.rows();i++){
			switch(nl.elements[i][0].charAt(0)){
				case 'R':
					console.info('read '+nl.elements[i][0]);
					Elements[numElem] = {};
						Elements[numElem].name = nl.elements[i][0];
						Elements[numElem].node1 = nl.elements[i][1];
						Elements[numElem].node2 = nl.elements[i][2];
						Elements[numElem].value = nl.elements[i][3];
					numElem ++;
					break;
				
				case 'C':
				case 'L':
					throw new Error('L & C are not supported yet'); //pendiente
					break;
				case 'V':
					Vsources[numV] = {};
						Vsources[numV].name = nl.elements[i][0];
						Vsources[numV].node1 = nl.elements[i][1];
						Vsources[numV].node2 = nl.elements[i][2];
						Vsources[numV].value = nl.elements[i][3];
					numV ++;
					break;
				case 'O':
					throw new Error('op amps are not supported yet'); //pendiente
					break;
				case 'I':
					Isources[numI] = {};
						Isources[numI].name = nl.elements[i][0];
						Isources[numI].node1 = nl.elements[i][1];
						Isources[numI].node2 = nl.elements[i][2];
						Isources[numI].value = nl.elements[i][3];
					numI ++;
					break;
				default:
					throw new Error('unsupported element ' + nl.elements[i][0] );
			}
			
			numNode = Math.max(nl.elements[i][1], Math.max(nl.elements[i][2], numNode) );
		}
		
		//Preallocate all of the cell arrays #############################################
		G = Matrix.Zero(numNode, numNode);
		V = [];
		I = Matrix.Zero(numNode,1);
		if ((numV + numO) != 0){
			B = Matrix.Zero(numNode, numV+numO); 
			C = Matrix.Zero(numV+numO, numNode);
			D = Matrix.Zero(numV+numO, numV+numO);
			E = Matrix.Zero(numV+numO, 1);
			J = [];
		}
		// -------------------------------------------------------------------------------
		
		//Fill the G matrix #############################################################
		//fill with conductances from netlist
		for (i=0; i<numElem;i++){
			n1 = Elements[i].node1;
			n2 = Elements[i].node2;
			switch ( Elements[i].name.charAt(0) ){
				case 'R':
					g = 1 / Elements[i].value;
					break;
					//TODO: incluir L y C
			}
			
			//if neither side of the element is connected to ground, then substract it 
			//from the appropiate location in matrix
			if ( n1!=0 && n2!=0 ){
				G.elements[n1-1][n2-1] = G.elements[n1-1][n2-1] - g;
				G.elements[n2-1][n1-1] = G.elements[n2-1][n1-1] - g;
			}
			
			//If node 1 is *NOT* connected to ground, add element to diagonal of matrix
			if (n1!=0)
				G.elements[n1-1][n1-1] = G.elements[n1-1][n1-1] + g;
				
			//Idem for node2
			if (n2!=0)
				G.elements[n2-1][n2-1] = G.elements[n2-1][n2-1] + g;
			
		}
		//G matrix is finished ---------------------------------------------------
		
		//Fill the I matrix
		for (j=0;j<numNode;j++){
			for (i=0;i<numI;i++){
				if ( Isources[i].node1 == j )
					I.elements[j] -= Isources[i].value;
				else if ( Isources[i].node2 == j )
					I.elements[j] += Isources[i].value;
			}
		}
		//Fill the V matrix ##############################################
		for (i=0;i<numNode;i++)
			V[i] = 'v_'+(i+1); // *** añadido el '+1', el elemento en la posición i representa el nodo i+1, ya que no cuenta el 0, tierra ***
		
		if ( ( numV + numO ) != 0 ){
			//Fill the B matrix
			//first handle the case of the independent voltage sources
			for (i=0; i<numV; i++){
				for(j=0; j<numNode; j++){
					if ( Vsources[i].node1 - 1 == j )
						B.elements[j][i] = 1;
					else if (Vsources[i].node2 - 1 == j)
						B.elements[j][i] = -1;
				}
			}
			// TODO: Now handle the case of the Op Amp
			
			//Fill the C matrix ####################################################
			for (i=0; i<numV; i++){
				for (j=0; j<numNode; j++){
					if ( Vsources[i].node1 - 1 == j )
						C.elements[i][j] = 1;
					else if ( Vsources[i].node2 - 1 == j )
						C.elements[i][j] = -1;
				}
			}
			//TODO: now handle the case of the Op Amp
			
			//Fill the D matrix ###################################################
			//The D matrix is non-zero only for CCVS and VCVS (not included in this
			//simple implementation of SPICE)
			
			//Fill the E matrix ###################################################
			
			for (i=0;i<numV;i++){
				E.elements[i][0] = Vsources[i].value;
			}
			
			//Fill the J matrix ###################################################
			for ( i=0;i<numV;i++){
				J[i] = 'I_'+Vsources[i].name;
			}
				//TODO: op amps
			//The J matrix is finished --------------------------------------------
		}
		
		//Form the A, X and Z matrices
		if ( ( numV + numO ) != 0 ){
			Aux1 = C.augment(D);
			A = G.augment(B);
			
			for(i=0;i<Aux1.rows();i++)
				A.elements[A.rows()] = Aux1.elements[i];
				
			X = V;
			for(i=0;i<J.length;i++)
				X[X.length] = J[i];
				
			Z = I.dup();
			for(i=0;i<E.rows();i++)
				Z.elements[Z.rows()] = E.elements[i];
		
		}else{
			A = G.dup();
			X = V;
			Z = I.dup();
		}
		
		CSim.say('A = '+A.inspect(),'debug');
		CSim.say('X = ['+X+']','debug');
		CSim.say('Z = '+Z.inspect(),'debug');
	
		
		if (A.rank() == A.rows()){
			this.Xsol = A.inv().x(Z);
			
			CSim.say('<b>['+X+']</b> = '+this.Xsol.inspect() , 'debug' );
			
			CSim.say('solved in '+Math.round( new Date().getTime() - tic ) + 'ms.' , 'debug' );
			
			this._solution = [0];
			for (var i=0; i<this.Xsol.elements.length; i++){
				this._solution.push(CSimCircuit._significantDigits(this.Xsol.elements[i][0], 4));
			}
		}else
			CSim.onError('A is singular!! A.rank()='+A.rank()+' < A.rows()='+A.rows());
	
	},
	_clearSolution : function(){
		CSimCanvas._clearSolution();
		CSimCircuit._solution = "";
	},
	_mostrarmatriznodos : function(){
			this._addwirestomatrix();
			this._addelementstomatrix();
			this._encontrarnodos();
			var str = "\n";
			this._foreachGrid ( function(i,j){
				(CSimCircuit._matriznodos[i][j] == ".") ? str += " " : str += CSimCircuit._matriznodos[i][j].toString().charAt(0);
			}, function(i){
				str += "\n";
			});
			console.log(str);
	},
	_mostrarmatrizcircuito : function(){
			var str = "\n";

			this._foreachGrid ( function(i,j){
				(this._matrizcircuito[i][j] == ".") ? str += " " : str += this._matrizcircuito[i][j];
			}, function(i){
				str += "\n";
			});
			console.log(str);
	},
	_saveCircuit : function(){
		var wirelist = [];
		for (var w in CSim._wires)
			wirelist.push([CSim._wires[w]._x0, CSim._wires[w]._y0, CSim._wires[w]._x1, CSim._wires[w]._y1]);
		
		var elemlist = [];
		for (var i in CSim._elements) 
			elemlist.push([CSim._elements[i]._type, CSim._elements[i]._name, CSim._elements[i]._value, CSim._elements[i]._rotation, CSim._elements[i]._x, CSim._elements[i]._y]); //TODO: add rotation
			
		var jsonelemlist = JSON.stringify(elemlist);
		var jsonwirelist = JSON.stringify(wirelist);

		var jsonobject = {
			"wires": jsonwirelist,
			"elements": jsonelemlist,
			"xmin": CSimCircuit._xmin,
			"xmax": CSimCircuit._xmax,
			"ymin": CSimCircuit._ymin,
			"ymax": CSimCircuit._ymax
		}
		var jsonstring = JSON.stringify(jsonobject);
		
		$.post("savejson.php", {json: jsonstring})
		.done(function(){
			CSim.say("Circuito guardado en 'circuit.json'");
		});
	},
	_loadCircuit : function(){
		$.ajax({dataType: 'json', url: 'loadjson.php', async: false,})
		.done(function(data) {
			CSim.deleteAll();
			CSimCircuit._xmin = data.xmin;
			CSimCircuit._xmax = data.xmax;
			CSimCircuit._ymin = data.ymin;
			CSimCircuit._ymax = data.ymax;
			
			var wirelist = JSON.parse(data.wires);
			for (var i=0; i<wirelist.length; i++)
				new CSimWire(wirelist[i][0], wirelist[i][1], wirelist[i][2], wirelist[i][3]); //points
				
			var elemlist = JSON.parse(data.elements);
			for (var i=0; i<elemlist.length; i++){
				var newelem = new CSimElement([elemlist[i][4], elemlist[i][5]]); //pos
				newelem._create(elemlist[i][0], elemlist[i][1], elemlist[i][2], elemlist[i][3]); // type,name,value,rotation
			}	
			setTimeout(function(){
				CSimCanvas._deselectAll();
				CSim.say("Circuito cargado de 'circuit.json'");
			}, 1000);
		});
	},
	_significantDigits : function(n, digits){
		n = Math.round(n*Math.pow(10,7))/Math.pow(10,7);
		if (n == 0) return 0;
		var sign = Math.abs(n)/n;
		var intdigits = Math.ceil( Math.log(Math.abs(n)) / Math.LN10 );
		var factor = Math.pow(10, digits-intdigits);
		return Math.round(n*factor)/factor;
	}
}
CSimCircuitElement = function( type , father , value){
	this._type = type;
	this._name = type+CSim.elemDef[type]['counter'];
	this._node1 = null;
	this._node2 = null;
	this._father = father;
	this._value = value;
	
	CSim.elemDef[type]['counter']++;
	CSimCircuit._elements[this._name] =  this;
}