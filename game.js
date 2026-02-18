let canvas;
let ctx;
let charakter = new Image();


function init() {
    canvas = document.getElementById("canvas");
    ctx = canvas.getContext("2d");

    
    charakter.src = '../img/Knight/Walk/walk1.png';
}