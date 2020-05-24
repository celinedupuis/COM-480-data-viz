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
            if (current[0] != undefined) {
                current[0].className = current[0].className.replace(" active", "");
            }
            this.className += " active";
        });
    }

    // Cholorpleth
    const btnCholorpleth = document.getElementsByClassName("cholorplethButton");
    for (let i = 0; i < btnCholorpleth.length; i++) {
        btnCholorpleth[i].addEventListener("click", function() {
            let current = document.getElementsByClassName("activeCholorplethButton");
            current[0].className = current[0].className.replace(" activeCholorplethButton", "");
            this.className += " activeCholorplethButton";
        });
    }

    // BarChart
    const btnBar = document.getElementsByClassName("barChartButton");
    for (let i = 0; i < btnBar.length; i++) {
        btnBar[i].addEventListener("click", function() {
            let current = document.getElementsByClassName("activeBarChartButton");
            current[0].className = current[0].className.replace(" activeBarChartButton", "");
            this.className += " activeBarChartButton";
        });
    }

    // BubbleChart
    const btnResources = document.getElementsByClassName("btnResources");
    for (let i = 0; i < btnResources.length; i++) {
        btnResources[i].addEventListener("click", function() {
            let current = document.getElementsByClassName("activeButton");
            current[0].className = current[0].className.replace(" activeButton", "");
            this.className += " activeButton";
        });
    }

    const btnRadius = document.getElementsByClassName("btnRadius");
    let isUniformRadius = true;
    btnRadius[0].addEventListener("click", function() {
        isUniformRadius = !isUniformRadius;
        if (isUniformRadius) {
            let str = this.className;
            this.className = str.substr(0, 27);
        } else {
            this.className += " activeButton";
        }
    });
});