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

        // Cholorpleth
        var lightGrey = "hsl(0, 0%, 90%)"
        var darkGrey = "hsl(0, 0%, 20%)"
        this.color_scale = d3.scaleLog()
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
            .style("fill", (d) => this.color_scale(d.properties.density));

        // Draw the canton labels
        this.map_container.selectAll(".label-canton")
            .data(map_data)
            .enter()
            .append("text")
            .classed("label-canton", true)
            .attr("transform", d => "translate(" + this.path.centroid(d) + ")")
            .text(d => d.id);

        // Draw instruction
        const instruction_padding = 80;
        this.svg.append('g')
            .append("text")
            .text("Select a canton on the map")
            .attr("transform", d => "translate(" + ((this.svg_width / 2) - instruction_padding) + "," + (this.svg_height - instruction_padding / 2) + ")")
            .classed("label", true);

        // Draw legend
        const legend_max_w = this.svg_width * 4 / 5;
        const legend_max_h = 200;
        const legend_min_w = this.svg_width * 4 / 5;
        const legend_min_h = 230;
        const size_rect = 20;

        // - max rect
        this.svg.append('g')
            .append("rect")
            .attr("width", size_rect)
            .attr("height", size_rect)
            .attr("x", legend_max_w)
            .attr("y", legend_max_h)
            .attr("fill", darkGrey);

        // - min rect
        this.svg.append('g')
            .append("rect")
            .attr("width", size_rect)
            .attr("height", size_rect)
            .attr("x", legend_min_w)
            .attr("y", legend_min_h)
            .attr("fill", lightGrey);

        // - max text
        this.svg.append('g')
            .append("text")
            .text("Max: " + densityToString(d3.max(map_data, d => d.properties.density)))
            .classed("label", true)
            .attr("transform", "translate(" + (legend_max_w + 1.25 * size_rect) + "," + (legend_max_h + 0.75 * size_rect) + ")");

        // - min text
        this.svg.append('g')
            .append("text")
            .classed("label", true)
            .text("Min: " + densityToString(d3.min(map_data, d => d.properties.density)))
            .attr("transform", "translate(" + (legend_min_w + 1.25 * size_rect) + "," + (legend_min_h + 0.75 * size_rect) + ")");

        // - title
        this.svg.append('g')
            .append('text')
            .text("Population")
            .classed("label", true)
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
    }
}