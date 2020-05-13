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
        const label_padding = 40;
        const x_range = [0, d3.max(map_data, d => d.properties.density)];
        const x_scale = d3.scaleLinear()
            .domain(x_range)
            .range([0, this.chart_width]);
        const x_axis = d3.axisBottom()
            .scale(x_scale);
        this.svg.append("g")
            .call(x_axis)
            .attr("transform", "translate(" + offset / 2 + "," + this.chart_height * 1.5 + ")")
        this.svg.append('g')
            .append('text')
            .text("Population")
            .classed("label", true)
            .attr("transform", "translate(" + (this.chart_width / 2) + "," + (this.chart_height * 1.5 + label_padding) + ")");

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
            .attr("transform", "translate(" + offset / 2 + "," + this.chart_height * 0.5 + ")");

        this.threshold = d3.mean(map_data, d => d.properties.gdpPerCapita);

        // Draw the bubbles
        this.chart_container.selectAll("circle")
            .data(map_data)
            .enter()
            .append("circle")
            .attr("r", d => d.properties.gdpPerCapita)
            .attr("cx", d => x_scale(d.properties.density))
            .attr("cy", d => this.y_scale(d.properties.beds))
            .classed("bubble", true)
            .classed('bubble-blue', d => d.properties.gdpPerCapita <= this.threshold)
            .classed('bubble-red', d => d.properties.gdpPerCapita >= this.threshold);

        // Draw the labels
        this.bubble_label_shift = 10;
        this.chart_container.append('g')
            .selectAll('text')
            .data(map_data)
            .enter()
            .append('text')
            .text(d => d.id)
            .attr('x', d => x_scale(d.properties.density) - this.bubble_label_shift)
            .attr('y', d => this.y_scale(d.properties.beds) - this.bubble_label_shift)
            .classed("label-bubble", true)

        // Draw legend
        const legend_blue_w = this.chart_width * 3 / 4;
        const legend_blue_h = 200;
        const legend_red_w = this.chart_width * 3 / 4;
        const legend_red_h = 230;
        const size_rect = 20;

        this.svg.append('g')
            .append("rect")
            .attr("id", "legend-blue")
            .classed('bubble-blue', true)
            .attr("width", size_rect)
            .attr("height", size_rect)
            .attr("x", legend_blue_w)
            .attr("y", legend_blue_h)

        this.svg.append('g')
            .append("text")
            .attr("id", "legend-blue")
            .classed("label", true)
            .text("GDP below or equal to average (click)")
            .attr("transform", "translate(" + (legend_blue_w + 1.25 * size_rect) + "," + (legend_blue_h + 0.75 * size_rect) + ")")

        this.svg.append('g')
            .append("rect")
            .attr("id", "legend-red")
            .classed('bubble-red', true)
            .attr("width", size_rect)
            .attr("height", size_rect)
            .attr("x", legend_red_w)
            .attr("y", legend_red_h)

        this.svg.append('g')
            .append("text")
            .attr("id", "legend-red")
            .classed("label", true)
            .text("GDP above average (click)")
            .attr("transform", "translate(" + (legend_red_w + 1.25 * size_rect) + "," + (legend_red_h + 0.75 * size_rect) + ")")

        this.svg.append('g')
            .append('text')
            .text("# Beds")
            .classed("label", true)
            .classed("yaxis-label", true)
            .style("font-size", 20)
            .attr("transform", "translate(" + (legend_blue_w) + "," + (legend_blue_h - 1.5 * label_padding) + ")");
        this.svg.append('g')
            .append('text')
            .text("per 1000 inhabitants")
            .classed("label", true)
            .attr("transform", "translate(" + (legend_blue_w) + "," + (legend_blue_h - label_padding) + ")");
    }
}