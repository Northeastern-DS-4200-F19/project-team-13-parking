/* global D3 */

// Initialize a parking spot heatmap.
// Modeled after Mike Bostock's Reusable Chart framework https://bost.ocks.org/mike/chart/
function heatmap() {
  // Based on Mike Bostock's margin convention
  // https://bl.ocks.org/mbostock/3019563
  let margin = {
      top: 120,
      left: 75,
      right: 30,
      bottom: 50
    },
    width = 6000 - margin.left - margin.right,
    height = 700 - margin.top - margin.bottom,
    xValue = d => d[0],
    yValue = d => d[1],
    xLabelText = "",
    yLabelText = "",
    yLabelOffsetPx = 0,
    xScale = d3.scaleBand(),
    yScale = d3.scaleBand();
  
  // Create the chart by adding an svg to the div with the id 
  // specified by the selector using the given data
  function chart(selector, data) {
    let svg = d3.select(selector)
      .append("svg")
        .attr("preserveAspectRatio", "xMidYMid meet")
        .attr("width", width)
        .attr("height", height)
        .classed("svg-content", true);
    
    addTitle(svg, 'Chester Square Parking', x=margin.left, y=25, font_size=35);
    addLegend(
      svg,
      ['Occupied', 'Unoccupied', 'Blocked'],
      {'Occupied': 'red', 'Unoccupied': 'black', 'Blocked': 'grey'},
      true, margin.right + 10, 45, 15);
        
    svg = svg.append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Build X scales and axis:
    xScale
      .range([0, width])
      .domain(d3.map(data, xValue).keys())
      .padding(0.05);

    // Build Y scales and axis:
    yScale
      .range([height - margin.top - margin.bottom, 0])
      .domain(d3.map(data, yValue).keys())
      .padding(0.05);
    
    // X axis
    const xAxis = svg.append("g")
        .attr("transform", "translate(0," + (height - margin.bottom - margin.top) + ")")
        .call(d3.axisBottom(xScale).tickSize(0))
        .select(".domain").remove();
        
    // X axis label
    xAxis.append("text")        
        .attr("class", "axisLabel")
        .attr("transform", "translate(" + (width - 50) + ",-10)")
        .text(xLabelText);
    
    // Y axis and label
    const yAxis = svg.append("g")
        .call(d3.axisLeft(yScale).tickSize(0))
        .select(".domain").remove()
        .append("text")
          .attr("class", "axisLabel")
          .attr("transform", "translate(" + yLabelOffsetPx + ", -12)")
          .text(yLabelText);

    // create a tooltip
    const tooltip = d3.select("#heatmap-container")
      .append("div")
      .style("opacity", 0)
      .attr("class", "tooltip")
      .style("background-color", "white")
      .style("border", "solid")
      .style("border-width", "2px")
      .style("border-radius", "5px")
      .style("padding", "5px")

    // Three function that change the tooltip when user hover / move / leave a cell
    function mouseover(d) {
      tooltip
        .style("opacity", 1)
      d3.select(this)
        .style("stroke", "black")
        .style("opacity", 1)
    }

    function mousemove(d) {
      tooltip
        .html(d.occupied || 'Unoccupied')
        .style("position", "absolute")
    }

    function mouseleave(d) {
      tooltip
        .style("opacity", 0)
      d3.select(this)
        .style("stroke", "none")
        .style("opacity", 0.8)
    }

    function fill(d) {
      if (d.occupied === '') {
        return '#000004'
      }
      else if (d.occupied === 'Construction' || d.occupied == 'Blocked' ) {
        return 'grey'
      }
      else {
        return '#b93556'
      }
    }

    svg.selectAll()
      .data(data, d => X(d) + ':' + Y(d))
      .enter()
      .append("rect")
        .attr("x", d => X(d))
        .attr("y", d => Y(d))
        .attr("width", xScale.bandwidth())
        .attr("height", yScale.bandwidth())
        .style("fill", d => fill(d))
        .style("stroke-width", 4)
        .style("stroke", "none")
        .style("opacity", 0.8)
        .on("mouseover", mouseover)
        .on("mousemove", mousemove)
        .on("mouseleave", mouseleave);

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