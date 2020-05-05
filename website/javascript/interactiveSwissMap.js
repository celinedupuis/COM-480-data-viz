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

        // Data Swiss Indicators
        const indicators_promise = d3.csv("../data/swiss_indicators_2020.csv").then((data) => {
            let population = {};
            let growthDomesticProductPerCapita = {};
            let beds = {};
            let doctors = {};

            data.forEach((row) => {
                population[row.id] = parseFloat(row.population);
                growthDomesticProductPerCapita = parseFloat(row.gdp);
                beds[row.id] = parseFloat(row.beds);
                doctors[row.id] = parseFloat(row.doctors);
            });
            return { population, growthDomesticProductPerCapita, beds, doctors };
        });

        // Data TopoJSON
        const map_promise = d3.json("../data/ch-cantons.json").then((topojson_raw) => {
            const canton_paths = topojson.feature(topojson_raw, topojson_raw.objects.cantons);
            return canton_paths.features;
        });

        // Colors
        var red = "#F95151";
        var lightGrey = "hsl(0, 0%, 90%)"
        var darkGrey = "hsl(0, 0%, 40%)"

        // Load Data in Promise
        Promise.all([indicators_promise, map_promise]).then((results) => {
            let map_data = results[1];
            map_data.map(x => {
                x.properties.density = results[0].population[x.id];
                x.properties.gdpPerCapita = results[0].growthDomesticProductPerCapita[x.id];
                x.properties.beds = results[0].beds[x.id];
                x.properties.doctors = results[0].doctors[x.id];
            });

            // Color Scale
            let color_scale = d3.scaleLog()
                .range([lightGrey, darkGrey])
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

            // Interaction
            d3.selectAll(".canton")
                .on("mouseover", mouseover)
                .on("mouseout", mouseout)
                .on("click", click);

            let cantonSelected = false;
            let cantonSelectedID = "";

            function mouseover(d) {
                const cantonOver = d.id;
                cantonSelectedID = d.id;
                if (!cantonSelected) {
                    d3.selectAll(".canton")
                        .style("stroke-width", d => d.id == cantonOver ? 3 : 0.5)
                        .style("fill", d => d.id == cantonOver ? red : color_scale(d.properties.density));
                }
                updateIndicators();
            }

            function mouseout(d) {
                if (!cantonSelected) {
                    d3.selectAll(".canton")
                        .style("stroke-width", 0.5)
                        .style("fill", d => color_scale(d.properties.density))
                }
            }

            function click(d) {
                cantonSelected = cantonSelectedID == d.id ? !cantonSelected : true;
                cantonSelectedID = d.id;
                if (cantonSelected) {
                    d3.selectAll(".canton")
                        .style("stroke-width", d => d.id == cantonSelectedID ? 3 : 0.5)
                        .style("fill", d => d.id == cantonSelectedID ? red : color_scale(d.properties.density));
                    scrollBy(0, svg_viewbox.height / 2);
                } else {
                    mouseout(d);
                }
            }

            function updateIndicators() {
                let name = map_data.filter(canton => canton.id == cantonSelectedID)[0].properties.name;
                let demographic = map_data.filter(canton => canton.id == cantonSelectedID)[0].properties.density;
                let beds = map_data.filter(canton => canton.id == cantonSelectedID)[0].properties.beds;
                let doctors = map_data.filter(canton => canton.id == cantonSelectedID)[0].properties.doctors / 100;

                demographic = Number(demographic).toFixed(0).toString() + "'000 <br> inhabitants";
                if (demographic > 1000) {
                    demographic = Number(demographic).toFixed(0).toString()[0] + "'" + Number(demographic).toFixed(0).toString().substr(1, 3) + "'000 <br>inhabitants";
                }
                beds = Number(beds).toFixed(1).toString() + " beds <br> for 1000 inhabitants";
                doctors = Number(doctors).toFixed(1).toString() + " doctors <br> for 1000 inhabitants";

                document.getElementById("indicator-name").innerHTML = name;
                document.getElementById("indicator-demographic").innerHTML = demographic;
                document.getElementById("indicator-beds").innerHTML = beds;
                document.getElementById("indicator-doctors").innerHTML = doctors;

                overlayIndicators();
            }

            // Change Cholorpleth
            d3.selectAll("#bedTab")
                .on("click", bedsCholorpleth)

            d3.selectAll("#densityTab")
                .on("click", densityCholorpleth)

            function bedsCholorpleth() {
                color_scale.domain([d3.min(map_data, d => d.properties.beds), d3.max(map_data, d => d.properties.beds)]);
                d3.selectAll(".canton")
                    .style("fill", (d) => color_scale(d.properties.beds));
            }

            function densityCholorpleth() {
                color_scale.domain([d3.min(map_data, d => d.properties.density), d3.max(map_data, d => d.properties.density)]);
                d3.selectAll(".canton")
                    .style("fill", (d) => color_scale(d.properties.density));
            }
        });
    }
}

function whenDocumentLoaded(action) {
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", action);
    } else {
        action();
    }
}

whenDocumentLoaded(() => {
    plot_object = new SwissMap('interactiveSwissMap');
});