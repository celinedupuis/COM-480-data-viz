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

    // Bubble chart buttons
    const btnResources = document.getElementsByClassName("btnResources");
    for (let i = 0; i < btnResources.length; i++) {
        btnResources[i].addEventListener("click", function() {
            let current = document.getElementsByClassName("activeButton");
            current[0].className = current[0].className.replace(" activeButton", "");
            this.className += " activeButton";
        });
    }
    const btnRadius = document.getElementsByClassName("btnRadius");
    for (let i = 0; i < btnRadius.length; i++) {
        btnRadius[i].addEventListener("click", function() {
            let current = document.getElementsByClassName("activeButton");
            current[1].className = current[1].className.replace(" activeButton", "");
            this.className += " activeButton";
        });
    }
});