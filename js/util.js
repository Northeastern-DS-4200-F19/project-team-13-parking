const REGULATION_COLORS = {
    'Resident Only': 'green',
    'Unrestricted': 'orange',
    'Metered': 'red',
    'Handicapped': 'cyan',
    'Visitor Parking': 'purple',
}

const TIMES = [
  "6:00 AM",
  "7:00 AM",
  "8:00 AM",
  "9:00 AM",
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "1:00 PM",
  "2:00 PM",
  "3:00 PM",
  "4:00 PM",
  "5:00 PM",
  "6:00 PM",
  "7:00 PM",
  "8:00 PM"
]

/**
 * Remove the chart in the given container and draw the given chart there with the data.
 */
function redrawChart(chart, container_selector, data) {
  d3.select(container_selector).select('svg').remove()
  d3.select(container_selector).select('div').remove()

  chart(container_selector, data);
}


/**
 * Adds the given title to the element at the given x and y.
 * 
 * @param {*} el 
 * @param {String} title 
 * @param {number} x 
 * @param {number} y 
 */
function addTitle(el, title, x=0, y=0, font_size=22) {
  el.append("text")
    .attr("x", x)
    .attr("y", y)
    .attr("text-anchor", "left")
    .style("font-size", font_size + "px")
    .style('fill', 'black')
    .text(title);
}

/**
 * Adds a legend to the given element given keys, their colors, and
 * positioning.
 * 
 * @param {*} el 
 * @param {String} title
 * @param {Array<String>} keys 
 * @param {object} color_map 
 * @param {number} x 
 * @param {number} y 
 * @param {number} y_offset 
 */
function addLegend(el, title, keys, color_map={}, vertical=true, x=0, y=0, offset=15, callbacks=[]) {
  const labelGroup = el.append('g')
    .attr('transform','translate(' + x +',' + y + ')');
  
  function appendEventHandlers(element, key) {
    element
      .on('click', _ => callbacks.forEach(callback => callback([key])))
      .on('mouseover', function(_) { d3.select(this).style("cursor", "pointer"); })
      .on('mouseout', function(_) { d3.select(this).style("cursor", "default"); });
  }

  labelGroup.append("text").attr("x", 0).attr("y", 0).text(title + ':').attr("alignment-baseline","middle");

  keys.forEach((key, idx) => {
    let circle, text;
    if (vertical) {
      labelY = (idx + 1) * offset;

      circle = labelGroup.append("circle").attr("cx", 0).attr("cy", labelY).attr("r", 6).style("fill", color_map[key] || 'black')
      text = labelGroup.append("text").attr("x", 15).attr("y", labelY).text(key).style("font-size", "15px").attr("alignment-baseline","middle");
    } else {
      labelX = (idx + 1) * offset

      circle = labelGroup.append("circle").attr("cx", labelX).attr("cy", 0).attr("r", 6).style("fill", color_map[key] || 'black');
      text = labelGroup.append("text").attr("x", labelX + 10).attr("y", 0).text(key).style("font-size", "15px").attr("alignment-baseline","middle");
    }

    appendEventHandlers(circle, key);
    appendEventHandlers(text, key);
  });
}

/**
 * Converts an hour (e.g. '6:00 AM') into an integer for sorting.
 */
function hourToInt(hour) {
  hourInt = parseInt(hour.substring(0, hour.indexOf(':')));
  isPm = hour.substring(hour.length - 2, hour.length - 1) == 'P';
  return hourInt + (isPm && hourInt != 12 ? 12 : 0);
}


/**
 * Processes the data into a map from regulation to a list of utilization rates during
 * each recorded time of the day.
 */
function utilizationRateByGroup(data, spots=[], times=[]) {
    let grouped_data = {};
    const excluded = ['Construction', 'Blocked', '']

    for (row of data) {
        if (spots.length > 0 && !spots.includes(row['Absolute Spot Number'])) {
          continue;
        }

        regulation = row['Regulation']
        if (grouped_data[regulation] == undefined) {
            grouped_data[regulation] = {}
            grouped_data[regulation]['total_spots'] = 0
            grouped_data[regulation]['spots'] = []
        }

        grouped_data[regulation]['total_spots'] += 1
        grouped_data[regulation]['spots'].push(row['Absolute Spot Number']);

        Object.keys(row).forEach(function (key) {
            if (key.includes('AM') || key.includes('PM')) {
                if (!excluded.includes(row[key])) {
                    if (grouped_data[regulation][key] == undefined) {
                        grouped_data[regulation][key] = {'occupied_spots': 0}
                    }

                    grouped_data[regulation][key]['occupied_spots'] += 1
                }
            }
        });
    }

    data_by_regulation = {}
    const excluded_keys = ['total_spots', 'spots']
    Object.keys(grouped_data).forEach(regulation => {
        data_by_regulation[regulation] = []

        Object.keys(grouped_data[regulation]).forEach(time => {
            if (times.length > 0 && !times.includes(time)) {
              return;
            }

            if (!excluded_keys.includes(time)) {
              total_spots = grouped_data[regulation]['total_spots'];
              occupied_spots = grouped_data[regulation][time]['occupied_spots'];
              spots = grouped_data[regulation]['spots']

              util_rate = occupied_spots / total_spots;
              data_by_regulation[regulation].push({
                'time': time,
                'util_rate': util_rate,
                'occupied_spots': occupied_spots,
                'spots': spots,
                'regulation': regulation
              });
            }
        });
    });

    return data_by_regulation
}

/**
 * Process the data into a list of information for all spots at all recorded times,
 * optionally filtered by times.
 */
function parkingSpotTimeData(data, times=[], regulations=[]) {
  parking_spot_time_data = []

  for (row of data) {
    const unselected_regulation = regulations.length > 0 && !regulations.includes(row['Regulation']);

    Object.keys(row).forEach(time => {
      const unselected_time = times.length > 0 && !times.includes(time);

      if (time.includes('AM') || time.includes('PM')) {
        parking_spot_time_data.push({
          'spot': row['Absolute Spot Number'],
          'time': time,
          'occupied': row[time],
          'unselected': unselected_regulation || unselected_time
        });
      }
    });
  }

  return parking_spot_time_data.sort((a, b) => b['spot'] - a['spot']);
}