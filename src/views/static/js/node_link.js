// Create the SVG container
const svg = d3.select("#my_dataviz"),
  width = +svg.attr("width"),
  height = +svg.attr("height");

let autoplayInterval; // Global variable to store the autoplay interval

function getNodeColor(node, communities_raw, currentTimeIndex) {
  console.log("NODE ID = ", node.id);
  const communityColorPalette = [
    "blue",
    "green",
    "red",
    "orange",
    "purple",
    "yellow",
    "cyan",
    "magenta",
    "lime",
    "pink",
  ];

  // Find the index of the object with the matching 'time' property
  const timeIndex = communities_raw.findIndex(
    (obj) => obj.time === currentTimeIndex
  );

  if (timeIndex === -1) {
    console.log(`Time ${currentTimeIndex} not found in communities_raw`);
    return "rgb(220, 220, 220)"; // Default color if time is not found
  }

  const communitiesAtIndex = communities_raw[timeIndex].communities;

  // Iterate over each sub-array within communitiesAtIndex
  for (let i = 0; i < communitiesAtIndex.length; i++) {
    const subarray = communitiesAtIndex[i];
    console.log("SUBARRAY = ", subarray);
    // Convert both node id and values in subarray to strings before comparison
    if (subarray.map(String).includes(String(node.id))) {
      return communityColorPalette[i % communityColorPalette.length];
    }
  }

  console.log(`Node = ${node.id} not found in any community array`);
  console.log(`Communities array = ${communitiesAtIndex}`);

  return "rgb(220, 220, 220)"; // Default color if node.id is not found in any sub-array
}

