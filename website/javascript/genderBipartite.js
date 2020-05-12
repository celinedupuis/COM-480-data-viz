const _data = [
    ['Men', 'Doctors', 8845],
    ['Men', 'Dentists', 1450],
    ['Men', 'Nurses', 5768],
    ['Men', 'Caregivers', 2016],
    ['Men', 'Midwives', 0],

    ['Women', 'Doctors', 6499],
    ['Women', 'Dentists', 743],
    ['Women', 'Nurses', 47506],
    ['Women', 'Caregivers', 21692],
    ['Women', 'Midwives', 2000]
];
const colorPrimary = {
    Men: "#4287f5",
    Women: "#F95151",
};
const secondary = ["Caregivers", "Midwives", "Nurses", "Doctors", "Dentists"];

function sortSec(a, b, c, d, e) {
    return d3.ascending(secondary.indexOf(a), secondary.indexOf(b), secondary.indexOf(c), secondary.indexOf(d), secondary.indexOf(e));
}

const svg = d3.select("#bipartite");
const svg_viewbox = svg.node().viewBox.animVal;

const g = svg.append("g").attr("transform", "translate(0, 20)");
const bp = viz.bP()
    .data(_data)
    .pad(5)
    .height(400)
    .width(svg_viewbox.width)
    .barSize(45)
    .sortSecondary(sortSec)
    .orient("horizontal")
    .fill(d => colorPrimary[d.primary]);

g.call(bp);

g.selectAll(".mainBars")
    .on("mouseover", mouseover)
    .on("mouseout", mouseout);

g.selectAll(".mainBars").append("text").attr("class", "label")
    .attr("x", d => d.part == "primary" ? -5 : 0)
    .attr("y", d => d.part == "primary" ? 0 : 45)
    .attr("transform", d => d.part == "primary" ? "" : "rotate(20)")
    .text(d => d.key)
    .attr("text-anchor", d => d.part == "primary" ? "middle" : "start");

g.selectAll(".mainBars").append("text").attr("class", "perc")
    .attr("x", 0)
    .attr("transform", d => d.part == "primary" ? "" : "rotate(20)")
    .attr("y", d => (d.part == "primary" ? 12 : 60))
    .attr("text-anchor", d => d.part == "primary" ? "middle" : "start")
    .text(d => d3.format("0.0%")(d.percent));


function mouseover(d) {
    let keySelected = d.key;
    let primarySelected = d.part;
    bp.mouseover(d);
    g.selectAll(".mainBars")
        .select(".perc")
        .style("opacity", d => d.key == keySelected || d.part == "primary" || primarySelected == "primary" ? 1 : 0.2)
        .text(d => d3.format("0.0%")(d.percent));
    g.selectAll(".mainBars")
        .select(".label")
        .style("opacity", d => d.key == keySelected || d.part == "primary" || primarySelected == "primary" ? 1 : 0.2);
}

function mouseout(d) {
    bp.mouseout(d);
    g.selectAll(".mainBars")
        .select(".perc")
        .style("opacity", 1)
        .text(d => d3.format("0.0%")(d.percent));
    g.selectAll(".mainBars")
        .select(".label")
        .style("opacity", 1);
}