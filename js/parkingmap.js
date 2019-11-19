
// Parse parking survey data
//...

//
// d3.selectAll(".parkingspot")
//     .data(theData)
//     .enter()
//     .append("p")


d3.selectAll(".parkingspot")
            .on("mouseover", mouseover)
            .on("mouseout", mouseleave)
            .on("click", mouseclick)


function mouseover() {
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

function mouseclick() {
    tooltip
        .style("opacity", 1)
    d3.select(this)
        .style("fill", "green")

}

