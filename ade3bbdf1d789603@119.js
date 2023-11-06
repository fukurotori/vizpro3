function _1(md){return(
md`# U.S. 2020 Presidential Election Results SpikeMaps`
)}

function _2(md){return(
md`## Biden Votes`
)}

function _bidenChart(SpikeMap,bidenVotes,countymap,centroid,statemap,nation,statemesh){return(
SpikeMap(bidenVotes, {
  value: ([bidenVotes]) => +bidenVotes,
  position([, stateid, countyid]) {
    const county = countymap.get(stateid + countyid);
    return county && centroid(county);
  },
  title([bidenVotes, stateid, countyid]) {
    const state = statemap.get(stateid);
    const county = countymap.get(stateid + countyid);
    return `${county?.properties.name}, ${state?.properties.name}\n${(+bidenVotes).toLocaleString("en")}`;
  },
  features: nation,
  borders: statemesh,
  fill: "blue", // fill color for spikes
  stroke: "blue", // stroke color for spikes
  width: 975,
  height: 610
})
)}

function _4(md){return(
md`## Trump Votes`
)}

function _trumpChart(SpikeMap,trumpVotes,countymap,centroid,statemap,nation,statemesh){return(
SpikeMap(trumpVotes, {
  value: ([trumpVotes]) => +trumpVotes,
  position([, stateid, countyid]) {
    const county = countymap.get(stateid + countyid);
    return county && centroid(county);
  },
  title([trumpVotes, stateid, countyid]) {
    const state = statemap.get(stateid);
    const county = countymap.get(stateid + countyid);
    return `${county?.properties.name}, ${state?.properties.name}\n${(+trumpVotes).toLocaleString("en")}`;
  },
  features: nation,
  borders: statemesh,
  width: 975,
  height: 610
})
)}

async function _trumpVotes(d3,FileAttachment){return(
d3.csvParse(await FileAttachment("us-presidential-election-2020.csv").text(), ({fips, votes, margin2020}) => [(margin2020-60<0?0:margin2020-60), fips.substring(0,2), fips.substring(2,5)])
)}

async function _bidenVotes(d3,FileAttachment){return(
d3.csvParse(await FileAttachment("us-presidential-election-2020.csv").text(), ({fips, votes, margin2020}) => [(-margin2020-30<0?0:-margin2020-30), fips.substring(0,2), fips.substring(2,5)])
)}

function _election(FileAttachment){return(
FileAttachment("us-presidential-election-2020.csv").csv()
)}

function _9(__query,election,invalidation){return(
__query(election,{from:{table:"election"},sort:[],slice:{to:null,from:null},filter:[],select:{columns:null}},invalidation,"election")
)}

function _centroid(d3)
{
  const path = d3.geoPath();
  return feature => path.centroid(feature);
}


function _us(FileAttachment){return(
FileAttachment("counties-albers-10m.json").json()
)}

function _nation(topojson,us){return(
topojson.feature(us, us.objects.nation)
)}

function _statemap(topojson,us){return(
new Map(topojson.feature(us, us.objects.states).features.map(d => [d.id, d]))
)}

function _countymap(topojson,us){return(
new Map(topojson.feature(us, us.objects.counties).features.map(d => [d.id, d]))
)}

function _statemesh(topojson,us){return(
topojson.mesh(us, us.objects.states, (a, b) => a !== b)
)}

