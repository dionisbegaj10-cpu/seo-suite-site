
const boxheader = document.querySelector(".box-header");
const boxpres = document.querySelector(".box-pres");
const boxcustomers = document.querySelector(".box-customers");

let currentPixel = window.pageYOffset;

const animskew = function () {
    const newPixel = window.pageYOffset;
    const diff = newPixel - currentPixel;
    const speed = diff * 0.05;

    boxheader.style.transform = "skewY("+ speed + "deg)";
    boxpres.style.transform = "skewY("+ speed + "deg)";
    boxcustomers.style.transform = "skewY("+ speed + "deg)";
    
    currentPixel = newPixel;

    requestAnimationFrame(animskew);
};

animskew();