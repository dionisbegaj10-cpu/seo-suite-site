
;( function( window ) {
	
	'use strict';

	var document = window.document;

	if (!String.prototype.trim) {
		String.prototype.trim=function(){return this.replace(/^\s+|\s+$/g, '');};
	}

	function NLForm( el ) {	
		this.el = el;
		this.overlay = this.el.querySelector( '.nl-overlay' );
		this.fields = [];
		this.fldOpen = -1;
		this._init();
	}

	NLForm.prototype = {
		_init : function() {
			var self = this;
			Array.prototype.slice.call( this.el.querySelectorAll( 'select' ) ).forEach( function( el, i ) {
				self.fldOpen++;
				self.fields.push( new NLField( self, el, 'dropdown', self.fldOpen ) );
			} );
			Array.prototype.slice.call( this.el.querySelectorAll( 'input' ) ).forEach( function( el, i ) {
				self.fldOpen++;
				self.fields.push( new NLField( self, el, 'input', self.fldOpen ) );
			} );
			this.overlay.addEventListener( 'click', function(ev) { self._closeFlds(); } );
			this.overlay.addEventListener( 'touchstart', function(ev) { self._closeFlds(); } );
		},
		_closeFlds : function() {
			if( this.fldOpen !== -1 ) {
				this.fields[ this.fldOpen ].close();
			}
		}
	};

	function NLField( form, el, type, idx ) {
		this.form = form;
		this.elOriginal = el;
		this.pos = idx;
		this.type = type;
		this._create();
		this._initEvents();
	}

	NLField.prototype = {
		_create : function() {
			if( this.type === 'dropdown' ) {
				this._createDropDown();	
			}
			else if( this.type === 'input' ) {
				this._createInput();	
			}
		},
		_createDropDown : function() {
			var self = this;
			this.fld = document.createElement( 'div' );
			this.fld.className = 'nl-field nl-dd';
			this.toggle = document.createElement( 'a' );
			this.toggle.innerHTML = this.elOriginal.options[ this.elOriginal.selectedIndex ].innerHTML;
			this.toggle.className = 'nl-field-toggle';
			this.optionsList = document.createElement( 'ul' );
			var ihtml = '';
			Array.prototype.slice.call( this.elOriginal.querySelectorAll( 'option' ) ).forEach( function( el, i ) {
				ihtml += self.elOriginal.selectedIndex === i ? '<li class="nl-dd-checked">' + el.innerHTML + '</li>' : '<li>' + el.innerHTML + '</li>';
				// selected index value
				if( self.elOriginal.selectedIndex === i ) {
					self.selectedIdx = i;
				}
			} );
			this.optionsList.innerHTML = ihtml;
			this.fld.appendChild( this.toggle );
			this.fld.appendChild( this.optionsList );
			this.elOriginal.parentNode.insertBefore( this.fld, this.elOriginal );
			this.elOriginal.style.display = 'none';
		},
		_createInput : function() {
			var self = this;
                        if($(this).attr("name")=="action") return false;
			this.fld = document.createElement( 'div' );
			this.fld.className = 'nl-field nl-ti-text';
			this.toggle = document.createElement( 'a' );
			this.toggle.innerHTML = this.elOriginal.getAttribute( 'placeholder' );
			this.toggle.className = 'nl-field-toggle';
			this.optionsList = document.createElement( 'ul' );
			this.getinput = document.createElement( 'input' );
			this.getinput.setAttribute( 'type', 'text' );
			this.getinput.setAttribute( 'placeholder', this.elOriginal.getAttribute( 'placeholder' ) );
			this.getinputWrapper = document.createElement( 'li' );
			this.getinputWrapper.className = 'nl-ti-input';
			this.inputsubmit = document.createElement( 'button' );
                        this.inputsubmit.className = 'nl-field-go';
			this.inputsubmit.innerHTML = '';
			this.getinputWrapper.appendChild( this.getinput );
			this.getinputWrapper.appendChild( this.inputsubmit );
			this.example = document.createElement( 'li' );
			this.example.className = 'nl-ti-example';
			this.example.innerHTML = this.elOriginal.getAttribute( 'data-subline' );
			this.optionsList.appendChild( this.getinputWrapper );
			this.optionsList.appendChild( this.example );
			this.fld.appendChild( this.toggle );
			this.fld.appendChild( this.optionsList );
			this.elOriginal.parentNode.insertBefore( this.fld, this.elOriginal );
			this.elOriginal.style.display = 'none';
		},
		_initEvents : function() {
			var self = this;
			this.toggle.addEventListener( 'click', function( ev ) { ev.preventDefault(); ev.stopPropagation(); self._open(); } );
			this.toggle.addEventListener( 'touchstart', function( ev ) { ev.preventDefault(); ev.stopPropagation(); self._open(); } );

			if( this.type === 'dropdown' ) {
				var opts = Array.prototype.slice.call( this.optionsList.querySelectorAll( 'li' ) );
				opts.forEach( function( el, i ) {
					el.addEventListener( 'click', function( ev ) { ev.preventDefault(); self.close( el, opts.indexOf( el ) ); } );
					el.addEventListener( 'touchstart', function( ev ) { ev.preventDefault(); self.close( el, opts.indexOf( el ) ); } );
				} );
			}
			else if( this.type === 'input' ) {
				this.getinput.addEventListener( 'keydown', function( ev ) {
					if ( ev.keyCode === 13 ) {
						self.close();
					}
				} );
				this.inputsubmit.addEventListener( 'click', function( ev ) { ev.preventDefault(); self.close(); } );
				this.inputsubmit.addEventListener( 'touchstart', function( ev ) { ev.preventDefault(); self.close(); } );
			}

		},
		_open : function() {
			if( this.open ) {
				return false;
			}
			this.open = true;
			this.form.fldOpen = this.pos;
			var self = this;
			this.fld.className += ' nl-field-open';
                        $(this.fld).find("input").focus();
		},
		close : function( opt, idx ) {
			if( !this.open ) {
				return false;
			}
			this.open = false;
			this.form.fldOpen = -1;
			this.fld.className = this.fld.className.replace(/\b nl-field-open\b/,'');

			if( this.type === 'dropdown' ) {
				if( opt ) {
					// remove class nl-dd-checked from previous option
					var selectedopt = this.optionsList.children[ this.selectedIdx ];
					selectedopt.className = '';
					opt.className = 'nl-dd-checked';
					this.toggle.innerHTML = opt.innerHTML;
					// update selected index value
					this.selectedIdx = idx;
					// update original select element´s value
					this.elOriginal.value = this.elOriginal.children[ this.selectedIdx ].value;
				}
			}
			else if( this.type === 'input' ) {
				this.getinput.blur();
				this.toggle.innerHTML = this.getinput.value.trim() !== '' ? this.getinput.value : this.getinput.getAttribute( 'placeholder' );
				this.elOriginal.value = this.getinput.value;
			}
		}
	};

	// add to global namespace
	window.NLForm = NLForm;
        

} )( window );
var emailisok = false;
function sendAlertMessage(msg){
    $(".message_text").html(msg);
    $(".message_box").addClass("opened");
}
function validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}
function validatePhoneNumber(phone) {
    var re = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im;
    return re.test(String(phone).toLowerCase());
}
function validateForm() {
    var name = document.forms[0]["name"].value;
    var occupation = document.forms[0]["occupation"].value;
    var contact_email= document.forms[0]["contact_email"].value;
    var phone_number = document.forms[0]["phone_number"].value;
    var more_info = document.forms[0]["more_info"].value;
    if (name === "") {
        sendAlertMessage("Con chi abbiamo il piacere di parlare? Ricorda di inserire il tuo nome.");
        return false;
    }else if(occupation === ""){
        sendAlertMessage("E tu, di cosa ti occupi? <br> Parlaci un po' della tua attività...");
        return false;
    }else if(more_info === ""){
        sendAlertMessage("Più informazioni sono fondamentali per capire quello di cui hai bisogno. Di cosa si tratta?");
        return false;
    }else if(contact_email === ""){
        sendAlertMessage("Beh, senza email e numero di telefono come la facciamo una chiacchierata?");
        return false;
    }else if(validateEmail(contact_email)===false || emailisok === false){
        sendAlertMessage("Controlla l'indirizzo email, sembra non essere valido!");
        return false;
    }else if(phone_number === ""){
        sendAlertMessage("Beh, senza email e numero di telefono come la facciamo una chiacchierata?");
        return false;
    }else if(!validatePhoneNumber(phone_number)){
        sendAlertMessage("Controlla il numero di telefono, sembra non essere valido!");
        return false;
    }else {
        return true;
    }
}
function checkEmailMX(email){
    $.ajax({
        url: 'contact_form.php',
        type: "POST",
        data: {
            "action": "checkMail",
            "contact_email": email
        },
        dataType: 'application/json; charset=utf-8'
    }).always(function (data) {
            var d = JSON.parse(data.responseText);
            if(d.code == 200){
                emailisok = true;
            }else{
                emailisok = false;
                //sendAlertMessage(d.msg);
            }
    });
}
$(document).ready(function(){
    $(".window_button, .message_overlay").on("click", function(){
        $(".message_box").removeClass("opened");
    });
    $("#nl-form .nl-submit").on("click", function(){
        $("#nl-form").submit();
    });
    $("input[placeholder='email']").on("blur",function(){
        checkEmailMX($(this).val());
    });
    $("#nl-form").on("submit", function(e){
        if(validateForm()){
            return true;
        }else{
            e.preventDefault();
            return false;
        }
    }); 
          
    $("#close_form").on("mouseover",function(){
        $(".cursor").addClass("cursor_onbutton");
    }).on("mouseout", function(){
        $(".cursor").removeClass("cursor_onbutton");
    });
    
    $("#nl-submit").on("mouseover",function(){
        $(".cursor").addClass("cursor_onbutton");
    }).on("mouseout", function(){
        $(".cursor").removeClass("cursor_onbutton");
    });
    
});
let cX;
let cY;
$(document).ready(function(){
        $(document).on("mousemove",function(e){
            cX = e.clientX;
            cY = e.clientY;
        });
        addMagnetic(document.getElementById("close_form"));
        addMagnetic(document.getElementById("nl-submit"));
});

function addMagnetic(elm){
    function magnetic(){
        var bound = elm.getBoundingClientRect();
        var diagonal = Math.sqrt( Math.pow(bound.width, 2) + Math.pow(bound.height, 2) );
        var centerX = bound.width/2 + bound.x;//bound.width/2 + bound.left;
        var centerY = bound.height/2 + bound.y;//bound.height/2 + bound.top;
        var distance = Math.sqrt(Math.pow(centerX-cX, 2)+ Math.pow(centerY-cY, 2));
        var diffX = cX - centerX;
        var diffY = cY - centerY;
        var maxDistance = (diagonal + distance) / 2;
        if (distance < maxDistance) {
            var percent = 1 - (distance / maxDistance);
            elm.style.transform = "translate("+Math.round(diffX*percent)+"px, "+Math.round(diffY*percent)+"px)"; 
        } else {
            elm.style.transform = "";
        }
        requestAnimationFrame(magnetic);
    };
    magnetic();
}