// Create the SVG container
const svg = d3.select("#my_dataviz"),
  width = +svg.attr("width"),
  height = +svg.attr("height");

let autoplayInterval; // Global variable to store the autoplay interval

function initializeNodePositions(nodes) {
  nodes.forEach((node, index) => {
    // Set fixed positions based on index or custom logic
    node.x = width / 2 + (index % 10) * 50 - 250;
    node.y = height / 2 + Math.floor(index / 10) * 50 - 250;
  });
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

  // Remove existing slider if it exists
  d3.select("#scrubber").select("#select-time").remove();

  d3.select("#scrubber")
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

    // Initialize node positions
    initializeNodePositions(filteredNodes);

    // Assign colors based on the communities_raw data
    const timeData = communities_raw.find((data) => data.time === timeIndex);
    if (timeData && Array.isArray(timeData.communities)) {
      // Create a map of node IDs to colors
      const nodeColorMap = {};
      timeData.communities.forEach((communityData) => {
        const color = communityData.color;
        const community = communityData.community;
        community.forEach((nodeId) => {
          nodeColorMap[nodeId] = color;
        });
      });

      // Update the nodes with the colors from nodeColorMap
      filteredNodes.forEach((node) => {
        if (nodeColorMap[node.id]) {
          node.color = nodeColorMap[node.id];
        } else {
          node.color = "#000"; // Default color if not found
        }
      });
    }

    // Update simulation with filtered nodes and links
    simulation.nodes(filteredNodes);
    simulation.force("link").links(filteredLinks);
    simulation.alpha(1).restart(); // Ensure the simulation restarts

    // Redraw nodes, links, and labels
    redraw(filteredNodes, filteredLinks);
    currentTimeText.text("Current timestamp: " + timeIndex);
  }

  function redraw(nodes, links) {
    // Redraw links
    const link = svg
      .selectAll(".link")
      .data(links, (d) => d.source.id + "-" + d.target.id)
      .join(
        (enter) =>
          enter
            .insert("line", ".node")
            .attr("class", "link")
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
            .append("circle")
            .attr("class", "node")
            .attr("r", 20)
            .attr("fill", (d) => {
              if (!d.color) {
                console.log(`Node ${d.id} color is undefined.`);
                return "#000"; // Fallback color
              }
              return d.color;
            })
            .attr("stroke", "#DFDFDF")
            .call(drag(simulation))
            .on("click", clicked),
        (update) =>
          update.attr("fill", (d) => {
            if (!d.color) {
              console.log(`Node ${d.id} color is undefined.`);
              return "#000"; // Fallback color
            }
            return d.color;
          }),
        (exit) => exit.remove()
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
            .append("text")
            .attr("class", "label")
            .text((d) => d.id)
            .attr("font-size", "12px")
            .attr("font-weight", "bold")
            .attr("dx", -15)
            .attr("dy", 5),
        (update) => update
      );

    // Disable transitions for labels
    label.transition().duration(0);
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
