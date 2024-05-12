// set the dimensions and margins of the graph
var margin = { top: 10, right: 0, bottom: -10, left: 0 },
  bar_width = 870, // - margin.left - margin.right
  bar_height = 250; // - margin.top - margin.bottom

function countEdgesBetweenTimes(links, start, end) {
  return links.filter((link) => link.time >= start && link.time < end).length;
}

function processEdgesData(nodes, links, times) {
  const edgeCounts = {};

  // Calculate edge counts for each timestamp
  for (let i = 0; i < times.length; i++) {
    const time = times[i];
    edgeCounts[time] = countEdgesBetweenTimes(links, time, time + 1);
  }

  // Convert edgeCounts object into an array of objects
  const sampleData = Object.entries(edgeCounts).map(([time, count]) => ({
    group: `Time ${time}`,
    value: count,
  }));

  return sampleData;
}

function countUniqueNodesBetweenTimes(nodes, start, end) {
  const uniqueNodes = new Set();
  nodes.forEach((node) => {
    if (node.time >= start && node.time <= end) {
      uniqueNodes.add(node.id);
    }
  });
  return uniqueNodes.size;
}

function processNodesData(nodes, links, times) {
  const nodeCounts = {};

  // Calculate unique node counts for each timestamp
  for (let i = 0; i < times.length; i++) {
    const time = times[i];
    nodeCounts[time] = countUniqueNodesBetweenTimes(nodes, time, time);
  }

  // Convert nodeCounts object into an array of objects
  const sampleData = Object.entries(nodeCounts).map(([time, count]) => ({
    group: `Time ${time}`,
    value: count,
  }));

  return sampleData;
}

function edgesVisualization(nodes, links, times) {
  // Remove any existing SVG elements
  d3.select("#bar_chart").selectAll("svg").remove();

  const sampleData = processEdgesData(nodes, links, times);
  // console.log(JSON.stringify(sampleData, null, 2));

  // Append the svg object to the body of the page
  var bar_svg = d3
    .select("#bar_chart")
    .append("svg")
    .attr("width", bar_width)
    .attr("height", bar_height)
    .append("g");

  // List of groups = species here = value of the first column called group -> I show them on the X axis
  const groups = sampleData.map((d) => d.group);

  // Add X axis
  const x = d3.scaleBand().domain(groups).range([0, bar_width]);

  // Add Y axis
  const y = d3
    .scaleLinear()
    .domain([0, d3.max(sampleData, (d) => d.value)])
    .range([bar_height, 0]);

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
    .attr("fill", "#336cf7")
    // .attr("stroke", "#eaecef") // Border color
    .attr("stroke-width", 1); // Border width
}

function nodesVisualization(nodes, links, times) {
  // Remove any existing SVG elements
  d3.select("#bar_chart").selectAll("svg").remove();

  const sampleData = processNodesData(nodes, links, times);
  console.log(JSON.stringify(sampleData, null, 2));

  // Append the SVG object to the body of the page
  var svg = d3
    .select("#bar_chart")
    .append("svg")
    .attr("width", bar_width)
    .attr("height", bar_height);

  // List of groups = species here = value of the first column called group -> I show them on the X axis
  const groups = sampleData.map((d) => d.group);

  // Add X axis
  const x = d3.scaleBand().domain(groups).range([0, bar_width]);

  // Add Y axis
  const y = d3
    .scaleLinear()
    .domain([0, d3.max(sampleData, (d) => d.value)])
    .range([bar_height, 0]);

  // Initialize line generator
  var line = d3
    .line()
    .x((d) => x(d.group) + x.bandwidth() / 2) // Adjust for centering the line
    .y((d) => y(d.value));

  // Draw the line
  svg
    .append("path")
    .datum(sampleData)
    .attr("fill", "none")
    .attr("stroke", "#336cf7") // Line color
    .attr("stroke-width", 2) // Line width
    .attr("d", line);
}

function communitiesVisualization(communities) {
  // Remove any existing SVG elements
  d3.select("#bar_chart").selectAll("svg").remove();

  // Parse the Data
  const data = communities.map((row) => ({
    time: row[0],
    values: row.slice(1, 4), // Extract values for sections A, B, and C only
    total: row[4], // Total value of A + B + C
  }));

  console.log("Parsed Data:", data);

  // List of groups = time periods
  const groups = data.map((d) => d.time);

  console.log("Groups:", groups);

  // Append the svg object to the body of the page
  var bar_svg = d3
    .select("#bar_chart")
    .append("svg")
    .attr("width", bar_width)
    .attr("height", bar_height)
    .append("g");

  // Add X axis
  const x = d3.scaleBand().domain(groups).range([0, bar_width]).padding(0.1);

  console.log("X Scale Domain:", x.domain());

  // Add Y axis
  const y = d3
    .scaleLinear()
    .domain([0, d3.max(data, (d) => d.total)])
    .range([bar_height, 0]); // Adjusted range

  console.log("Y Scale Domain:", y.domain());

  // Color palette
  const color = d3.scaleOrdinal().range(["#336CF7", "#A5A6DC", "#C0A975"]);

  // Show the bars
  bar_svg
    .selectAll("g")
    .data(data)
    .join("g")
    .attr("transform", (d) => `translate(${x(d.time)},0)`)
    .selectAll("rect")
    .data((d) => d.values)
    .join("rect")
    .attr("x", 0)
    .attr("y", (d, i, nodes) => {
      const previousBars = d3.sum(
        nodes.slice(0, i).map((node) => Number(d3.select(node).attr("height")))
      );
      return y(previousBars + d);
    })
    .attr("height", (d) => y(0) - y(d))
    .attr("width", x.bandwidth())
    .attr("fill", (_, i) => color(i));
  // .attr("stroke", "#eaecef"); // Border color
}
