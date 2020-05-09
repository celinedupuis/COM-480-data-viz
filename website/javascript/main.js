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
            doctors[row.id] = parseFloat(row.doctors);
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

        // Common Interaction
        let cantonSelected = false;
        let cantonSelectedID = "";

        d3.selectAll(".canton")
            .on("mouseover", mouseover)
            .on("mouseout", mouseout)
            .on("click", click);

        d3.selectAll("circle")
            .on("mouseover", mouseover)
            .on("mouseout", mouseout)
            .on("click", click)

        function mouseover(d) {
            let cantonOver = d.id;
            d3.selectAll(".canton")
                .style("stroke-width", d => d.id == cantonOver ? 3 : 0.5)
                .style("fill", d => d.id == cantonOver ? "#F95151" : cholorpleth.color_scale(d.properties.density));
            d3.selectAll("circle")
                .style("fill-opacity", d => d.id == cantonOver ? 1 : 0.5)
                .style("stroke-width", d => d.id == cantonOver ? 1 : 0)
            d3.selectAll(".label-bubble")
                .text(d => d.id == cantonOver ? d.properties.name : "")
                .style("font-size", d => d.id == cantonOver ? 40 : 14)
            updateIndicators(cantonOver);
        }

        function mouseout(d) {
            if (!cantonSelected) {
                d3.selectAll(".canton")
                    .style("stroke-width", 0.5)
                    .style("fill", d => cholorpleth.color_scale(d.properties.density))
                d3.selectAll("circle")
                    .style("fill-opacity", 1)
                    .style("stroke-width", 1)
                d3.selectAll(".label-bubble")
                    .text(d => d.id)
                    .style("font-size", 14)
                defaultIndicators();
            }
        }

        function click(d) {
            cantonSelected = cantonSelectedID == d.id ? !cantonSelected : true;
            cantonSelectedID = d.id;
            if (cantonSelected) {
                updateIndicators(cantonSelectedID);
                d3.selectAll(".canton")
                    .style("stroke-width", d => d.id == cantonSelectedID ? 3 : 0.5)
                    .style("fill", d => d.id == cantonSelectedID ? "#F95151" : cholorpleth.color_scale(d.properties.density));
                scrollBy(0, svg_viewbox.height / 2);
                d3.selectAll("circle")
                    .style("fill-opacity", d => d.id == cantonSelectedID ? 1 : 0.5)
                    .style("stroke-width", d => d.id == cantonSelectedID ? 1 : 0)
                d3.selectAll(".label-bubble")
                    .text(d => d.id == cantonSelectedID ? d.properties.name : "")
                    .style("font-size", d => d.id == cantonSelectedID ? 40 : 14)
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