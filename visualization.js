
// Immediately Invoked Function Expression to limit access to our 
// variables and prevent 
((() => {
  d3.csv('./data/parking.csv').then(data => {
    const acUtilRate = areachart()
      .x(d => d.time)
      .xLabel("Time of Day")
      .y(d => d.util_rate)
      .yLabel("Utilization")
      .yLabelOffset(40)
      ("#area-container", utilizationRateByGroup(data));
    
    const hmParkingSpots = heatmap()
      .x(d => d.spot)
      .xLabel("Parking Spot")
      .y(d => d.time)
      .yLabel("Time of Day")
      .yLabelOffset(40)
      ("#heatmap-container", parkingSpotTimeData(data));
  });
})())