function _SpikeMap(d3){return(
function SpikeMap(data, {
  position = d => d, // given d in data, returns the [longitude, latitude]
  value = () => undefined, // given d in data, returns the quantitative value
  title, // given a datum d, returns the hover text
  scale = d3.scaleLinear, // type of length scale
  domain, // [0, max] values; input of length scale; must start at zero
  maxLength = 200, // maximum length of spikes
  width = 640, // outer width, in pixels
  height, // outer height, in pixels
  projection, // a D3 projection; null for pre-projected geometry
  features, // a GeoJSON feature collection for the background
  borders, // a GeoJSON object for stroking borders
  spike = (length, width = 7) => `M${-width / 2},0L0,${-length}L${width / 2},0`,
  outline = projection && projection.rotate ? {type: "Sphere"} : null, // a GeoJSON object for the background
  backgroundFill = "#e0e0e0", // fill color for background
  backgroundStroke = "white", // stroke color for borders
  backgroundStrokeWidth, // stroke width for borders
  backgroundStrokeOpacity, // stroke width for borders
  backgroundStrokeLinecap = "round", // stroke line cap for borders
  backgroundStrokeLinejoin = "round", // stroke line join for borders
  fill = "red", // fill color for spikes
  fillOpacity = 0.3, // fill opacity for spikes
  stroke = "red", // stroke color for spikes
  strokeWidth, // stroke width for spikes
  strokeOpacity, // stroke opacity for spikes
  legendX = width - 20,
  legendY = height - 20,
} = {}) {
  // Compute values.
  const I = d3.map(data, (_, i) => i);
  const V = d3.map(data, value).map(d => d == null ? NaN : +d);
  const P = d3.map(data, position);
  const T = title == null ? null : d3.map(data, title);

  // Compute default domains.
  if (domain === undefined) domain = [0, d3.max(V)];

  // Construct scales.
  const length = scale(domain, [0, maxLength]);

  // Compute the default height. If an outline object is specified, scale the projection to fit
  // the width, and then compute the corresponding height.
  if (height === undefined) {
    if (outline === undefined) {
      height = 400;
    } else {
      const [[x0, y0], [x1, y1]] = d3.geoPath(projection.fitWidth(width, outline)).bounds(outline);
      const dy = Math.ceil(y1 - y0), l = Math.min(Math.ceil(x1 - x0), dy);
      projection.scale(projection.scale() * (l - 1) / l).precision(0.2);
      height = dy;
    }
  }

  // Construct a path generator.
  const path = d3.geoPath(projection);

  const svg = d3.create("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [0, 0, width, height])
      .attr("style", "width: 100%; height: auto; height: intrinsic;");

  if (outline != null) svg.append("path")
      .attr("fill", "white")
      .attr("stroke", "currentColor")
      .attr("d", path(outline));

  svg.append("path")
      .datum(features)
      .attr("fill", backgroundFill)
      .attr("d", path);

  if (borders != null) svg.append("path")
      .attr("pointer-events", "none")
      .attr("fill", "none")
      .attr("stroke", backgroundStroke)
      .attr("stroke-linecap", backgroundStrokeLinecap)
      .attr("stroke-linejoin", backgroundStrokeLinejoin)
      .attr("stroke-width", backgroundStrokeWidth)
      .attr("stroke-opacity", backgroundStrokeOpacity)
      .attr("d", path(borders));

  const legend = svg.append("g")
      .attr("fill", "#777")
      .attr("text-anchor", "middle")
      .attr("font-family", "sans-serif")
      .attr("font-size", 10)
    .selectAll("g")
      .data(length.ticks(4).slice(1).reverse())
    .join("g")
      .attr("transform", (d, i) => `translate(${legendX - i * 18},${legendY})`);

  legend.append("path")
      .attr("fill", fill)
      .attr("fill-opacity", 0.3)
      .attr("stroke", stroke)
      .attr("d", d => spike(length(d)));

  legend.append("text")
      .attr("dy", "1.3em")
      .text(length.tickFormat(4, "s"));

  svg.append("g")
      .attr("fill", fill)
      .attr("fill-opacity", fillOpacity)
      .attr("stroke", stroke)
      .attr("stroke-width", strokeWidth)
      .attr("stroke-opacity", strokeOpacity)
    .selectAll("path")
    .data(d3.range(data.length)
        .filter(i => P[i])
        .sort((i, j) => d3.ascending(P[i][1], P[j][1]) || d3.ascending(P[i][0], P[j][0])))
    .join("path")
      .attr("transform", projection == null
          ? i => `translate(${P[i]})`
          : i => `translate(${projection(P[i])})`)
      .attr("d", i => spike(length(V[i])))
      .call(T ? path => path.append("title").text(i => T[i]) : () => {});

  return svg.node();
}
)}

export default function define(runtime, observer) {
  const main = runtime.module();
  function toString() { return this.url; }
  const fileAttachments = new Map([
    ["counties-albers-10m.json", {url: new URL("./files/50848f0dd4d2d9c84821adba90ca625cb2815694117bbb7b6ae393e788aae9d85f19a6c73d60d642bb04e2f95b87993e8c7312d4d4da6a1431c58460f5ad6c63.json", import.meta.url), mimeType: "application/json", toString}],
    ["us-presidential-election-2020.csv", {url: new URL("./files/5978ce002d33cbcde5f39be69222360182955287fd504d1128b8d73aac5d9080298d87bc92db475f1e17af384db06b0431ad458bdaeaf2bda75685260789ebab.csv", import.meta.url), mimeType: "text/csv", toString}]
  ]);
  main.builtin("FileAttachment", runtime.fileAttachments(name => fileAttachments.get(name)));
  main.variable(observer()).define(["md"], _1);
  main.variable(observer()).define(["md"], _2);
  main.variable(observer("bidenChart")).define("bidenChart", ["SpikeMap","bidenVotes","countymap","centroid","statemap","nation","statemesh"], _bidenChart);
  main.variable(observer()).define(["md"], _4);
  main.variable(observer("trumpChart")).define("trumpChart", ["SpikeMap","trumpVotes","countymap","centroid","statemap","nation","statemesh"], _trumpChart);
  main.variable(observer("trumpVotes")).define("trumpVotes", ["d3","FileAttachment"], _trumpVotes);
  main.variable(observer("bidenVotes")).define("bidenVotes", ["d3","FileAttachment"], _bidenVotes);
  main.variable(observer("election")).define("election", ["FileAttachment"], _election);
  main.variable(observer()).define(["__query","election","invalidation"], _9);
  main.variable(observer("centroid")).define("centroid", ["d3"], _centroid);
  main.variable(observer("us")).define("us", ["FileAttachment"], _us);
  main.variable(observer("nation")).define("nation", ["topojson","us"], _nation);
  main.variable(observer("statemap")).define("statemap", ["topojson","us"], _statemap);
  main.variable(observer("countymap")).define("countymap", ["topojson","us"], _countymap);
  main.variable(observer("statemesh")).define("statemesh", ["topojson","us"], _statemesh);
  main.variable(observer("SpikeMap")).define("SpikeMap", ["d3"], _SpikeMap);
  return main;
}
