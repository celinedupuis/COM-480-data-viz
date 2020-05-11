function whenDocumentLoaded(action) {
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", action);
    } else {
        action();
    }
}

whenDocumentLoaded(() => {

    // Menu navigation bar
    const tabBtn = document.getElementsByClassName("btn");
    for (let i = 0; i < tabBtn.length; i++) {
        tabBtn[i].addEventListener("click", function() {
            let current = document.getElementsByClassName("active");
            current[0].className = current[0].className.replace(" active", "");
            this.className += " active";
        });
    }

    // Buttons to choose between type of resources
    const btnsPhysicalMode = document.getElementsByClassName("physicalResourcesButton");
    const btnsHumanMode = document.getElementsByClassName("humanResourcesButton");

    for (let i = 0; i < btnsPhysicalMode.length; i++) {
        btnsPhysicalMode[i].addEventListener("click", function() {
            for (let i = 0; i < btnsPhysicalMode.length; i++) {
                btnsHumanMode[i].className = btnsHumanMode[i].className.replace(" activeButton", "");
                btnsPhysicalMode[i].className += " activeButton";
            }
        });

        btnsHumanMode[i].addEventListener("click", function() {
            for (let i = 0; i < btnsHumanMode.length; i++) {
                btnsPhysicalMode[i].className = btnsPhysicalMode[i].className.replace(" activeButton", "");
                btnsHumanMode[i].className += " activeButton";
            }
        });
    }

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
        bubble_chart = new BubbleChart(map_data, 'bubbleChart');;

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

        // Interaction
        let isCantonSelected = false;
        let cantonSelectedID = "";
        let isPhysicalResourcesMode = true;
        let isSameRadius = false;

        d3.selectAll(".canton")
            .on("mouseover", mouseover)
            .on("mouseout", mouseout)
            .on("click", click);

        d3.selectAll("circle")
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

        d3.selectAll(".physicalResourcesButton")
            .on("click", modePhysicalResource)

        d3.selectAll(".humanResourcesButton")
            .on("click", modeHumanResource)

        d3.selectAll(".bubbleRatio")
            .on("click", setBubblesRadius)


        function setBubblesRadius() {
            isSameRadius = !isSameRadius;
            d3.selectAll("circle")
                .transition()
                .duration(500)
                .attr("r", isSameRadius ? 10 : d => d.properties.gdpPerCapita);
        }

        // Functions
        function modePhysicalResource() {
            isPhysicalResourcesMode = true;
            //cholorpleth
            d3.selectAll(".canton")
                .transition()
                .duration(500)
                .style("fill", (d) => color_scale_beds(d.properties.beds));

            //bubble chart
            bubble_chart.y_range = [0, d3.max(map_data, d => d.properties.beds)];
            bubble_chart.y_scale = d3.scaleLinear()
                .domain(bubble_chart.y_range)
                .range([bubble_chart.chart_height, 0]);
            d3.selectAll("circle")
                .transition()
                .duration(500)
                .attr("cy", d => bubble_chart.y_scale(d.properties.beds));
            d3.selectAll('.yaxis-label')
                .text("Doctors / 1000 inhabitants")
            bubble_chart.y_axis = d3.axisLeft()
                .scale(bubble_chart.y_scale);
            d3.selectAll(".yaxis")
                .transition()
                .duration(500)
                .call(bubble_chart.y_axis)

            // label
            d3.selectAll(".label-bubble")
                .transition()
                .duration(500)
                .attr('y', d => bubble_chart.y_scale(d.properties.beds) - 22)
        }

        function modeHumanResource() {
            isPhysicalResourcesMode = false;

            // cholorpleth
            d3.selectAll(".canton")
                .transition()
                .duration(500)
                .style("fill", (d) => color_scale_doctors(d.properties.doctors));

            // bubble chart
            bubble_chart.y_range = [0, d3.max(map_data, d => d.properties.doctors)];
            bubble_chart.y_scale = d3.scaleLinear()
                .domain(bubble_chart.y_range)
                .range([bubble_chart.chart_height, 0]);
            d3.selectAll("circle")
                .transition()
                .duration(500)
                .attr("cy", d => bubble_chart.y_scale(d.properties.doctors));
            d3.selectAll('.yaxis-label')
                .text("Doctors / 1000 inhabitants")
            bubble_chart.y_axis = d3.axisLeft()
                .scale(bubble_chart.y_scale);
            d3.selectAll(".yaxis")
                .transition()
                .duration(500)
                .call(bubble_chart.y_axis)

            // label
            d3.selectAll(".label-bubble")
                .transition()
                .duration(500)
                .attr('y', d => bubble_chart.y_scale(d.properties.doctors) - 22)
        }

        function mouseover(d) {
            let overID = d.id;
            if (!isCantonSelected) {
                // cholorpleth
                d3.selectAll(".canton")
                    .style("fill-opacity", d => d.id == overID ? 1 : 0.2)
                    .style("stroke-width", d => d.id == overID ? 1 : 0.2)
                    .style("stroke", d => d.id == overID ? red : white);

                // icons
                updateIndicators(overID);

                // bubble chart
                d3.selectAll("circle")
                    .style("fill-opacity", d => d.id == overID ? 1 : 0.3)
                    .style("stroke-width", d => d.id == overID ? 1 : 0);

                // label
                d3.selectAll(".label-canton")
                    .text(d => d.id == overID ? d.properties.name : "")
                    .style("font-size", d => d.id == overID ? 20 : 14);

                d3.selectAll(".label-bubble")
                    .text(d => d.id == overID ? d.properties.name : "")
                    .style("font-size", d => d.id == overID ? 20 : 14);
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
                d3.selectAll("circle")
                    .style("fill-opacity", 1)
                    .style("stroke-width", 1);

                // label
                d3.selectAll(".label-canton")
                    .text(d => d.id)
                    .style("font-size", 14)
                d3.selectAll(".label-bubble")
                    .text(d => d.id)
                    .style("font-size", 14);
            }
        }

        function click(d) {
            isCantonSelected = cantonSelectedID == d.id ? !isCantonSelected : true;
            cantonSelectedID = d.id;
            if (isCantonSelected) {
                // cholorpleth
                d3.selectAll(".canton")
                    .style("fill-opacity", d => d.id == cantonSelectedID ? 1 : 0.2)
                    .style("stroke-width", d => d.id == cantonSelectedID ? 5 : 0.2)
                    .style("stroke", d => d.id == cantonSelectedID ? red : white);

                // icons
                updateIndicators(cantonSelectedID);

                // bubble chart
                d3.selectAll("circle")
                    .style("fill-opacity", d => d.id == cantonSelectedID ? 1 : 0.3)
                    .style("stroke-width", d => d.id == cantonSelectedID ? 5 : 0)

                // label
                d3.selectAll(".label-canton")
                    .text(d => d.id == cantonSelectedID ? d.properties.name : "")
                    .style("font-size", d => d.id == cantonSelectedID ? 20 : 14)
                d3.selectAll(".label-bubble")
                    .text(d => d.id == cantonSelectedID ? d.properties.name : "")
                    .style("font-size", d => d.id == cantonSelectedID ? 20 : 14);

            } else {
                mouseout(d);
            }
        }

        function updateIndicators(currentCanton) {
            let name = map_data.filter(canton => canton.id == currentCanton)[0].properties.name;
            let demographic = map_data.filter(canton => canton.id == currentCanton)[0].properties.density;
            let beds = map_data.filter(canton => canton.id == currentCanton)[0].properties.beds;
            let doctors = map_data.filter(canton => canton.id == currentCanton)[0].properties.doctors / 100;

            demographic = Number(demographic).toFixed(0).toString() + "'000 <br> inhabitants";
            if (demographic > 1000) {
                demographic = Number(demographic).toFixed(0).toString()[0] + "'" + Number(demographic).toFixed(0).toString().substr(1, 3) + "'000 <br>inhabitants";
            }
            beds = Number(beds).toFixed(1).toString() + " beds <br> for 1000 inhabitants";
            doctors = Number(doctors).toFixed(1).toString() + " doctors <br> for 1000 inhabitants";

            document.getElementById("indicator-name").innerHTML = name;
            document.getElementById("indicator-demographic").innerHTML = demographic;
            document.getElementById("indicator-beds").innerHTML = beds;
            document.getElementById("indicator-doctors").innerHTML = doctors;
        }

        function defaultIndicators() {
            document.getElementById("indicator-name").innerHTML = "Switzerland";
            document.getElementById("indicator-demographic").innerHTML = "8’544’527 <br> inhabitants";
            document.getElementById("indicator-beds").innerHTML = "2.26 doctors <br> for 1000 inhabitants";
            document.getElementById("indicator-doctors").innerHTML = "4.4 beds <br> for 1000 inhabitants";
        }
    });
});