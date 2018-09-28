# svg_plot.js
## Introduction
A lightweight generator for plotting a useful venn diagram(and others...) with svg tech.

The [Venn][] page

## Requirements
No other dependency(no longer need svgjs).

And you need to require it when you use our script in browser
```html
	<script src="./venn_plot.min.js"></script>
```
## Usage
### Create a plot
1. set up a html container for venn plot.(like a div with a *"venn"* id)
```html
		<div id="venn" style="width:400;height:400"></div>
```
2. run venn plot to render it
```js
		var venn = new venn_plot(document.querySelector('#venn'));
		var data = {names:["a","b"],items:[["a1","a2","ab"],["b1","ab"]]};
		venn.load_data(data);
```
3. output highlight group
```js
		console.log(venn.get_sets());
```
## Change logs
* 0.1.0

	remove svgjs dependency and rebuild by native svg dom

* 0.0.3

	define svg dimension to let it extensible when shows on browser

* 0.0.2

	remove babeljs compilation because safari's error on throw symbol.

* 0.0.1

	Initiate the project and a base function

[venn]:	wyubin.github.io/svg_plot/venn.html	"plot venn by input"
