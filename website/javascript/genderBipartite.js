class Bipartite {
    constructor(svg_element_id) {
        this.svg = d3.select('#' + svg_element_id);
        const svg_viewbox = this.svg.node().viewBox.animVal;
        this.svg_height = svg_viewbox.height;
        const data = [
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
        const secondary = ["Caregivers", "Midwives", "Nurses", "Dentists", "Doctors"];

        function sortSec(a, b, c, d, e) {
            return d3.ascending(secondary.indexOf(a), secondary.indexOf(b), secondary.indexOf(c), secondary.indexOf(d), secondary.indexOf(e));
        }

        const g = this.svg.append("g").attr("transform", "translate(0, 20)");
        const bp = viz.bP()
            .data(data)
            .pad(5)
            .height(this.svg_height * 0.7)
            .width(svg_viewbox.width)
            .barSize(55)
            .sortSecondary(sortSec)
            .orient("horizontal")
            .fill(d => colorPrimary[d.primary]);

        g.call(bp);
        g.selectAll(".mainBars")
            .append("text")
            .classed("label-bipartite", true)
            .attr("x", d => d.part == "primary" ? -5 : 0)
            .attr("y", d => d.part == "primary" ? 0 : 50)
            .attr("transform", d => d.part == "primary" ? "" : "rotate(20)")
            .text(d => d.key)
            .attr("text-anchor", d => d.part == "primary" ? "middle" : "start");

        g.selectAll(".mainBars")
            .append("text")
            .classed("perc", true)
            .attr("x", 0)
            .attr("transform", d => d.part == "primary" ? "" : "rotate(20)")
            .attr("y", d => (d.part == "primary" ? 15 : 65))
            .attr("text-anchor", d => d.part == "primary" ? "middle" : "start")
            .text(d => d3.format("0.0%")(d.percent));


        // Interaction
        g.selectAll(".mainBars")
            .on("mouseover", mouseoverBipartite)
            .on("mouseout", mouseoutBipartite);

        function mouseoverBipartite(d) {
            let keySelected = d.key;
            let primarySelected = d.part;
            bp.mouseover(d);
            g.selectAll(".mainBars")
                .select(".perc")
                .style("opacity", d => d.key == keySelected || d.part == "primary" || primarySelected == "primary" ? 1 : 0.2)
                .text(d => d3.format("0.0%")(d.percent));
            g.selectAll(".mainBars")
                .select(".label-bipartite")
                .style("opacity", d => d.key == keySelected || d.part == "primary" || primarySelected == "primary" ? 1 : 0.2);
        }

        function mouseoutBipartite(d) {
            bp.mouseout(d);
            g.selectAll(".mainBars")
                .select(".perc")
                .style("opacity", 1)
                .text(d => d3.format("0.0%")(d.percent));
            g.selectAll(".mainBars")
                .select(".label-bipartite")
                .style("opacity", 1);
        }
    }
}