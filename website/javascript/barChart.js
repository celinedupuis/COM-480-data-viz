class BarChart {
    constructor(data, svg_element_id) {
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

        const width_bar = 15;
        const x_domain = [0, d3.max(data, (d, i) => i)];
        const x_scale = d3.scaleLinear()
            .domain(x_domain)
            .range([0, this.chart_width]);


        let y_domain = [0, d3.max(data, d => d.properties.ICUafter)];
        let y_scale = d3.scaleLinear()
            .domain(y_domain)
            .range([this.chart_height * 3 / 4, 0]);

        // axis
        const x_axis = d3.axisBottom()
            .scale(x_scale)
            .tickFormat("");
        this.svg.append("g")
            .call(x_axis)
            .attr("transform", "translate(" + offset / 2 + "," + this.chart_height + ")");

        let y_axis = d3.axisLeft()
            .scale(y_scale);
        this.svg.append("g")
            .call(y_axis)
            .attr("transform", "translate(" + offset / 2 + "," + this.chart_height * 1 / 4 + ")");

        // during covid
        this.chart_container.selectAll("bar")
            .data(data.sort(function(a, b) { return b.properties.ICUafter - a.properties.ICUafter }))
            .enter().append("rect")
            .attr("x", (d, i) => x_scale(i) + width_bar)
            .attr("y", d => y_scale(d.properties.ICUafter))
            .attr("fill", red)
            .attr("opacity", 1)
            .attr("width", width_bar)
            .attr("height", d => (this.chart_height * 3 / 4) - y_scale(d.properties.ICUafter));

        // before covid
        this.chart_container.selectAll("bar")
            .data(data.sort(function(a, b) { return b.properties.ICUafter - a.properties.ICUafter }))
            .enter().append("rect")
            .attr("x", (d, i) => x_scale(i))
            .attr("y", d => y_scale(d.properties.ICUbefore))
            .attr("fill", blue)
            .attr("opacity", 1)
            .attr("width", width_bar)
            .attr("height", d => (this.chart_height * 3 / 4) - y_scale(d.properties.ICUbefore));

        // canton label
        this.chart_container.append('g')
            .selectAll('text')
            .data(data.sort(function(a, b) { return b.properties.ICUafter - a.properties.ICUafter }))
            .enter()
            .append("text")
            .classed("label-chart", true)
            .text(d => d.id)
            .attr("x", (d, i) => x_scale(i) + width_bar / 2)
            .attr("y", (this.chart_height * 3 / 4) + 30)


        // Interaction Bubble Chart Radius
        d3.selectAll("#test")
            .on("click", function() {
                normalizedChart();
            })

        function normalizedChart(d) {
            console.log("hello")
                /*y_domain = [0, 0.5];
                y_scale = d3.scaleLinear()
                    .domain(y_domain)
                    .range([barChart.chart_height * 3 / 4, 0]);

                d3.selectAll("bar")
                    .data(data.sort(function(a, b) { return (b.properties.ICUafter / b.properties.density) - (a.properties.ICUafter / a.properties.density) }))
                    .attr("x", (d, i) => x_scale(i) + width_bar)
                    .attr("y", d => y_scale(d.properties.ICUafter / d.properties.density))
                    .attr("fill", red)
                    .attr("opacity", 1)
                    .attr("width", width_bar)
                    .attr("height", d => (barChart.chart_height * 3 / 4) - y_scale(d.properties.ICUafter / d.properties.density));

                //before
                d3.selectAll("bar")
                    .data(data.sort(function(a, b) { return (b.properties.ICUafter / b.properties.density) - (a.properties.ICUafter / a.properties.density) }))
                    .enter().append("rect")
                    .attr("x", (d, i) => x_scale(i))
                    .attr("y", d => y_scale(d.properties.ICUbefore / d.properties.density))
                    .attr("fill", blue)
                    .attr("opacity", 1)
                    .attr("width", width_bar)
                    .attr("height", d => (this.chart_height * 3 / 4) - y_scale(d.properties.ICUbefore / d.properties.density));

                d3.selectAll("label-chart")
                    .data(data.sort(function(a, b) { return (b.properties.ICUafter / b.properties.density) - (a.properties.ICUafter / a.properties.density) }))
                    .enter()
                    .append("text")
                    .classed("label", true)
                    .text(d => d.id)
                    .attr("x", (d, i) => x_scale(i) + width_bar / 2)
                    .attr("y", (this.chart_height * 3 / 4) + 30)*/
        }
    }
};