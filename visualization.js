const REGULATION_COLORS = {
    'Resident Only': 'green',
    'Unrestricted': 'orange',
    'Metered': 'red',
    'Handicapped': 'cyan',
    'Visitor Parking': 'purple',
}

const TIMES = [
  "6:00 AM",
  "7:00 AM",
  "8:00 AM",
  "9:00 AM",
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "1:00 PM",
  "2:00 PM",
  "3:00 PM",
  "4:00 PM",
  "5:00 PM",
  "6:00 PM",
  "7:00 PM",
  "8:00 PM"
]

/**
 * Adds the given title to the element at the given x and y.
 * 
 * @param {*} el 
 * @param {String} title 
 * @param {number} x 
 * @param {number} y 
 */
function addTitle(el, title, x=0, y=0) {
  el.append("text")
    .attr("x", x)
    .attr("y", y)
    .attr("text-anchor", "left")
    .style("font-size", "22px")
    .style('fill', 'black')
    .text(title);
}

/**
 * Adds a legend to the given element given keys, their colors, and
 * positioning.
 * 
 * @param {*} el 
 * @param {Array<String>} keys 
 * @param {object} color_map 
 * @param {number} x 
 * @param {number} y 
 * @param {number} y_offset 
 */
function addLegend(el, keys, color_map={}, vertical=true, x=0, y=0, offset=15) {
  const labelGroup = el.append('g')
    .attr('transform','translate(' + x +',' + y + ')');
  
  keys.forEach((key, idx) => {
    if (vertical) {
      labelY = idx * offset;

      labelGroup.append("circle").attr("cx", 0).attr("cy", labelY).attr("r", 6).style("fill", color_map[key] || 'black');
      labelGroup.append("text").attr("x", 15).attr("y", labelY).text(key).style("font-size", "15px").attr("alignment-baseline","middle");
    } else {
      labelX = idx * offset

      labelGroup.append("circle").attr("cx", labelX).attr("cy", 0).attr("r", 6).style("fill", color_map[key] || 'black');
      labelGroup.append("text").attr("x", labelX + 10).attr("y", 0).text(key).style("font-size", "15px").attr("alignment-baseline","middle");
    }
  });
}

/**
 * Processes the data into a map from regulation to a list of utilization rates during
 * each recorded time of the day.
 */
function utilizationRateByGroup(data) {
    let grouped_data = {};
    const excluded = ['Construction', 'Blocked', '']

    for (row of data) {
        regulation = row['Regulation']
        if (grouped_data[regulation] == undefined) {
            grouped_data[regulation] = {}
            grouped_data[regulation]['total_spots'] = 0
        }

        grouped_data[regulation]['total_spots'] += 1

        Object.keys(row).forEach(function (key) {
            if (key.includes('AM') || key.includes('PM')) {
                if (!excluded.includes(row[key])) {
                    if (grouped_data[regulation][key] == undefined) {
                        grouped_data[regulation][key] = {'occupied_spots': 0}
                    }

                    grouped_data[regulation][key]['occupied_spots'] += 1
                }
            }
        });
    }

    data_by_regulation = {}
    Object.keys(grouped_data).forEach(function (regulation) {
        data_by_regulation[regulation] = []

        Object.keys(grouped_data[regulation]).forEach(function (time) {
            if (time != 'total_spots') {
                total_spots = grouped_data[regulation]['total_spots'];
                occupied_spots = grouped_data[regulation][time]['occupied_spots'];

                util_rate = occupied_spots / total_spots;
                data_by_regulation[regulation].push({'time': time, 'util_rate': util_rate, 'occupied_spots': occupied_spots});
            }
        });
    });

    return data_by_regulation
}


function renderMapVis(data) {

}

function renderHeatmapVis(data) {

}

/**
 * Adds the area chart svg.
 * 
 * @param {*} data 
 */
