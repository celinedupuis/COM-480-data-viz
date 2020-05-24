class BarChart {
    constructor(data, svg_element_id) {
        this.data = data;
        this.svg = d3.select('#' + svg_element_id);
        const offset = 200;
        const svg_viewbox = this.svg.node().viewBox.animVal;
        this.svg_width = svg_viewbox.width;
        this.svg_height = svg_viewbox.height;
        this.chart_width = this.svg_width - offset;
        this.chart_height = this.svg_height * 3 / 4;

        // Create container
        this.chart_container = this.svg.append('g')
            .attr("transform", "translate(" + offset * 0.6 + "," + this.chart_height * 1 / 4 + ")")

        // Draw scale and axis
        const x_domain = [0, d3.max(data, (d, i) => i) + 1];
        this.x_scale = d3.scaleLinear()
            .domain(x_domain)
            .range([0, this.chart_width]);
        const x_axis = d3.axisBottom()
            .scale(this.x_scale)
            .tickFormat("");
        this.svg.append("g")
            .call(x_axis)
            .attr("transform", "translate(" + offset / 2 + "," + this.chart_height + ")");

        this.y_domain = [0, d3.max(data, d => d.properties.ICUafter)];
        this.y_scale = d3.scaleLinear()
            .domain(this.y_domain)
            .range([this.chart_height * 3 / 4, 0]);
        this.y_axis = d3.axisLeft()
            .scale(this.y_scale);
        this.svg.append("g")
            .call(this.y_axis)
            .classed("y-axis-bar", true)
            .attr("transform", "translate(" + offset / 2 + "," + this.chart_height * 1 / 4 + ")");

        // Draw red bar
        this.width_bar = 15;
        this.chart_container.selectAll("bar")
            .data(data.sort(function(a, b) { return b.properties.ICUafter - a.properties.ICUafter }))
            .enter()
            .append("rect")
            .classed("red-bar", true)
            .attr("x", (d, i) => this.x_scale(i) + this.width_bar)
            .attr("y", d => this.y_scale(d.properties.ICUafter))
            .attr("fill", red)
            .attr("opacity", 1)
            .attr("width", this.width_bar)
            .attr("height", d => (this.chart_height * 3 / 4) - this.y_scale(d.properties.ICUafter));

        // Draw blue bar
        this.chart_container.selectAll("bar")
            .data(data.sort(function(a, b) { return b.properties.ICUafter - a.properties.ICUafter }))
            .enter()
            .append("rect")
            .classed("blue-bar", true)
            .attr("x", (d, i) => this.x_scale(i))
            .attr("y", d => this.y_scale(d.properties.ICUbefore))
            .attr("fill", blue)
            .attr("opacity", 1)
            .attr("width", this.width_bar)
            .attr("height", d => (this.chart_height * 3 / 4) - this.y_scale(d.properties.ICUbefore));

        // Draw labels
        this.chart_container.append('g')
            .selectAll('text')
            .data(data.sort(function(a, b) { return b.properties.ICUafter - a.properties.ICUafter }))
            .enter()
            .append("text")
            .classed("label-bar", true)
            .text(d => d.id)
            .attr("x", (d, i) => this.x_scale(i) + this.width_bar / 2)
            .attr("y", (this.chart_height * 3 / 4) + 30)

        // Draw legend
        const label_padding = 40;
        const legend_blue_w = this.chart_width * 4 / 5;
        const legend_blue_h = 180;
        const legend_red_w = this.chart_width * 4 / 5;
        const legend_red_h = legend_blue_h + 30;
        const size_rect = 20;

        // - title
        this.svg.append('g')
            .append('text')
            .text("# ICU Beds")
            .classed("yaxis-label-bar", true)
            .classed("label", true)
            .style("font-size", 20)
            .attr("transform", "translate(" + (legend_blue_w) + "," + (legend_blue_h - 0.5 * label_padding) + ")");

        // - rect blue
        this.svg.append('g')
            .append("rect")
            .attr("fill", blue)
            .attr("id", "legend-bar-blue")
            .attr("width", size_rect)
            .attr("height", size_rect)
            .attr("x", legend_blue_w)
            .attr("y", legend_blue_h);

        // - rect red
        this.svg.append('g')
            .append("rect")
            .attr('fill', red)
            .attr("id", "legend-bar-red")
            .attr("width", size_rect)
            .attr("height", size_rect)
            .attr("x", legend_red_w)
            .attr("y", legend_red_h);

        // - legend blue
        this.svg.append('g')
            .append("text")
            .attr("id", "legend-bar-blue")
            .classed("legend-bar", true)
            .text("Certified by SSMI (24 March)")
            .attr("transform", "translate(" + (legend_blue_w + 1.25 * size_rect) + "," + (legend_blue_h + 0.75 * size_rect) + ")")

        // - legend red
        this.svg.append('g')
            .append("text")
            .attr("id", "legend-bar-red")
            .classed("legend-bar", true)
            .text("Listed by Swiss Armed Force (13 May)")
            .attr("transform", "translate(" + (legend_red_w + 1.25 * size_rect) + "," + (legend_red_h + 0.75 * size_rect) + ")")

        // - instruction
        this.svg.append('g')
            .append("text")
            .classed("instruction", true)
            .text("Click on the legend to select")
            .attr("transform", "translate(" + (legend_red_w + 1.25 * size_rect) + "," + (legend_red_h + 2 * size_rect) + ")")

        // - instruction
        this.svg.append('g')
            .append("text")
            .classed("instruction", true)
            .text("only the red or the blue bars")
            .attr("transform", "translate(" + (legend_red_w + 1.25 * size_rect) + "," + (legend_red_h + 2.75 * size_rect) + ")")


        // Interaction
        let isSubsetSelected = false;
        let clickOnRed = false;

        // - with legend
        d3.selectAll("#legend-bar-red")
            .on("click", function() {
                if (isSubsetSelected && !clickOnRed) {
                    clickOnRed = true;
                    isSubsetSelected = true;
                    selectSubsetBar();
                } else if (!isSubsetSelected) {
                    clickOnRed = true;
                    isSubsetSelected = true;
                    selectSubsetBar();
                } else if (isSubsetSelected && clickOnRed) {
                    clickOnRed = false;
                    isSubsetSelected = false;
                    unselectSubsetBar();
                }
            })

        d3.selectAll("#legend-bar-blue")
            .on("click", function() {
                if (isSubsetSelected && !clickOnRed) {
                    clickOnRed = false;
                    isSubsetSelected = false;
                    unselectSubsetBar();
                } else if (!isSubsetSelected) {
                    clickOnRed = false;
                    isSubsetSelected = true;
                    selectSubsetBar();
                } else if (isSubsetSelected && clickOnRed) {
                    clickOnRed = false;
                    isSubsetSelected = true;
                    selectSubsetBar();
                }
            })

        function selectSubsetBar() {
            d3.selectAll("#legend-bar-red")
                .style("font-size", clickOnRed ? font_size_default * 1.25 : font_size_default * 0.5)
            d3.selectAll("#legend-bar-blue")
                .style("font-size", clickOnRed ? font_size_default * 0.5 : font_size_default * 1.25)
            d3.selectAll(".blue-bar")
                .style('opacity', clickOnRed ? 0 : opacity_default);
            d3.selectAll(".red-bar")
                .style('opacity', clickOnRed ? opacity_default : 0)
        }

        function unselectSubsetBar() {
            d3.selectAll(".blue-bar")
                .style('opacity', 1);
            d3.selectAll(".red-bar")
                .style('opacity', 1);
            d3.selectAll("#legend-bar-red")
                .style("font-size", font_size_default)
            d3.selectAll("#legend-bar-blue")
                .style("font-size", font_size_default)
        }
    }
};