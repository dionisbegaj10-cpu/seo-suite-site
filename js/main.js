var blob;
var shapes = [
    {
        wave1: {amplitude: 76.923, frequency: 0.879, phase: 0},
        wave2: {amplitude: 60, frequency: 0.165, phase: 0},
        wave3: {amplitude: 50, frequency: 0, phase: 0}
    },
    {
        wave1: {amplitude: 0, frequency: 0, phase: 0},
        wave2: {amplitude: 0, frequency: 0, phase: 0},
        wave3: {amplitude: 35, frequency: 10, phase: 0}
    },
    {
        wave1: {amplitude: 200, frequency: 7.692, phase: 6.283},
        wave2: {amplitude: 200, frequency: 7.912, phase: 6.283},
        wave3: {amplitude: 200, frequency: 10, phase: 6.283}
    },
    {
        wave1: {amplitude: 34.066, frequency: 5.934, phase: 0},
        wave2: {amplitude: 20.879, frequency: 6.154, phase: 0},
        wave3: {amplitude: 50.549, frequency: 0, phase: 0}
    }
];
var blob_settings = {
        BLOB_SIZE: 250,
        BLOB_DISTANCE: 1000,
        DETALISATION: 60,
        PERSPECTIVE_DISTORTION: 1,
        ROTATION_SPEED: 5,
        DOT_SIZE: ($(window).width()>480)?1.5:1, //1.5,
        DOT_COLOR: "#d0d0d0",
        MOUSE_DISTANCE_MIN: 20,
        MOUSE_DISTANCE_MAX: 400,
        MOUSE_SENSITIVITY: 1,
        INERTIAL_TIME: 4,
        INITIAL_SHAPE: {
            wave1: {amplitude: 76.923, frequency: 0.879, phase: 0},
            wave2: {amplitude: 60, frequency: 0.165, phase: 0},
            wave3: {amplitude: 50, frequency: 0, phase: 0}
        },
        USE_WAVE_MOTION: true,
        USE_WAVE_SWING: true,
        USE_MORPHING: true,
        MORPHING_AUTOPLAY: true,
        MORPHING_DURATION: 1,
        MORPHING_DELAY: 0,
        MORPHING_TRANSITION_TYPE: "cubic",
        MORPHING_SHAPES:[shapes[0]],
        WAVE_1_MOTION_SPEED: 1.3,
        WAVE_2_MOTION_SPEED: 0.8
    }
