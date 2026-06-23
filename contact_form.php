<!DOCTYPE html>
<html>
	<head>
		<meta charset="utf-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0;">
		<title>ILAB - Contattaci</title>
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
                <meta property="og:title" content="ilab - Digital creative studio" />
                <meta property="og:url" content="https://www.ilabsolutions.it/" />
                <meta property="og:image" content="https://www.ilabsolutions.it/img/300x200.jpg" />
                <meta property="og:image:width" content="300px" />
                <meta property="og:image:height" content="200px" />
                <meta property="og:site_name" content="ilab" />
                <meta property="og:description" content="Dal 2009, ilab è un digital creative studio di origini partenopee specializzato in branding, web design e advertising." />
                <meta name="twitter:title" content="ilab - Digital creative studio">
                <meta name="twitter:card" content="summary_large_image">
                <meta name="twitter:site" content="https://www.ilabsolutions.it">
                <meta name="twitter:creator" content="ilab">
                <meta name="twitter:description" content="Dal 2009, ilab è un digital creative studio di origini partenopee specializzato in branding, web design e advertising.">
                <meta name="twitter:image" content="https://www.ilabsolutions.it/img/800x418.jpg">
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
                                    <span id="hello-ilab">Salve <span class="ilab" >ILAB,</span>
                                            <span class="spacer"></span>
                                            mi chiamo <input id="nome" type="text" value="" name="name" placeholder="Nome e Cognome" data-subline="Come ti chiami?" required> e mi
                                            occupo di <input id="occupation "type="text" value="" name="occupation" placeholder="parlaci della tua attività." data-subline="Cosa fai di bello nella vita?" />
                                            <span class="spacer"></span>
                                            Sono alla ricerca di un'agenzia a cui affidare un progetto di
					<select name="request_type">
                                            <option value="Branding" selected>Branding</option>
                                            <option value="Web Design">Web Design</option>
                                            <option value="Advertising">Advertising</option>
                                            <option value="Social Media">Social Media</option>
                                            <option value="Branding + Web">Branding + Web</option>
					</select>
                                            <span class="spacer"></span>
                                            Dispongo di un budget di
					<select name="budget">
                                            <option value="circa 5.000€" selected>circa 5.000</option>
                                            <option value="5.000 - 10.000€">5.000 - 10.000</option>
                                            <option value="10.000 - 20.000€">10.000 - 20.000</option>
                                            <option value="+ 20.000€">+ 20.000</option>
					</select>
                                            € e il progetto va avviato in circa 
					<select name="end_date">
                                            <option value="un mese" selected>un mese</option>
                                            <option value="due mesi">due mesi</option>
                                            <option value="tre mesi">tre mesi</option>
                                            <option value="sei mesi">sei mesi</option>
                                        </select>
                                            <span class="spacer"></span>
                                            Potrebbe esservi utile sapere che <input type="text" value="" name="more_info" placeholder="si tratta di ..." data-subline="Descrivici in breve il progetto" />
                                            <span class="spacer"></span>
                                             Preferirei essere contattato in
					<select name="preference">
                                            <option value="mattinata" selected>mattinata</option>
                                            <option value="pomeriggio">pomeriggio</option>
                                            <option value="sera">serata</option>
					</select>
                                            all'indirizzo <input id="contact-email" type="text" value="" name="contact_email" placeholder="email" data-subline="Qual è la tua email?"/>
                                            o al numero <input type="text" value="" name="phone_number" placeholder="345 *******." data-subline="E il numero di telefono?"/>
                                            <span class="spacer"></span>
                                            <span>Grazie mille, a presto!</span>
                                            <span class="spacer"></span>
                                            <span class="privacy-policy">Cliccando su "INVIA" dichiaro di accettare la <a id="privacy-policy" href="privacy.html" target="_blank">Privacy Policy</a>.</span>
                                            <span class="spacer"></span>
					<div class="nl-submit-wrap">
                                            <button class="nl-submit" id="nl-submit" type="submit" value="Submit" data-hover="true"><span class="nlbg"></span><span class="nltop">Invia</span></button>
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
                        <button class="nl-submit window_button"><span class="nlbg"></span><span class="nltop">Chiudi</span></button>
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
