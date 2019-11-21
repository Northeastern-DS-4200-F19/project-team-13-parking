
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
      .registerLegendCallback(updateHeatmapRegulations)
      ("#area-container", utilizationRateByGroup(data));
    
    const hmParkingSpots = heatmap()
      .x(d => d.time)
      .xLabel("Time of Day")
      .y(d => d.spot)
      .yLabel("Parking Spot Number")
      .yLabelOffset(40)
      .selectionDispatcher(d3.dispatch(DATA_SELECTED))
      ("#heatmap-container", parkingSpotTimeData(data));

    updateParkingMap();


    function updateHeatmapRegulations(regulations) {
      redrawChart(hmParkingSpots, '#heatmap-container', parkingSpotTimeData(data, [], regulations))
    }

    acUtilRate.selectionDispatcher().on(DATA_SELECTED, selectedData => {
      redrawChart(hmParkingSpots, '#heatmap-container', parkingSpotTimeData(data, selectedData.map(d => d.time)));
    });

    hmParkingSpots.selectionDispatcher().on(DATA_SELECTED, selectedData => {
      redrawChart(acUtilRate, '#area-container', utilizationRateByGroup(data, selectedData.map(d => d.spot), selectedData.map(d => d.time)))
      filterParkingMap(selectedData.map(d => d.spot));
    });
  });
})())
