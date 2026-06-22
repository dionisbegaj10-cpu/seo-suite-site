<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="utf-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0;">
		<title>Get in touch — Digital Creative Studio</title>
                <script
                    src="https://code.jquery.com/jquery-3.4.1.min.js"
                    integrity="sha256-CSXorXvZcTkaix6Yvo6HppcZGetbYMGWSFlBw8HfCJo="
                    crossorigin="anonymous"></script>
		<link rel="stylesheet" type="text/css" href="css/style.css" />
		<link rel="stylesheet" type="text/css" href="css/component.css" />
		<script src="js/modernizr.custom.js" type="text/javascript"></script>
                <link rel="apple-touch-icon" sizes="180x180" href="img/apple-touch-icon.png">
                <link rel="icon" type="image/png" sizes="32x32" href="img/favicon-32x32.png">
                <link rel="icon" type="image/png" sizes="16x16" href="img/favicon-16x16.png">
                <link rel="manifest" href="img/site.webmanifest">
                <link rel="mask-icon" href="img/safari-pinned-tab.svg" color="#5bbad5">
                <meta name="msapplication-TileColor" content="#da532c">
                <meta name="theme-color" content="#ffffff">
                <meta property="og:type" content="website" />
                <meta property="og:title" content="Digital Creative &amp; Marketing Studio" />
                <meta property="og:url" content="https://studio.example/" />
                <meta property="og:image" content="img/300x200.jpg" />
                <meta property="og:image:width" content="300px" />
                <meta property="og:image:height" content="200px" />
                <meta property="og:site_name" content="Digital Creative Studio" />
                <meta property="og:description" content="A digital creative and marketing studio — brand, web, growth and performance." />
                <meta name="twitter:title" content="Digital Creative &amp; Marketing Studio">
                <meta name="twitter:card" content="summary_large_image">
                <meta name="twitter:site" content="Digital Creative Studio">
                <meta name="twitter:creator" content="Digital Creative Studio">
                <meta name="twitter:description" content="A digital creative and marketing studio — brand, web, growth and performance.">
                <meta name="twitter:image" content="img/800x418.jpg">
                	</head>
	<body class="nl-blurred">
            <div id="cont_frame">
		<div class="container container-box">
                        <div class="box box-close">
                            <span id="close_form">
                                <span class="close_form_point"></span>
                                <span class="close_form_back"></span>
                                <span class="close_form_top"></span>
                            </span>
                        </div>
			<div class="box box-form">
				<form id="nl-form" action="" method="POST" name="contact_form" class="nl-form">
                                    <span id="hello-ilab">Hello <span class="ilab" >Studio,</span>
                                            <span class="spacer"></span>
                                            my name is <input id="nome" type="text" value="" name="name" placeholder="Full name" data-subline="What&#39;s your name?" required> and I'm
                                            with <input id="occupation "type="text" value="" name="occupation" placeholder="company / brand" data-subline="Who are you with?" />
                                            <span class="spacer"></span>
                                            I'm looking for help with
					<select name="request_type">
                                            <option value="Branding" selected>Branding</option>
                                            <option value="Web & Design">Web &amp; Design</option>
                                            <option value="Growth Marketing">Growth Marketing</option>
                                            <option value="Performance">Performance</option>
                                            <option value="The full package">the full package</option>
					</select>
                                            <span class="spacer"></span>
                                            My budget is around
					<select name="budget">
                                            <option value="under 5k" selected>under &euro;5k</option>
                                            <option value="5k - 15k">&euro;5k - &euro;15k</option>
                                            <option value="15k - 50k">&euro;15k - &euro;50k</option>
                                            <option value="50k+">&euro;50k+</option>
					</select>
                                            and I'd like to kick off
					<select name="timeline">
                                            <option value="in a few weeks" selected>in a few weeks</option>
                                            <option value="in 1-2 months">in 1-2 months</option>
                                            <option value="this quarter">this quarter</option>
                                            <option value="not sure yet">not sure yet</option>
                                        </select>.
                                            <span class="spacer"></span>
                                            It might help to know that <input type="text" value="" name="more_info" placeholder="we're trying to ..." data-subline="Describe your goal in a sentence" />
                                            <span class="spacer"></span>
                                             I'd prefer to hear back in the
					<select name="preference">
                                            <option value="morning" selected>morning</option>
                                            <option value="afternoon">afternoon</option>
                                            <option value="evening">evening</option>
					</select>
                                            at <input id="contact-email" type="text" value="" name="contact_email" placeholder="email" data-subline="What&#39;s your email?"/>
                                            or on <input type="text" value="" name="phone_number" placeholder="+1 555 000 0000" data-subline="And your phone number?"/>
                                            <span class="spacer"></span>
                                            <span>Thanks — talk soon!</span>
                                            <span class="spacer"></span>
                                            <span class="privacy-policy">By clicking "SEND" I agree to the <a id="privacy-policy" href="privacy.html" target="_blank">Privacy Policy</a>.</span>
                                            <span class="spacer"></span>
					<div class="nl-submit-wrap">
                                            <button class="nl-submit" id="nl-submit" type="submit" value="Submit" data-hover="true"><span class="nlbg"></span><span class="nltop">Send</span></button>
					</div>
                                        <div class="nl-overlay"></div>
                                        <input type="hidden" name="action" value="sendMail" />
				</form>
			</div>
		</div>
            </div>
            <div class="message_box">
                <div class="message_overlay"></div>
                <div class="message_window">
                    <div class="message_text"></div>
                    <div class="window_buttons">
                        <button class="nl-submit window_button"><span class="nlbg"></span><span class="nltop">Close</span></button>
                    </div>
                </div>
            </div>
            <div class="cursor">
                <div class="cursor__inner cursor-circle"></div>
                <div class="cursor__inner cursor-dot"></div>
            </div>
		<script src="js/nlform.js"></script>
		<script>
			var nlform = new NLForm( document.getElementById( 'nl-form' ) );
		</script>
                <script src="js/cursor.js" type="text/javascript"></script>
                <script>
                $("#close_form").on("click",function(){
                    window.top.closeContactForm();

                });
                $(".nl-submit").on("mousemove",function(e){
                    var relX = e.pageX - $(this).offset().left;
                    var relY = e.pageY - $(this).offset().top;
                    $(".nl-submit span.nlbg").css("top", relY);
                    $(".nl-submit span.nlbg").css("left", relX);
                });


                </script>
                                        </body>
</html>
