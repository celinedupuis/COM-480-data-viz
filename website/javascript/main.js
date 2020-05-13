function whenDocumentLoaded(action) {
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", action);
    } else {
        action();
    }
}

whenDocumentLoaded(() => {
    // Data CSV
    const indicators_promise = d3.csv("../data/swiss_indicators_2020.csv").then((data) => {
        let population = {};
        let gdpPerCapita = {};
        let beds = {};
        let doctors = {};

        data.forEach((row) => {
            population[row.id] = parseFloat(row.population);
            gdpPerCapita[row.id] = ((parseFloat(row.gdp) / 1500) * parseFloat(row.gdp) / 1500) / 150;
            beds[row.id] = parseFloat(row.beds);
            doctors[row.id] = parseFloat(row.doctors) / 100;
        });
        return { population, gdpPerCapita, beds, doctors };
    });

    // Data TopoJSON
    const map_promise = d3.json("../data/ch-cantons.json").then((topojson_raw) => {
        const canton_paths = topojson.feature(topojson_raw, topojson_raw.objects.cantons);
        return canton_paths.features;
    });

    // Load Data in Promise
    Promise.all([indicators_promise, map_promise]).then((results) => {
        let map_data = results[1];
        map_data.map(x => {
            x.properties.density = results[0].population[x.id];
            x.properties.gdpPerCapita = results[0].gdpPerCapita[x.id];
            x.properties.beds = results[0].beds[x.id];
            x.properties.doctors = results[0].doctors[x.id];
        });

        // Create Data Viz
        cholorpleth = new SwissMap(map_data, 'cholorpleth');
        bubble_chart = new BubbleChart(map_data, 'bubbleChart');
        bipartite = new Bipartite('bipartite');

        // Main variables
        let isCantonSelected = false;
        let cantonSelectedID = "";
        let isResourceBed = true;
        let isUniformRadius = false;
        let bubbleLegendSelected = false;

        const duration_transition = 500;
        const font_size_default = 14;
        const font_size_selected = 20;
        const stroke_width_selected = 5;
        const stroke_width_unselected = 0.2;
        const opacity_unselected = 0.3;
        const bubble_radius = 15;

        // Colors
        const lightGrey = "hsl(0, 0%, 90%)"
        const darkGrey = "hsl(0, 0%, 20%)"
        const red = "#F95151"
        const white = "#ffffff"
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
            .domain([d3.min(map_data, d => d.properties.population), d3.max(map_data, d => d.properties.population)]);

        // Interaction Overlay
        d3.selectAll(".canton")
            .on("mouseover", mouseover)
            .on("mouseout", mouseout)
            .on("click", click)

        d3.selectAll(".bubble")
            .on("mouseover", mouseover)
            .on("mouseout", mouseout)
            .on("click", click)

        d3.selectAll(".label-bubble")
            .on("mouseover", mouseover)
            .on("mouseout", mouseout)
            .on("click", click)

        d3.selectAll(".label-canton")
            .on("mouseover", mouseover)
            .on("mouseout", mouseout)
            .on("click", click)

        d3.selectAll("#legend-red")
            .on("mouseover", function() {
                overlaySubsetBubble(true, true);
            })
            .on("mouseout", function() {
                overlaySubsetBubble(false, true);
            })
            .on("click", function() {
                //TODO
            })
        d3.selectAll("#legend-blue")
            .on("mouseover", function() {
                overlaySubsetBubble(true, false);
            })
            .on("mouseout", function() {
                overlaySubsetBubble(false, true);
            })
            .on("click", function() {
                //TODO
            })


        // Interaction Buttons
        d3.selectAll("#btn-beds")
            .on("click", function() {
                changeMode(true);
            });

        d3.selectAll("#btn-doctors")
            .on("click", function() {
                changeMode(false);
            })

        d3.selectAll("#btn-radius")
            .on("click", function() {
                setUniformRadius(true);
            })

        d3.selectAll("#btn-radius-w")
            .on("click", function() {
                setUniformRadius(false);
            })

        // Functions
        function setUniformRadius(uniformRadius) {
            isUniformRadius = uniformRadius;
            d3.selectAll(".bubble")
                .transition()
                .duration(duration_transition)
                .attr("r", isUniformRadius ? bubble_radius : d => d.properties.gdpPerCapita);
        }

        function changeMode(physicalResourceMode) {
            isResourceBed = physicalResourceMode;
            bubble_chart.y_range = [0, d3.max(map_data, d => isResourceBed ? d.properties.beds : d.properties.doctors)];
            bubble_chart.y_scale = d3.scaleLinear()
                .domain(bubble_chart.y_range)
                .range([bubble_chart.chart_height, 0]);
            d3.selectAll(".bubble")
                .transition()
                .duration(duration_transition)
                .attr("cy", d => isResourceBed ? bubble_chart.y_scale(d.properties.beds) : bubble_chart.y_scale(d.properties.doctors));
            d3.selectAll('.yaxis-label')
                .text(isResourceBed ? "# Beds" : "# Doctors")
            bubble_chart.y_axis = d3.axisLeft()
                .scale(bubble_chart.y_scale);
            d3.selectAll(".yaxis")
                .transition()
                .duration(duration_transition)
                .call(bubble_chart.y_axis)
            d3.selectAll(".label-bubble")
                .transition()
                .duration(duration_transition)
                .attr('y', d => isResourceBed ? bubble_chart.y_scale(d.properties.beds) - bubble_chart.bubble_label_shift : bubble_chart.y_scale(d.properties.doctors) - bubble_chart.bubble_label_shift)
        }

        function overlaySubsetBubble(showSubset, onlyRed) {
            if (showSubset) {
                d3.selectAll(".bubble")
                    .transition()
                    .duration(duration_transition / 2)
                    .style('opacity', onlyRed ? (d => d.properties.gdpPerCapita > bubble_chart.threshold ? 1 : 0) : (d => d.properties.gdpPerCapita <= bubble_chart.threshold ? 1 : 0));
                d3.selectAll(".label-bubble")
                    .transition()
                    .duration(duration_transition / 2)
                    .style('opacity', onlyRed ? (d => d.properties.gdpPerCapita > bubble_chart.threshold ? 1 : 0) : (d => d.properties.gdpPerCapita <= bubble_chart.threshold ? 1 : 0));
            } else {
                d3.selectAll(".bubble")
                    .transition()
                    .duration(duration_transition / 2)
                    .style('opacity', 1);
                d3.selectAll(".label-bubble")
                    .transition()
                    .duration(duration_transition / 2)
                    .style('opacity', 1);
            }
        }

        function mouseout(d) {
            if (!isCantonSelected) {
                // cholorpleth
                d3.selectAll(".canton")
                    .style("fill-opacity", 1)
                    .style("stroke-width", 0.5)
                    .style("stroke", white);
                // icons
                defaultIndicators();
                // bubble chart
                d3.selectAll(".bubble")
                    .style("fill-opacity", 1)
                    .style("stroke-width", 1);
                // label
                d3.selectAll(".label-canton")
                    .text(d => d.id)
                    .style("font-size", font_size_default)
                d3.selectAll(".label-bubble")
                    .text(d => d.id)
                    .style("font-size", font_size_default);
            }
        }

        function mouseover(d) {
            if (!isCantonSelected) {
                overlayCanton(d);
            }
        }

        function overlayCanton(d) {
            let overID = d.id;
            // cholorpleth
            d3.selectAll(".canton")
                .style("fill-opacity", d => d.id == overID ? 1 : opacity_unselected)
                .style("stroke-width", d => d.id == overID ? 1 : stroke_width_unselected)
                .style("stroke", d => d.id == overID ? red : white);
            // icons
            updateIndicators(overID);
            // bubble chart
            d3.selectAll(".bubble")
                .style("fill-opacity", d => d.id == overID ? 1 : opacity_unselected)
                .style("stroke-width", d => d.id == overID ? 1 : stroke_width_unselected);
            // label
            d3.selectAll(".label-canton")
                .text(d => d.id == overID ? d.properties.name : "")
                .style("font-size", d => d.id == overID ? font_size_selected : font_size_default);
            d3.selectAll(".label-bubble")
                .text(d => d.id == overID ? d.properties.name : "")
                .style("font-size", d => d.id == overID ? font_size_selected : font_size_default);
        }

        function click(d) {
            isCantonSelected = cantonSelectedID == d.id ? !isCantonSelected : true;
            cantonSelectedID = d.id;
            if (isCantonSelected) {
                overlayCanton(d);
                // cholorpleth
                d3.selectAll(".canton")
                    .style("fill-opacity", 1)
                    .style("stroke-width", d => d.id == cantonSelectedID ? stroke_width_selected : stroke_width_unselected);
                // bubble chart
                d3.selectAll(".bubble")
                    .style("stroke-width", d => d.id == cantonSelectedID ? stroke_width_selected : stroke_width_unselected)
                    .style("fill-opacity", d => d.id == cantonSelectedID ? 1 : 2 * opacity_unselected);
            } else {
                mouseout(d);
            }
        }

        function updateIndicators(currentCanton) {
            let name = map_data.filter(canton => canton.id == currentCanton)[0].properties.name;
            let demographic = map_data.filter(canton => canton.id == currentCanton)[0].properties.density;
            let beds = map_data.filter(canton => canton.id == currentCanton)[0].properties.beds;
            let doctors = map_data.filter(canton => canton.id == currentCanton)[0].properties.doctors;

            if (demographic > 1000) {
                demographic = Number(demographic).toFixed(0).toString()[0] + "'" + Number(demographic).toFixed(0).toString().substr(1, 3) + "'000 <br>inhabitants";
            } else {
                demographic = Number(demographic).toFixed(0).toString() + "'000 <br> inhabitants";
            }

            beds = Number(beds).toFixed(1).toString() + " hospital beds <br> for 1000 inhabitants";
            doctors = Number(doctors).toFixed(1).toString() + " doctors <br> for 1000 inhabitants";

            document.getElementById("indicator-name").innerHTML = name;
            document.getElementById("indicator-demographic").innerHTML = demographic;
            document.getElementById("indicator-beds").innerHTML = beds;
            document.getElementById("indicator-doctors").innerHTML = doctors;
        }

        function defaultIndicators() {
            document.getElementById("indicator-name").innerHTML = "Switzerland";
            document.getElementById("indicator-demographic").innerHTML = "8’544’527 <br> inhabitants";
            document.getElementById("indicator-beds").innerHTML = "4.4 hospital beds <br> for 1000 inhabitants";
            document.getElementById("indicator-doctors").innerHTML = "2.26 doctors <br> for 1000 inhabitants";
        }
    });
});