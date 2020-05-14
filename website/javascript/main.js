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
        let gdpPerCapitaRow = {};
        let beds = {};
        let doctors = {};

        data.forEach((row) => {
            population[row.id] = parseFloat(row.population);
            gdpPerCapita[row.id] = ((parseFloat(row.gdp) / 1500) * parseFloat(row.gdp) / 1500) / 150;
            gdpPerCapitaRow[row.id] = parseFloat(row.gdp);
            beds[row.id] = parseFloat(row.beds);
            doctors[row.id] = parseFloat(row.doctors) / 100;
        });
        return { population, gdpPerCapita, gdpPerCapitaRow, beds, doctors };
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
            x.properties.gdpPerCapitaRow = results[0].gdpPerCapitaRow[x.id];
            x.properties.beds = results[0].beds[x.id];
            x.properties.doctors = results[0].doctors[x.id];
        });

        // Create Data Viz
        cholorpleth = new SwissMap(map_data, 'cholorpleth');
        bubble_chart = new BubbleChart(map_data, 'bubbleChart');
        bipartite = new Bipartite('bipartite');

        // Style variables
        const duration_transition = 500;
        const font_size_default = 14;
        const font_size_selected = 20;
        const stroke_width_unselected = 0.2;
        const stroke_width_default = 1;
        const stroke_width_selected = 5;
        const opacity_unselected = 0.3;
        const opacity_default = 1;
        const bubble_radius = 15;

        // Main variables
        let isCantonSelected = false;
        let cantonSelectedID = "";
        let isPhysicalResourceMode = true;
        let isBubbleRadiusUniform = false;
        let isSubsetSelected = false;
        let isRedSubsetSelected = false;
        let isBlueSubsetSelected = false;

        // Colors
        const lightGrey = "hsl(0, 0%, 90%)"
        const darkGrey = "hsl(0, 0%, 20%)"
        const red = "#F95151"
        const white = "#FFFFFF"
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


        // Interaction Overlay/Click
        d3.selectAll(".canton")
            .on("mouseover", overlayCanton)
            .on("mouseout", unselectCanton)
            .on("click", selectCanton)

        d3.selectAll(".bubble")
            .on("mouseover", overlayCanton)
            .on("mouseout", unselectCanton)
            .on("click", selectCanton)

        d3.selectAll(".label-bubble")
            .on("mouseover", overlayCanton)
            .on("mouseout", unselectCanton)
            .on("click", selectCanton)

        d3.selectAll(".label-canton")
            .on("mouseover", overlayCanton)
            .on("mouseout", unselectCanton)
            .on("click", selectCanton)

        function overlayCanton(d) {
            if (!isCantonSelected) {
                let overID = d.id;
                // cholorpleth
                d3.selectAll(".canton")
                    .style("fill-opacity", d => d.id == overID ? opacity_default : opacity_unselected)
                    .style("stroke-width", d => d.id == overID ? stroke_width_default : stroke_width_unselected)
                    .style("stroke", d => d.id == overID ? red : white);
                d3.selectAll(".label-canton")
                    .text(d => d.id == overID ? d.properties.name : "")
                    .style("font-size", d => d.id == overID ? font_size_selected : font_size_default);
                updateIndicators(overID);
                // bubble chart
                d3.selectAll(".bubble")
                    .style("fill-opacity", d => d.id == overID ? opacity_default : opacity_unselected)
                    .style("stroke-width", d => d.id == overID ? stroke_width_default : stroke_width_unselected);
                d3.selectAll(".label-bubble")
                    .text(d => d.id == overID ? d.properties.name : "")
                    .style("font-size", d => d.id == overID ? font_size_selected : font_size_default);
            }
        }

        function selectCanton(d) {
            isCantonSelected = cantonSelectedID == d.id ? !isCantonSelected : true;
            if (isCantonSelected) {
                cantonSelectedID = d.id;
                // cholorpleth
                d3.selectAll(".canton")
                    .style("fill-opacity", 1)
                    .style("stroke-width", d => d.id == cantonSelectedID ? stroke_width_selected : stroke_width_unselected)
                    .style("stroke", d => d.id == cantonSelectedID ? red : white);
                d3.selectAll(".label-canton")
                    .text(d => d.id == cantonSelectedID ? d.properties.name : "")
                    .style("font-size", d => d.id == cantonSelectedID ? font_size_selected : font_size_default);
                updateIndicators(cantonSelectedID);
                // bubble chart
                d3.selectAll(".bubble")
                    .style("fill-opacity", d => d.id == cantonSelectedID ? opacity_default : 2 * opacity_unselected)
                    .style("stroke-width", d => d.id == cantonSelectedID ? stroke_width_selected : stroke_width_unselected);
                d3.selectAll(".label-bubble")
                    .text(d => d.id == cantonSelectedID ? d.properties.name : "")
                    .style("font-size", d => d.id == cantonSelectedID ? font_size_selected : font_size_default);
            } else {
                unselectCanton(d);
            }
        }

        function unselectCanton(d) {
            if (!isCantonSelected) {
                // cholorpleth
                d3.selectAll(".canton")
                    .style("fill-opacity", opacity_default)
                    .style("stroke-width", stroke_width_default / 2)
                    .style("stroke", white);
                d3.selectAll(".label-canton")
                    .text(d => d.id)
                    .style("font-size", font_size_default)
                defaultIndicators();
                // bubble chart
                d3.selectAll(".bubble")
                    .style("fill-opacity", opacity_default)
                    .style("stroke-width", stroke_width_default);
                d3.selectAll(".label-bubble")
                    .text(d => d.id)
                    .style("font-size", font_size_default);
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

        // Interaction Bubble Chart Radius
        d3.selectAll("#btn-radius-w")
            .on("click", function() {
                setUniformRadius();
            })

        function setUniformRadius() {
            isBubbleRadiusUniform = !isBubbleRadiusUniform;
            d3.selectAll(".bubble")
                .transition()
                .duration(duration_transition)
                .attr("r", isBubbleRadiusUniform ? bubble_radius : d => d.properties.gdpPerCapita);
        }

        // Interaction Bubble Chart Legend
        d3.selectAll("#legend-red")
            .on("click", function() {
                isRedSubsetSelected = !isRedSubsetSelected;
                isSubsetSelected = isRedSubsetSelected || isBlueSubsetSelected;
                selectSubsetBubble(true);
            })
        d3.selectAll("#legend-blue")
            .on("click", function() {
                isBlueSubsetSelected = !isBlueSubsetSelected;
                isSubsetSelected = isRedSubsetSelected || isBlueSubsetSelected;
                selectSubsetBubble(false);
            })

        function selectSubsetBubble(clickOnRed) {
            if (isSubsetSelected) {
                d3.selectAll("#legend-red")
                    .style("font-size", clickOnRed ? font_size_default * 1.25 : font_size_default * 0.5)
                d3.selectAll("#legend-blue")
                    .style("font-size", clickOnRed ? font_size_default * 0.5 : font_size_default * 1.25)
                d3.selectAll(".bubble")
                    .transition()
                    .duration(duration_transition / 2)
                    .style('opacity', clickOnRed ? (d => d.properties.gdpPerCapita > bubble_chart.threshold ? opacity_default : 0) : (d => d.properties.gdpPerCapita <= bubble_chart.threshold ? opacity_default : 0));
                d3.selectAll(".label-bubble")
                    .transition()
                    .duration(duration_transition / 2)
                    .style('opacity', clickOnRed ? (d => d.properties.gdpPerCapita > bubble_chart.threshold ? opacity_default : 0) : (d => d.properties.gdpPerCapita <= bubble_chart.threshold ? opacity_default : 0));
            } else {
                d3.selectAll(".bubble")
                    .transition()
                    .duration(duration_transition / 2)
                    .style('opacity', 1);
                d3.selectAll(".label-bubble")
                    .transition()
                    .duration(duration_transition / 2)
                    .style('opacity', 1);
                d3.selectAll("#legend-red")
                    .style("font-size", font_size_default)
                d3.selectAll("#legend-blue")
                    .style("font-size", font_size_default)
            }
        }

        // Interaction Bubble Resource Mode
        d3.selectAll("#btn-beds")
            .on("click", function() {
                changeMode(true);
            });

        d3.selectAll("#btn-doctors")
            .on("click", function() {
                changeMode(false);
            })

        d3.selectAll(".yaxis-label")
            .on("click", function() {
                changeMode(!isPhysicalResourceMode);
            })

        function changeMode(physicalResourceMode) {
            isPhysicalResourceMode = physicalResourceMode;
            bubble_chart.y_range = [0, d3.max(map_data, d => isPhysicalResourceMode ? d.properties.beds : d.properties.doctors)];
            bubble_chart.y_scale = d3.scaleLinear()
                .domain(bubble_chart.y_range)
                .range([bubble_chart.chart_height, 0]);
            d3.selectAll(".bubble")
                .transition()
                .duration(duration_transition)
                .attr("cy", d => isPhysicalResourceMode ? bubble_chart.y_scale(d.properties.beds) : bubble_chart.y_scale(d.properties.doctors));
            d3.selectAll('.yaxis-label')
                .text(isPhysicalResourceMode ? "# Beds" : "# Doctors")
            bubble_chart.y_axis = d3.axisLeft()
                .scale(bubble_chart.y_scale);
            d3.selectAll(".yaxis")
                .transition()
                .duration(duration_transition)
                .call(bubble_chart.y_axis)
            d3.selectAll(".label-bubble")
                .transition()
                .duration(duration_transition)
                .attr('y', d => isPhysicalResourceMode ? bubble_chart.y_scale(d.properties.beds) - bubble_chart.bubble_label_shift : bubble_chart.y_scale(d.properties.doctors) - bubble_chart.bubble_label_shift)
        }

    });
});