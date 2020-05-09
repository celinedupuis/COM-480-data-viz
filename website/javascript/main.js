function whenDocumentLoaded(action) {
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", action);
    } else {
        action();
    }
}

whenDocumentLoaded(() => {

    // Nav Bar
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
        cholorpleth = new SwissMap(map_data, 'interactiveSwissMap');
        bubble_chart = new BubbleChart(map_data, 'bubbleChart');;

        // Colors
        const lightGrey = "hsl(0, 0%, 90%)"
        const middleGrey = "hsl(0, 0%, 40%)"
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

        // Common Interaction
        let cantonSelected = false;
        let cantonSelectedID = "";
        let physicalResourceMode = true;
        d3.selectAll(".canton")
            .on("mouseover", mouseover)
            .on("mouseout", mouseout)
            .on("click", click);

        d3.selectAll("circle")
            .on("mouseover", mouseover)
            .on("mouseout", mouseout)
            .on("click", click)

        d3.selectAll(".physicalResourcesButton")
            .on("click", modePhysicalResource)

        d3.selectAll(".humanResourcesButton")
            .on("click", modeHumanResource)

        function modePhysicalResource() {
            physicalResourceMode = true;
            //cholorpleth
            d3.selectAll(".canton")
                .transition()
                .duration(500)
                .style("fill", (d) => color_scale_beds(d.properties.beds));
            //bubble chart
            y_range = [0, d3.max(map_data, d => d.properties.beds)];
            y_scale = d3.scaleLinear()
                .domain(y_range)
                .range([bubble_chart.chart_height, 0]);
            d3.selectAll("circle")
                .transition()
                .duration(500)
                .attr("cy", d => y_scale(d.properties.beds))
            d3.selectAll(".label-bubble")
                .transition()
                .duration(500)
                .attr('y', d => y_scale(d.properties.beds) - 15)
        }

        function modeHumanResource() {
            physicalResourceMode = false;
            //cholorpleth
            d3.selectAll(".canton")
                .transition()
                .duration(500)
                .style("fill", (d) => color_scale_doctors(d.properties.doctors));
            //bubble chart
            y_range = [0, d3.max(map_data, d => d.properties.doctors)];
            y_scale = d3.scaleLinear()
                .domain(y_range)
                .range([bubble_chart.chart_height, 0]);
            d3.selectAll("circle")
                .transition()
                .duration(500)
                .attr("cy", d => y_scale(d.properties.doctors))
            d3.selectAll(".label-bubble")
                .transition()
                .duration(500)
                .attr('y', d => y_scale(d.properties.doctors) - 15)
        }

        function mouseover(d) {
            let cantonOver = d.id;
            if (!cantonSelected) {
                // cholorpleth
                d3.selectAll(".canton")
                    .style("stroke-width", d => d.id == cantonOver ? 3 : 0.5)
                    .style("stroke", d => d.id == cantonOver ? red : white);
                updateIndicators(cantonOver);

                // bubble chart
                d3.selectAll("circle")
                    .style("fill-opacity", d => d.id == cantonOver ? 1 : 0.5)
                    .style("stroke-width", d => d.id == cantonOver ? 1 : 0);
                d3.selectAll(".label-bubble")
                    .text(d => d.id == cantonOver ? d.properties.name : "");
            }
        }

        function mouseout(d) {
            if (!cantonSelected) {
                // cholorpleth
                d3.selectAll(".canton")
                    .style("stroke-width", 0.5)
                    .style("stroke", white);
                // bubble chart
                d3.selectAll("circle")
                    .style("fill-opacity", 1)
                    .style("stroke-width", 1)
                d3.selectAll(".label-bubble")
                    .text(d => d.id)
                defaultIndicators();
            }
        }

        function click(d) {
            cantonSelected = cantonSelectedID == d.id ? !cantonSelected : true;
            cantonSelectedID = d.id;
            if (cantonSelected) {
                // cholorpleth
                d3.selectAll(".canton")
                    .style("stroke-width", d => d.id == cantonSelectedID ? 5 : 0.5)
                updateIndicators(cantonSelectedID);
                // bubble chart
                d3.selectAll("circle")
                    .style("fill-opacity", d => d.id == cantonSelectedID ? 1 : 0.5)
                    .style("stroke-width", d => d.id == cantonSelectedID ? 1 : 0)
                d3.selectAll(".label-bubble")
                    .text(d => d.id == cantonSelectedID ? d.properties.name : "")
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