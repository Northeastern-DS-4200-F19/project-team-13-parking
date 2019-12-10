// Global colors for every regulation.
const REGULATION_COLORS = {
  'Resident Only': 'green',
  'Unrestricted': 'orange',
  'Metered': 'mediumblue',
  'Handicapped': 'gold',
  'Visitor Parking': 'purple',
  'Blocked': 'red' // Blocked is not a regulation, but in some instances is used as one.
}

// All hours we have data for, in AM/PM format.
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

// A mapping between times and an attribute that represents it.
const TIME_TO_ATTR = {
  "6:00 AM": "sixAM",
  "7:00 AM": "sevenAM",
  "8:00 AM": "eightAM",
  "9:00 AM": "nineAM",
  "10:00 AM": "tenAM",
  "11:00 AM": "elevenAM",
  "12:00 PM": "noon",
  "1:00 PM": "onePM",
  "2:00 PM": "twoPM",
  "3:00 PM": "threePM",
  "4:00 PM": "fourPM",
  "5:00 PM": "fivePM",
  "6:00 PM": "sixPM",
  "7:00 PM": "sevenPM",
  "8:00 PM": "eightPM"
}

/**
 * Remove the chart in the given container and draw the given chart there with the data.
 * 
 * @param {*} chart the reusable chart component to place in the container.
 * @param {String} containerSelector select the container to replace the chart in.
 * @param {*} data the data to construct the chart with.
 */
function redrawChart(chart, containerSelector, data) {
  d3.select(containerSelector).selectAll("*").remove(); // Remove all elements in container.

  chart(containerSelector, data);
}

/**
 * Adds the given title to the element at the given x and y.
 * 
 * @param {*} el the element to add the title to.
 * @param {String} title the title.
 * @param {number} x the x offset of the title.
 * @param {number} y the y offset of the title.
 * @param {String} fontSize the font size of the title.
 */
function addTitle(el, title, x=0, y=0, fontSize=22) {
  el.append("text")
    .attr("x", x)
    .attr("y", y)
    .attr("text-anchor", "left")
    .style("font-size", fontSize + "px")
    .style('fill', 'black')
    .text(title);
}

/**
 * Register a callback to an element, and calls the callbacks with its "key" value when clicked,
 * alongside the "key" values of all the passed in elements that are "clicked".
 * 
 * @param {*} element the element to register the callbacks for.
 * @param {*} elements the elements whose values are also passed to the callback if they are "clicked".
 * @param {*} callbacks the callback functions to register.
 */
function registerCallbacks(element, elements, callbacks) {
  element
    .on('click', _ => {
      element.classed("clicked", !element.classed("clicked"));
      elements.forEach(el => el.classed("notClicked", !el.classed("clicked")));

      keys = [];
      // Add each elements key to the argument passed to the callbacks
      // if they are "clicked".
      elements.forEach(el => {
        if (el.classed("clicked")) {
          keys.push(el.attr("key"));
        }
      });

      if (keys.length == 0) {
        elements.forEach(el => el.classed("notClicked", false));
      }

      callbacks.forEach(callback => callback(keys));
    })
    .on('mouseover', function(_) { d3.select(this).style("cursor", "pointer"); })
    .on('mouseout', function(_) { d3.select(this).style("cursor", "default"); });
}

/**
 * Attaches callbacks to the filters, which are called with the selected
 * keys in the filter.
 * 
 * @param {*} callbacks the callbacks to attach.
 */
function connectFilters(callbacks=[]) {
  const items = [];
  items.push(d3.select("#resident-filter").attr("key", "Resident Only"));
  items.push(d3.select("#unrestricted-filter").attr("key", "Unrestricted"));
  items.push(d3.select("#metered-filter").attr("key", "Metered"));
  items.push(d3.select("#handicapped-filter").attr("key", "Handicapped"));
  items.push(d3.select("#visitor-filter").attr("key", "Visitor Parking"));

  items.forEach(item => registerCallbacks(item, items, callbacks));
}

