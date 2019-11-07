REGULATION_COLORS = {
    'Resident Only': 'red',
    'Unrestricted': 'blue',
    'Metered': 'green',
    'Handicapped': 'black',
    'Visitor': 'purple',
    'Visitor Parking': 'pink',
}

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
                data_by_regulation[regulation].push({'time': time, 'util_rate': util_rate});
            }
        });
    });

    return data_by_regulation
}


function renderMapVis(data) {

}

function renderHeatmapVis(data) {

}

function renderAreaVis(data) {
    data = utilizationRateByGroup(data)

    const width  = 600;
    const height = 500;
    const margin = {
        top: 30,
        bottom: 30,
        left: 30,
        right: 30
    };

    const svg = d3.select('.vis-holder')
        .append('svg')
            .attr('width', width)
            .attr('height', height)
            .style('background', '#efefef');

    const chartGroup = svg
        .append('g')
            .attr('transform','translate(' + margin.left +',' + margin.top + ')');

    const xScale = d3.scaleLinear()
        .domain([6, 20])
        .range([0, width - margin.left * 2]);
    
    const yScale = d3.scaleLinear()
        .domain([0, 1])
        .range([height - margin.bottom - margin.top, 0]);
    
    const xAxis = d3.axisBottom(xScale);
    chartGroup.append('g')
        .attr('class', 'x axis')
        .attr('transform', 'translate(0, ' + (height - margin.bottom - margin.top) + ')')
        .call(xAxis);

    const yAxis = d3.axisLeft(yScale);
    chartGroup.append('g')
        .attr('class', 'y axis')
        .attr('transform', 'translate(0, 0)')
        .call(yAxis);
    
    function hourToInt(hour) {
        hourInt = parseInt(hour.substring(0, hour.indexOf(':')))
        isPm = hour.substring(hour.length - 2, hour.length - 1) == 'P'
        return hourInt + (isPm && hourInt != 12 ? 12 : 0)
    }
    
    const line = d3.line()
        .x(d => xScale(hourToInt(d.time)))
        .y(d => yScale(d.util_rate));

    Object.keys(data).forEach(key => {
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
// set the dimensions and margins of the graph
var margin = {top: 80, right: 25, bottom: 30, left: 50},
  width = 4500 - margin.left - margin.right,
  height = 450 - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg = d3.select("#heatmap")
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



  var myVars = [
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

  // console.log(myGroups)
  // console.log(myVars)

  // Build X scales and axis:
  var x = d3.scaleBand()
    .range([ 0, width ])
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
    .domain(myVars)
    .padding(0.05);
  svg.append("g")
    .style("font-size", 15)
    .call(d3.axisLeft(y).tickSize(0))
    .select(".domain").remove()

  // Build color scale
  var myColor = d3.scaleSequential()
    .interpolator(d3.interpolateInferno)
    .domain([1,100])

  // create a tooltip
  var tooltip = d3.select("#heatmap")
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
      .html("The exact value of<br>this cell is: " + d.occupied)
      .style("left", (d3.mouse(this)[0]+70) + "px")
      .style("top", (d3.mouse(this)[1]) + "px")
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
      .attr("rx", 4)
      .attr("ry", 4)
      .attr("width", x.bandwidth() )
      .attr("height", y.bandwidth() )
      .style("fill", function(d) { return myColor(d.occID)} )
      .style("stroke-width", 4)
      .style("stroke", "none")
      .style("opacity", 0.8)
    .on("mouseover", mouseover)
    .on("mousemove", mousemove)
    .on("mouseleave", mouseleave)
})

// Add title to graph
svg.append("text")
        .attr("x", 0)
        .attr("y", -50)
        .attr("text-anchor", "left")
        .style("font-size", "22px")
        .text("Chester Square Parking");

// Add subtitle to graph
svg.append("text")
        .attr("x", 0)
        .attr("y", -20)
        .attr("text-anchor", "left")
        .style("font-size", "14px")
        .style("fill", "grey")
        .style("max-width", 400)
        .text("Yilang Wan");

