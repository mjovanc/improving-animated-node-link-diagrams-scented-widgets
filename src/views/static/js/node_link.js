// Create the SVG container
const svg = d3.select("#my_dataviz"),
    width = +svg.attr("width"),
    height = +svg.attr("height");

function updateVisualization(nodes, links, times) {
    const currentTimeText = d3.select("#current-time");
    const autoplayCheckbox = d3.select("#autoplayChecked");

    autoplayCheckbox.node().removeAttribute("disabled");

    let currentTimeIndex = 0;
    let isAutoplayEnabled = true;

    currentTimeText.text("Current timestamp: " + currentTimeIndex);
    // Add event listener to the autoplay checkbox
    autoplayCheckbox.on("change", function() {
        isAutoplayEnabled = this.checked; // Update autoplay state based on checkbox value
        console.log("Autoplay enabled: " + isAutoplayEnabled);
    });

    console.log("times.length = " + times.length);
    console.log("times = " + times);
    console.log("Original nodes:", nodes);
    console.log("Original links:", links);

    const scrubber = d3.select("#scrubber").append("input")
        .attr("type", "range")
        .attr("min", 0)
        .attr("max", times.length - 1) // Adjusted to match the index range
        .attr("step", 1)
        .attr("value", 0) // initial value
        .attr("class", "form-range")
        .attr("id", "select-time")
        .on("input", function() {
            currentTimeIndex = +this.value;
            console.log("currentTimeIndex = " + currentTimeIndex);
            updateSimulation();
        });

    const simulation = d3.forceSimulation(nodes)
        .force("link", d3.forceLink().id(d => d.id).distance(100))
        .force("charge", d3.forceManyBody().strength(-100)) // Decrease repulsion strength
        .force("center", d3.forceCenter(width / 2, height / 2))
        .force("collide", d3.forceCollide().radius(40)) // Add a collide force to prevent nodes from overlapping
        .force("x", d3.forceX(width / 2).strength(0.1)) // Add an x-axis force to center nodes horizontally
        .force("y", d3.forceY(height / 2).strength(0.1)) // Add a y-axis force to center nodes vertically
        .alpha(1)
        .alphaDecay(0.05) // Slow down alpha decay for smoother animation
        .on("tick", ticked);

    function updateSimulation() {
        const filteredNodes = nodes.filter(d => d.time === currentTimeIndex);
        const filteredLinks = links.filter(d => d.time === currentTimeIndex);

        simulation.nodes(filteredNodes);
        simulation.force("link").links(filteredLinks);
        simulation.alpha(1).restart();

        // Redraw nodes, links, and labels
        redraw(filteredNodes, filteredLinks);
        currentTimeText.text("Current timestamp: " + currentTimeIndex);
    }


    function redraw(nodes, links) {
        // Redraw links
        const link = svg.selectAll(".link")
            .data(links, d => d.source.id + "-" + d.target.id)
            .join(
                enter => enter.insert("line", ".node") // insert lines before nodes
                    .attr("class", "link") // add class for styling
                    .attr("stroke", "#999")
                    .attr("stroke-width", "2"),
                update => update,
                exit => exit.remove()
            );

        // Disable transitions for links
        link.transition().duration(0);

        // Redraw nodes
        const node = svg.selectAll(".node")
            .data(nodes, d => d.id)
            .join(
                enter => enter.append("circle") // append new nodes
                    .attr("class", "node") // Add class for styling
                    .attr("r", 20)
                    .attr("fill", "blue")
                    .call(drag(simulation))
                    .on("click", clicked),
                update => update, // update existing nodes
                exit => exit.remove() // remove nodes that are not in the data
            );

        // Disable transitions for nodes
        node.transition().duration(0);

        // Redraw labels
        const label = svg.selectAll(".label")
            .data(nodes, d => d.id)
            .join(
                enter => enter.append("text") // append new labels
                    .attr("class", "label") // Add class for styling
                    .text(d => d.id)
                    .attr("font-size", "16px")
                    .attr("dx", -10)
                    .attr("dy", 5),
                update => update // update existing labels
            );

        // Disable transitions for labels
        label.transition().duration(0);

        simulation.nodes(nodes);
        simulation.force("link").links(links);
    }


    function ticked() {
        svg.selectAll("line")
            .attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y);

        svg.selectAll(".node")
            .attr("cx", d => d.x)
            .attr("cy", d => d.y);

        svg.selectAll(".label")
            .attr("x", d => d.x)
            .attr("y", d => d.y);
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

        return d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended);
    }

    function clicked(event, d) {
        console.log("Clicked node:", d.id);
        // Add your custom logic for node click event here
    }
}