/**
 * Adds a legend to the given element given keys, their colors, and
 * positioning, registering callbacks to that legend.
 * 
 * @param {*} el the element to add the legend to.
 * @param {String} title the title of the legend.
 * @param {Array<String>} keys the keys of the legend.
 * @param {object} colorMap the colors of the keys.
 * @param {number} x the x offset of the legend.
 * @param {number} y the y offset of the legend.
 * @param {number} offset the offset of each legend item from each other.
 * @param {*} callbacks the callbacks to attach to the legend.
 */
function addLegend(el, title, keys, colorMap={}, vertical=true, x=0, y=0, offset=15, callbacks=[]) {
  const labelGroup = el.append('g')
    .attr('transform','translate(' + x +',' + y + ')');

  labelGroup.append("text").attr("x", 0).attr("y", 0).text(title + ':').style("font-size", "15px").attr("alignment-baseline","middle");

  const circles = [];
  keys.forEach((key, idx) => {
    let circle;
    if (vertical) {
      labelY = (idx + 1) * offset;

      circle = labelGroup.append("circle").attr("cx", 0).attr("cy", labelY).attr("r", 6).style("fill", colorMap[key] || 'black').attr("id", key);
      text = labelGroup.append("text").attr("x", 15).attr("y", labelY).text(key).style("font-size", "15px").attr("alignment-baseline","middle");
    } else {
      labelX = (idx + 1) * offset

      circle = labelGroup.append("circle").attr("cx", labelX).attr("cy", 0).attr("r", 6).style("fill", colorMap[key] || 'black');
      text = labelGroup.append("text").attr("x", labelX + 10).attr("y", 0).text(key).style("font-size", "15px").attr("alignment-baseline","middle");
    }

    circles.push(circle);
  });

  circles.forEach(circle => registerCallbacks(circle, circles, callbacks));
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
 * Converts an int into an hour (e.g. '6:00 AM').
 */
function intToHour(intHour) {
  return TIMES.find(time => hourToInt(time) == intHour) || '11:00PM';
}

/**
 * Sets the time marker on the heatmap, used with the range slider.
 * 
 * @param {*} time the time to highlight.
 */
function setHeatmapTimeMarker(time) {
  let marker = d3.select("#timeMarker");
  marker.attr("x", marker.attr(TIME_TO_ATTR[time]));
}


/**
 * Processes the data into a map from regulation to a list of utilization rates during
 * each recorded time of the day, optionally filtered by spot, time, or regulation.
 * 
 * @param data the data to derive the util rates from.
 * @param spots if non-empty, the spots to filter by and include in the result.
 * @param times if non-empty, the times to filter by and include in the result.
 * @param regulations if non-empty, the regulations to filter by and include in the result.
 */
function utilizationRateByGroup(data, spots=[], times=[], regulations=[]) {
  let groupedData = {};
  const excluded = ['Construction', 'Blocked', ''];

  // Preprocess data into a map from regulation to its data.
  for (row of data) {
      const invalidSpot = spots.length > 0 && !spots.includes(row['Absolute Spot Number']);
      if (invalidSpot) {
        continue;
      }

      regulation = row['Regulation'];
      if (regulation === "Visitor") {
        // Account for descrepencies in regulation naming in the parking data.
        regulation = "Visitor Parking";
      }

      if (groupedData[regulation] == undefined) {
          groupedData[regulation] = {};
          groupedData[regulation]['total_spots'] = 0;
          groupedData[regulation]['spots'] = [];
      }

      const invalidRegulation = regulations.length > 0 && !regulations.includes(regulation);
      if (invalidRegulation) {
        continue;
      }

      groupedData[regulation]['total_spots'] += 1
      groupedData[regulation]['spots'].push(row['Absolute Spot Number']);

      Object.keys(row).forEach(function (key) {
          if (key.includes('AM') || key.includes('PM')) {
              if (!excluded.includes(row[key])) {
                  if (groupedData[regulation][key] == undefined) {
                      groupedData[regulation][key] = {'occupied_spots': 0}
                  }

                  groupedData[regulation][key]['occupied_spots'] += 1
              }
          }
      });
  }

  dataByRegulation = {}
  const excluded_keys = ['total_spots', 'spots']
  // Final processing of data, calculating util rates for each regulation.
  Object.keys(groupedData).forEach(regulation => {
    dataByRegulation[regulation] = []

    Object.keys(groupedData[regulation]).forEach(time => {
      const invalidTime = times.length > 0 && !times.includes(time);
      if (invalidTime) {
        return;
      }

      if (!excluded_keys.includes(time)) {
        total_spots = groupedData[regulation]['total_spots'];
        occupied_spots = groupedData[regulation][time]['occupied_spots'];
        spots = groupedData[regulation]['spots'];

        util_rate = occupied_spots / total_spots;
        dataByRegulation[regulation].push({
          'time': time,
          'util_rate': util_rate,
          'occupied_spots': occupied_spots,
          'spots': spots,
          'regulation': regulation
        });
      }
    });
  });

  return dataByRegulation;
}

/**
 * Process the data into a list of information for all spots at all recorded times,
 * optionally filtered by times.
 * 
 * @param data the data to derive the parking spot heatmap data from.
 * @param times if non-empty, the times to filter-by and exclusively include in the result.
 * @param regulations if non-empty, the regulations to filter-by and exclusively include in the result.
 */
function parkingSpotTimeData(data, times=[], regulations=[]) {
  const parkingSpotTimeData = [];

  for (row of data) {
    const unselectedRegulation = regulations.length > 0 && 
      !regulations.includes(row['Regulation'] === "Visitor" ? "Visitor Parking" : row['Regulation']);

    const getTime = (i) => {
      if (i < 6) {
        return `${6 + i}:00 AM`;
      } else if (i === 6) {
        return "12:00 PM";
      } else {
        return `${i - 6}:00 PM`;
      }
    }

    for (let i = 0; i < 15; i++) {
      let start = getTime(i);
      let occupant = row[start];
      let j = 0;

      // count subsequent rows
      while (i + j < 15 && row[getTime(i + j + 1)] === occupant) {
        j++;
      }

      let end = getTime(i + j);
      for (let k = 0; k < j + 1; k++) {
        parkingSpotTimeData.push({
          'spot': row['Absolute Spot Number'],
          'time': getTime(i + k),
          'occupied': occupant, // they all have this occupant
          'timeRange': {
            'start': start,
            'end': end,
            'duration': (occupant === "") ? -1 * (j  + 1) : j + 1
          },
          'regulation': row['Regulation'] === "Visitor" ? "Visitor Parking" : row['Regulation'],
          'unselected': unselectedRegulation || (times.length > 0 && !times.includes(getTime(i + k)))
        });
      }
      i = i + j;
    }
  }

  return parkingSpotTimeData.sort((a, b) => b['spot'] - a['spot']);
}

// Adds events to the element that makes it collapsable and
// expandable
function makeExpandable(elementSelector) {
  // Accordion
  const acc = document.getElementsByClassName(elementSelector);

  if (!acc) {
    return;
  }

  for (let i = 0; i < acc.length; i++) {
    acc[i].addEventListener("click", function() {
      this.classList.toggle("active");
      const panel = this.nextElementSibling;
      if (panel.style.maxHeight) {
        panel.style.maxHeight = null;
      } else {
        panel.style.maxHeight = panel.scrollHeight + "px";
      }
    });

    if (!localStorage.getItem("visited")) {
      acc[i].classList.toggle("active");
      const panel = acc[i].nextElementSibling;
      panel.style.maxHeight = panel.scrollHeight + "px";
      localStorage.setItem("visited", true);
    }
  }
}