var isInViewport = function (elem) {
    var bounding = elem.getBoundingClientRect();
    return (
        bounding.top >= 0 &&
        bounding.left >= 0 &&
        bounding.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        bounding.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
};
var inter;

var intDistance, intPerspective;
var ctrlDistance = ctrlPerspective= false;
var curAni = 1;
function animateDistance(end, index){
    if(curAni !== index){
        ctrlDistance = false;
        curAni = index;
        clearInterval(intDistance);
    }
    if(ctrlDistance === false){
        ctrlDistance = true;
        if(blob.blobDistance >= end){
            var step = (blob.blobDistance - end)/100;
            intDistance = setInterval(function(){
                if(blob.blobDistance > end){
                    if((blob.blobDistance - step)>end){
                        blob.blobDistance -= step;
                    }else{
                        blob.blobDistance = end;
                    }
                }else{
                    ctrlDistance = false;
                    clearInterval(intDistance);
                }
            },1);
        }else{
            var step = (end - blob.blobDistance)/100;
            intDistance = setInterval(function(){
                if(blob.blobDistance < end){
                    if((blob.blobDistance + step)<end){
                        blob.blobDistance += step;
                    }else{
                        blob.blobDistance = end;
                    }
                }else{
                    ctrlDistance = false;
                    clearInterval(intDistance);
                }
            },1);
        }
    }
    //blob.blobDistance = end;
}
function animatePerspective(end, index){
    if(curAni !== index){
        ctrlPerspective = false;
        curAni = index;
        clearInterval(intPerspective);
    }
    if(ctrlPerspective === false){
        ctrlPerspective = true;
        if(blob.perspectiveDistortion >= end){
            intPerspective = setInterval(function(){
                if(blob.perspectiveDistortion > end){
                    blob.perspectiveDistortion -= 1;
                }else{
                    ctrlPerspective = false;
                    clearInterval(intPerspective);
                }
            },2);
        }else{
            intPerspective = setInterval(function(){
                if(blob.perspectiveDistortion < end){
                    blob.perspectiveDistortion += 1;
                }else{
                    ctrlPerspective = false;
                    clearInterval(intPerspective);
                }
            },2);
        }
    }
    //blob.perspectiveDistortion = end;
}
$(document).ready(function(){
    $('body').addClass('animated');
    blob = new BlobAnimation("blob_container", blob_settings);

    var service = document.getElementById('delegato-testo-4');
    var collaborations = document.getElementById('delegato-testo-2');
    var intro = document.getElementById('intro');
    var text = document.getElementById('delegato-testo-1');
    var title1 = document.getElementById('delegato-testo-3');
    var ftitle = document.getElementById('delegato-testo-5');
    var aatitle = document.getElementById('aa-loghi');
    var services = document.getElementById('aa-loghi');
    window.addEventListener('scroll', function (event) {
        if (isInViewport(intro)) {
            blob.morphTo(shapes[0]);
            blob.blobSize = 250;
            animateDistance(1000, 1);
            animatePerspective(1, 1);
            blob.dotSize = ($(window).width()>480)?1.5:1; //1.5;
        }
        if (isInViewport(text)) {
            blob.morphTo(shapes[1]);
            blob.blobSize = 220;
            animateDistance(0, 2);
            animatePerspective(3, 2);
            blob.dotSize = ($(window).width()>480)?1:0.8;//1;
        }
        if (isInViewport(title1)) {
            blob.morphTo(shapes[2]);
            blob.blobSize = 220;
            animateDistance(1000, 3);
            animatePerspective(1, 3);
            blob.dotSize = ($(window).width()>480)?1.021:0.6;//1.021;
        }
        if (isInViewport(ftitle)) {
            blob.morphTo(shapes[3]);
            blob.blobSize = 220;
            animateDistance(1000, 4);
            animatePerspective(1, 4);
            blob.dotSize = ($(window).width()>480)?1.021:0.6;//1.021;
        }

        /*
        if (isInViewport(intro)) {
            blob.morphTo(shapes[0]);
            clearInterval(inter);
            inter = setInterval(function(){
                if(blob.perspectiveDistortion >=1){
                    blob.perspectiveDistortion -=0.1;
                }else{
                    clearInterval(inter);
                }
            });
        }
	if (isInViewport(customers)) {
            blob.morphTo(shapes[0]);
            clearInterval(inter);
            inter = setInterval(function(){
                if(blob.perspectiveDistortion <=10){
                    blob.perspectiveDistortion +=0.1;
                }else{
                    clearInterval(inter);
                }
            });
	}
        */
        /* Scroll Control */
        if (isInViewport(intro)) {
            $("body").addClass("animated");
        }else{
            $("body").removeClass("animated");
        }
        if (isInViewport(text)) {
            $("#text1").addClass("animated");    
        }
        if (isInViewport(collaborations)) {
            $("#collaborations, .customer-clients").addClass("animated");
        }
        if (isInViewport(title1) || isInViewport(ftitle) || isInViewport(intro)) {
            $("#blob_container").addClass("animated");
            $("body").addClass("animated");
        }else{
            $("#blob_container").removeClass("animated");
            $("body").removeClass("animated");
        }
        if (isInViewport(ftitle)) {
            $("#ftitle, .footer-box-center, #address, .footer-box-right").addClass("animated");
        }
        if (isInViewport(aatitle)) {
            $("#aa-title, #aa-loghi").addClass("animated");
            $("#award-text").addClass("animated").animate({"top":"0"},1000, function(){
                $("body, body #mytopnav img, body .logo_placeholder img").css("transition-delay", "0s, 0s");
            });

            animateNumbers();
        }
        if (isInViewport(service)) {
            $("#services, .work-1, .work-2, .work-3, .work-4, .work-4, #social-media, #branding, #web-design, #advertising").addClass("animated");
        }
    }, false);
    //setInterval(function(){jsband.ColorTween.run(blob, "dotColor", "rgb("+255*Math.random()+","+255*Math.random()+","+255*Math.random()+")", jsband.Ease.lin(), 1000)}, 1000)
});
$(document).ready(function(){
    $("#ftitle").on("click",function(e){
        if(typeof gtag == "function"){
            gtag('event', 'view_item');
        }
        $(".contact_overlay").css("top", e.clientY);
        $(".contact_overlay").css("left", e.clientX);
        $(".mainBody").css("overflow","hidden");
        $(".contact_overlay").addClass("opened");
        $(".mainBody").animate({"top":0},300,function(){
            $("iframe").addClass("animated");
        });
    });
    $("#edit_button").on("click", function(e){
        if(typeof gtag == "function"){
            gtag('event', 'view_item');
        }
        $(".edit_button_overlay").addClass("actived");
        $(".mainBody").css("overflow","hidden");
        $(".mainBody").animate({"top":0},300,function(){
            $("iframe").addClass("animated");
        });
    });
    
    /*
    $("#edit_button").on("click", function(e){
        //$(this).addClass("actived");
        $(".contact_overlay").css("top", e.clientY);
        $(".contact_overlay").css("left", e.clientX);
        $(".mainBody").css("overflow","hidden");
        $(".contact_overlay").addClass("opened");
        $("#ftitle").trigger("click");
    });
    */
});
var aw_numbers = new Array();
var aw_old_numbers = new Array();
$(document).ready(function() {
    setAnimationDelay("intro");
    setAnimationDelay("text1", 100);
    setAnimationDelay("award-text", 100);
    setAnimationDelay("aa-title", 100);
    setAnimationDelay("services", 100);
    setAnimationDelay("collaborations", 100);
    setAnimationDelay("ftitle", 400);
    setAnimationDelayLi("branding", 1200);
    setAnimationDelayLi("web-design", 1600);
    setAnimationDelayLi("advertising", 2000);
    setAnimationDelayLi("social-media", 2400);
    setNumberAnimation();
});
function closeContactForm(){
    $("iframe").removeClass("animated");
    $("body").animate({"top":0},400,function(){
        $(".contact_overlay").removeClass("opened");
        $(".mainBody").css("overflow-y","inherit");
        $(".edit_button_overlay").removeClass("actived");
        $(".mainBody").animate({"top":0},700,function(){
            $(".contact_overlay").css("top", "-1px");
            $(".contact_overlay").css("left", "-1px");
        });
    });
}
function setAnimationDelay(id, start_delay){
    if(typeof start_delay === "undefined") start_delay = 0;
    $("#"+id).find("span").each(function(i){
        $(this).css("transition-delay", ((i*30)+start_delay)+"ms");
    });
}
function setAnimationDelayLi(id, start_delay){
    if(typeof start_delay === "undefined") start_delay = 0;
    $("#"+id).find("li").each(function(i){
        $(this).css("transition-delay", ((i*20)+start_delay)+"ms");
    });
}
function setNumberAnimation(){
    jQuery(".customer-awwwards li").each(function(i){
        aw_numbers[i] = jQuery(this).find("span").text();
        jQuery(this).find("span").text("");
    });
}

function animateNumbers(){
    jQuery(".customer-awwwards li").each(function(i){
        startNumberAnimation(aw_numbers[i], jQuery(this).find("span.not_animated"));
    });
}
function startNumberAnimation(end, obj){
        var z = end-1;
        var tmz = 500 + Math.floor(Math.random()*2000);
        obj.removeClass("not_animated");
        var tmr = setInterval(function(){
            obj.text(z);
            if(z===9){
                z=0;
            }else{
                z++;
            }
        },50);
        var tmo = setTimeout(function(){
            clearInterval(tmr);
            obj.text(end);
        },tmz);
}

     

$(document).ready(function(){
    $(".footer-box-right li:first-child a").on("mouseover",function(){
        $("body").addClass("body_blu");
    }).on("mouseout", function(){
        $("body").removeClass("body_blu");
    });
    $(".footer-box-right li:nth-child(2) a").on("mouseover",function(){
        $("body").addClass("body_instagram");
    }).on("mouseout", function(){
        $("body").removeClass("body_instagram");
    });
    $(".footer-box-right li:nth-child(3) a").on("mouseover",function(){
        $("body").addClass("body_linkedin");
    }).on("mouseout", function(){
        $("body").removeClass("body_linkedin");
    });
    
    $("#edit_button").on("mouseover",function(){
        $(".cursor").addClass("cursor_onbutton");
    }).on("mouseout", function(){
        $(".cursor").removeClass("cursor_onbutton");
    });
    
    const section = document.querySelectorAll(".edit_button");
    let currentPixel = window.pageYOffset;
    let delta = 5;
    if($(window).width()<480){
        delta = 0;
    }
    const looper = function(){
        const newPixel = window.pageYOffset;
        const diff = newPixel - currentPixel;
        const speed = diff*delta;
        //for(i=0;i<section.length;i++) section[i].style.transform = "translateY("+-speed+"px)";
        for(i=0;i<section.length;i++) section[i].style.top = -speed+"px";
        currentPixel = newPixel;
        requestAnimationFrame(looper);
    };
    looper();
    /*
    const footer = document.getElementById("footer");
    const stopButton = function(){
        let b_foot = footer.getBoundingClientRect();
        
        if(typeof )
        const hs = window.pageYOffset;
        console.log(b_foot, hs);
        requestAnimationFrame(stopButton);
    }
    stopButton();
    */
    let distance;
    let elm = document.getElementById("edit_button");
    let bound = elm.getBoundingClientRect();
    let diagonal = Math.sqrt( Math.pow(bound.width, 2) + Math.pow(bound.height, 2) );
    let centerX = bound.width/2 + bound.x;//bound.width/2 + bound.left;
    let centerY = bound.height/2 + bound.y;//bound.height/2 + bound.top;
    $(window).resize(function(){
        bound = elm.getBoundingClientRect();
        diagonal = Math.sqrt( Math.pow(bound.width, 2) + Math.pow(bound.height, 2) );
        centerX = bound.width/2 + bound.x;//bound.width/2 + bound.left;
        centerY = bound.height/2 + bound.y;//bound.height/2 + bound.top;
    });
    let cX;
    let cY;
    $(document).on("mousemove",function(e){
        cX = e.clientX;
        cY = e.clientY;
    });
    const magnetic = function(){
        bound = elm.getBoundingClientRect();
        centerX = bound.width/2 + bound.x;//bound.width/2 + bound.left;
        centerY = bound.height/2 + bound.y;//bound.height/2 + bound.top;
        distance = Math.sqrt(Math.pow(centerX-cX, 2)+ Math.pow(centerY-cY, 2));
        var diffX = cX - centerX;
        var diffY = cY - centerY;
        var maxDistance = (diagonal + distance) / 2;
        if (distance < maxDistance) {
            let percent = 1 - (distance / maxDistance);
            elm.style.transform = "translate("+Math.round(diffX*percent)+"px, "+Math.round(diffY*percent)+"px)"; 
        } else {
            elm.style.transform = "";
        }
        requestAnimationFrame(magnetic);
    };
    magnetic();
    /*
    $("body").animate({"top":0},4000,function(){
        $(".loader").animate({"opacity":0},300,function(){
        */
            $("body").removeClass("bodypreloader");
            $(".box, footer, .container, section, .bottom_nav").animate({"opacity":1},300, function(){
                $("#intro").addClass("animated");
                bound = elm.getBoundingClientRect();
                diagonal = Math.sqrt( Math.pow(bound.width, 2) + Math.pow(bound.height, 2) );
                centerX = bound.width/2 + bound.left;
                centerY = bound.height/2 + bound.top;
            });
            /*
        });
    });
    */
});


