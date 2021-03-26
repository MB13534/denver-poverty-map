mapboxgl.accessToken =
  "pk.eyJ1IjoicG1pbiIsImEiOiJja2szNnd4MzYxN3o5MnBwZXB4NmdxdGRwIn0.V_JbBgEasmYUmvWQ8Q3V1A";
var map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/pmin/ckkw0m0oy1j5s17o8g4teo6zi",
  zoom: 11,
  center: [-104.99, 39.74],
});

map.on("load", function () {
  // ---------- CENSUS TRACTS ----------

  // Import and display the census tracts
  map.addSource("tracts", {
    type: "vector",
    url: "mapbox://pmin.9f8sydtg",
  });
  // Show borders between census tracts
  map.addLayer({
    id: "tractLines",
    type: "line",
    source: "tracts",
    "source-layer": "Income_Poverty__Census_Tracts-cn39ss",
    layout: {
      visibility: "none",
      "line-join": "round",
      "line-cap": "round",
    },
    paint: {
      "line-color": "#877b59",
      "line-width": 1.5,
    },
  });
  // Show shading inside census tracts to indicate poverty rate
  map.addLayer({
    id: "tractFill",
    type: "fill",
    source: "tracts",
    "source-layer": "Income_Poverty__Census_Tracts-cn39ss",
    layout: {
      visibility: "none",
    },
    paint: {
      "fill-color": ["rgb", 200, 0, 0],
      "fill-opacity": [
        "/",
        ["get", "Percent_Poverty_AllPeople_Income_Below_Pov_Level"],
        100,
      ],
    },
  });

  // ---------- NEIGHBORHOODS ----------

  // Import and display the neighborhoods
  map.addSource("neighborhoods", {
    type: "vector",
    url: "mapbox://pmin.bp288dvg",
  });
  // Show borders between neighborhoods
  map.addLayer({
    id: "neighborhoodLines",
    type: "line",
    source: "neighborhoods",
    "source-layer": "neighborhoods_from_cdphe-blvz58",
    layout: {
      visibility: "visible",
      "line-join": "round",
      "line-cap": "round",
    },
    paint: {
      "line-color": "#877b59",
      "line-width": 1.5,
    },
  });
  // This part adds the shading in the neighborhoods
  var matchExpression = ["match", ["get", "NBHD_NAME"]];

  data.forEach(function (row) {
    var alpha = row["pov_rate"] / 100;
    //console.log("pov_rate is: " + pov_rate);
    matchExpression.push(row["NBHD_NAME"], alpha);
  });
  matchExpression.push(0);
  /* console.log("Data is: " + data[1]["NBHD_NAME"]); */
  console.log("Match expression contains: " + matchExpression);
  map.addLayer({
    id: "neighborhoodFill",
    type: "fill",
    source: "neighborhoods",
    "source-layer": "neighborhoods_from_cdphe-blvz58",
    layout: {
      visibility: "visible",
    },
    paint: {
      "fill-color": ["rgb", 200, 0, 0],
      "fill-opacity": matchExpression,
    },
  });

  var layers = [
    "0-10",
    "10-20",
    "20-30",
    "30-40",
    "40-50",
    "50-60",
    "60-70",
    "70+",
  ];

  var colors = [
    "rgba(200, 0, 0, 0.05)",
    "rgba(200, 0, 0, 0.1)",
    "rgba(200, 0, 0, 0.2)",
    "rgba(200, 0, 0, 0.3)",
    "rgba(200, 0, 0, 0.4)",
    "rgba(200, 0, 0, 0.5)",
    "rgba(200, 0, 0, 0.6)",
    "rgba(200, 0, 0, 0.7)",
  ];

  for (i = 0; i < layers.length; i++) {
    var layer = layers[i];
    var color = colors[i];
    var item = document.createElement("div");
    var key = document.createElement("span");
    key.className = "legend-key";
    key.style.backgroundColor = color;

    var value = document.createElement("span");
    value.innerHTML = layer;
    item.appendChild(key);
    item.appendChild(value);
    legend.appendChild(item);
  }
});

// Set up the corresponding toggle button for census tracts
// ----------------------------------------------------------------
var id = "tracts";

var tractLink = document.createElement("a");
tractLink.href = "#";
tractLink.className = "";
tractLink.textContent = id;

// ----------------------------------------------------------------

// Set up the corresponding toggle button for neighborhoods
// ----------------------------------------------------------------
var id = "neighborhoods";

var neighborhoodLink = document.createElement("a");
neighborhoodLink.href = "#";
neighborhoodLink.className = "active";
neighborhoodLink.textContent = id;

// ----------------------------------------------------------------

// On click, do the following:
// ----------------------------------------------------------------
tractLink.onclick = function (e) {
  e.preventDefault();
  e.stopPropagation();

  var visibility = map.getLayoutProperty("tractLines", "visibility");

  // Toggle census tract layer visibility by changing the layout object's visibility property:
  // ----------------------------------------------------------------
  if (visibility === "visible") {
    map.setLayoutProperty("tractLines", "visibility", "none");
    map.setLayoutProperty("tractFill", "visibility", "none");
    this.className = "";
  } else {
    this.className = "active";
    map.setLayoutProperty("tractLines", "visibility", "visible");
    map.setLayoutProperty("tractFill", "visibility", "visible");
  }
};

neighborhoodLink.onclick = function (e) {
  e.preventDefault();
  e.stopPropagation();

  var visibility = map.getLayoutProperty("neighborhoodLines", "visibility");

  // Toggle neighborhood layer visibility by changing the layout object's visibility property:
  // ----------------------------------------------------------------
  if (visibility === "visible") {
    map.setLayoutProperty("neighborhoodLines", "visibility", "none");
    map.setLayoutProperty("neighborhoodFill", "visibility", "none");
    this.className = "";
  } else {
    this.className = "active";
    map.setLayoutProperty("neighborhoodLines", "visibility", "visible");
    map.setLayoutProperty("neighborhoodFill", "visibility", "visible");
  }
};

var layers = document.getElementById("menu");
layers.appendChild(neighborhoodLink);
layers.appendChild(tractLink);

map.on("mousemove", function (e) {
  var neighborhoods = map.queryRenderedFeatures(e.point, {
    layers: ["neighborhoodFill"],
  });
  // console.log(neighborhoods[0]);
  if (neighborhoods.length > 0) {
    document.getElementById("features").innerHTML =
      "<h3><strong>" +
      neighborhoods[0].properties.NBHD_NAME +
      "</strong></h3><p><strong><em>" +
      neighborhoods[0].layer.paint["fill-opacity"] * 100 +
      "</strong> people per square mile</em></p>";
  } else {
    document.getElementById("features").innerHTML =
      "<p>Hover over a neighborhood!</p>";
  }
});
