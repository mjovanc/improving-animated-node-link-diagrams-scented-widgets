document.addEventListener('DOMContentLoaded', function() {
    // Make a local query to get the data
    fetch('/bar-data')
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
        var svgHeight = windowHeight * 0.8; // 80% of card height
        var barPadding = 5;

        var svg = d3.select('#bar-chart')
            .append('svg')
            .attr('width', svgWidth)
            .attr('height', svgHeight)
            .append('g')
            .attr('transform', 'translate(' + (svgWidth / 2) + ',' + (svgHeight / 2) + ')');

        var barWidth = (svgWidth / dataset.length);

        var barChart = svg.selectAll('rect')
            .data(dataset)
            .enter()
            .append('rect')
            .attr('x', function(d, i) {
                return i * barWidth - (svgWidth / 2);  // Position each bar horizontally
            })
            .attr('y', function(d) {
                return svgHeight / 2 - d;  // Position bars from the center
            })
            .attr('height', function(d) {
                return d;  // Set height of bars based on data value
            })
            .attr('width', barWidth - barPadding)
            .style('fill', 'teal');
    }
});
