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
        const path = d3.geoPath()
            .projection(projection);

        // Color Scale
        var lightGrey = "hsl(0, 0%, 90%)"
        var darkGrey = "hsl(0, 0%, 40%)"
        this.color_scale = d3.scaleLog()
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
            .style("fill", (d) => this.color_scale(d.properties.density));

        // Draw the canton labels
        this.label_container.selectAll(".label")
            .data(map_data)
            .enter()
            .append("text")
            .classed("label", true)
            .attr("transform", d => "translate(" + path.centroid(d) + ")")
            .text(d => d.id);

        // Change Cholorpleth
        d3.selectAll("#bedTab")
            .on("click", bedsCholorpleth)

        d3.selectAll("#densityTab")
            .on("click", densityCholorpleth)

        function bedsCholorpleth() {
            color_scale.domain([d3.min(map_data, d => d.properties.beds), d3.max(map_data, d => d.properties.beds)]);
            d3.selectAll(".canton")
                .style("fill", (d) => this.color_scale(d.properties.beds));
        }

        function densityCholorpleth() {
            color_scale.domain([d3.min(map_data, d => d.properties.density), d3.max(map_data, d => d.properties.density)]);
            d3.selectAll(".canton")
                .style("fill", (d) => this.color_scale(d.properties.density));
        }
    }
}