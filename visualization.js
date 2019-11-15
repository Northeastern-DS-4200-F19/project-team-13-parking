
// Immediately Invoked Function Expression to limit access to our 
// variables and prevent 
((() => {
  const DATA_SELECTED = "data_selected";

  d3.csv('./data/parking.csv').then(data => {
    const acUtilRate = areachart()
      .x(d => d.time)
      .xLabel("Time of Day")
      .y(d => d.util_rate)
      .yLabel("Utilization")
      .yLabelOffset(40)
      .selectionDispatcher(d3.dispatch(DATA_SELECTED))
      ("#area-container", utilizationRateByGroup(data));
    
    const hmParkingSpots = heatmap()
      .x(d => d.spot)
      .xLabel("Parking Spot")
      .y(d => d.time)
      .yLabel("Time of Day")
      .yLabelOffset(40)
      .selectionDispatcher(d3.dispatch(DATA_SELECTED))
      ("#heatmap-container", parkingSpotTimeData(data));

      acUtilRate.selectionDispatcher().on(DATA_SELECTED, selectedData => {
        hmParkingSpots.updateSelection(selectedData);
      });
  
      hmParkingSpots.selectionDispatcher().on(DATA_SELECTED, selectedData => {
        redrawChart(acUtilRate, '#area-container', utilizationRateByGroup(data, selectedData.map(d => d.spot), selectedData.map(d => d.time)))
      });
  });
})())