function renderAreaVis(data) {
    data = utilizationRateByGroup(data)

    const width  = 900;
    const height = 500;
    const margin = {
        top: 40,
        bottom: 40,
        left: 60,
        right: 120
    };

    const svg = d3.select('#area-container')
        .append('svg')
          .attr("width", width + margin.left + margin.right)
          .attr("height", height + margin.top);

    addTitle(svg, 'Chester Square Parking Spot Utilization', x=margin.left, y=17);
    addLegend(svg, Object.keys(data), REGULATION_COLORS, true, width - margin.right, margin.top);
        
    const chartGroup = svg
        .append('g')
            .attr('transform','translate(' + margin.left +',' + margin.top + ')');

    // Create x,y axis with axis labels
    const xScale = d3.scaleBand()
      .range([0, width - margin.right - margin.left])
      .domain(TIMES);
    const yScale = d3.scaleLinear()
      .domain([0, 1])
      .range([height - margin.bottom - margin.top, 0]);
    
    const xAxis = d3.axisBottom(xScale);
    chartGroup.append('g')
        .attr('class', 'x axis')
        .attr('transform', 'translate(0, ' + (height - margin.bottom - margin.top) + ')')
        .call(xAxis)
        .selectAll('.tick')
          .attr('transform', function() {
            return this.getAttribute('transform') + ' translate(-24, 0)'
          });
    
    svg.append("text")             
        .attr("transform",
              "translate(" + (width / 2)+ " ," + (height) + ")")
        .style("text-anchor", "middle")
        .text("Time of Day");

    const yAxis = d3.axisLeft(yScale);
    chartGroup.append('g')
        .attr('class', 'y axis')
        .attr('transform', 'translate(0, 0)')
        .call(yAxis);
    
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 10)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Utilization Rate");    
    
    // Converts an hour (e.g. '6:00 AM') into an integer for sorting.
    function hourToInt(hour) {
        hourInt = parseInt(hour.substring(0, hour.indexOf(':')));
        isPm = hour.substring(hour.length - 2, hour.length - 1) == 'P';
        return hourInt + (isPm && hourInt != 12 ? 12 : 0);
    }
    
    // Define our areas and lines
    const area = d3.area()
      .curve(d3.curveNatural)
      .x(d => xScale(d.time))
      .y0(d => yScale(d.util_rate) - d.occupied_spots / 2)
      .y1(d => yScale(d.util_rate) + d.occupied_spots / 2);
    const line = d3.line()
      .curve(d3.curveNatural)
      .x(d => xScale(d.time))
      .y(d => yScale(d.util_rate));

    // Create lines for each regulation
    Object.keys(data).forEach(key => {
        chartGroup.append('path')
            .attr('d', area(data[key].sort((d1, d2) => hourToInt(d1.time) - hourToInt(d2.time))))
            .attr('stroke', REGULATION_COLORS[key])
            .attr('stroke-opacity', 0.5)
            .attr('fill', REGULATION_COLORS[key])
            .attr('fill-opacity', 0.5);
        chartGroup.append('path')
            .attr('d', line(data[key].sort((d1, d2) => hourToInt(d1.time) - hourToInt(d2.time))))
            .attr('class', 'dataLine')
            .attr('stroke', REGULATION_COLORS[key]);
    });
}

d3.csv('./data/parking.csv').then(data => {
    renderMapVis(data);
    renderHeatmapVis(data);
    renderAreaVis(data);
});

/*
 ------------------------------Below is the code for heat map----------------------------------
*/

// TODO: It's probably gonna be best to source everything from one csv once we get to
// brushing and linking.

// set the dimensions and margins of the graph
var margin = {top: 80, right: 25, bottom: 30, left: 75},
  width = 6000 - margin.left - margin.right,
  height = 450 - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg = d3.select("#heatmap-container")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");

//Read the data
d3.csv("./data/Heat-Map-Data.csv").then(data => {
  var myGroups = [];
  for (var i = 1; i <291; i++ ) {
    myGroups.push(i.toString())
  }

  // Build X scales and axis:
  var x = d3.scaleBand()
    .range([0, width])
    .domain(myGroups)
    .padding(0.05);
  svg.append("g")
    .style("font-size", 15)
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x).tickSize(0))
    .select(".domain").remove()

  // Build Y scales and axis:
  var y = d3.scaleBand()
    .range([ height, 0 ])
    .domain(TIMES)
    .padding(0.05);
  svg.append("g")
    .style("font-size", 15)
    .call(d3.axisLeft(y).tickSize(0))
    .select(".domain").remove()

  // // Build color scale
  // var color = d3.scaleSequential()
  //   .interpolator(d3.interpolateInferno)
  //   .domain([1,100])

  // create a tooltip
  var tooltip = d3.select("#heatmap-container")
    .append("div")
    .style("opacity", 0)
    .attr("class", "tooltip")
    .style("background-color", "white")
    .style("border", "solid")
    .style("border-width", "2px")
    .style("border-radius", "5px")
    .style("padding", "5px")

  // Three function that change the tooltip when user hover / move / leave a cell
  var mouseover = function(d) {
    tooltip
      .style("opacity", 1)
    d3.select(this)
      .style("stroke", "black")
      .style("opacity", 1)
  }
  var mousemove = function(d) {
    tooltip
      .html(d.occupied || 'Unoccupied')
      .style("position", "absolute")
      .style("left", (d3.mouse(this)[10]+70) + "px")
      .style("top", (d3.mouse(this)[10]) + "px")
  }
  var mouseleave = function(d) {
    tooltip
      .style("opacity", 0)
    d3.select(this)
      .style("stroke", "none")
      .style("opacity", 0.8)
  }

  // add the squares
  svg.selectAll()
    .data(data, function(d) {return d.spot+':'+d.time;})
    .enter()
    .append("rect")
      .attr("x", function(d) { return x(d.spot) })
      .attr("y", function(d) { return y(d.time) })
      .attr("width", x.bandwidth() )
      .attr("height", y.bandwidth() )
      .style("fill", function(d) { 
        if (d.occupied === '') {
          return '#000004'
        }
        else if (d.occupied === 'Construction' || d.occupied == 'Blocked' ) {
          return 'grey'
        }
        else {
          return '#b93556'
        }
       } )
      .style("stroke-width", 4)
      .style("stroke", "none")
      .style("opacity", 0.8)
    .on("mouseover", mouseover)
    .on("mousemove", mousemove)
    .on("mouseleave", mouseleave)
})

addTitle(svg, 'Chester Square Parking', 0, -10);
addLegend(svg, ['Occupied', 'Unoccupied', 'Blocked'], {'Occupied': 'red', 'Unoccupied': 'black', 'Blocked': 'grey'}, false, 250, -15, 120);

