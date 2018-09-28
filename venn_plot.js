module.id='venn_plot';
require('../../lib/stdlib.array.js');
require('../../lib/stdlib.SVGElement.js');
var extend=require('util')._extend;

/**
* plot venn based on html svg
* @constructs self_mod
* @param {DOM} dom - DOM of this view
* @param {Object} args
*/
function self_mod(dom,args){
	// args is css settings for jquery
	this.doms={body:dom};
	this.args = extend({
		min_length:300,
		margin:10,
		color:['#CCCC00','#006600','#990099','#0000FF'],
		style_bt:{stroke:'#09ABF7',fill:'#F5EA69'}
	},args);
	this.data = {};
	this._init_();
}
module.exports = self_mod;
/**
* init render
*/
self_mod.prototype._init_ = function(){
	// create init svg
	this.doms.svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
	this.doms.body.appendChild(this.doms.svg);
	this.dom_event(this.doms.svg);
}
/**
* add event of svg(including button click event)
* @param {SVG} svg - svg DOM of venn plot
*/
self_mod.prototype.dom_event = function(svg){
	// add click function on btn_sel
	svg.addEventListener('onclick',function(e){
		var cl = e.target.classList;
		if(cl.contains("btn_sel")){
			var sel_bool = cl.contains("selected");
			e.target.style['fill-opacity'] = !sel_bool;
			cl.toggle("selected");
		}
	});
}
/**
* load data by user
* @param {object} data - including names(group name) and items(array of string arrays)
*/
self_mod.prototype.load_data = function(data){
	// data:{name:,items:}
	extend(this.data,data);
	this.data.diff = this.diff_count(data);
	return this.render();
}
/**
* count differences of each string array
* @param {object} data - including names(group name) and items(array of string arrays)
* @returns {object} names and items of diff string arrays
*/
self_mod.prototype.diff_count = function(data){
	var len_d = data.items.length,
		set_total=[],
		g_temp,
		inds_d = data.items.range(),
		i_names_g,
		d_names_g,
		ret={names:[],items:[],ind_g:[]};
	while(len_d){
		// use group ind list to count
		inds_d.ncombine(len_d).map(function(t_inds_g){
			// get intersection of each item array and finally diff with previous items
			g_temp = data.items[t_inds_g[0]];
			if(t_inds_g.length!=1){
				g_temp = g_temp.intersect.apply(g_temp,t_inds_g.slice(1).map(function(v){
					return data.items[v];
				}))
			}
			g_temp = g_temp.diff(set_total);
			// push into ret.items and set_total
			ret.items.push(g_temp);
			set_total = set_total.concat(g_temp);
			// generate name
			i_names_g = t_inds_g.map(function(v){return data.names[v]}).join(' ∩ ');
			d_names_g = inds_d.diff(t_inds_g).map(function(v){return data.names[v]}).join(' ∪ ');
			ret.names.push(i_names_g + (d_names_g.length ? ' not '+d_names_g : ''));
			ret.ind_g.push(t_inds_g);
		});
		--len_d;
	}
	return ret;
}
/**
* count layout info and adjust svg layout
* @param {int} len_g - group length of input data
*
*/
self_mod.prototype.layout_count = function(){
	var dim_len = this.args.dim_svg = Math.min(this.doms.body.clientWidth,this.doms.body.clientHeight);
	var t_len = dim_len-this.args.margin*2;
	this.args.dim_bt = [t_len/8,t_len/10,5];
	var len_g = this.data.items.length;
	return len_g==4 ? this.layout_rect() : this.layout_circle(len_g);
}
/**
* count layout info for group < 4
* @param {int} len_g - group size
* @returns {object} layout including r,ct,ct_n,item
*/
self_mod.prototype.layout_circle = function(len_g){
	var t_len = this.args.dim_svg-this.args.margin*2;
	var r = t_len/3;
	var sr = r/2;
	var loci_c=[[r,r],[2*r,r],[3*sr,2*r]];
	var loci_n=[[r,30],
				[2*r,30],
				[3*sr,3*r]];//count name location
	var loci_num=[[sr, r],
					[5*sr, r],
					[3*sr,5*sr],
					[3*sr,0.75*r],
					[2*r,3.5*sr],
					[r,3.5*sr],
					[3*sr, 2.7*sr]];//number location
	var diff_ind = {
		2:[3,0,1],
		3:[6,3,5,4,0,1,2]
	};// intersection rigon
	return {
		r:r,
		ct: loci_c.slice(0,len_g),
		ct_n: loci_n.slice(0,len_g),
		item: diff_ind[len_g].map(function(v){return loci_num[v]})
	};
}
/**
* count layout info for group = 4
* @returns {object} layout including r,ct,ct_n,item
*/
self_mod.prototype.layout_rect = function(){
	var t_len = this.args.dim_svg-this.args.margin*2;
	var c = t_len/6;
	var s_2 = Math.sqrt(2);
	var sc = c/(2*Math.sqrt(2));
	var loci_c=[[0,0],[c,0],[0,0],[c,0]];
	var loci_n=[[2*c-sc,t_len],[2*c-sc,30],[5*c-sc,30],[5*c-sc,t_len]];
	var t_loci = [3*c+0.5*sc,4*c-0.5*sc];
	var loci_num=[t_loci,
		[t_loci[0]-2*sc,t_loci[1]-2*sc],
		[t_loci[0]+2*sc,t_loci[1]+2*sc],
		[t_loci[0]-2*sc,t_loci[1]+2*sc],
		[t_loci[0]+2*sc,t_loci[1]-2*sc],
		[t_loci[0]-4*sc,t_loci[1]-4*sc],
		[t_loci[0]-4*sc,t_loci[1]],
		[t_loci[0],t_loci[1]+4*sc],
		[t_loci[0],t_loci[1]-4*sc],
		[t_loci[0]+4*sc,t_loci[1]],
		[t_loci[0]+4*sc,t_loci[1]-4*sc],
		[t_loci[0]-6*sc,t_loci[1]-2*sc],
		[t_loci[0]-2*sc,t_loci[1]-6*sc],
		[t_loci[0]+2*sc,t_loci[1]-6*sc],
		[t_loci[0]+6*sc,t_loci[1]-2*sc],
	];
	return {
		c:c,
		rw:2*c,
		rh:3*c*s_2,
		ct: loci_c,
		ct_trans: [[c/4,3*c],[4*c, 5*c/6]],
		ct_n: loci_n,
		item: loci_num
	};
}
/**
* control diff button event by this single function
* @param {object} e - event object from EventListener
*/
self_mod.prototype.bt_event = function(e){
	var self=this,
		t_sty = e.target.style,
		t_ind = parseInt(e.target.getAttribute('data-id'));
	if(e.type == 'mouseenter'){
		t_sty.strokeWidth=3;
		self.data.diff.ind_g[t_ind].map(function(v){
			self.doms.g_text[v].style.fontWeight='bold';
		});
	}else if(e.type == 'mouseleave'){
		t_sty.strokeWidth=1;
		self.data.diff.ind_g[t_ind].map(function(v){
			self.doms.g_text[v].style.fontWeight='';
		});
	}else if(e.type == 'click'){
		// check clicked or not
		if(e.target.classList.contains('clicked')){
			t_sty.fillOpacity=0;
			e.target.classList.remove('clicked');
		}else{
			t_sty.fillOpacity=1;
			e.target.classList.add('clicked');
		}
	}
}
/**
* control diff button event by this single function
* @returns {object} get names and items of select region
*/
self_mod.prototype.get_sets=function(){
	var t_rects=this.doms.svg.querySelectorAll('rect.clicked'),
		ret={names:[],items:[]},
		t_ind,
		i;
	for(i=0;i<t_rects.length;i++){
		t_ind = parseInt(t_rects[i].getAttribute('data-id'));
		ret.names.push(this.data.diff.names[t_ind]);
		ret.items.push(this.data.diff.items[t_ind]);
	}
	return ret;
}

