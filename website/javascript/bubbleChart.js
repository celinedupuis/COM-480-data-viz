class BubbleChart {
    constructor(map_data, svg_element_id) {
        this.svg = d3.select('#' + svg_element_id);

        // Scale to svg coordinate
        const offset = 100;
        const svg_viewbox = this.svg.node().viewBox.animVal;
        this.svg_width = svg_viewbox.width;
        this.svg_height = svg_viewbox.height;
        this.chart_width = this.svg_width - offset;
        this.chart_height = this.svg_height * 1 / 2;

        // Create container
        this.chart_container = this.svg.append('g')
            .attr("transform", "translate(" + offset / 2 + "," + this.chart_height * 0.5 + ")")

        // Scale to svg coordinate
        // x-axis
        const x_range = [0, d3.max(map_data, d => d.properties.density)];
        const x_scale = d3.scaleLinear()
            .domain(x_range)
            .range([0, this.chart_width]);
        const x_axis = d3.axisBottom()
            .scale(x_scale);
        this.svg.append("g")
            .call(x_axis)
            .attr("transform", "translate(0," + this.chart_height * 1.5 + ")")
        this.svg.append('g')
            .append('text')
            .text("Population")
            .classed("label", true)
            .attr("transform", "translate(" + this.chart_width / 2 + "," + (this.chart_height * 1.5 + 50) + ")");

        // y-axis
        this.y_range = [0, d3.max(map_data, d => d.properties.beds)];
        this.y_scale = d3.scaleLinear()
            .domain(this.y_range)
            .range([this.chart_height, 0]);
        this.y_axis = d3.axisLeft()
            .scale(this.y_scale);
        this.svg.append("g")
            .call(this.y_axis)
            .classed("yaxis", true)
            .attr("transform", "translate(0," + this.chart_height * 0.5 + ")");
        this.svg.append('g')
            .append('text')
            .text("Beds / 1000 inhabitants")
            .classed("label", true)
            .classed("yaxis-label", true)
            .attr("transform", "translate(" + -50 + "," + this.chart_height * 1.3 + ")rotate(-90)");

        // Draw the bubbles
        this.chart_container.selectAll("circle")
            .data(map_data)
            .enter()
            .append("circle")
            .attr("r", d => d.properties.gdpPerCapita)
            .attr("cx", d => x_scale(d.properties.density))
            .attr("cy", d => this.y_scale(d.properties.beds))
            .classed('middle', d => d.properties.gdpPerCapita <= d3.mean(map_data, d => d.properties.gdpPerCapita))
            .classed('high', d => d.properties.gdpPerCapita >= d3.mean(map_data, d => d.properties.gdpPerCapita));

        // Draw the labels
        this.chart_container.append('g')
            .selectAll('text')
            .data(map_data)
            .enter()
            .append('text')
            .text(d => d.id)
            .attr('x', d => x_scale(d.properties.density) + 22)
            .attr('y', d => this.y_scale(d.properties.beds) - 22)
            .classed("label-bubble", true);
    }
}