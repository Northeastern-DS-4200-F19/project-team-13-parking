

var rangeslider = document.getElementById("sliderRange"); 
var output = document.getElementById("demo"); 
output.innerHTML = rangeslider.value; 
  
rangeslider.oninput = function() { 
  output.innerHTML = this.value; 
} 

// read the data
var mapData = {}
d3.csv("/data/parking.csv").then (function(data) {
    for (var i = 0; i < data.length; i++) {
        mapData['_' + data[i]['Absolute Spot Number']] = 
        [data[i]['Regulation'], 
        data[i]['6:00 AM'], 
        data[i]['7:00 AM'],
        data[i]['8:00 AM'],
        data[i]['9:00 AM'],
        data[i]['10:00 AM'],
        data[i]['11:00 AM'],
        data[i]['12:00 PM'],
        data[i]['1:00 PM'],
        data[i]['2:00 PM'],
        data[i]['3:00 PM'],
        data[i]['4:00 PM'],
        data[i]['5:00 PM'],
        data[i]['6:00 PM'],
        data[i]['7:00 PM'],
        data[i]['8:00 PM']];
    }
    console.log(mapData);
});


d3.selectAll(".parkingspot")
            .on("mouseover", mouseover)
            .on("mouseout", mouseleave)
            // .on("click", mouseclick)


function mouseover() {

    //convert the slider value to the correct index of time in mapData
    index = rangeslider.value - 5

    tooltip
        .html(mapData[d3.select(this).attr("id")][0] + ' ' + mapData[d3.select(this).attr("id")][index])
        .style("opacity", 1)
    d3.select(this)
      .style("fill", "red")
}

function mouseleave() {
    tooltip
        .style("opacity", 0)
    d3.select(this)
      .style("fill", "black")
}

// create a tooltip
const tooltip = d3.select("#map-container")
    .append("div")
    .style("opacity", 0)
    .attr("class", "tooltip")
    .style("background-color", "white")
    .style("border", "solid")
    .style("border-width", "2px")
    .style("border-radius", "5px")
    .style("padding", "5px")

// function mouseclick() {
//     tooltip
//         .html(mapData[d3.select(this).attr("id")])
//         .style("opacity", 1)
//     d3.select(this)
//         .style("fill", "green")

// }

