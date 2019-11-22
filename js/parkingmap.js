const PARKING_SPOTS = 384;

var rangeslider = document.getElementById("sliderRange"); 
var output = document.getElementById("time"); 
output.innerHTML = intToHour(rangeslider.value); 
  
// read the data
var mapData = {}
d3.csv("./data/parking.csv").then (function(data) {
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
});

d3.selectAll("use")
  .on("mouseover", mouseover)
  .on("mouseout", mouseleave)


function mouseover() {
    //convert the slider value to the correct index of time in mapData
    index = rangeslider.value - 5
    tooltip
        .html(mapData[d3.select(this).attr("id")][0] + ': ' + mapData[d3.select(this).attr("id")][index] || "Unoccupied")
        .style("opacity", 1);
    d3.select(this)
      .style("fill", "red")
}

function mouseleave() {
  tooltip
      .style("opacity", 0)
  d3.select(this)
    .style("fill", "black")
}

function updateParkingMap() {
  for (var j = 1; j < PARKING_SPOTS; j++) {
    if (mapData["_" + j][rangeslider.value - 5] == "Construction" || mapData["_" + j][rangeslider.value - 5] == "Blocked") {
        d3.select("#_" + j).style("fill", "grey")
    }
    else if (mapData["_" + j][rangeslider.value - 5] == "") {
        d3.select("#_" + j).style("fill", "#000004")
    }
    else {
        d3.select("#_" + j).style("fill", "#b93556")
    }
  }
}

function filterParkingMap(spots=[], regulations=[]) {
  updateParkingMap();

  if (spots.length == 0 && regulations.length == 0) {
    return;
  }

  for (var id = 1; id < PARKING_SPOTS; id++) {
    if (!spots.includes(""+ id) && !regulations.includes(mapData['_' + id][0])) {
      d3.select("#_" + id).style("fill", "white");
    }
  }
}

rangeslider.oninput = function() { 
    output.innerHTML = intToHour(this.value); 
    updateParkingMap();
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
