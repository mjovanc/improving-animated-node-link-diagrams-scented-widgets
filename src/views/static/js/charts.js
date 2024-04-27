// set the dimensions and margins of the graph
var margin = { top: 10, right: 0, bottom: -10, left: 0 },
  bar_width = 870, // - margin.left - margin.right
  bar_height = 250; // - margin.top - margin.bottom

function countEdgesBetweenTimes(links, start, end) {
  return links.filter((link) => link.time >= start && link.time < end).length;
}

function processEdgesData(nodes, links, times) {
  const totalTimestamps = times.length;

  // Check if the number of timestamps is less than or equal to 20
  if (totalTimestamps <= 20) {
    // If so, calculate edge counts directly without intervals
    const edgeCounts = {};
    for (let i = 0; i < totalTimestamps; i++) {
      const time = times[i];
      edgeCounts[time] = countEdgesBetweenTimes(links, time, time + 1);
    }
    // Convert edgeCounts object into an array of objects
    const sampleData = Object.entries(edgeCounts).map(([time, count]) => ({
      group: `Time ${time}`,
      value: count,
    }));
    return sampleData;
  } else {
    // Otherwise, apply the interval logic
    const maxBars = 100;
    const intervalSize = Math.ceil(totalTimestamps / maxBars);
    const edgeCounts = {};
    for (let i = 0; i < totalTimestamps - 1; i++) {
      const start = times[i];
      const end = times[i + 1];
      const intervalIndex = Math.floor(start / intervalSize);
      if (!edgeCounts[intervalIndex]) {
        edgeCounts[intervalIndex] = 0;
      }
      edgeCounts[intervalIndex] += countEdgesBetweenTimes(links, start, end);
    }
    const sampleData = Object.entries(edgeCounts).map(
      ([intervalIndex, count]) => ({
        group: `Interval ${
          parseInt(intervalIndex) * intervalSize + 1
        }-${Math.min(
          (parseInt(intervalIndex) + 1) * intervalSize,
          totalTimestamps
        )}`,
        value: count,
      })
    );
    return sampleData;
  }
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
  const totalTimestamps = times.length;
  const maxBars = 20;

  // Check if the number of timestamps is less than or equal to 20
  if (totalTimestamps <= 20) {
    // If so, calculate unique node counts directly without intervals
    const nodeCounts = {};
    for (let i = 0; i < totalTimestamps; i++) {
      const time = times[i];
      nodeCounts[time] = countUniqueNodesBetweenTimes(nodes, time, time);
    }
    // Convert nodeCounts object into an array of objects
    const sampleData = Object.entries(nodeCounts).map(([time, count]) => ({
      group: `Time ${time}`,
      value: count,
    }));
    return sampleData;
  } else {
    // Otherwise, apply the interval logic
    const intervalSize = Math.ceil(totalTimestamps / maxBars);
    const nodeCounts = {};
    let intervalIndex = 0;
    let count = 0;
    for (let i = 0; i < times.length; i++) {
      const time = times[i];
      if (!nodeCounts[intervalIndex]) {
        nodeCounts[intervalIndex] = 0;
      }
      nodeCounts[intervalIndex] += countUniqueNodesBetweenTimes(
        nodes,
        time,
        time
      );
      count++;
      if (count >= intervalSize || i === times.length - 1) {
        intervalIndex++;
        count = 0;
      }
    }
    return Object.entries(nodeCounts).map(([intervalIndex, count]) => ({
      group: `Interval ${parseInt(intervalIndex) * intervalSize + 1}-${Math.min(
        (parseInt(intervalIndex) + 1) * intervalSize,
        totalTimestamps
      )}`,
      value: count,
    }));
  }
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
    .attr("stroke", "#eaecef") // Border color
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
      .attr("width", bar_width)
      .attr("height", bar_height)
      .append("g")
      .attr("width", bar_width); // Set the width of the <g> tag
    //.attr("transform",
    //    "translate(" + margin.left + "," + margin.top + ")");

    // Add X axis
    const x = d3.scaleBand().domain(groups).range([0, width]);
    // .padding([0.2])
    // bar_svg.append("g")
    //   .attr("transform", `translate(0, ${height})`)
    //   .call(d3.axisBottom(x).tickSizeOuter(0));

    // Add Y axis
    const y = d3.scaleLinear().domain([0, 50]).range([bar_height, 0]);
    // bar_svg.append("g")
    //   .call(d3.axisLeft(y));

    // color palette = one color per subgroup
    //TODO: the colors should be changed depending on Edges/Communities chart
    const color = d3
      .scaleOrdinal()
      .domain(subgroups)
      .range(["#336CF7", "#A5A6DC", "#EEEDFF"]);

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
      .attr("stroke", "#eaecef") // Border color
      .attr("stroke-width", 1); // Border width
  });
}
