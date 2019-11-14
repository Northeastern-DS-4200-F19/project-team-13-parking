
d3.csv('./data/parking.csv').then(data => {
  const acUtilRate = areachart()
    .x(d => d.time)
    .xLabel("Time of Day")
    .y(d => d.util_rate)
    .yLabel("Utilization")
    .yLabelOffset(40)
    ("#area-container", utilizationRateByGroup(data));
});
