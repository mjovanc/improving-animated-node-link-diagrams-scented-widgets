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
  console.log(JSON.stringify(sampleData, null, 2));

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

  // Get the maximum number of communities across all time periods
  const maxCommunities = Math.max(
    ...communities.map((d) => d.communities.length)
  );

  // Parse the Data
  // Generate an array of objects where each object represents a time period
  const data = communities.map((d) => {
    const totalItems = d.communities.reduce((acc, val) => acc + val.length, 0);
    // Calculate the percentage of each community for the total items
    const percentages = d.communities.map(
      (community) => (community.length / totalItems) * 100
    );
    return { time: d.time, percentages: percentages };
  });

  // List of groups = time periods
  const groups = data.map((d) => d.time);

  // Append the svg object to the body of the page
  var bar_svg = d3
    .select("#bar_chart")
    .append("svg")
    .attr("width", bar_width)
    .attr("height", bar_height)
    .append("g")
    .attr("width", bar_width); // Set the width of the <g> tag

  // Add X axis
  const x = d3.scaleBand().domain(groups).range([0, width]);

  // Add Y axis
  const y = d3.scaleLinear().domain([0, 100]).range([bar_height, 0]);

  // color palette = one color per subgroup
  //TODO: the colors should be changed depending on Edges/Communities chart
  const color = d3.scaleOrdinal().range(["#336CF7", "#A5A6DC", "#EEEDFF"]);

  // Show the bars
  bar_svg
    .append("g")
    .selectAll("g")
    .data(data)
    .join("g")
    .attr("transform", (d) => `translate(${x(d.time)},0)`)
    .selectAll("rect")
    .data((d) => d.percentages)
    .join("rect")
    .attr("x", 0)
    .attr("y", (d) => y(d))
    .attr("height", (d) => bar_height - y(d))
    .attr("width", x.bandwidth())
    .attr("fill", (d, i) => color(i))
    .attr("stroke", "black") // Border color should be -> #eaecef
    .attr("stroke-width", 1); // Border width
}
