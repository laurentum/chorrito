// ==UserScript==
// @name         EpeniBot X2
// @version      1.32b
// @description  Este es el robot duplicador. Se obliga a refrescar la pagina en una hora.
// @author       laurentum
// @match        https://freebitco.in/*
// @grant        none
// @updateURL    https://raw.githubusercontent.com/laurentum/chorrito/master/robot_publico.js
// @downloadURL  https://raw.githubusercontent.com/laurentum/chorrito/master/robot_publico.js
// ==/UserScript==

(function() {
	'use strict';

	var version="1.32b";

	// función para consultar tiempo restante hasta próximo roll
	function tiemporestante(){
		var tR={};
		tR.texto = $('title').text().replace("FreeBitco.in - Free Bitcoin Wallet, Faucet, Lottery and Dice!","");
		tR.texto = tR.texto.replace("- FreeBitco.in - Win free bitcoins every hour!", "");
		if (tR.texto!=="") {
			tR.minuto = parseInt(tR.texto.split(":")[0]);
			tR.seg = parseInt(tR.texto.split(":")[1]);
			tR.tiempo = tR.minuto*60+tR.seg;
		} else
			tR.tiempo = 0;
		return(tR.tiempo);
	}

	// función para reportar
	function Reportar(estatus) {
	estatus=encodeURIComponent(estatus);
		var parametros="Id="+userID+"&Btc="+balance_BTC+"&Rp="+balance_PR+"&Status="+estatus+"&Version="+version;
		$.ajax({
			crossDomain: true,	
        	url: "https://script.google.com/macros/s/AKfycbzYjk5fPj2IBAIVTQ17WfoF7Go-Ct6DPg1y3lzzrE6lnB6umRQ/exec?"+parametros,
			method : "GET",
        	dataType: "jsonp"
    	});
	}

	// premios es un objeto con una función para activar bonos para
	// acrecentar rápidamente los puntos reward y cobrar el bono
	// de aumento premio por lanzamiento cuando tengas suficientes puntos.
	var premios = {};
	premios.rutina = function() {
        premios.puntos = parseInt($('.user_reward_points').text().replace(',',""));
        premios.temporizadorbono = {};
        if ($("#bonus_container_free_points").length !== 0) {
            premios.temporizadorbono.texto = $('#bonus_span_free_points').text();
            premios.temporizadorbono.hora = parseInt(premios.temporizadorbono.texto.split(":")[0]);
            premios.temporizadorbono.minuto = parseInt(premios.temporizadorbono.texto.split(":")[1]);
            premios.temporizadorbono.segundo = parseInt(premios.temporizadorbono.texto.split(":")[2]);
            premios.temporizadorbono.actual = premios.temporizadorbono.hora * 3600 + premios.temporizadorbono.minuto * 60 + premios.temporizadorbono.segundo;
        } else
            premios.temporizadorbono.actual = 0;
        if (premios.temporizadorbono.actual === 0 & tiemporestante()===0) {
			if (premios.puntos>8000) {
				Reportar("Activando los bonos de 100RP y 1000% por lanzamiento.");
				RedeemRPProduct('free_points_100');
				RedeemRPProduct('fp_bonus_1000');
			}
			else if (premios.puntos>5800) {
				Reportar("Activando los bonos de 100RP y 500% por lanzamiento.");
				RedeemRPProduct('free_points_100');
				RedeemRPProduct('fp_bonus_500');
			}
			else if (premios.puntos>5000) {
				Reportar("Activando los bonos de 100RP y 100% por lanzamiento.");
				RedeemRPProduct('free_points_100');
				RedeemRPProduct('fp_bonus_100');
			}
			else if (premios.puntos>1200) {
				Reportar("Activando el bono de 100RP por lanzamiento.");
				RedeemRPProduct('free_points_100');
			}
			else if (premios.puntos>600) {
				Reportar("Activando el bono de 50RP por lanzamiento.");
				RedeemRPProduct('free_points_50');
			}
			else if (premios.puntos>120) {
				Reportar("Activando el bono de 10RP por lanzamiento.");
				RedeemRPProduct('free_points_10');
			}
			else if (premios.puntos>20) {
				Reportar("Activando el bono de 1RP por lanzamiento.");
				RedeemRPProduct('free_points_1');
			}
		}
	};

	var body = $('body');
	// datos de esta cuenta
	var userID = (((document.getElementById('edit_tab')).getElementsByTagName('p')[0]).getElementsByTagName('span')[1]).innerHTML;
	userID = parseInt(userID);
	var hora_reporte=userID % 24;
	var balance_BTC = parseFloat(document.getElementById('balance').innerHTML);
	var balance_PR = parseInt($('.user_reward_points').text().replace(',',""));
	// el tipo siempre estará despierto.
	var despierto=true;
	var estado="";
	var hora_actual=new Date();
	hora_actual=hora_actual.getHours();
	if (despierto) {estado="Estoy despierto.";}
	else {estado="Estoy dormido.";}
	// verifica si hay captcha u otras condiciones
	var hay_captcha=($('#captchasnet_free_play_captcha').is(':visible'))||($('#free_play_recaptcha').is(':visible'));
	var timer_running=($("#multi_acct_same_ip").is(":visible"));
	var bloqueo_ip=$('#free_play_error').is(':visible');
	var estado_captcha="";
	var color_robot="#054908";
	if (hay_captcha) {estado_captcha="¡Maldita captcha! Reportando a mi amo..."; color_robot="#a40000";}
	if (timer_running) {estado_captcha="El reloj está corriendo. Reportando a mi amo..."; color_robot="#a40000";}
	if (!timer_running & !hay_captcha) {
		if (despierto) {
			estado_captcha="Voy a cobrar el chorrito";
			if ($("#bonus_container_free_points").length !== 0) {estado_captcha+=".";}
			else {estado_captcha+=" y también voy a activar bonos (si tengo suficientes RP).";}
		} else {
			estado_captcha="No hago un coño.";
		}
	}
    body.prepend(
        $('<div/>').attr('style',"position:fixed;top:45px;left:0;z-index:999;width:300px;background-color:"+color_robot+";color: white; text-align: left;")
            .append(
                $('<div/>').attr('id','autofaucet')
					.append($('<p/>').attr('style','text-decoration:bold; text-align:center').text("( ͡° ͜ʖ ͡°) ╭∩╮  v."+version))
					.append($('<p/>').attr('style','text-decoration:bold; text-align:center').text("───────────────────────"))
                    .append($('<p/>').text(estado))
                    .append($('<p/>').text(estado_captcha))
            )
    ).prepend($('<style/>').text("#autofaucet p { margin: 0; margin-left: 2px;  text-align: left; }"));

	// activa la rutina para que se ejecute repetidamente de manera asíncrona según condiciones:
	if (despierto & !hay_captcha & !bloqueo_ip) {	
		setTimeout(premios.rutina,1000);  // activar en un segundo
		var timeout=Math.floor(Math.random() * 60 )*1000+2000; //timeout adicional entre 2 y 62 segundos
   		if ($('#free_play_form_button').is(':visible')) {
			console.log("Cobrando el premios.");
   			setTimeout(function(){ $('#free_play_form_button').click();},timeout);
		}
   		setTimeout(function(){
			if ($('.close-reveal-modal').is(':visible')) {
				setTimeout(function(){$('.close-reveal-modal').click();},1000);
			}
		},timeout+12000); // cierra la ventana de dialogo pop-up 12 segundos despues de jugar el chorrito
		setTimeout(function(){location.reload(true);},timeout+3601000); //obliga a hacer un refrescamiento de la pagina en una hora
		if (hora_actual==hora_reporte) {Reportar("Balance al día");} // manda el reporte diario a las 12 del mediodía.
	} else {
		setTimeout(function(){location.reload();},3600000); // nos vemos en una hora.
		if (hora_actual==hora_reporte) {	// manda el reporte diario a las 12 del mediodía.
			if (hay_captcha) {
				Reportar("Balance al día (captcha)");
			} 
			else if (timer_running) {
				Reportar("Balance al día (timer running)");
			}
			else {Reportar("Balance al día.");}
		}
		else { // reporta el problema
			if (hay_captcha) {Reportar("captcha");}
			else if (timer_running) {Reportar("timer running");}  
        }
	}
})();