/**
* render svg by layout settings
*/
self_mod.prototype.render = function(){
	var layout = this.layout_count(),
		self=this,
		t_svg,
		s=this.doms.svg;
	this.doms.g_text = [];
	s.set_attr('width',this.args.dim_svg).set_attr('height',this.args.dim_svg);
	s.empty();
	var g=s.create_node('g');
	s.appendChild(g);
	// prepare two g for venn
	var rect_g = [];
	if(!layout.r){
		rect_g = Array.prototype.range(2).map(function(v,ind){
			t_svg = s.create_node('g');
			g.appendChild(t_svg);
			return t_svg;
		});
	}
	layout.ct.map(function(v,ind){
		// circle or rect
		if(layout.r){
			g.appendChild(s.create_node('circle',{
				cx:v[0],
				cy:v[1],
				r:layout.r,
				fill:self.args.color[ind],
				'fill-opacity': .2
			}));
		}else{
			t_svg = s.create_node('rect',{
				width:layout.rw,
				height:layout.rh,
				x:v[0],
				y:v[1],
				rx:self.args.dim_bt[2],
				ry:self.args.dim_bt[2],
				fill:self.args.color[ind],
				'fill-opacity': .2
			});
			rect_g[ind < 2 ? 0:1].appendChild(t_svg);
		}
		// names
		t_svg = s.create_node('text',{
			'text-anchor':'middle',
			x:layout.ct_n[ind][0],
			y:layout.ct_n[ind][1],
			fill:self.args.color[ind]
		});
		t_svg.innerHTML = self.data.names[ind]+'(n='+self.data.items[ind].length+')';
		g.appendChild(t_svg);
		// collect group text dom for mouse over
		self.doms.g_text.push(t_svg);
		// get text height
		//if(!th){th=t_svg.getBoundingClientRect().height;}
	});
	// transform of venn 4
	rect_g.map(function(v,ind){
		t_ind = ind ? 1:-1;
		var str_trans = [
			'translate('+(layout.ct_trans[ind].join(','))+')',
			'rotate('+(t_ind*45)+')'
		];
		v.set_attr('transform',str_trans.join(' '));
	});
	// diff items
	var g_bt = s.create_node('g');
	s.appendChild(g_bt);
	t_svg=s.create_node('rect',{
		width:self.args.dim_bt[0],
		height:self.args.dim_bt[1],
		rx:self.args.dim_bt[2],
		ry:self.args.dim_bt[2]
	});
	Object.keys(self.args.style_bt).map(function(v){
		t_svg.set_attr(v,self.args.style_bt[v]);
	});
	var c_rect,t_text;
	layout.item.map(function(v,ind){
		// rect
		c_rect = t_svg.cloneNode()
		.set_attr('transform','translate('+(v[0]-0.5*self.args.dim_bt[0])+','+(v[1]-0.5*self.args.dim_bt[1])+')')
		.set_attr('fill-opacity',0)
		.set_attr('data-id',ind);

		c_rect.addEventListener('mouseenter',function(e){self.bt_event(e)});
		c_rect.addEventListener('mouseleave',function(e){self.bt_event(e)});
		c_rect.addEventListener('click',function(e){self.bt_event(e)});
		g_bt.appendChild(c_rect);
		t_text = s.create_node('text',{
			'text-anchor':'middle',
			'transform':'translate('+v[0]+','+v[1]+')'
		});
		t_text.innerHTML = self.data.diff.items[ind].length.toString();
		g_bt.appendChild(t_text);
	});
}
