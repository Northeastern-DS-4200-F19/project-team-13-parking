
((() => {
  // Set up accordion legends.
  makeExpandable("accordion");

  // All regulations selected in the regulations legend.
  let SELECTED_REGULATIONS = [];

  const DATA_SELECTED = "data_selected";

  d3.csv('./data/parking.csv').then(data => {
    // Render area chart.
    const acUtilRate = areachart()
      .x(d => d.time)
      .xLabel("Time of Day")
      .y(d => d.util_rate)
      .yLabel("Utilization")
      .yLabelOffset(40)
      .selectionDispatcher(d3.dispatch(DATA_SELECTED))
      .registerLegendCallback(storeSelectedRegulations)
      .registerLegendCallback(updateAreaRegulations)
      .registerLegendCallback(updateHeatmapRegulations)
      .registerLegendCallback(updateParkingMapRegulations)
      ("#area-container", utilizationRateByGroup(data));
    
    // Render heatmap.
    PARKING_SPOT_DATA = parkingSpotTimeData(data);
    const hmParkingSpots = heatmap()
      .x(d => d.time)
      .xLabel("Time of Day")
      .y(d => d.spot)
      .yLabel("Parking Spot Number")
      .yLabelOffset(0)
      .selectionDispatcher(d3.dispatch(DATA_SELECTED))
      ("#heatmap-container", PARKING_SPOT_DATA);

    // Color parking spots in map by regulation.
    updateParkingMap();

    // Store any selected regulations for consistent filtering.
    function storeSelectedRegulations(regulations) {
      SELECTED_REGULATIONS = regulations;
    }

    // Redraw area chart filtered by regulations.
    function updateAreaRegulations(regulations) {
      redrawChart(acUtilRate, '#area-container', utilizationRateByGroup(data, [], [], regulations));
    }

    // Filter heatmap by regulations.
    function updateHeatmapRegulations(regulations) {
      filterHeatmap('#heatmap-container', PARKING_SPOT_DATA, regulations=regulations);
    }

    // Filter parking map by regulations.
    function updateParkingMapRegulations(regulations) {
      filterParkingMap(spots=[], regulations=regulations);
    }

    acUtilRate.selectionDispatcher().on(DATA_SELECTED, selectedData => {
      // Redraw heatmap filtered by time.
      filterHeatmap('#heatmap-container', PARKING_SPOT_DATA, regulations=SELECTED_REGULATIONS, times=selectedData.map(d => d.time));
    });

    hmParkingSpots.selectionDispatcher().on(DATA_SELECTED, selectedData => {
      const selectedSpots = selectedData.map(d => d.spot);
      const selectedTimes = selectedData.map(d => d.time);

      // Redraw area chart filtered by spot # and time.
      redrawChart(acUtilRate, '#area-container', utilizationRateByGroup(data, selectedSpots, selectedTimes, SELECTED_REGULATIONS));
      // Filter the heatmap by any selected regulations and times.
      filterHeatmap('#heatmap-container', PARKING_SPOT_DATA, regulations=SELECTED_REGULATIONS, times=selectedTimes);
      // Filter parking map by spot # and selected regulations.
      filterParkingMap(spots=selectedSpots, regulations=SELECTED_REGULATIONS);
    });
  });
})())
