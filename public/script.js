console.log('script.js loaded')

const containerElem = document.getElementsByClassName('container')[0];
console.log(containerElem)



var fadeout = function(elem) {
    var o = 1;
    var timer = setInterval(function () {
        if (o <= 0.0) {
            clearInterval(timer);
        }
        elem.style.opacity = o;
        elem.style.filter = 'alpha(opacity=' + o * 100 + ")";
        o -= 0.1;
    }, 25);
};

var fadein = function(elem) {
    var o = 0;
    var timer = setInterval(function () {
        if (o >= 1.0) {
            clearInterval(timer);
        }
        elem.style.opacity = o;
        elem.style.filter = 'alpha(opacity=' + o * 100 + ")";
        o += 0.1;
    }, 25);
};


//fadein(containerElem)
