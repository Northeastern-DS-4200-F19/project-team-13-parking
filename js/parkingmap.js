const PARKING_SPOTS = 384;

var rangeslider = document.getElementById("sliderRange"); 
var output = document.getElementById("time"); 
output.innerHTML = intToHour(rangeslider.value); 
  
// read the data
var mapData = {}
d3.csv("./data/parking.csv").then (function(data) {
    for (var i = 0; i < data.length; i++) {
      let regulation = data[i]['Regulation'];
      if (data[i]['Regulation'] === "Visitor") {
        regulation = "Visitor Parking";
      }
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
    spot = d3.select(this);
    if (!spot.classed('hidden-spot')) {
      index = rangeslider.value - 5
      let occupant = mapData[spot.attr("id")][index];
      tooltip
          .html(mapData[spot.attr("id")][0] + ': ' + (occupant === "" ? "Unoccupied" : occupant))
          .style("opacity", 1);

      // spot.style("fill", "red")
    }
}

function mouseleave() {
  tooltip
      .style("opacity", 0)
  fillById(d3.select(this).attr("id"))
}

function updateParkingMap() {
  for (var j = 1; j <= PARKING_SPOTS; j++) {
    fillById("_" + j);
  }
}

function fillById(id) {
  if (mapData[id][rangeslider.value - 5] == "Construction" || mapData[id][rangeslider.value - 5] == "Blocked") {
    d3.select("#" + id).style("fill", REGULATION_COLORS["Blocked"])
  } else if (mapData[id][rangeslider.value - 5] == "") {
    d3.select("#" + id).style("fill", "#000000")
  } else {
    d3.select("#" + id).style("fill", REGULATION_COLORS[mapData[id][0]])
  }
}

function filterParkingMap(spots=[], regulations=[]) {
  updateParkingMap();

  for (var id = 1; id <= PARKING_SPOTS; id++) {
    const notInSpots = spots.length > 0 && !spots.includes("" + id);
    const notInRegulations = regulations.length > 0 && !regulations.includes(mapData['_' + id][0]);
    d3.select("#_" + id).classed("hidden-spot", notInSpots || notInRegulations);
  }
}

rangeslider.onmouseover = function() {
  console.log(this.value);
}

rangeslider.oninput = function() { 
    output.innerHTML = intToHour(this.value);
    setHeatmapTimeMarker(intToHour(this.value));
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
