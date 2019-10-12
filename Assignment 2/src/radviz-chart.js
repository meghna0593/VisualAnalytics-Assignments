function renderRadviz(){
    let radvizDOM,
        data,
        colorAccessor,
        dimensions,
        header;
    let dimensionAnchor;
    function mainRadviz(div){        
        //constant variables
        dimensionAnchor = Array.apply(null, {length: dimensions.length}).map(Number.call, Number).map(x=>x*2*Math.PI/(dimensions.length)); // intial DA configration;

        let	radiusDA = 6,
			radiusDT = 4; // radius of DA and data points
        let nodecolor = d3.scaleOrdinal(d3.schemeCategory20); //set color scheme
		const formatnumber = d3.format(',d');		
		let margin = {top:50, right:150, bottom:50, left:80},
			width = 600,
			height = 550;		
		let chartRadius = Math.min((height-margin.top-margin.bottom) , (width-margin.left-margin.right))/2;		
        
        var titles = header; // get the attributes name
        titles.unshift('index');
        
        var dimensions_new = dimensions,
			dimensionNamesNormalized = dimensions_new.map(function(d) { return d + '_normalized'; }), // 'sepalL_normalized'
			dimension_length = dimensions_new.length,
			dimension_anchor = dimensionAnchor.slice(), // intial configuration;	
            data_new = data.slice();
    
        //adding more attributes to data_new
        data_new.forEach((d,i) => {
			d.index = i;
			d.id = i;
			d.color = nodecolor(colorAccessor(d));
        });
        
        
        data_new = addNormalizedValues(data_new);
		data_new = calculateNodePosition(data_new, dimensionNamesNormalized, dimension_anchor); // calculateNodePosition. need update when DAs move.	
        
        let dimensionAnchor_data = dimensions.map(function(d, i) {
			return {
				theta: dimension_anchor[i], 
				x: Math.cos(dimension_anchor[i])*chartRadius+chartRadius,
				y: Math.sin(dimension_anchor[i])*chartRadius+chartRadius,
				fixed: true,
				name: d
				};
        });
        
        let colorspace = [], colorclass = [];
		data_new.forEach(function(d, i){            
			if(colorspace.indexOf(d.color)<0) {                
				colorspace.push(d.color); 
				colorclass.push(d.class); }
        });        

        d3.select("svg").remove(); //to clear svg content and update with new selection

        const radviz_svg = d3.select(radvizDOM);

        let svg = radviz_svg.append('svg').attr('id', 'radviz')
			.attr('width', width)
			.attr('height', height);						
		svg.append('rect').attr('fill', 'transparent')
			.attr('width', width)
            .attr('height', height);

        let center = svg.append('g').attr('class', 'center').attr('transform', `translate(${margin.left},${margin.top})`); 	

        svg.append('rect').attr('class', 'DAtip-rect');
        
        let DAtipContainer = svg.append('g').attr('x', 0).attr('y', 0);
		let DAtip = DAtipContainer.append('g')
			.attr('class', 'DAtip')
			.attr('transform', `translate(${margin.left},${margin.top})`)
			.attr('display', 'none');
		DAtip.append('rect');
		DAtip.append('text').attr('width', 150).attr('height', 25)
			.attr('x', 0).attr('y', 25)
			.text(':').attr('text-anchor', 'start').attr('dominat-baseline', 'middle');	
		// prepare DT tooltip components
		svg.append('rect').attr('class', 'tip-rect')
			.attr('width', 80).attr('height', 200)
			.attr('fill', 'transparent')
			.attr('backgroundColor', d3.rgb(100,100,100)); // add tooltip container				
		let tooltipContainer = svg.append('g')
			.attr('class', 'tip')
			.attr('transform', `translate(${margin.left},${margin.top})`)
			.attr('display', 'none');

        
        const renderRadviz = d3.select(radvizDOM).data([render_radviz()]);
        renderRadviz.each(render);
        function render(method){
            d3.select(this).call(method);
        }
        function render_radviz(){
            function chart(div) {
                div.each(function() {
                    /* --------------- section --------------- */
                    /*Draw the big circle: drawPanel(chartRadius)*/
                    drawPanel(chartRadius);
                    /* --------------- section --------------- */
                    /*Draw the Dimensional Anchor nodes: tips components, and then call drawDA() to draw DA points, and call drawDALabel to draw DA labels*/
                    drawDA();// draw the DA nodes
                    drawDALabel();// the DA nodes label
                    /* --------------- section --------------- */
                    /*Draw the data Point nodes: prepare visual components and then call drawDT()*/
    
                    // add multiple lines for each information			
                    let tooltip = tooltipContainer.selectAll('text').data(titles)
                            .enter().append('g').attr('x', 0).attr('y',function(d,i){return 25*i;});
                    tooltip.append('rect').attr('width', 150).attr('height', 25).attr('x', 0).attr('y',function(d,i){return 25*i;})
                            .attr('fill', d3.rgb(200,200,200));
                    tooltip.append('text').attr('width', 150).attr('height', 25).attr('x', 5).attr('y',function(d,i){return 25*(i+0.5);})
                            .text(d=>d + ':').attr('text-anchor', 'start').attr('dominat-baseline', 'hanging');
                    // plot each data node
                    drawDT();
                    /* --------------- section --------------- */
                    /*Draw the legend: prepare data and then call drawLegend()*/
                    // plot the legend
                    drawLegend();
    
                    /* --------------- section --------------- */	
                    // subfunctions
                    // subfunction --> drawPanel(a): draw the big circle with the radius 'a'
                    function drawPanel(a) {
                        let panel = center.append('circle')
                            .attr('class', 'big-circle')
                            .attr('stroke', d3.rgb(0,0,0))
                            .attr('stroke-width', 3)
                            .attr('fill', 'transparent')
                            .attr('r', a)
                            .attr('cx', a)
                            .attr('cy', a);
                    }//end of function drawPanel()
                    
                    // subfunction --> drawDA(): draw the DA
                    function drawDA(){
                        center.selectAll('circle.DA-node').remove();
                        let DANodes = center.selectAll('circle.DA-node')
                            .data(dimensionAnchor_data)
                            .enter().append('circle').attr('class', 'DA-node')
                            .attr('fill', d3.rgb(120,120,120))
                            .attr('stroke', d3.rgb(120,120,120))
                            .attr('stroke-width', 1)
                            .attr('r', radiusDA)
                            .attr('cx', d => d.x)
                            .attr('cy', d => d.y)
                            .on('mouseenter', function(d){
                                let damouse = d3.mouse(this); // get current mouse position
                                svg.select('g.DAtip').select('text').text('(' + formatnumber((d.theta/Math.PI)*180) + ')').attr('fill', 'darkorange').attr('font-size', '18pt');
                                svg.select('g.DAtip').attr('transform',  `translate(${margin.left + damouse[0] +0},${margin.top+damouse[1] - 50})`);
                                svg.select('g.DAtip').attr('display', 'block');
                            })
                            .on('mouseout', function(d){
                                svg.select('g.DAtip').attr('display', 'none');
                            })
                            .call(d3.drag()
                                .on('start', dragstarted)
                                .on('drag', dragged)
                                .on('end', dragended)
                            );
                    }//end of function drawDA				
    
                    // dragstarted, dragged, dragended
                    function dragstarted(d){ 
                        d3.select(this).raise().classed('active', true);
                    }
                    function dragended(d){ 
                        d3.select(this).classed('active', false);
                        d3.select(this).attr('stroke-width', 0);
                    }
                    function dragged(d, i) {
                        d3.select(this).raise().classed('active', true);
                        let tempx = d3.event.x - chartRadius;
                        let tempy = d3.event.y - chartRadius;
                        let newAngle = Math.atan2( tempy , tempx ) ;	
                        newAngle = newAngle<0? 2*Math.PI + newAngle : newAngle;
                        d.theta = newAngle;
                        d.x = chartRadius + Math.cos(newAngle) * chartRadius;
                        d.y = chartRadius + Math.sin(newAngle) * chartRadius;
                        d3.select(this).attr('cx', d.x).attr('cy', d.y);
                        // redraw the dimensional anchor and the label
                        drawDA();
                        drawDALabel();
                        //update data points
                        dimension_anchor[i] = newAngle;
                        calculateNodePosition(data_new, dimensionNamesNormalized, dimension_anchor);
                        drawDT();
                    }
                    
                    // subfunction --> drawDALabel(): draw the dimensional anchor label.
                    function drawDALabel() {
                        center.selectAll('text.DA-label').remove();
                        let DANodesLabel = center.selectAll('text.DA-label')
                            .data(dimensionAnchor_data).enter().append('text').attr('class', 'DA-label')
                            .attr('x', d => d.x).attr('y', d => d.y)
                            .attr('text-anchor', d=>Math.cos(d.theta)>0?'start':'end')
                            .attr('dominat-baseline', d=>Math.sin(d.theta)<0?'baseline':'hanging')
                            .attr('dx', d => Math.cos(d.theta) * 15)
                            .attr('dy', d=>Math.sin(d.theta)<0?Math.sin(d.theta)*(15):Math.sin(d.theta)*(15)+ 10)
                            .text(d => d.name)
                            .attr('font-size', '18pt');					
                    }//end of function drawDALabel
    
                    // subfunction --> drawDT(): draw the data points.
                    function drawDT(){
                        center.selectAll('.circle-data').remove();
                        let DTNodes = center.selectAll('.circle-data')
                            .data(data_new).enter().append('circle').attr('class', 'circle-data')
                            .attr('id', d=>d.index)
                            .attr('r', radiusDT)
                            .attr('fill', d=>d.color)
                            .attr('stroke', 'black')
                            .attr('stroke-width', 0.5)
                            .attr('cx', d => d.x0*chartRadius + chartRadius)
                            .attr('cy', d => d.y0*chartRadius + chartRadius)
                            .on('mouseenter', function(d) {
                                let mouse = d3.mouse(this); //get current mouse position.
                                let tip = svg.select('g.tip').selectAll('text').text(function(k, i){
                                    return k + ': ' + d[k];
                                }); // edit tips text
                                // move tips position
                                svg.select('g.tip').attr('transform',  `translate(${margin.left + mouse[0] +20},${margin.top+mouse[1] - 120})`);
                                // display the tip
                                svg.select('g.tip').attr('display', 'block');
                                // highlight the point
                                d3.select(this).raise().transition().attr('r', radiusDT*2).attr('stroke-width', 3);		
                            })
                            .on('mouseout', function(d) {
                                // close the tips.
                                svg.select('g.tip').attr('display', 'none');
                                // dis-highlight the point
                                d3.select(this).transition().attr('r', radiusDT).attr('stroke-width', 0.5);
                            });					
                    }// end of function drawDT				
                    
                    // subfunction --> drawLegend()
                    function drawLegend() {
                        let heightLegend = 25, xLegend = margin.left+chartRadius*1.7, yLegend = 25;
                        let legendcircle = center.selectAll('circle.legend').data(colorspace)
                            .enter().append('circle').attr('class', 'legend')
                            .attr('r', radiusDT)
                            .attr('cx', xLegend)
                            .attr('cy', (d, i) => i*yLegend)
                            .attr('fill', d=>d);
                        let legendtexts = center.selectAll('text.legend').data(colorclass)
                            .enter().append('text').attr('class', 'legend')
                            .attr('x', xLegend + 2 * radiusDT)
                            .attr('y', (d, i) => i*yLegend+5)
                            .text(d => d).attr('font-size', '16pt').attr('dominat-baseline', 'middle')
                            .on('mouseover', function(d){
                                //when mouse hover, other classes will be discolored.
                                let tempa = d3.select(radvizDOM).selectAll('.circle-data');
                                tempa.nodes().forEach((element) => {
                                    console.log(element);
                                    let tempb = element.getAttribute('id');
                                    if (data_new[tempb].class != d) {
                                        d3.select(element).attr('fill-opacity', 0.2).attr('stroke-width', 0);
                                    }
                                });
                            })
                            .on('mouseout', function(d) {
                                //when mouse move out, display normally.
                                d3.select(radvizDOM).selectAll('.circle-data')
                                    .attr('fill-opacity', 1).attr('stroke-width', 0.5);
                            });					
                    }// end of function drawLegend()	
                });// end of div.each(function(){})
            } // end of function chart(div)
            return chart;
        }

        function addNormalizedValues(data_new) {        
            data_new.forEach(function(d) {
                dimensions.forEach(function(dimension) {
                    d[dimension] = +d[dimension];
                });
            });
            var normalizationScales = {};
            dimensions.forEach(function(dimension) {
                normalizationScales[dimension] = d3.scaleLinear().domain(d3.extent(data_new.map(function(d, i) {
                    return d[dimension];
                }))).range([ 0, 1 ]);
            });
            data_new.forEach(function(d) {
                dimensions.forEach(function(dimension) {
                    d[dimension + "_normalized"] = normalizationScales[dimension](d[dimension]);
                });
            });        
            data_new.forEach(function(d) {
                let dsum = 0;
                dimensionNamesNormalized.forEach(function (k){ dsum += d[k]; }); // sum
                d.dsum = dsum;
            });
            return data_new;
        };

        function calculateNodePosition(data_new, dimensionNamesNormalized, dimension_anchor) {
            data_new.forEach(function(d) {
                let dsum = d.dsum, dx = 0, dy = 0;
                dimensionNamesNormalized.forEach(function (k, i){ 
                    dx += Math.cos(dimension_anchor[i])*d[k]; 
                    dy += Math.sin(dimension_anchor[i])*d[k]; }); // dx & dy
                d.x0 = dx/dsum;
                d.y0 = dy/dsum;
                d.dist 	= Math.sqrt(Math.pow(dx/dsum, 2) + Math.pow(dy/dsum, 2)); // calculate r
                d.distH = Math.sqrt(Math.pow(dx/dsum, 2) + Math.pow(dy/dsum, 2)); // calculate r
                d.theta = Math.atan2(dy/dsum, dx/dsum) * 180 / Math.PI; 
            });
            return data_new;
        }
    }

    

    

    //handling input
    mainRadviz.radvizDOM = function(_in){
        if(!arguments.length) { return }
        radvizDOM = _in;
        return mainRadviz;
    }

    mainRadviz.data = function(_in){
        if(!arguments.length) { return }
        data = _in;
        return mainRadviz;
    }

    mainRadviz.colorAccessor = function(_in){
        if(!arguments.length) { return }
        colorAccessor = _in;
        return mainRadviz;
    }

    mainRadviz.dimensions = function(_in){
        if(!arguments.length) { return }
        dimensions = _in;
        return mainRadviz;
    }

    mainRadviz.header = function(_in){
        if(!arguments.length) { return }
        header = _in;
        return mainRadviz;
    }

    return mainRadviz;
};