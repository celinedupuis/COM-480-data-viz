class BubbleChart {
    constructor(svg_element_id) {
        this.svg = d3.select('#' + svg_element_id);

        // Data Swiss Indicators
        d3.csv("../data/swiss_indicators_2020.csv").then((data) => {
            data.forEach((row) => {
                row.population = parseFloat(row.population);
                row.gdp = ((parseFloat(row.gdp) / 1500) * (parseFloat(row.gdp) / 1500) / 150);
                row.beds = parseFloat(row.beds);
                row.doctors = parseFloat(row.doctors);
            });

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
            const x_range = [0, d3.max(data, d => d.population)];
            const y_range = [0, d3.max(data, d => d.beds)];
            const x_scale = d3.scaleLinear()
                .domain(x_range)
                .range([0, this.chart_width]);
            const y_scale = d3.scaleLinear()
                .domain(y_range)
                .range([this.chart_height, 0]);

            // Create Axis
            const x_axis = d3.axisBottom()
                .scale(x_scale);
            this.svg.append("g")
                .call(x_axis)
                .attr("transform", "translate(0," + this.chart_height * 1.5 + ")")

            const y_axis = d3.axisLeft()
                .scale(y_scale);
            this.svg.append("g")
                .call(y_axis)
                .attr("transform", "translate(0," + this.chart_height * 0.5 + ")")

            // Draw the bubbles
            this.chart_container.selectAll("circle")
                .data(data)
                .enter()
                .append("circle")
                .attr("r", d => d.gdp)
                .attr("cx", d => x_scale(d.population))
                .attr("cy", d => y_scale(d.beds))
                .classed('middle', d => d.gdp <= d3.mean(data, d => d.gdp))
                .classed('high', d => d.gdp >= d3.mean(data, d => d.gdp));

            // Draw the labels
            this.chart_container.append('g')
                .selectAll('text')
                .data(data)
                .enter()
                .append('text')
                .text(d => d.id)
                .attr('x', d => x_scale(d.population) + 15)
                .attr('y', d => y_scale(d.beds) - 15)
                .classed("label-bubble", true);

            // Interaction
            d3.selectAll("circle")
                .on("mouseover", mouseover)
                .on("mouseout", mouseout)

            let bubbleSelectedID = "";

            function mouseover(d) {
                bubbleSelectedID = d.id;
                d3.selectAll("circle")
                    .style("fill-opacity", d => d.id == bubbleSelectedID ? 1 : 0.5)
                    .style("stroke-width", d => d.id == bubbleSelectedID ? 1 : 0)
                d3.selectAll(".label-bubble")
                    .text(d => d.id == bubbleSelectedID ? d.id : "")
                    .style("font-size", d => d.id == bubbleSelectedID ? 40 : 14)
            }

            function mouseout(d) {
                d3.selectAll("circle")
                    .style("fill-opacity", 1)
                    .style("stroke-width", 1)
                d3.selectAll(".label-bubble")
                    .text(d => d.id)
                    .style("font-size", 14)
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
    plot_object = new BubbleChart('bubbleChart');
});