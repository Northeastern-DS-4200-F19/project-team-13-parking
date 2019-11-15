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
    yScale = d3.scaleLinear();
  
  // Create the chart by adding an svg to the div with the id 
  // specified by the selector using the given data
  function chart(selector, data) {
    let svg = d3.select(selector)
      .append("svg")
        .attr("preserveAspectRatio", "xMidYMid meet")
        .attr("viewBox", [0, 0, width + margin.left + margin.right, height + margin.top + margin.bottom].join(' '))
        .classed("svg-content", true);
    
    addTitle(svg, 'Chester Square Parking Spot Utilization', x=margin.left, y=17);
    addLegend(svg, Object.keys(data), REGULATION_COLORS, true, width - margin.right - 10, 10);

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
      .curve(d3.curveNatural)
      .x(d => X(d))
      .y0(d => Y(d) - d.occupied_spots / 2)
      .y1(d => Y(d) + d.occupied_spots / 2);
    const line = d3.line()
      .curve(d3.curveNatural)
      .x(d => X(d))
      .y(d => Y(d));

    // Create lines for each regulation
    Object.keys(data).forEach(key => {
      svg.append('path')
        .attr('d', area(data[key].sort((d1, d2) => hourToInt(d1.time) - hourToInt(d2.time))))
        .attr('stroke', REGULATION_COLORS[key])
        .attr('stroke-opacity', 0.5)
        .attr('fill', REGULATION_COLORS[key])
        .attr('fill-opacity', 0.5);
      svg.append('path')
        .attr('d', line(data[key].sort((d1, d2) => hourToInt(d1.time) - hourToInt(d2.time))))
        .attr('class', 'dataLine')
        .attr('stroke', REGULATION_COLORS[key]);
    });

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

  return chart;
}