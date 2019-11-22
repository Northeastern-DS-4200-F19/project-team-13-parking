
((() => {
  // Accordion

  var acc = document.getElementsByClassName("accordion");
  var i;

  for (i = 0; i < acc.length; i++) {
    acc[i].addEventListener("click", function() {
      this.classList.toggle("active");
      var panel = this.nextElementSibling;
      if (panel.style.maxHeight) {
        panel.style.maxHeight = null;
      } else {
        panel.style.maxHeight = panel.scrollHeight + "px";
      }
    });
    if (!localStorage.getItem("visited")) {
      acc[i].classList.toggle("active");
      var panel = acc[i].nextElementSibling;
      panel.style.maxHeight = panel.scrollHeight + "px";
      localStorage.setItem("visited", true);
    }
  }

  const DATA_SELECTED = "data_selected";

  d3.csv('./data/parking.csv').then(data => {
    const acUtilRate = areachart()
      .x(d => d.time)
      .xLabel("Time of Day")
      .y(d => d.util_rate)
      .yLabel("Utilization")
      .yLabelOffset(40)
      .selectionDispatcher(d3.dispatch(DATA_SELECTED))
      .registerLegendCallback(updateAreaRegulations)
      .registerLegendCallback(updateHeatmapRegulations)
      .registerLegendCallback(updateParkingMapRegulations)
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

    function updateAreaRegulations(regulations) {
      redrawChart(acUtilRate, '#area-container', utilizationRateByGroup(data, [], [], regulations));
    }


    function updateHeatmapRegulations(regulations) {
      redrawChart(hmParkingSpots, '#heatmap-container', parkingSpotTimeData(data, [], regulations))
    }

    function updateParkingMapRegulations(regulations) {
      filterParkingMap(spots=[], regulations=regulations);
    }

    acUtilRate.selectionDispatcher().on(DATA_SELECTED, selectedData => {
      redrawChart(hmParkingSpots, '#heatmap-container', parkingSpotTimeData(data, selectedData.map(d => d.time)));
    });

    hmParkingSpots.selectionDispatcher().on(DATA_SELECTED, selectedData => {
      redrawChart(acUtilRate, '#area-container', utilizationRateByGroup(data, selectedData.map(d => d.spot), selectedData.map(d => d.time)))
      filterParkingMap(spots=selectedData.map(d => d.spot));
    });
  });
})())
