document.addEventListener('DOMContentLoaded', function() {
    // Make a local query to get the data
    fetch('/line-data')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            renderChart(data.data);  // Assuming 'data' property contains the array
        })
        .catch(error => console.error('Error fetching data:', error));

    function renderChart(dataset) {
        var cardWidth = document.querySelector('.card.p-4').offsetWidth;
        var windowHeight = window.innerHeight;
        var svgWidth = cardWidth * 0.8; // 80% of card width
        var svgHeight = windowHeight * 0.8; // 80% of window height
        var margin = { top: 20, right: 20, bottom: 30, left: 50 };

        var svg = d3.select('#line-chart')
            .append('svg')
            .attr('width', svgWidth)
            .attr('height', svgHeight);

        var width = svgWidth - margin.left - margin.right;
        var height = svgHeight - margin.top - margin.bottom;

        var xScale = d3.scaleLinear()
            .domain([0, dataset.length - 1])
            .range([0, width]);

        var yScale = d3.scaleLinear()
            .domain([0, d3.max(dataset)])
            .range([height, 0]);

        var line = d3.line()
            .x(function(d, i) { return xScale(i); })
            .y(function(d) { return yScale(d); });

        var chartGroup = svg.append('g')
            .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

        chartGroup.append('path')
            .datum(dataset)
            .attr('class', 'line')
            .attr('d', line);

        chartGroup.selectAll('.dot')
            .data(dataset)
            .enter().append('circle')
            .attr('class', 'dot')
            .attr('cx', function(d, i) { return xScale(i); })
            .attr('cy', function(d) { return yScale(d); })
            .attr('r', 5);

        chartGroup.append('g')
            .attr('transform', 'translate(0,' + height + ')')
            .call(d3.axisBottom(xScale));

        chartGroup.append('g')
            .call(d3.axisLeft(yScale));
    }
});
