/**
* demo.js
* http://www.codrops.com
*
* Licensed under the MIT license.
* http://www.opensource.org/licenses/mit-license.php
* 
* Copyright 2019, Codrops
* http://www.codrops.com
*/
$(window).load(function(){
    const body = document.getElementById("box-portfolio");//document.body;

    const MathUtils = {
        lineEq: (y2, y1, x2, x1, currentVal) => {
            // y = mx + b 
            var m = (y2 - y1) / (x2 - x1), b = y1 - m * x1;
            return m * currentVal + b;
        },
        lerp: (a, b, n) => (1 - n) * a + n * b,
        getRandomFloat: (min, max) => (Math.random() * (max - min) + min).toFixed(2)
    };
    
    const getMousePos = (e) => {
        let posx = 0;
        let posy = 0;
        if (!e) e = window.event;
        if (e.pageX || e.pageY) {
            posx = e.pageX;
            posy = e.pageY;
        }
        else if (e.clientX || e.clientY) 	{
            posx = e.clientX + body.scrollLeft + document.documentElement.scrollLeft;
            posy = e.clientY + body.scrollTop + document.documentElement.scrollTop;
        }
        return { x : posx, y : posy }
    };

    let winsize;
    const calcWinsize = () => winsize = {width: window.innerWidth, height: window.innerHeight};
    calcWinsize();
    window.addEventListener('resize', calcWinsize);

    let mousepos = {x: winsize.width/2, y: winsize.height/2};
    window.addEventListener('mousemove', ev => mousepos = getMousePos(ev));

    // Strip Item
    class StripItem {
        constructor(el) {
            this.DOM = {el: el};
            this.DOM.image = this.DOM.el.querySelector('.img-inner');
            this.DOM.number = this.DOM.el.querySelector('.strip-item-link');

            this.initEvents();
        }
        initEvents() {
            // Hovering the number makes it slide out/in
            this.DOM.number.addEventListener('mouseenter', () => {
                const inner = this.DOM.number.querySelector('span');
                new TimelineMax()
                .to(inner, 0.2, {
                    ease: Quad.easeOut,
                    y: '-100%',
                    opacity: 0
                }, 0)
                .to(inner, 0.5, {
                    ease: Expo.easeOut,
                    startAt: {y: '100%', opacity: 0, scale: 1.3},
                    y: '0%',
                    opacity: 1
                }, 0.2)
            });
            
            this.DOM.number.addEventListener('mouseleave', () => {
                const inner = this.DOM.number.querySelector('span');
                TweenMax.killTweensOf(inner);
                TweenMax.set(inner, {
                    scale: 1,
                    y: '0%',
                    opacity: 1
                });
            });
        }
    }

    // Content Item
    class ContentItem {
        constructor(el) {
            this.DOM = {el: el};
            this.DOM.image = this.DOM.el.querySelector('.img-outer');
            this.DOM.title = this.DOM.el.querySelector('.content-item-title');
            this.DOM.text = this.DOM.el.querySelector('.content-item-text');
        }
    }

    // Images strip
    class Strip {
        constructor(el) {
            this.DOM = {el: el};
            this.DOM.strip = this.DOM.el.querySelector('.strip');
            this.items = [];
            [...this.DOM.strip.querySelectorAll('.strip-item')].forEach(item => this.items.push(new StripItem(item)));
            this.boxStrip = document.getElementById("box-strip");
            this.DOM.draggable = this.DOM.el.querySelector('.draggable');
            this.DOM.indicator = document.querySelector('.frame__indicator');
            this.DOM.cover = this.DOM.el.querySelector('.strip-cover');
            this.currentStrip = 2;
            this.draggableWidth = this.DOM.draggable.offsetWidth;
            this.maxDrag = this.draggableWidth < winsize.width ? 0 : this.draggableWidth - winsize.width;
            this.dragPosition = -this.items[0].DOM.el.getBoundingClientRect().width;
            
            this.draggie = new Draggabilly(this.DOM.draggable, { axis: 'x' });
            this.draggie.setPosition( this.dragPosition);
            
            var title = this.items[this.currentStrip-1].DOM.el.dataset.title;
            var subtitle = this.items[this.currentStrip-1].DOM.el.dataset.subtitle;
            $("#box-strip").find(".strip-cover__title").text(title);
            $("#box-strip").find(".strip-cover__subtitle").text(subtitle);
            this.init();
            this.initEvents();
        }
        init() {
            this.renderedStyles = {
                position: {previous: 0, current: this.dragPosition},
                scale: {previous: 1, current: 1},
                imgScale: {previous: 1, current: 1},
                opacity: {previous: 1, current: 1},
                coverScale: {previous: 0.75, current: 0.75},
                coverOpacity: {previous: 0, current: 0},
                indicatorScale: {previous: 1, current: 1},
            };

            this.render = () => {
                this.renderId = undefined;
                
                for (const key in this.renderedStyles ) {
                    this.renderedStyles[key].previous = MathUtils.lerp(this.renderedStyles[key].previous, this.renderedStyles[key].current, 0.1);
                }
                
                TweenMax.set(this.DOM.strip, {x: this.renderedStyles.position.previous});
                for (const item of this.items) {
                    TweenMax.set(item.DOM.el, {scale: this.renderedStyles.scale.previous, opacity: this.renderedStyles.opacity.previous});
                    TweenMax.set(item.DOM.image, {scale: this.renderedStyles.imgScale.previous});
                }
                TweenMax.set(this.DOM.cover, {scale: this.renderedStyles.coverScale.previous, opacity: this.renderedStyles.coverOpacity.previous});
                TweenMax.set(this.DOM.indicator, {scaleX: this.renderedStyles.indicatorScale.previous});

                if ( !this.renderId ) {
                    this.renderId = requestAnimationFrame(() => this.render());  
                }
            };
            this.renderId = requestAnimationFrame(() => this.render());
        }
        initEvents() {
            this.onDragStart = () => {
                this.renderedStyles.scale.current = 0.8;
                this.renderedStyles.imgScale.current = 1.6;
                this.renderedStyles.opacity.current = 0.3;
                this.renderedStyles.coverScale.current = 1;
                this.renderedStyles.coverOpacity.current = 1;
                this.renderedStyles.indicatorScale.current = 0;
            };

            this.onDragMove = (event, pointer, moveVector) => {
                if ( this.draggie.position.x >= 0 ) {
                    this.dragPosition = MathUtils.lineEq(0.5*winsize.width,0, winsize.width, 0, this.draggie.position.x);
                }
                else if ( this.draggie.position.x < -1*this.maxDrag ) {
                    this.dragPosition = MathUtils.lineEq(0.5*winsize.width,0, this.maxDrag+winsize.width, this.maxDrag, this.draggie.position.x);
                }
                else {
                    this.dragPosition = this.draggie.position.x;
                }
                //console.log(this.current);
                this.renderedStyles.position.current = this.dragPosition;
                var bs_bound = this.boxStrip.getBoundingClientRect();
                
                for (const item of this.items) {
                    var item_bound =  item.DOM.el.getBoundingClientRect();
                    if(item_bound.x < bs_bound.x && (item_bound.x+item_bound.width) > (bs_bound.x+bs_bound.width)){
                        if(item.DOM.el.dataset.index != this.currentStrip){
                            var title = item.DOM.el.dataset.title;
                            var subtitle = item.DOM.el.dataset.subtitle;
                            $("#box-strip").stop().animate({"opacity":0},300,function(){
                                $(this).find(".strip-cover__title").text(title);
                                $(this).find(".strip-cover__subtitle").text(subtitle);
                                $(this).animate({"opacity":1},300);
                            });
                            this.currentStrip = item.DOM.el.dataset.index;
                        }
                    }
                }
                
                mousepos = getMousePos(event);
            };

            this.onDragEnd = () => {
                if ( this.draggie.position.x > 0 ) {
                    this.dragPosition = 0;
                    this.draggie.setPosition(this.dragPosition, this.draggie.position.y);
                }
                else if ( this.draggie.position.x < -1*this.maxDrag ) {
                    this.dragPosition = -1*this.maxDrag;
                    this.draggie.setPosition(this.dragPosition, this.draggie.position.y);
                }
                this.renderedStyles.position.current = this.dragPosition;
                this.renderedStyles.scale.current = 1;
                this.renderedStyles.imgScale.current = 1;
                this.renderedStyles.opacity.current = 1;
                this.renderedStyles.coverScale.current = 0.75;
                this.renderedStyles.coverOpacity.current = 0;
                this.renderedStyles.indicatorScale.current = 1;
                /*
                var bs_bound = this.boxStrip.getBoundingClientRect();
                for (const item of this.items) {
                    var item_bound =  item.DOM.el.getBoundingClientRect();
                    if(item_bound.x < bs_bound.x && (item_bound.x+item_bound.width) > (bs_bound.x+bs_bound.width)){
                        if(item.DOM.el.dataset.index != this.currentStrip){
                            var title = item.DOM.el.dataset.title;
                            var subtitle = item.DOM.el.dataset.subtitle;
                            $("#box-strip").stop().animate({"opacity":0},300,function(){
                                $(this).find(".strip-cover__title").text(title);
                                $(this).find(".strip-cover__subtitle").text(subtitle);
                                $(this).animate({"opacity":1},300);
                            });
                            this.currentStrip = item.DOM.el.dataset.index;
                        }
                    }
                }*/
            };

            this.draggie.on('pointerDown', this.onDragStart);
            this.draggie.on('dragMove', this.onDragMove);
            this.draggie.on('pointerUp', this.onDragEnd);

            for (const item of this.items) {
                item.DOM.number.addEventListener('click', (ev) => {
                    ev.preventDefault();
                    this.showItem(item);
                });
            }

            window.addEventListener('resize', () => {
                this.maxDrag = this.draggableWidth < winsize.width ? 0 : this.draggableWidth - winsize.width;
                if ( Math.abs(this.dragPosition) + winsize.width > this.draggableWidth ) {
                    const diff = Math.abs(this.dragPosition) + winsize.width - this.draggableWidth;
                    this.dragPosition = this.dragPosition+diff;
                    this.draggie.setPosition(this.dragPosition, this.draggie.position.y);
                }
            });
        }
        showItem(item) {
            if ( this.isAnimating ) {
                return false;
            }
            
            if ( this.renderId ) {
                window.cancelAnimationFrame(this.renderId);
                this.renderId = undefined;
            }

            this.isAnimating = true;

            this.current = this.items.indexOf(item);
            const contentItem = contentItems[this.current];
            contentItem.DOM.el.classList.add('content-item-current');
            TweenMax.set(this.DOM.cover, {scale: 0, opacity: 0});

            this.contentToggleTimeline = new TimelineMax({
                onComplete: () => this.isAnimating = false
            })
            .set([contentItem.DOM.image, contentItem.DOM.title, contentItem.DOM.text, closeContentCtrl], {
                opacity: 0
            }, 0)
            .to(this.items.map(item => item.DOM.el), 0.8, {
                ease: Cubic.easeOut,
                scale: 0.8,
                opacity: 0.4
            }, 0)
            .to(this.items.map(item => item.DOM.image), 0.8, {
                ease: Cubic.easeOut,
                scale: 1.6
            }, 0)
            .to(this.DOM.indicator, 0.8, {
                ease: Cubic.easeOut,
                scaleX: 0
            }, 0);

            for (const item of this.items) {
                this.contentToggleTimeline.to(item.DOM.el, 1, {
                    ease: Expo.easeInOut,
                    y: winsize.height*-1
                }, MathUtils.getRandomFloat(0.2,0.4));
            }

            this.contentToggleTimeline
            .to(contentItem.DOM.image, 1, {
                ease: Expo.easeInOut,
                startAt: {y: winsize.height*1.3, opacity: 1},
                y: 0
            }, 0.6)
            .to(contentItem.DOM.title, 0.8, {
                ease: Quint.easeOut,
                startAt: {y: 100},
                y: 0,
                opacity: 1
            }, 1)
            .to(contentItem.DOM.text, 0.8, {
                ease: Quint.easeOut,
                startAt: {y: 200},
                y: 0,
                opacity: 1
            }, 1)
            .to(closeContentCtrl, 0.8, {
                ease: Quint.easeOut,
                startAt: {y: 50},
                y: 0,
                opacity: 1
            }, 1);
        }
        closeContent() {
            if ( this.isAnimating ) {
                return false;
            }
            this.isAnimating = true;
            
            const contentItem = contentItems[this.current];
            this.contentToggleTimeline = new TimelineMax({
                onComplete: () => {
                    contentItem.DOM.el.classList.remove('content-item-current');
                    this.isAnimating = false
                    this.renderId = requestAnimationFrame(() => this.render());
                }
            })
            .set(this.items.map(item => item.DOM.el), {
                scale: 1,
                opacity: 1
            }, 0)
            .set(this.items.map(item => item.DOM.image), {
                scale: 1
            }, 0)
            .to(contentItem.DOM.text, 0.8, {
                ease: Quint.easeIn,
                y: 200,
                opacity: 0
            }, 0)
            .to(contentItem.DOM.title, 0.8, {
                ease: Quint.easeIn,
                y: 100,
                opacity: 0
            }, 0)
            .to(closeContentCtrl, 0.8, {
                ease: Quint.easeOut,
                y: 50,
                opacity: 0
            }, 0.2)
            .to(contentItem.DOM.image, 1, {
                ease: Expo.easeInOut,
                y: winsize.height*1.3, 
                opacity: 1
            }, 0.2);

            for (const item of this.items) {
                this.contentToggleTimeline.to(item.DOM.el, MathUtils.getRandomFloat(0.6,0.9), {
                    ease: Expo.easeInOut,
                    y: 0
                }, MathUtils.getRandomFloat(0.4,0.6));
            }

            this.contentToggleTimeline
            .to(this.DOM.indicator, 1.2, {
                ease: Expo.easeOut,
                scaleX: 1
            }, 0.5);
        }
    }

    
        const strip = new Strip(document.querySelector('.strip-outer'));
        const contentItems = [];
        [...document.querySelectorAll('.content-item')].forEach(item => contentItems.push(new ContentItem(item)));
        const closeContentCtrl = document.querySelector('.content-close');
        closeContentCtrl.addEventListener('click', () => {
            strip.closeContent();
        });
});
window.onerror = function (msg, url, lineNo, columnNo, error) {
  console.log(msg, url, lineNo, columnNo, error);

  return false;
}