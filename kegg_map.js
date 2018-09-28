module.id='kegg_map';
require('../../lib/stdlib.SVGElement.js');
var extend = require('util')._extend;
var events_reg = require('../../lib/events_reg.js');
/**
* based on svgjs[https://github.com/wout/svg.js] to render specific plot
* @constructs kegg_map
* @param {DOM} dom - DOM of this instance
* @param {Object} args - custom settings
* @returns {Object} this kegg_map object
*/
var kegg_map = function (dom,args){
	this.doms={body:dom || SVGElement.prototype.create_node('svg')};
	this.args = extend({
		default_color:'#ff0000'
	},args);
	// vars as back ground value for event callback
	this.vars={
		kegg_pre:'http://www.genome.jp/dbget-bin/www_bget?'
	};
	// initial event register
	this.e_reg = new events_reg(this.doms.body);
	//this.init();
};
module.exports = kegg_map;
/**
* add event to this svg and register event
* @param {String} e_type - event type name
* @param {String} selector - selector for event target
* @param {Function} cb - callback(e,this.vars)
* @returns {Object} this kegg_map object
*/
kegg_map.prototype.add_event = function(e_type,selector,cb){
	var self = this;
	if(!this.e_reg.events[e_type]){
		this.e_reg.events[e_type] = {};
	}
	this.e_reg.events[e_type][selector] = function(e){return cb(e,self.vars)};
	this.e_reg.register();
}
/**
* generate svg node by input kegg coor
* @param {String} tag - tag name
* @param {Array} coor_list - coor info list
* @param {Function} cb - callback(e,this.vars)
* @returns {Object} this kegg_map object
*/
kegg_map.prototype.coor2node = function(type,coor_list,color){
	var t_tag = '',t_attrs = {},t_style = {};
	if(type=='rect'){
		t_tag = type;
		t_attrs.x = coor_list[0]-(coor_list[2]/2);
		t_attrs.y = coor_list[1]-(coor_list[3]/2);
		t_attrs.width = coor_list[2];
		t_attrs.height = coor_list[3];
	}else if(type =='line'){
		t_tag = 'path';
		var t_path = ['M'+coor_list[0]+','+coor_list[1]];
		for(var i=1;i < Math.floor(coor_list.length/2);i++){
			t_path.push('L'+coor_list[i*2]+','+coor_list[i*2+1]);
		}
		t_attrs['stroke-width'] = 5;
		//t_attrs['stroke-width'] = coor_list[coor_list.length-1];
		t_attrs.d = t_path.join('');
	}
	// color set
	if(type == 'line'){
		t_style.stroke = color;
	}else{
		t_style.fill = color;
		t_style["fill-opacity"] = .5;
	}
	var t_svg = this.doms.body.create_node(t_tag,t_attrs);
	Object.keys(t_style).map(function(v){
		t_svg.style[v] = t_style[v];
	});
	return t_svg;
}
/**
* render kegg map on single map url
* @param {String} map_url - url of this map image
* @param {Object} site2coor - site id with their coor(plot type and coor)
* @param {Function} cb_color - cb_color(site_id,this.vars)
* @returns {Object} this svg dom
*/
kegg_map.prototype.render = function(map_url,site2coor,cb_color){
	// clean content
	this.doms.body.empty();
	var self = this,t_coors,t_node,t_color;
	// get map size and generate the svg DOM
	var t_img = document.createElement('img');
	t_img.onload = function(e){
		var t_width = t_img.width,t_height = t_img.height;
		self.doms.body.style.width = t_width;
		self.doms.body.style.height = t_height;
		var t_image = self.doms.body.create_node('image',{
			width:t_width,
			height:t_height,
			'xlink:href':map_url
		});
		self.doms.body.appendChild(t_image);
		Object.keys(site2coor).map(function(v){
			t_coors = site2coor[v].split(',');
			t_color = cb_color ? (cb_color(v,self.vars) || self.args.default_color):self.args.default_color;
			t_node = self.coor2node(t_coors[0],t_coors.slice(1).map(function(v){return parseInt(v)}),t_color);
			t_node.id = v;
			self.doms.body.appendChild(t_node);
		});
	}
	// trigger event
	t_img.src = map_url;
	return this.doms.body;
}
