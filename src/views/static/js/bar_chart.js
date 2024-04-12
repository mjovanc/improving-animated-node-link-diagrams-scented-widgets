// set the dimensions and margins of the graph
var margin = {top: 10, right: 10, bottom: 20, left: 10},
    bar_width = 1300 - margin.left - margin.right,
    bar_height = 200 - margin.top - margin.bottom;

// append the svg object to the body of the page
var bar_svg = d3.select("#bar_chart")
    .append("svg")
    .attr("width", bar_width + margin.left + margin.right)
    .attr("height", bar_height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");

// Parse the Data
d3.csv("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/data_stacked.csv").then((data) => {
    console.log(data); // this is the data


    // List of groups = species here = value of the first column called group -> I show them on the X axis
    var groups = d3.map(data, function (d) {
        return (d.group)
    }).keys()

    // List of subgroups = header of the csv files = soil condition here
    var subgroups = data.columns.slice(1);

    // Add X axis
    var x = d3.scaleBand()
        .domain(groups)
        .range([0, bar_width])
        .padding([0.2])
    bar_svg.append("g")
        .attr("transform", "translate(0," + bar_height + ")")
        .call(d3.axisBottom(x).tickSizeOuter(0));

    // Add Y axis
    var y = d3.scaleLinear()
        .domain([0, 60])
        .range([bar_height, 0]);
    bar_svg.append("g")
        .call(d3.axisLeft(y));

    // color palette = one color per subgroup
    var color = d3.scaleOrdinal()
        .domain(subgroups)
        .range(['#e41a1c', '#377eb8', '#4daf4a'])

    //stack the data? --> stack per subgroup
    var stackedData = d3.stack()
        .keys(subgroups)
        (data)

    // Show the bars
    bar_svg.append("g")
        .selectAll("g")
        // Enter in the stack data = loop key per key = group per group
        .data(stackedData)
        .enter().append("g")
        .attr("fill", function (d) {
            return color(d.key);
        })
        .selectAll("rect")
        // enter a second time = loop subgroup per subgroup to add all rectangles
        .data(function (d) {
            return d;
        })
        .enter().append("rect")
        .attr("x", function (d) {
            return x(d.data.group);
        })
        .attr("y", function (d) {
            return y(d[1]);
        })
        .attr("height", function (d) {
            return y(d[0]) - y(d[1]);
        })
        .attr("width", x.bandwidth())
})