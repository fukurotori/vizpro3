

function _chart(d3, topojson, us) {
  const width = 630;
  const height = 350;

  const zoom = d3.zoom()
    .scaleExtent([1, 8])
    .on("zoom", zoomed);

  const svg = d3.create("svg")
    .attr("viewBox", [0, 0, width, height])
    .attr("width", width)
    .attr("height", height)
    .attr("id","zoom")
    .attr("display", "none")
    .attr("style", "max-width: 100%; height: auto;");

  const projection = d3.geoMercator()
    .scale(100)
    .rotate([180, 0, 0]) // Rotate the map by 180 degrees
    .translate([width / 2, height / 2]);

  const path = d3.geoPath()
    .projection(projection);

  const g = svg.append("g");

  const states = g.append("g")
    .attr("fill", "#444")
    .attr("cursor", "pointer")
    .selectAll("path")
    .data(topojson.feature(us, us.objects.default).features)
    .join("path")
    .on("click", clicked)
    .attr("d", path);

  states
    .append("title")
    .text((d) => d.properties.name);

  g.append("path")
    .attr("fill", "none")
    .attr("stroke", "white")
    .attr("stroke-linejoin", "round")
    .attr("d", path(topojson.mesh(us, us.objects.default, (a, b) => a !== b)));

  svg.call(zoom);

  // Add transition to zoom the map to fit the SVG element
  svg.transition()
    .duration(750)
    .call(
      zoom.transform,
      d3.zoomIdentity
        .translate(width / 2, height / 2)
        .scale(Math.min(8, 0.9 / Math.max(width / width, height / height)))
        .translate(-width / 2, -height / 2),
      d3.zoomTransform(svg.node()).invert([width / 2, height / 2])
    );

  function reset() {
    states.transition().style("fill", null);
    svg.transition().duration(750).call(
      zoom.transform,
      d3.zoomIdentity,
      d3.zoomTransform(svg.node()).invert([width / 2, height / 2])
    );
  }

  function clicked(event, d) {
    const [[x0, y0], [x1, y1]] = path.bounds(d);
    prepare_data(d.properties.name);
    event.stopPropagation();
    states.transition().style("fill", null);
    d3.select(this).transition().style("fill",
"red");
    svg.transition().duration(750).call(
      zoom.transform,
      d3.zoomIdentity
        .translate(width / 2, height / 2)
        .scale(Math.min(8, 0.9 / Math.max((x1 - x0) / width, (y1 - y0) / height)))
        .translate(-(x0 + x1) / 2, -(y0 + y1) / 2),
      d3.pointer(event, svg.node())
    );
  }

  function draw_scatter(data)
{
  
  // Set the margins
  const margin = { top: 20, right: 20, bottom: 30, left: 40 };
  
  // Set the width and height of the chart
  const width = 300 - margin.left - margin.right;
  const height = 200 - margin.top - margin.bottom;
  
  $("#scatterplot").html("");
  // Create an SVG element
  const svg = d3.select("#scatterplot").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);
  
  // Create a linear scale for the x-axis
  const xScale = d3.scaleLinear()
    .domain([1950, 2023])
    .range([0, width]);
  
  // Create a linear scale for the y-axis
  const yScale = d3.scaleLinear()
    .domain([0, 10])
    .range([height, 0]);
  
  // Create an axis generator for the x-axis
  const xAxis = d3.axisBottom(xScale).ticks(10);
//   svg.select(".x.axis")
//   .call(xAxis.grid(true));

// // Add grid lines to the y-axis
// svg.select(".y.axis")
//   .call(yAxis.grid(true));
  // Add an axis label for the x-axis
svg.append("text")
.attr("class", "x axis label")
.attr("text-anchor", "middle")
.attr("x", width / 2)
.attr("y", height + margin.bottom)
.text("Years");

// Add an axis label for the y-axis
svg.append("text")
.attr("class", "y axis label")
.attr("text-anchor", "middle")
.attr("transform", "rotate(-90)")
.attr("x", -70)
.attr("y", -17)
.text("Number of Events");
  // Create an axis generator for the y-axis
  const yAxis = d3.axisLeft(yScale).ticks(10);
 
  // Add the x-axis to the chart
  svg.append("g")
    .attr("class", "x axis")
    .attr("transform", `translate(0, ${height})`)
    .call(xAxis);
  
  // Add the y-axis to the chart
  svg.append("g")
    .attr("class", "y axis")
    .call(yAxis);

      var tooltip = d3.select("#scatterplot")
    .append("div")
    .style("opacity", 0)
    .attr("class", "tooltip")
    .style("background-color", "white")
    .style("border", "solid")
    .style("border-width", "1px")
    .style("border-radius", "5px")
    .style("padding", "10px")
    var mouseover = function(d) {
      tooltip
        .style("opacity", 1)
    }
  
    var mousemove = function(d) {
  
      tooltip
        .html( d.target.__data__.decade+"'s :" + d.target.__data__.events)
        // .style("left", (d3.mouse(this)[0]+90) + "px") // It is important to put the +90: other wise the tooltip is exactly where the point is an it creates a weird effect
        // .style("top", (d3.mouse(this)[1]) + "px")
    }
  
    // A function that change this tooltip when the leaves a point: just need to set opacity to 0 again
    var mouseleave = function(d) {
      tooltip
        .transition()
        .duration(200)
        .style("opacity", 0)
    }
    var mouseclick = function(d) {
      console.log(d);
      var event = event_data[d.target.__data__.decade];
      let uls = ` Events:
      <ul style="
      font-size: 13px;
  ">${event.map(data => 
        `<li>${data}</li>`).join('')}
         </ul>`;
      $("#event_detail").html(uls);

    }
       // Add the scatterplot circles to the chart
  svg.selectAll(".circle")
  .data(data)
  .enter().append("circle")
    .attr("class", "circle")
    .attr("cx", d => xScale(d.decade))
    .attr("cy", d => yScale(d.events))
    .attr("r", 5)
    .attr("fill", "blue").on("mouseover", mouseover )
    .on("mousemove", mousemove )
    .on("mouseleave", mouseleave )
    .on("click", mouseclick )
      
}
var event_data= {};
function calculate_decade(events_data){
console.log(events_data);
var year_data = {1950:0,1960:0,1970:0,1980:0,1990:0,2000:0,2010:0,2020:0}
event_data = {1950:[],1960:[],1970:[],1980:[],1990:[],2000:[],2010:[],2020:[]}
for (let i = 0; i < events_data.length; i++) {
  var year = events_data[i].split("-")[0].trim();
  if(year >= 1950 && year < 1960){
    year_data[1950]++;
    event_data[1950].push(events_data[i]);
  }
  if(year >= 1960 && year < 1970){
    year_data[1960]++;
    event_data[1960].push(events_data[i]);
  }
  if(year >= 1970 && year < 1980){
    year_data[1970]++;
    event_data[1970].push(events_data[i]);
  }
  if(year >= 1980 && year < 1990){
    year_data[1980]++;
    event_data[1980].push(events_data[i]);
  }
  if(year >= 1990 && year < 2000){
    year_data[1990]++;
    event_data[1990].push(events_data[i]);
  }
  if(year >= 2000 && year < 2010){
    year_data[2000]++;
    event_data[2000].push(events_data[i]);
  }
  if(year >= 2010 && year < 2020){
    year_data[2010]++;
    event_data[2010].push(events_data[i]);
  }
}
return year_data;
}


  function zoomed(event) {
    const { transform } = event;
    g.attr("transform", transform);
    g.attr("stroke-width", 1 / transform.k);
  }
  function prepare_data(country_name){
    $.getJSON('./input_json.json', function(data) {
      var cnt = data[country_name]["Key historical events"].length;
      $("#top_row").text(country_name + " : " +cnt);
      var actor = data[country_name]["Actors"].split(";")
      var year_data = calculate_decade(data[country_name]["Key historical events"]);
      const sca_data = [
        { decade: 1950, events: year_data[1950] },
        { decade: 1960, events: year_data[1960] },
        { decade: 1970, events: year_data[1970] },
        { decade: 1980, events: year_data[1980] },
        { decade: 1990, events: year_data[1990] },
        { decade: 2000, events: year_data[2000] },
        { decade: 2010, events: year_data[2010]},
        { decade: 2020, events: year_data[2020]},
      ];
      draw_scatter(sca_data);

      let uls = ` Actors:
      <ul style="
      font-size: 13px;
  ">${actor.map(data => 
        `<li>${data}</li>`).join('')}
         </ul>`;
      $("#actors_row").html(uls);
      
      var org = data[country_name]["Organisations"]
      let ul = `Organisations:
      <ul style="
      font-size: 13px;
  ">${org.map(data => 
        `<li>${data.split(":")[0]}</li>`).join('')}
         </ul>`;
       $("#bottom_row").html(ul);
    });
    
  // Create a dataset
  
  
  }

  return svg.node();
}





function _us(FileAttachment){return(
FileAttachment("states-albers-10m.json").json()
)}

export default function define(runtime, observer) {
  const main = runtime.module();
  function toString() { return this.url; }
  const fileAttachments = new Map([
    ["states-albers-10m.json", {url: new URL("http://code.highcharts.com/mapdata/custom/south-america.topo.json", import.meta.url), mimeType: "application/json", toString}]
  ]);
  main.builtin("FileAttachment", runtime.fileAttachments(name => fileAttachments.get(name)));
  main.variable(observer("chart")).define("chart", ["d3","topojson","us"], _chart);
  main.variable("us").define("us", ["FileAttachment"], _us);
  return main;
}
