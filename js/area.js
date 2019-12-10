/* global D3 */

// Initialize a parking spot utilization rate area chart.
// Modeled after Mike Bostock's Reusable Chart framework https://bost.ocks.org/mike/chart/
function areachart() {
  // Based on Mike Bostock's margin convention
  // https://bl.ocks.org/mbostock/3019563
  let margin = {
      top: 120,
      left: 50,
      right: 30,
      bottom: 50
    },
    width = 600 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom,
    xValue = d => d[0],
    yValue = d => d[1],
    xLabelText = "",
    yLabelText = "",
    yLabelOffsetPx = 0,
    xScale = d3.scalePoint(),
    yScale = d3.scaleLinear(),
    legendCallbacks = [],
    dispatcher;
  
  // Create the chart by adding an svg to the div with the id 
  // specified by the selector using the given data.
  function chart(selector, data) {
    let svg = d3.select(selector)
      .append("svg")
        .attr("preserveAspectRatio", "xMidYMid meet")
        .attr("viewBox", [0, 0, width + margin.left + margin.right, height + margin.top + margin.bottom].join(' '))
        .classed("svg-content", true);
    
    // Connect the legend filters to the passed in callbacks.
    connectFilters(legendCallbacks);
    addTitle(svg, 'Chester Square Parking Spot Utilization by Regulation Type', x=margin.left, y=50, font_size=20);

    // Create the area width scale legend
    scaleLegend = svg.append("g")
      .attr("transform", "translate(" + (width - 60) + ", " + 60 + ")");
    scaleLegend.append("rect")
      .attr("height", 20)
      .attr("width", 1)
      .attr("fill", "black");
    scaleLegend.append("rect")
      .attr("height", 1)
      .attr("width", 10)
      .attr("transform", "translate(5, 0), rotate(180)");
    scaleLegend.append("rect")
      .attr("height", 1)
      .attr("width", 10)
      .attr("transform", "translate(5, 20), rotate(180)");
    scaleLegend.append("text")
      .attr("transform", "translate(10, 15)")
      .style("font-size", "12px")
      .text("# Occupied Spots");

    // Create the base svg for the area chart.
    svg = svg.append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    //Define scales
    xScale
      .domain(TIMES)
      .rangeRound([0, width]);

    yScale
      .domain([0, 1])
      .rangeRound([height, 0]);

    // X axis
    const xAxis = svg.append("g")
        .attr("transform", "translate(0," + (height) + ")")
        .call(d3.axisBottom(xScale));
        
    // Put X axis tick labels at an angle
    xAxis.selectAll("text")	
      .style("text-anchor", "end")
      .attr("dx", "-.8em")
      .attr("dy", ".15em")
      .attr("transform", "rotate(-65)");
        
    // X axis label
    xAxis.append("text")        
      .attr("class", "axisLabel")
      .attr("transform", "translate(" + (width - 50) + ",-10)")
      .text(xLabelText);
  
    // Y axis and label
    const yAxis = svg.append("g")
      .call(d3.axisLeft(yScale))
      .append("text")
        .attr("class", "axisLabel")
        .attr("transform", "translate(" + yLabelOffsetPx + ", -12)")
        .text(yLabelText);

    // Define our areas and lines
    const area = d3.area()
      .curve(d3.curveCatmullRom.alpha(0.3))
      .x(d => X(d))
      .y0(d => Y(d) - d.occupied_spots / 4)
      .y1(d => Y(d) + d.occupied_spots / 4);
    const line = d3.line()
      .curve(d3.curveCatmullRom.alpha(0.3))
      .x(d => X(d))
      .y(d => Y(d));

    // Create lines and areas for each regulation
    Object.keys(data).forEach(regulation => {
      const sortedData = data[regulation].sort((d1, d2) => hourToInt(d1.time) - hourToInt(d2.time));

      svg.append('path')
        .attr('d', area(sortedData))
        .attr('class', 'dataArea')
        .attr('stroke', REGULATION_COLORS[regulation])
        .attr('stroke-opacity', 0.5)
        .attr('fill', REGULATION_COLORS[regulation])
        .attr('fill-opacity', 0.5);

      svg.append('path')
        .attr('d', line(sortedData))
        .attr('class', 'dataLine')
        .attr('stroke', REGULATION_COLORS[regulation]);
    });


    const allPoints = [];
    // Create points for util rates for all regulations at all times, used for brushing.
    Object.keys(data).forEach(regulation => {
      let points = svg.append("g")
        .selectAll(".linePoint")
          .data(data[regulation]);
      
      points.exit().remove();
            
      points = points.enter()
        .append("circle")
          .attr("class", "point linePoint")
        .merge(points)
          .attr("cx", X)
          .attr("cy", Y)        
          .attr("r",5);

      allPoints.push(points);
    });

    svg.call(brush);

    // Highlight points when brushed
    function brush(g) {
      // Brush on the x-axis exlcusively.
      const brush = d3.brushX()
        .on("start brush", select)
        .on("end", brushEnd)
        .extent([
          [-margin.left, -margin.bottom],
          [width + margin.right, height + margin.top]
        ]);

      g.call(brush); // Adds the brush to this element

      function select() {
        if (d3.event.selection === null) return;
        const [x0, x1] = d3.event.selection;

        allPoints.forEach(areaPoints => {
          areaPoints.classed("selected-no-fill", d => x0 <= X(d) && X(d) <= x1);
        });
      }
      
      function brushEnd() {
        // Get the name of our dispatcher's event
        let dispatchString = Object.getOwnPropertyNames(dispatcher._)[0];

        // Let other charts know
        dispatcher.call(dispatchString, this, svg.selectAll(".selected-no-fill").data());
      }
    }

    return chart;
  }

  // The x-accessor from the datum
  function X(d) {
    return xScale(xValue(d));
  }

  // The y-accessor from the datum
  function Y(d) {
    return yScale(yValue(d));
  }

  chart.margin = function (_) {
    if (!arguments.length) return margin;
    margin = _;
    return chart;
  };

  chart.width = function (_) {
    if (!arguments.length) return width;
    width = _;
    return chart;
  };

  chart.height = function (_) {
    if (!arguments.length) return height;
    height = _;
    return chart;
  };

  chart.x = function (_) {
    if (!arguments.length) return xValue;
    xValue = _;
    return chart;
  };

  chart.y = function (_) {
    if (!arguments.length) return yValue;
    yValue = _;
    return chart;
  };

  chart.xLabel = function (_) {
    if (!arguments.length) return xLabelText;
    xLabelText = _;
    return chart;
  };

  chart.yLabel = function (_) {
    if (!arguments.length) return yLabelText;
    yLabelText = _;
    return chart;
  };

  chart.yLabelOffset = function (_) {
    if (!arguments.length) return yLabelOffsetPx;
    yLabelOffsetPx = _;
    return chart;
  };

  // Registers a callback to this chart.
  chart.registerLegendCallback = function (_) {
    if (!arguments.length) return legendCallbacks;
    legendCallbacks.push(_);
    return chart;
  };

  // Gets or sets the dispatcher we use for selection events
  chart.selectionDispatcher = function (_) {
    if (!arguments.length) return dispatcher;
    dispatcher = _;
    return chart;
  };

  return chart;
}