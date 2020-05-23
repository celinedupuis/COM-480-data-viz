// Const variables
const duration_transition = 500;
const font_size_default = 14;
const font_size_selected = 20;
const stroke_width_unselected = 0.2;
const stroke_width_default = 1;
const stroke_width_selected = 5;
const opacity_unselected = 0.3;
const opacity_default = 1;
const bubble_radius = 15;
const red = "#F95151"
const blue = "#4287f5"
const white = "#FFFFFF"

// Main variables
let isCantonSelected = false;
let cantonSelectedID = "";

function whenDocumentLoaded(action) {
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", action);
    } else {
        action();
    }
}

whenDocumentLoaded(() => {
    // Data Swiss Indicators
    const indicators_promise = d3.csv("data/swiss_indicators_2020.csv").then((data) => {
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
    const map_promise = d3.json("data/ch-cantons.json").then((topojson_raw) => {
        const canton_paths = topojson.feature(topojson_raw, topojson_raw.objects.cantons);
        return canton_paths.features;
    });

    // Data ICU beds
    const icu_promise = d3.csv("data/swiss_icu_2020.csv").then((data) => {
        let ICUbefore = {};
        let ICUafter = {};
        data.forEach((row) => {
            ICUbefore[row.id] = parseFloat(row.ICUbefore);
            ICUafter[row.id] = parseFloat(row.ICUafter);
        });
        return { ICUbefore, ICUafter };
    });


    // Load Data in Promise
    Promise.all([indicators_promise, map_promise, icu_promise]).then((results) => {
        let map_data = results[1];
        map_data.map(x => {
            x.properties.density = results[0].population[x.id];
            x.properties.gdpPerCapita = results[0].gdpPerCapita[x.id];
            x.properties.gdpPerCapitaRow = results[0].gdpPerCapitaRow[x.id];
            x.properties.beds = results[0].beds[x.id];
            x.properties.doctors = results[0].doctors[x.id];
            x.properties.ICUbefore = results[2].ICUbefore[x.id];
            x.properties.ICUafter = results[2].ICUafter[x.id];
        });

        // Create Data Viz
        cholorpleth = new SwissMap(map_data, 'cholorpleth');
        bubbleChart = new BubbleChart(map_data, 'bubbleChart');
        bipartite = new Bipartite('bipartite');
        barChart = new BarChart(map_data, 'barChart')


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
                d3.selectAll(".label-gdp")
                    .text(d => d.id == overID ? (d.properties.gdpPerCapitaRow + " CHF") : "")
                    .style("opacity", 1);
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
                d3.selectAll(".label-gdp")
                    .text(d => d.id == cantonSelectedID ? (d.properties.gdpPerCapitaRow + " CHF") : "")
                    .style("opacity", 1);
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
                d3.selectAll(".label-gdp")
                    .style("opacity", 0);
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