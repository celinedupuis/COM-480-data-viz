class SwissMap {
    constructor(svg_element_id) {
        this.svg = d3.select('#' + svg_element_id);

        // SVG scale
        const svg_viewbox = this.svg.node().viewBox.animVal;
        this.svg_width = svg_viewbox.width;
        this.svg_height = svg_viewbox.height;

        // D3 Projection
        const lat = 8.2275;
        const lon = 46.8182;
        var projection = d3.geoNaturalEarth1()
            .center([lat, lon])
            .scale(18000)
            .translate([this.svg_width / 2, this.svg_height / 2])
            .precision(.1);

        // Path (JSON to SVG path)
        const path = d3.geoPath()
            .projection(projection);

        // Data
        const population_promise = d3.csv("../data/swiss_indicators_2020.csv").then((data) => {
            let cantonId_to_population = {};
            data.forEach((row) => {
                cantonId_to_population[row.id] = parseFloat(row.population);
            });
            return cantonId_to_population;
        });

        const map_promise = d3.json("../data/ch-cantons.json").then((topojson_raw) => {
            const canton_paths = topojson.feature(topojson_raw, topojson_raw.objects.cantons);
            return canton_paths.features;
        });

        Promise.all([population_promise, map_promise]).then((results) => {
            let cantonId_to_population = results[0];
            let map_data = results[1];

            map_data.map(x => {
                x.properties.density = cantonId_to_population[x.id];
            });

            // Color Scale
            const color_scale = d3.scaleLog()
                .range(["hsl(0, 0%, 90%)", "hsl(0, 0%, 40%)"])
                .interpolate(d3.interpolateHcl)
                .domain([d3.min(map_data, d => d.properties.density), d3.max(map_data, d => d.properties.density)]);

            // Create container
            this.map_container = this.svg.append('g');
            this.label_container = this.svg.append('g');
            this.info_container = this.svg.append('g');

            // Draw the canton region
            this.map_container.selectAll(".canton")
                .data(map_data)
                .enter()
                .append("path")
                .classed("canton", true)
                .attr("d", path)
                .style("fill", (d) => color_scale(d.properties.density));

            // Draw the canton labels
            this.label_container.selectAll(".label")
                .data(map_data)
                .enter()
                .append("text")
                .classed("label", true)
                .attr("transform", d => "translate(" + path.centroid(d) + ")")
                .text(d => d.id);

            // Draw information
            this.info_container.selectAll(".infoCanton")
                .data(map_data)
                .enter()
                .append("text")
                .classed("infoCanton", true)
                .attr("transform", d => "translate(900, 250)")

            // Interaction
            d3.selectAll(".canton")
                .on("mouseover", mouseover)
                .on("mouseout", mouseout)
                .on("click", click);

            let cantonSelected = false;
            let cantonSelectedID = "";

            function mouseover(d, i) {
                const cantonOver = d.id;
                cantonSelectedID = d.id;
                if (!cantonSelected) {
                    d3.selectAll(".canton")
                        .style("stroke-width", d => d.id == cantonOver ? 3 : 0.5)
                        .style("fill", d => d.id == cantonOver ? "#F95151" : color_scale(d.properties.density));
                    d3.selectAll(".infoCanton")
                        .text(d => {
                            if (d.id == cantonSelectedID) {
                                return d.properties.name;
                            } else {
                                return "";
                            }
                        })
                }
            }

            function mouseout(d, i) {
                if (!cantonSelected) {
                    d3.selectAll(".canton")
                        .style("stroke-width", 0.5)
                        .style("fill", d => color_scale(d.properties.density));
                    d3.selectAll(".infoCanton")
                        .text("");
                }
            }

            function click(d, i) {
                cantonSelected = cantonSelectedID == d.id ? !cantonSelected : true;
                cantonSelectedID = d.id;
                if (cantonSelected) {
                    d3.selectAll(".canton")
                        .style("stroke-width", d => d.id == cantonSelectedID ? 3 : 0.5)
                        .style("fill", d => d.id == cantonSelectedID ? "#F95151" : color_scale(d.properties.density));
                    d3.selectAll(".infoCanton")
                        .text(d => {
                            if (d.id == cantonSelectedID) {
                                return d.properties.name;
                            } else {
                                return "";
                            }
                        })
                    scrollBy(0, svg_viewbox.height / 2);
                } else {
                    mouseout(d, i);
                }
            }
        });
    }
}

function whenDocumentLoaded(action) {
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", action);
    } else {
        // `DOMContentLoaded` already fired
        action();
    }
}

whenDocumentLoaded(() => {
    plot_object = new SwissMap('interactiveSwissMap');
    // plot object is global, you can inspect it in the dev-console
});



var white = "#ffffff";
var colorIn = "#FEC9C9";
var colorClick = "#F95151";