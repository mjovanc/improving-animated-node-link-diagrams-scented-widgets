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

document
  .getElementById("uploadForm")
  .addEventListener("submit", function (event) {
    event.preventDefault();
    const formData = new FormData();
    formData.append("file", document.getElementById("fileInput").files[0]);

    fetch("/upload", {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        // Call function to visualize data using D3.js
        visualizeData(data);
      })
      .catch((error) => console.error("Error:", error));
  });

function visualizeData(data) {
  const edgesRadio = d3.select("#edgesRadio");
  const nodesRadio = d3.select("#nodesRadio");
  const communitiesRadio = d3.select("#communitiesRadio");

  edgesRadio.on("change", function (e) {
    if (e.target.checked) {
      edgesVisualization(data.nodes, data.links, data.times);
    }
  });

  nodesRadio.on("change", function (e) {
    if (e.target.checked) {
      nodesVisualization(data.nodes, data.links, data.times);
    }
  });

  communitiesRadio.on("change", function (e) {
    if (e.target.checked) {
      communitiesVisualization(data.communities);
    }
  });

  edgesVisualization(data.nodes, data.links, data.times);

  updateVisualization(data.nodes, data.links, data.times, data.communities_raw);

  closeNav();
}
