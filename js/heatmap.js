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
    width = 700 - margin.left - margin.right,
    height = 7000 - margin.top - margin.bottom,
    xValue = d => d[0],
    yValue = d => d[1],
    xLabelText = "",
    yLabelText = "",
    yLabelOffsetPx = 0,
    xScale = d3.scaleBand(),
    yScale = d3.scaleBand(),
    ourBrush = null,
    selectableElements = d3.select(null),
    dispatcher;;
  
  // Create the chart by adding an svg to the div with the id 
  // specified by the selector using the given data
  function chart(selector, data) {
    let svg = d3.select(selector)
      .append("svg")
        .attr("preserveAspectRatio", "xMidYMid meet")
        .attr("width", width)
        .attr("height", height)
        .classed("svg-content", true);
    
    addTitle(svg, 'Chester Square Parking Spots', x=margin.left, y=25, font_size=35)
    addLegend(
      svg,
      ['Occupied', 'Unoccupied', 'Blocked'],
      {'Occupied': '#b93556', 'Unoccupied': '#000004', 'Blocked': 'grey'},
      false, margin.left, 45, 125);
        
    svg = svg.append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Build X scales and axis:
    xScale
      .range([0, width - 120])
      .domain(d3.map(data, xValue).keys())
      .padding(0.05);

    // Build Y scales and axis:
    yScale
      .range([height - margin.top - margin.bottom, 0])
      .domain(d3.map(data, yValue).keys())
      .padding(0.05);
    
    // X axis
    const xAxis = svg.append("g")
        .attr("transform", "translate(0," + 0 + ")")
        .call(d3.axisTop(xScale).tickSize(0))
    xAxis.selectAll("text")	
      .style("text-anchor", "end")
      .attr("dx", "-.8em")
      .attr("dy", ".15em")
      .attr("transform", "rotate(65)");
    xAxis.select(".domain").remove();
        
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
          .text(yLabelText)

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

    colors = {
      'Resident Only': ['#000000', '#161616', '#242424', '#333333', '#434343', '#545454', '#656565', '#777777', '#898989', '#9c9c9c', '#afafaf', '#c2c2c2', '#d6d6d6', '#eaeaea', '#eff6ed', '#e0eddb', '#d1e4c9', '#c1dbb8', '#b2d2a7', '#a2c896', '#93bf85', '#83b674', '#73ad63', '#63a453', '#529b42', '#3f9231', '#29891d', '#008000'],
      'Unrestricted': ['#000000', '#161616', '#242424', '#333333', '#434343', '#545454', '#656565', '#777777', '#898989', '#9c9c9c', '#afafaf', '#c2c2c2', '#d6d6d6', '#eaeaea', '#fff9f1', '#fff3e3', '#ffedd4', '#ffe7c6', '#ffe1b7', '#ffdba8', '#ffd599', '#ffce8a', '#ffc879', '#ffc169', '#ffba57', '#ffb343', '#ffac2c', '#ffa500'],
      'Metered': ['#000000', '#161616', '#242424', '#333333', '#434343', '#545454', '#656565', '#777777', '#898989', '#9c9c9c', '#afafaf', '#c2c2c2', '#d6d6d6', '#eaeaea', '#fff3ef', '#ffe7de', '#ffdbce', '#ffcebe', '#ffc2ad', '#ffb59d', '#ffa78c', '#ff997c', '#ff8b6b', '#ff7b5a', '#ff6948', '#ff5535', '#ff3b20', '#ff0000'],
      'Handicapped': ['#000000', '#161616', '#242424', '#333333', '#434343', '#545454', '#656565', '#777777', '#898989', '#9c9c9c', '#afafaf', '#c2c2c2', '#d6d6d6', '#eaeaea', '#f6ffff', '#edffff', '#e3ffff', '#d9ffff', '#cfffff', '#c4ffff', '#b8ffff', '#abffff', '#9dffff', '#8effff', '#7cffff', '#66ffff', '#49ffff', '#00ffff'],
      'Visitor Parking': ['#000000', '#161616', '#242424', '#333333', '#434343', '#545454', '#656565', '#777777', '#898989', '#9c9c9c', '#afafaf', '#c2c2c2', '#d6d6d6', '#eaeaea', '#f7eef6', '#eeddec', '#e6cde3', '#ddbcda', '#d5acd1', '#cc9cc8', '#c38bbf', '#ba7bb5', '#b16bac', '#a75aa3', '#9e4a9b', '#943892', '#8a2389', '#800080']
    };

    function fill(d) {
      console.log(d.timeRange.duration);
      return colors[d.regulation][14 + d.timeRange.duration];
    }

    rect_width = xScale.bandwidth();
    rect_height = yScale.bandwidth();

    svg.selectAll()
      .data(data, d => X(d) + ':' + Y(d))
      .enter()
      .append("rect")
        .attr("x", d => X(d))
        .attr("y", d => Y(d))
        .attr("width", rect_width)
        .attr("height", rect_height)
        .style("fill", d => fill(d))
        .style("stroke-width", 1)
        .style("stroke", d => fill(d))
        .style("opacity", 0.8)
        .on("mouseover", mouseover)
        .on("mousemove", mousemove)
        .on("mouseleave", mouseleave);
    
    const points = svg.selectAll("rect").data(data);
    selectableElements = points;

    svg.call(brush);

    // Highlight points when brushed
    function brush(g) {
      const brush = d3.brush()
        .on("start brush", highlight)
        .on("end", brushEnd)
        .extent([
          [-margin.left, -margin.bottom],
          [width + margin.right, height + margin.top]
        ]);

      ourBrush = brush;

      g.call(brush); // Adds the brush to this element

      // Highlight the selected circles.
      function highlight() {
        if (d3.event.selection === null) return;
        const [
          [x0, y0],
          [x1, y1]
        ] = d3.event.selection;
        points.classed("selected", d =>
          x0 <= X(d) + (rect_width/2) && X(d) <= x1 && y0 <= Y(d) + (rect_height/2) && Y(d) <= y1
        );
      }
      
      function brushEnd() {
        // We don't want an infinite recursion
        if (d3.event.sourceEvent.type != "end") {
          d3.select(this).call(brush.move, null);
        }

        // Get the name of our dispatcher's event
        let dispatchString = Object.getOwnPropertyNames(dispatcher._)[0];

        // Let other charts know
        dispatcher.call(dispatchString, this, svg.selectAll(".selected").data());
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

  // Gets or sets the dispatcher we use for selection events
  chart.selectionDispatcher = function (_) {
    if (!arguments.length) return dispatcher;
    dispatcher = _;
    return chart;
  };

  // Given selected data from another visualization 
  // select the relevant elements here (linking)
  chart.updateSelection = function (selectedData) {
    if (!arguments.length) return;

    // Select an element if its datum was selected
    selectableElements.classed("selected", d => 
      selectedData.some(sd => sd['time'] == d['time'])
    );
  };

  return chart;
}