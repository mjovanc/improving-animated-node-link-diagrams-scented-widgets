/* Set the width of the side navigation to 250px and the left margin of the page content to 250px and add a black background color to body */
function openNav() {
    document.getElementById("mySidenav").style.width = "250px";
    document.getElementById("main").style.marginLeft = "250px";
    document.getElementById("menuButton").style.display = "none";
}

/* Set the width of the side navigation to 0 and the left margin of the page content to 0, and the background color of body to white */
function closeNav() {
    document.getElementById("mySidenav").style.width = "0";
    document.getElementById("main").style.marginLeft = "0";
    document.getElementById("menuButton").style.display = "flex";
}


document.getElementById('uploadForm').addEventListener('submit', function (event) {
    event.preventDefault();
    const formData = new FormData();
    formData.append('file', document.getElementById('fileInput').files[0]);
    
    
    fetch('/upload', {
        method: 'POST',
        body: formData
    })
        .then(response => response.json())
        .then(data => {
            // Call function to visualize data using D3.js
            visualizeData(data);
        })
        .catch(error => console.error('Error:', error));
});

function visualizeData(data) {

    // Print a message to the console to check if the code reaches this part
    console.log(data);
    console.log("data = " + data.times)
    console.log(typeof data.times);

    // const timesArray = data.times.split(',').map(Number);

    updateVisualization(data.nodes, data.links, data.times);
    closeNav();
    // D3.js code to visualize data
    // This function will receive data from the server and create a node-link diagram
    // Example: 
    // d3.select("#visualization").append("svg").attr("width", 500).attr("height", 500)
    //     .append("circle").attr("cx", 50).attr("cy", 50).attr("r", data.radius).style("fill", "red");
}
