let max;
let min;
let maxID;
let minID;
let isLegendSelected = false;
let cholorplethMode = "cholorpleth-population";

class SwissMap {
    constructor(map_data, svg_element_id) {
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
        this.path = d3.geoPath()
            .projection(projection);

        // Create container
        this.map_container = this.svg.append('g');

        // Color scale for cholorpleth
        var lightGrey = "hsl(0, 0%, 90%)"
        var darkGrey = "hsl(0, 0%, 20%)"
        const color_scale_beds = d3.scaleLog()
            .range([lightGrey, darkGrey])
            .interpolate(d3.interpolateHcl)
            .domain([d3.min(map_data, d => d.properties.beds), d3.max(map_data, d => d.properties.beds)]);

        const color_scale_doctors = d3.scaleLog()
            .range([lightGrey, darkGrey])
            .interpolate(d3.interpolateHcl)
            .domain([d3.min(map_data, d => d.properties.doctors), d3.max(map_data, d => d.properties.doctors)]);

        const color_scale_density = d3.scaleLog()
            .range([lightGrey, darkGrey])
            .interpolate(d3.interpolateHcl)
            .domain([d3.min(map_data, d => d.properties.density), d3.max(map_data, d => d.properties.density)]);

        // Draw the canton region
        this.map_container.selectAll(".canton")
            .data(map_data)
            .enter()
            .append("path")
            .classed("canton", true)
            .attr("d", this.path)
            .style("fill", (d) => color_scale_density(d.properties.density));

        // Draw the canton labels
        this.map_container.selectAll(".label-canton")
            .data(map_data)
            .enter()
            .append("text")
            .classed("label-canton", true)
            .attr("transform", d => "translate(" + this.path.centroid(d) + ")")
            .text(d => d.id);

        // Draw legend
        const legend_max_w = this.svg_width * 4 / 5;
        const legend_max_h = 200;
        const legend_min_w = this.svg_width * 4 / 5;
        const legend_min_h = 230;
        const size_rect = 20;

        // - max rect
        this.svg.append('g')
            .append("rect")
            .attr("id", "legend-max")
            .attr("width", size_rect)
            .attr("height", size_rect)
            .attr("x", legend_max_w)
            .attr("y", legend_max_h)
            .attr("fill", darkGrey);

        // - min rect
        this.svg.append('g')
            .append("rect")
            .attr("id", "legend-min")
            .attr("width", size_rect)
            .attr("height", size_rect)
            .attr("x", legend_min_w)
            .attr("y", legend_min_h)
            .attr("fill", lightGrey);

        // - max text
        this.svg.append('g')
            .append("text")
            .attr("id", "legend-max")
            .classed("label", true)
            .classed("legend-max-text", true)
            .text("Max: " + densityToString(d3.max(map_data, d => d.properties.density)))
            .attr("transform", "translate(" + (legend_max_w + 1.25 * size_rect) + "," + (legend_max_h + 0.75 * size_rect) + ")");

        // - min text
        this.svg.append('g')
            .append("text")
            .attr("id", "legend-min")
            .classed("label", true)
            .classed("legend-min-text", true)
            .text("Min: " + densityToString(d3.min(map_data, d => d.properties.density)))
            .attr("transform", "translate(" + (legend_min_w + 1.25 * size_rect) + "," + (legend_min_h + 0.75 * size_rect) + ")");

        // - title
        this.svg.append('g')
            .append('text')
            .text("Population")
            .classed("label", true)
            .classed("cholorpleth-title", true)
            .style("font-size", 20)
            .attr("transform", "translate(" + legend_max_w + "," + (legend_max_h - size_rect) + ")");

        function densityToString(density) {
            if (density > 1000) {
                density = Number(density).toFixed(0).toString()[0] + "'" + Number(density).toFixed(0).toString().substr(1, 3) + "'000 inhabitants";
            } else {
                density = Number(density).toFixed(0).toString() + "'000 inhabitants";
            }
            return density;
        }

        // Interaction Cholorpleth Legend
        d3.selectAll("#legend-max")
            .on("mouseover", function() {
                overlayLegend();
            })
            .on("mouseout", function() {
                if (!isLegendSelected) {
                    changeCholorpleth();
                }
            })
            .on("click", function() {
                isLegendSelected = !isLegendSelected;
            })


        d3.selectAll("#legend-min")
            .on("mouseover", function() {
                overlayLegend();
            })
            .on("mouseout", function() {
                if (!isLegendSelected) {
                    changeCholorpleth();
                }
            })
            .on("click", function() {
                isLegendSelected = !isLegendSelected;
            })

        function overlayLegend() {
            switch (cholorplethMode) {
                case "cholorpleth-population":
                    max = d3.max(map_data, d => d.properties.density);
                    min = d3.min(map_data, d => d.properties.density);
                    maxID = map_data.filter(canton => canton.properties.density == max)[0].properties.name;
                    minID = map_data.filter(canton => canton.properties.density == min)[0].properties.name;
                    break;
                case "cholorpleth-beds":
                    max = d3.max(map_data, d => d.properties.beds);
                    min = d3.min(map_data, d => d.properties.beds);
                    maxID = map_data.filter(canton => canton.properties.beds == max)[0].properties.name;
                    minID = map_data.filter(canton => canton.properties.beds == min)[0].properties.name;
                    break;
                case "cholorpleth-doctors":
                    max = d3.max(map_data, d => d.properties.doctors);
                    min = d3.min(map_data, d => d.properties.doctors);
                    maxID = map_data.filter(canton => canton.properties.doctors == max)[0].properties.name;
                    minID = map_data.filter(canton => canton.properties.doctors == min)[0].properties.name;
                    break;
            }
            d3.selectAll(".legend-max-text")
                .text("Max: " + maxID);
            d3.selectAll(".legend-min-text")
                .text("Min: " + minID)
        }

        // Interaction Cholorpleth Mode
        d3.selectAll(".cholorplethButton")
            .on("click", function() {
                isLegendSelected = false;
                cholorplethMode = this.id;
                changeCholorpleth();
            })

        function changeCholorpleth() {
            switch (cholorplethMode) {
                case "cholorpleth-population":
                    d3.selectAll(".canton")
                        .transition()
                        .duration(duration_transition)
                        .style("fill", (d) => color_scale_density(d.properties.density));
                    d3.selectAll(".cholorpleth-title")
                        .text("Population")
                    d3.selectAll(".legend-max-text")
                        .text("Max: " + densityToString(d3.max(map_data, d => d.properties.density)))
                    d3.selectAll(".legend-min-text")
                        .text("Min: " + densityToString(d3.min(map_data, d => d.properties.density)))
                    break;
                case "cholorpleth-beds":
                    d3.selectAll(".canton")
                        .transition()
                        .duration(duration_transition)
                        .style("fill", (d) => color_scale_beds(d.properties.beds));
                    d3.selectAll(".cholorpleth-title")
                        .text("# Beds")
                    d3.selectAll(".legend-max-text")
                        .text("Max: " + Number(d3.max(map_data, d => d.properties.beds)).toFixed(1) + " per 1000 inhabitants")
                    d3.selectAll(".legend-min-text")
                        .text("Min: " + Number(d3.min(map_data, d => d.properties.beds)).toFixed(1) + " per 1000 inhabitants")
                    break;
                case "cholorpleth-doctors":
                    d3.selectAll(".canton")
                        .transition()
                        .duration(duration_transition)
                        .style("fill", (d) => color_scale_doctors(d.properties.doctors));
                    d3.selectAll(".cholorpleth-title")
                        .text("# Doctors")
                    d3.selectAll(".legend-max-text")
                        .text("Max: " + Number(d3.max(map_data, d => d.properties.doctors)).toFixed(1) + " per 1000 inhabitants")
                    d3.selectAll(".legend-min-text")
                        .text("Min: " + Number(d3.min(map_data, d => d.properties.doctors)).toFixed(1) + " per 1000 inhabitants")
                    break;
            }
        }
    }
}