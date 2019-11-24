function renderRadviz(){
    
    let radvizDOM,
        data,
        colorAccessor,
        dimensions,
        header;
    let dimensionAnchor;
    function mainRadviz(div){  
        dimensionAnchor = Array.apply(null, {length: dimensions.length}).map(Number.call, Number).map(x=>x*2*Math.PI/(dimensions.length)); // intial DA configration;
        
        let	dimAnchorRadius = 6, dimDataPointRadius = 4; 
        	
		let margin = {top:50, right:150, bottom:50, left:110}, width = 600, height = 450;		
		let radvizRadius = Math.min((height-margin.top-margin.bottom) , (width-margin.left-margin.right))/2;		
        
        let nodecolor = d3.scaleOrdinal(d3.schemeCategory20); 
		const formatnumber = d3.format(',d');	

        //csv header names or attribute names
        var attributeNames = header; 
        attributeNames.unshift('index'); //popping index put of the array
        
        var dimensions_new = dimensions,
			dimensionNamesNormalized = dimensions_new.map(function(d) { return d + '_normalized'; }), 
            dimension_length = dimensions_new.length,
            data_new = data.slice(),
			dimension_anchor = dimensionAnchor.slice();
    
        //adding color to data_new    
        data_new.forEach((d,i) => {
			d.index = i;
			d.id = i;
			d.color = nodecolor(colorAccessor(d));
        });
        
        
        data_new = putNormalizedValues(data_new); //to include normalized data
		data_new = calcNodePosition(data_new, dimensionNamesNormalized, dimension_anchor); //to update the node when anchors move	
        
        let dimensionAnchor_data = dimensions.map(function(dt, i) {
			return {
				x: Math.cos(dimension_anchor[i])*radvizRadius+radvizRadius,
                y: Math.sin(dimension_anchor[i])*radvizRadius+radvizRadius,
                name: dt,
                theta: dimension_anchor[i], 
				fixed: true
				};
        });
        
        let colorSpace = [], colorClass = [];
		data_new.forEach(function(dt, i){  
			if(colorSpace.indexOf(dt.color)<0) {                
				colorSpace.push(dt.color); 
				colorClass.push(dt[header[header.length-1]]); }
        });        

        //to clear content and update svg when new file is added
        d3.select("svg").remove(); 

        const radviz_svg = d3.select(radvizDOM);

        let svg = radviz_svg.append('svg').attr('id', 'radviz').attr('width', width).attr('height', height);	
        					
		svg.append('rect').attr('fill', 'transparent').attr('width', width).attr('height', height);

        let center = svg.append('g').attr('class', 'center').attr('transform', `translate(${margin.left},${margin.top})`); 	
        
        let dataAnchContainer = svg.append('g').attr('x', 0).attr('y', 0);
		let dataAnchToolTip = dataAnchContainer.append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`)
            .attr('class', 'dataAnchToolTip')
			.attr('display', 'none');
        dataAnchToolTip.append('rect');
		dataAnchToolTip.append('text').attr('width', 150).attr('height', 25).attr('x', 0).attr('y', 25)
			.text(':').attr('text-anchor', 'start').attr('dominat-baseline', 'middle');	

        svg.append('rect').attr('class', 'tooltip-rect')
            .attr('width', 80).attr('height', 100)
            .attr('backgroundColor', d3.rgb(100,100,100))			
			.attr('fill', 'transparent');
        let tooltipContainer = svg.append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`)
            .attr('class', 'toolTip')
            .attr('display', 'none')

        
        const renderRadviz = d3.select(radvizDOM).data([render_radviz()]);
        renderRadviz.each(render);
        function render(method){
            d3.select(this).call(method);
        }

        function render_radviz(){
            function chart(div) {
                div.each(function() {
                    renderPanel(radvizRadius);
                    renderDimAnchor();
                    renderDimAnchorLabel();
                    let tooltip = tooltipContainer.selectAll('text').data(attributeNames)
                            .enter().append('g').attr('x', 0).attr('y',function(d,i){return 25*i;});
                    tooltip.append('rect').attr('width', 150).attr('height', 25).attr('x', 0).attr('y',function(d,i){return 25*i;})
                            .attr('fill', d3.rgb(255,255,153));
                    tooltip.append('text').attr('width', 150).attr('height', 25).attr('x', 5).attr('y',function(d,i){return 25*(i+0.5);})
                            .text(d=>d + ':').attr('text-anchor', 'start').attr('dominat-baseline', 'hanging');

                    renderPoint();
                    renderLegend();

                    //to draw the circle
                    function renderPanel(a) {
                        center.append('circle')
                            .attr('class', 'big-circle')
                            .attr('r', a)
                            .attr('cx', a)
                            .attr('cy', a)
                            .attr('fill', 'transparent')
                            .attr('stroke', d3.rgb(0,0,0))
                            .attr('stroke-width', 3);
                    }
                    
                    //to make points on the circle and tooltips
                    function renderDimAnchor(){
                        center.selectAll('circle.DimAch-node').remove();
                        center.selectAll('circle.DimAch-node')
                            .data(dimensionAnchor_data)
                            .enter().append('circle').attr('class', 'DimAch-node')
                            .attr('r', dimAnchorRadius)
                            .attr('cx', d => d.x)
                            .attr('cy', d => d.y)
                            .attr('fill', d3.rgb(96,96,96))
                            .attr('stroke', d3.rgb(0,0,0))
                            .attr('stroke-width', 2)
                            .on('mouseenter', function(d){
                                let dimAnchmouse = d3.mouse(this); 
                                svg.select('g.dataAnchToolTip').select('text').text('(' + formatnumber((d.theta/Math.PI)*180) + ')').attr('fill', 'purple').attr('font-size', '13pt');
                                svg.select('g.dataAnchToolTip').attr('transform',  `translate(${margin.left + dimAnchmouse[0] +0},${margin.top+dimAnchmouse[1] - 50})`);
                                svg.select('g.dataAnchToolTip').attr('display', 'block');
                            })
                            .on('mouseout', function(d){
                                svg.select('g.dataAnchToolTip').attr('display', 'none');
                            })
                            .call(d3.drag()
                                .on('start', dragStart)
                                .on('drag', dragMove)
                                .on('end', dragEnd)
                            );
                    }

                    //methods to drag the anchors
                    function dragStart(d){ 
                        d3.select(this).raise().classed('active', true);
                    }

                    function dragMove(d, i) {
                        d3.select(this).raise().classed('active', true);
                        let temp_xVal = d3.event.x - radvizRadius;
                        let temp_yVal = d3.event.y - radvizRadius;
                        let new_Angle = Math.atan2( temp_yVal , temp_xVal ) ;	
                        new_Angle = new_Angle<0? 2*Math.PI + new_Angle : new_Angle;
                        d.theta = new_Angle;
                        d.x = radvizRadius + Math.cos(new_Angle) * radvizRadius;
                        d.y = radvizRadius + Math.sin(new_Angle) * radvizRadius;
                        d3.select(this).attr('cx', d.x).attr('cy', d.y);

                        renderDimAnchor();
                        renderDimAnchorLabel();

                        dimension_anchor[i] = new_Angle;
                        calcNodePosition(data_new, dimensionNamesNormalized, dimension_anchor);
                        renderPoint();
                    }

                    function dragEnd(d){ 
                        d3.select(this).classed('active', false);
                        d3.select(this).attr('stroke-width', 0);
                    }
                    
                     //label for anchors
                    function renderDimAnchorLabel() {
                        center.selectAll('text.DimAch-label').remove();
                        center.selectAll('text.DimAch-label')
                            .data(dimensionAnchor_data).enter().append('text').attr('class', 'DimAch-label')
                            .attr('x', d => d.x).attr('y', d => d.y)
                            .attr('text-anchor', d=>Math.cos(d.theta)>0?'start':'end')
                            .attr('dominat-baseline', d=>Math.sin(d.theta)<0?'baseline':'hanging')
                            .attr('dx', d => Math.cos(d.theta) * 15)
                            .attr('dy', d=>Math.sin(d.theta)<0?Math.sin(d.theta)*(15):Math.sin(d.theta)*(15)+ 10)
                            .text(d => d.name)
                            .attr('font-size', '8pt');					
                    }
    
                    //method to draw the data points inside the circle
                    function renderPoint(){
                        center.selectAll('.circle-dt').remove();
                        center.selectAll('.circle-dt')
                            .data(data_new).enter().append('circle').attr('class', 'circle-dt')
                            .attr('id', d=>d.index)
                            .attr('r', dimDataPointRadius)
                            .attr('cx', d => d.x0*radvizRadius + radvizRadius)
                            .attr('cy', d => d.y0*radvizRadius + radvizRadius)
                            .attr('fill', d=>d.color)
                            .attr('stroke', 'black')
                            .attr('stroke-width', 0.3)
                            .on('mouseenter', function(d) {
                                let mouse = d3.mouse(this); 
                                let toolTip = svg.select('g.toolTip').selectAll('text').text(function(dt, i){
                                    return dt + ': ' + d[dt];
                                }); 
                                if(d['Class']!==undefined || d['quality']!==undefined){
                                    var element = document.getElementById('heat-map')
                                    element.style.visibility = 'visible'
                                }
                                
                                callHeatMap((d['Class']===undefined)?(d['quality']===undefined)?'':d['quality']:d['Class'],document.getElementById("data_options").value)
                                svg.select('g.toolTip').attr('transform',  `translate(${margin.left + mouse[0] +20},${margin.top+mouse[1] - 120})`);

                                svg.select('g.toolTip').attr('display', 'block');

                                d3.select(this).raise().transition().attr('r', dimDataPointRadius*2).attr('stroke-width', 2);		
                            })
                            .on('mouseout', function(d) {
                                
                                svg.select('g.toolTip').attr('display', 'none');

                                d3.select(this).transition().attr('r', dimDataPointRadius).attr('stroke-width', 0.5);
                            })
                            // .on('click',function(d){
                                
                            // })					
                    }			
                    
                    //method for the legend
                    function renderLegend() {
                        let xLegend = margin.left+radvizRadius*1.7, yLegend = 22;
                        center.selectAll('circle.legend').data(colorSpace)
                            .enter().append('circle').attr('class', 'legend')
                            .attr('r', dimDataPointRadius)
                            .attr('cx', xLegend)
                            .attr('cy', (d, i) => i*yLegend)
                            .attr('fill', d=>d);
                        
                        center.selectAll('text.legend').data(colorClass)
                            .enter().append('text').attr('class', 'legend')
                            .attr('x', xLegend + 2 * dimDataPointRadius)
                            .attr('y', (d, i) => i*yLegend+5)
                            .text(d => d).attr('font-size', '8pt').attr('dominat-baseline', 'middle')
                            .on('mouseover', function(d){

                                let temp_a = d3.select(radvizDOM).selectAll('.circle-dt');
                                temp_a.nodes().forEach((element) => {
                                    let temp_b = element.getAttribute('id');
                                    if (data_new[temp_b][header[header.length-1]] != d) {
                                        d3.select(element).attr('fill-opacity', 0.2).attr('stroke-width', 0);
                                    }
                                });
                            })
                            .on('mouseout', function(d) {
                                d3.select(radvizDOM).selectAll('.circle-dt')
                                    .attr('fill-opacity', 1).attr('stroke-width', 0.5);
                            });					
                    }	
                });
            }         
            return chart;
        }

        //method to reset the anchor position
        document.getElementById('resetOption').onclick = function() {resetChart()};	
		function resetChart() {		
            	
			dimension_anchor = dimensionAnchor.slice();
			dimensionAnchor_data = dimensions.map(function(dt, i) {
				return {
                    x: Math.cos(dimension_anchor[i])*radvizRadius+radvizRadius,
                    y: Math.sin(dimension_anchor[i])*radvizRadius+radvizRadius,
                    name: dt,
                    theta: dimension_anchor[i], 
                    fixed: true
					};
            });	
            console.log(data_new, dimensionNamesNormalized, dimension_anchor);
            
			calcNodePosition(data_new, dimensionNamesNormalized, dimension_anchor);		
            
            renderRadviz.each(render);
		}

        //adding normalized values to data
        function putNormalizedValues(data_new) {        
            data_new.forEach(function(dt) {
                dimensions.forEach(function(dimension) {
                    dt[dimension] = +dt[dimension];
                });
            });
            var normalizationScales = {};
            dimensions.forEach(function(dimension) {
                normalizationScales[dimension] = d3.scaleLinear().domain(d3.extent(data_new.map(function(dt, i) {
                    return dt[dimension];
                }))).range([ 0, 1 ]);
            });
            data_new.forEach(function(dt) {
                dimensions.forEach(function(dimension) {
                    dt[dimension + "_normalized"] = normalizationScales[dimension](dt[dimension]);
                });
            });        
            data_new.forEach(function(dt) {
                let dsum = 0;
                dimensionNamesNormalized.forEach(function (k){ dsum += dt[k]; }); 
                dt.dsum = dsum;
            });
            return data_new;
        };

        function calcNodePosition(data_new, dimensionNamesNormalized, dimension_anchor) {
            data_new.forEach(function(dt) {
                let dsum = dt.dsum, dx = 0, dy = 0;
                dimensionNamesNormalized.forEach(function (k, i){ 
                    dx += Math.cos(dimension_anchor[i])*dt[k]; 
                    dy += Math.sin(dimension_anchor[i])*dt[k]; }); 
                dt.x0 = dx/dsum;
                dt.y0 = dy/dsum;
                dt.dist 	= Math.sqrt(Math.pow(dx/dsum, 2) + Math.pow(dy/dsum, 2)); 
                dt.distH = Math.sqrt(Math.pow(dx/dsum, 2) + Math.pow(dy/dsum, 2)); 
                dt.theta = Math.atan2(dy/dsum, dx/dsum) * 180 / Math.PI; 
            });
            return data_new;
        }
    }

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


/*
 * [1] WYanChao. (n.d.). WYanChao/RadViz. Retrieved October 12, 2019, from https://github.com/WYanChao/RadViz/blob/master/index.js.
 */