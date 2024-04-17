// set the dimensions and margins of the graph
var margin = {top: 10, right: 10, bottom: 20, left: 10},
    bar_width = 1300, // - margin.left - margin.right
    bar_height = 200; // - margin.top - margin.bottom

const maxBarWidth = 50; // Maximum width for each bar

// append the svg object to the body of the page
var bar_svg = d3.select("#bar_chart")
    .append("svg")
    .attr("width", bar_width + margin.left + margin.right)
    .attr("height", bar_height + margin.top + margin.bottom)
    .append("g")
    //.attr("transform",
    //    "translate(" + margin.left + "," + margin.top + ")");

// Parse the Data
d3.csv("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/data_stacked.csv").then((data) => {
    // List of subgroups = header of the csv files = soil condition here
  const subgroups = data.columns.slice(1)

  // List of groups = species here = value of the first column called group -> I show them on the X axis
  const groups = data.map(d => (d.group))

  // Add X axis
  const x = d3.scaleBand()
      .domain(groups)
      .range([0, width])
      // .padding([0.2])
  // bar_svg.append("g")
  //   .attr("transform", `translate(0, ${height})`)
  //   .call(d3.axisBottom(x).tickSizeOuter(0));

  // Add Y axis
  const y = d3.scaleLinear()
    .domain([0, 60])
    .range([ 100, 0 ]);
  // bar_svg.append("g")
  //   .call(d3.axisLeft(y));

  // color palette = one color per subgroup
  const color = d3.scaleOrdinal()
    .domain(subgroups)
    .range(['#e41a1c','#377eb8','#4daf4a'])

  //stack the data? --> stack per subgroup
  const stackedData = d3.stack()
    .keys(subgroups)
    (data)

  // Show the bars
  bar_svg.append("g")
    .selectAll("g")
    // Enter in the stack data = loop key per key = group per group
    .data(stackedData)
    .join("g")
      .attr("fill", d => color(d.key))
      .selectAll("rect")
      // enter a second time = loop subgroup per subgroup to add all rectangles
      .data(d => d)
      .join("rect")
        .attr("x", d => x(d.data.group))
        .attr("y", d => y(d[1]))
        .attr("height", d => y(d[0]) - y(d[1]))
        .attr("width",x.bandwidth())
        .attr("stroke", "black") // Border color
        .attr("stroke-width", 1); // Border width
})