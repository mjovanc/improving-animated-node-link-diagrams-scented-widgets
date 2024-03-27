// Create the SVG container
const svg = d3.select("#my_dataviz"),
    width = +svg.attr("width"),
    height = +svg.attr("height");

function updateVisualization(nodes, links) {

    const simulation = d3.forceSimulation(nodes)
        .force("link", d3.forceLink(links).id(d => d.id).distance(100))
        .force("charge", d3.forceManyBody().strength(-100))
        .force("center", d3.forceCenter(width / 2, height / 2))
        .on("tick", ticked);

    const link = svg.selectAll("line")
        .data(links)
        .enter().append("line")
        .attr("stroke", "#999")
        .attr("stroke-width", "2");

    const node = svg.selectAll(".node")
        .data(nodes)
        .enter().append("circle")
        .attr("r", 20)
        .attr("fill", "blue")
        .call(drag(simulation))
        .on("click", clicked);

    const label = svg.selectAll(".label")
        .data(nodes)
        .enter().append("text")
        .text(d => d.id)
        .attr("font-size", "16px")
        .attr("dx", -10)
        .attr("dy", 5);

    function ticked() {
        link
            .attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y);

        node
            .attr("cx", d => d.x)
            .attr("cy", d => d.y);

        label
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

   
      
      // Usage example:
    
}