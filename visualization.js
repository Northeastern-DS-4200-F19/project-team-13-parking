REGULATION_COLORS = {
    'Resident Only': 'red',
    'Unrestricted': 'blue',
    'Metered': 'green',
    'Handicapped': 'black',
    'Visitor': 'purple',
    'Visitor Parking': 'pink',
}

function utilizationRateByGroup(data) {
    let grouped_data = {};
    const excluded = ['Construction', 'Blocked', '']

    for (row of data) {
        regulation = row['Regulation']
        if (grouped_data[regulation] == undefined) {
            grouped_data[regulation] = {}
            grouped_data[regulation]['total_spots'] = 0
        }

        grouped_data[regulation]['total_spots'] += 1

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
    Object.keys(grouped_data).forEach(function (regulation) {
        data_by_regulation[regulation] = []

        Object.keys(grouped_data[regulation]).forEach(function (time) {
            if (time != 'total_spots') {
                total_spots = grouped_data[regulation]['total_spots'];
                occupied_spots = grouped_data[regulation][time]['occupied_spots'];

                util_rate = occupied_spots / total_spots;
                data_by_regulation[regulation].push({'time': time, 'util_rate': util_rate});
            }
        });
    });

    return data_by_regulation
}


function renderMapVis(data) {

}

function renderHeatmapVis(data) {

}

function renderAreaVis(data) {
    data = utilizationRateByGroup(data)

    const width  = 600;
    const height = 500;
    const margin = {
        top: 30,
        bottom: 30,
        left: 30,
        right: 30
    };

    const svg = d3.select('.vis-holder')
        .append('svg')
            .attr('width', width)
            .attr('height', height)
            .style('background', '#efefef');

    const chartGroup = svg
        .append('g')
            .attr('transform','translate(' + margin.left +',' + margin.top + ')');

    const xScale = d3.scaleLinear()
        .domain([6, 20])
        .range([0, width - margin.left * 2]);
    
    const yScale = d3.scaleLinear()
        .domain([0, 1])
        .range([height - margin.bottom - margin.top, 0]);
    
    const xAxis = d3.axisBottom(xScale);
    chartGroup.append('g')
        .attr('class', 'x axis')
        .attr('transform', 'translate(0, ' + (height - margin.bottom - margin.top) + ')')
        .call(xAxis);

    const yAxis = d3.axisLeft(yScale);
    chartGroup.append('g')
        .attr('class', 'y axis')
        .attr('transform', 'translate(0, 0)')
        .call(yAxis);
    
    function hourToInt(hour) {
        hourInt = parseInt(hour.substring(0, hour.indexOf(':')))
        isPm = hour.substring(hour.length - 2, hour.length - 1) == 'P'
        return hourInt + (isPm && hourInt != 12 ? 12 : 0)
    }
    
    const line = d3.line()
        .x(d => xScale(hourToInt(d.time)))
        .y(d => yScale(d.util_rate));

    Object.keys(data).forEach(key => {
        chartGroup.append('path')
            .attr('d', line(data[key].sort((d1, d2) => hourToInt(d1.time) - hourToInt(d2.time))))
            .attr('class', 'dataLine')
            .attr('stroke', REGULATION_COLORS[key]);
    });
}


d3.csv('./data/parking.csv').then(data => {
    renderMapVis(data);
    renderHeatmapVis(data);
    renderAreaVis(data);
});
