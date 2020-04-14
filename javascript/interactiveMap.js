 let cantons = Array.from(document.getElementsByClassName("interactiveShapes"));

 var white = "#ffffff";
 var colorIn = "#FEC9C9";
 var colorClick = "#F95151";

 cantons.forEach(canton => {
     canton.style.fill = white;
     canton.selected = false;
     canton.addEventListener('mouseenter', () => {
         if (!canton.selected) {
             canton.style.fill = colorIn;
         }
     });
     canton.addEventListener('mouseleave', () => {
         if (!canton.selected) {
             canton.style.fill = white;
         }
     });
     canton.addEventListener('click', () => {
         if (canton.selected) {
             canton.style.fill = white;
         } else {
             canton.style.fill = colorClick;
         }
         canton.selected = !canton.selected;
     });
 });