function updateVisualization(nodes, links, times, communities_raw) {
  const currentTimeText = d3.select("#current-time");
  const playBtn = d3.select("#playBtn");
  const pauseBtn = d3.select("#pauseBtn");
  const timeoutInput = d3.select("#intervalTimeoutRange").attr("step", 100);
  const intervalTimeoutValue = d3.select("#intervalTimeoutValue");

  playBtn.node().removeAttribute("disabled");
  timeoutInput.node().removeAttribute("disabled");

  let currentTimeIndex = 0;

  // Set initial text values
  currentTimeText.text("Current Timestamp: " + currentTimeIndex);

  // Update event listener for the play button
  playBtn.on("click", function () {
    if (!this.disabled) {
      this.disabled = true;
      pauseBtn.node().disabled = false;
      startAutoplay();
    }
  });

  // Add event listener to the pause button
  pauseBtn.on("click", function () {
    clearInterval(autoplayInterval);
    playBtn.node().disabled = false;
    this.disabled = true;
  });

  timeoutInput.on("change", function () {
    intervalTimeoutValue.text("Timeout: " + this.value + " ms");
  });

  const uniqueNodeIds = new Set(nodes.map((d) => d.id)); // Create a set of unique node IDs

  nodes = nodes.filter((d) => uniqueNodeIds.has(d.id)); // Filter out duplicate nodes

  //TODO: this section should add a new community property with a unique value of their community
  // however this doesn't seem to add community property. LIke its immutable??
  console.log("Nodes before update:", nodes);

  communities_raw.forEach((communityData, timeIndex) => {
    console.log("Processing community data for time index:", timeIndex);
    const communityIds = new Set(communityData.communities.flat());
    console.log("Community IDs for time index", timeIndex, ":", communityIds);

    nodes.forEach((node) => {
      if (communityIds.has(node.id)) {
        console.log(
          "Node",
          node.id,
          "belongs to community at time index",
          timeIndex
        );
        node.community = timeIndex; // Assigning the time index as the community value
      }
    });
  });

  console.log("Nodes after update:", nodes);

  console.log("times.length = " + times.length);
  //console.log("times = " + times);
  //console.log("Original nodes:", nodes);
  //console.log("Original links:", links);

  const scrubber = d3
    .select("#scrubber")
    .append("input")
    .attr("type", "range")
    .attr("min", 0)
    .attr("max", times.length - 1) // Adjusted to match the index range
    .attr("step", 1)
    .attr("value", 0) // initial value
    .attr("class", "form-range")
    .attr("id", "select-time")
    .on("input", function () {
      currentTimeIndex = +this.value;
      console.log("currentTimeIndex = " + currentTimeIndex);
      updateSimulation(currentTimeIndex);
    });

  const simulation = d3
    .forceSimulation(nodes)
    .force(
      "link",
      d3
        .forceLink()
        .id((d) => d.id)
        .distance(100)
    )
    .force("charge", d3.forceManyBody().strength(-100)) // Decrease repulsion strength
    .force("center", d3.forceCenter(width / 2, height / 2))
    .force("collide", d3.forceCollide().radius(40)) // Add a collide force to prevent nodes from overlapping
    .force("x", d3.forceX(width / 2).strength(0.1)) // Add an x-axis force to center nodes horizontally
    .force("y", d3.forceY(height / 2).strength(0.1)) // Add a y-axis force to center nodes vertically
    .alpha(1)
    .alphaDecay(0.005) // Slow down alpha decay for smoother animation
    .on("tick", ticked);

  function updateSimulation(timeIndex) {
    console.log("updateSimulation(" + timeIndex + ")");
    console.log("Updating simulation...");

    // Filter nodes to remove duplicates
    const filteredNodes = [];
    const uniqueNodeIds = new Set(); // Set to store unique node IDs

    // Iterate through nodes and add unique nodes to filteredNodes
    nodes.forEach((node) => {
      if (node.time === timeIndex && !uniqueNodeIds.has(node.id)) {
        filteredNodes.push(node);
        uniqueNodeIds.add(node.id); // Add the node ID to the set
      }
    });

    // Filter links based on the time index
    const filteredLinks = links.filter((link) => link.time === timeIndex);

    // Update simulation with filtered nodes and links
    simulation.nodes(filteredNodes);
    simulation.force("link").links(filteredLinks);
    simulation.alpha(1); // restart here?

    // Redraw nodes, links, and labels
    redraw(filteredNodes, filteredLinks);
    currentTimeText.text("Current timestamp: " + timeIndex);
  }

  function redraw(nodes, links) {
    // Define a color scale for communities
    const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

    // Redraw links
    const link = svg
      .selectAll(".link")
      .data(links, (d) => d.source.id + "-" + d.target.id)
      .join(
        (enter) =>
          enter
            .insert("line", ".node") // insert lines before nodes
            .attr("class", "link") // add class for styling
            .attr("stroke", "#999")
            .attr("stroke-width", "2"),
        (update) => update,
        (exit) => exit.remove()
      );

    // Disable transitions for links
    link.transition().duration(0);

    // Redraw nodes
    const node = svg
      .selectAll(".node")
      .data(nodes, (d) => d.id)
      .join(
        (enter) =>
          enter
            .append("circle") // append new nodes
            .attr("class", "node") // Add class for styling
            .attr("r", 20)
            .attr("fill", (d) =>
              getNodeColor(d, communities_raw, currentTimeIndex)
            )
            .attr("stroke", "#DFDFDF")
            .call(drag(simulation))
            .on("click", clicked),
        (update) => update, // update existing nodes
        (exit) => exit.remove() // remove nodes that are not in the data
      );

    // Disable transitions for nodes
    node.transition().duration(0);

    // Redraw labels
    const label = svg
      .selectAll(".label")
      .data(nodes, (d) => d.id)
      .join(
        (enter) =>
          enter
            .append("text") // append new labels
            .attr("class", "label") // Add class for styling
            .text((d) => d.id)
            .attr("font-size", "16px")
            .attr("dx", -10)
            .attr("dy", 5),
        (update) => update // update existing labels
      );

    // Disable transitions for labels
    label.transition().duration(0);

    simulation.nodes(nodes);
    simulation.force("link").links(links);
  }

  function ticked() {
    svg
      .selectAll("line")
      .attr("x1", (d) => d.source.x)
      .attr("y1", (d) => d.source.y)
      .attr("x2", (d) => d.target.x)
      .attr("y2", (d) => d.target.y);

    svg
      .selectAll(".node")
      .attr("cx", (d) => d.x)
      .attr("cy", (d) => d.y);

    svg
      .selectAll(".label")
      .attr("x", (d) => d.x)
      .attr("y", (d) => d.y);
  }

  function drag(simulation) {
    function dragstarted(event) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }

    function dragged(event) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }

    function dragended(event) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }

    return d3
      .drag()
      .on("start", dragstarted)
      .on("drag", dragged)
      .on("end", dragended);
  }

  function clicked(event, d) {
    console.log("Clicked node:", d.id);
    // Add your custom logic for node click event here
  }

  function startAutoplay() {
    autoplayInterval = setInterval(() => {
      const scrubber = d3.select("#select-time");
      const maxTime = scrubber.attr("max");
      let currentTime = +scrubber.property("value");

      // If current time is less than the maximum time, increment the value and update the visualization
      if (currentTime < maxTime) {
        currentTime++;
        scrubber.property("value", currentTime);
        updateSimulation(currentTime);
      } else {
        // If current time reaches the maximum time, stop autoplay
        stopAutoplay();
      }
    }, document.getElementById("intervalTimeoutRange").value); // Interval time in milliseconds (adjust as needed)
  }

  function stopAutoplay() {
    clearInterval(autoplayInterval);
  }
}
