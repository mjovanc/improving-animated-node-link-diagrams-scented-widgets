// set the dimensions and margins of the graph
var margin = { top: 10, right: 10, bottom: 20, left: 10 },
  bar_width = 1300, // - margin.left - margin.right
  bar_height = 200; // - margin.top - margin.bottom

const totalBarWidth = bar_width; // Maximum width

function edgesVisualization(nodes, links, times) {
  // Remove any existing SVG elements
  d3.select("#bar_chart").selectAll("svg").remove();

  const sampleData = [
    { group: "Group 1", value: 10 },
    { group: "Group 2", value: 20 },
    { group: "Group 3", value: 30 },
    { group: "Group 4", value: 40 },
    { group: "Group 5", value: 50 },
  ];

  // Append the svg object to the body of the page
  var bar_svg = d3
    .select("#bar_chart")
    .append("svg")
    .attr("width", totalBarWidth + margin.left + margin.right)
    .attr("height", bar_height + margin.top + margin.bottom)
    .append("g")
    .attr("width", totalBarWidth);

  // List of groups = species here = value of the first column called group -> I show them on the X axis
  const groups = sampleData.map((d) => d.group);

  // Add X axis
  const x = d3.scaleBand().domain(groups).range([0, width]);

  // Add Y axis
  const y = d3
    .scaleLinear()
    .domain([0, d3.max(sampleData, (d) => d.value)])
    .range([100, 0]);

  // Show the bars
  bar_svg
    .selectAll("rect")
    .data(sampleData)
    .enter()
    .append("rect")
    .attr("x", (d) => x(d.group))
    .attr("y", (d) => y(d.value))
    .attr("height", (d) => bar_height - y(d.value))
    .attr("width", x.bandwidth())
    .attr("fill", "#c3c3c4")
    .attr("stroke", "black") // Border color
    .attr("stroke-width", 1); // Border width
}

function nodesVisualization(nodes, links, times) {
  // Remove any existing SVG elements
  d3.select("#bar_chart").selectAll("svg").remove();

  const sampleData = [
    { group: "Group 1", value: 10 },
    { group: "Group 2", value: 20 },
    { group: "Group 3", value: 30 },
    { group: "Group 4", value: 40 },
    { group: "Group 5", value: 50 },
  ];

  // Append the svg object to the body of the page
  var bar_svg = d3
    .select("#bar_chart")
    .append("svg")
    .attr("width", totalBarWidth + margin.left + margin.right)
    .attr("height", bar_height + margin.top + margin.bottom)
    .append("g")
    .attr("width", totalBarWidth);

  // List of groups = species here = value of the first column called group -> I show them on the X axis
  const groups = sampleData.map((d) => d.group);

  // Add X axis
  const x = d3.scaleBand().domain(groups).range([0, width]);

  // Add Y axis
  const y = d3
    .scaleLinear()
    .domain([0, d3.max(sampleData, (d) => d.value)])
    .range([100, 0]);

  // Show the bars
  bar_svg
    .selectAll("rect")
    .data(sampleData)
    .enter()
    .append("rect")
    .attr("x", (d) => x(d.group))
    .attr("y", (d) => y(d.value))
    .attr("height", (d) => bar_height - y(d.value))
    .attr("width", x.bandwidth())
    .attr("fill", "#c3c3c4")
    .attr("stroke", "black") // Border color
    .attr("stroke-width", 1); // Border width
}

function communitiesVisualization(nodes, links, times) {
  // Remove any existing SVG elements
  d3.select("#bar_chart").selectAll("svg").remove();

  // Parse the Data
  d3.csv(
    "https://gist.githubusercontent.com/mjovanc/1da7cac899ada0837caeded5c83afc59/raw/1cd67725cc0941be1470be840e0936fee81a98a0/stacked_data.csv"
  ).then((data) => {
    // List of subgroups = header of the csv files = soil condition here
    const subgroups = data.columns.slice(1);

    // List of groups = species here = value of the first column called group -> I show them on the X axis
    const groups = data.map((d) => d.group);

    console.log(groups.length);

    // Append the svg object to the body of the page
    var bar_svg = d3
      .select("#bar_chart")
      .append("svg")
      .attr("width", totalBarWidth + margin.left + margin.right)
      .attr("height", bar_height + margin.top + margin.bottom)
      .append("g")
      .attr("width", totalBarWidth); // Set the width of the <g> tag
    //.attr("transform",
    //    "translate(" + margin.left + "," + margin.top + ")");

    // Add X axis
    const x = d3.scaleBand().domain(groups).range([0, width]);
    // .padding([0.2])
    // bar_svg.append("g")
    //   .attr("transform", `translate(0, ${height})`)
    //   .call(d3.axisBottom(x).tickSizeOuter(0));

    // Add Y axis
    const y = d3.scaleLinear().domain([0, 50]).range([100, 0]);
    // bar_svg.append("g")
    //   .call(d3.axisLeft(y));

    // color palette = one color per subgroup
    //TODO: the colors should be changed depending on Edges/Communities chart
    const color = d3
      .scaleOrdinal()
      .domain(subgroups)
      .range(["#c3c3c4", "#4e4e4d", "#151516"]);

    //stack the data? --> stack per subgroup
    const stackedData = d3.stack().keys(subgroups)(data);

    // Show the bars
    bar_svg
      .append("g")
      .selectAll("g")
      // Enter in the stack data = loop key per key = group per group
      .data(stackedData)
      .join("g")
      .attr("fill", (d) => color(d.key))
      .selectAll("rect")
      // enter a second time = loop subgroup per subgroup to add all rectangles
      .data((d) => d)
      .join("rect")
      .attr("x", (d) => x(d.data.group))
      .attr("y", (d) => y(d[1]))
      .attr("height", (d) => y(d[0]) - y(d[1]))
      .attr("width", x.bandwidth())
      .attr("stroke", "black") // Border color
      .attr("stroke-width", 1); // Border width
  });
}
