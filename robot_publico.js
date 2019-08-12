// ==UserScript==
// @name         Robot DLV
// @version      1.52b
// @description  Se ha eliminado dependencia de jQuery
// @author       laurentum
// @match        https://freebitco.in/*
// @grant        none
// @updateURL    https://raw.githubusercontent.com/laurentum/chorrito/master/robot_publico.js
// @downloadURL  https://raw.githubusercontent.com/laurentum/chorrito/master/robot_publico.js
// ==/UserScript==

(function() {
	'use strict';
    var version="1.52b";

	  // función para consultar tiempo restante hasta próximo roll
	  function tiemporestante(){
	    var tR={};
	    tR.texto = document.title.replace("FreeBitco.in - Bitcoin, Bitcoin Price, Free Bitcoin Wallet, Faucet, Lottery and Dice!","");
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
      var peticion = new XMLHttpRequest();
      peticion.open('GET', 'https://script.google.com/macros/s/AKfycbzrBiC5Of2eAGPxoLBVFqcQ6W9mTu0N9Y3b2JWCTLYoeZ2s6npG/exec?'+parametros, true);
      peticion.onload = function() {
        if (this.status >= 200 && this.status < 400) {
          // Success!
          var respuesta = this.response;
    	    // Pasa un mensaje a la consola
          if (respuesta["fila"]!=-1) {			
            console.log("Escribiendo en la fila ",respuesta["fila"]);
          } else {
            console.log("Maquina no está en mis registros");
          }
        } else {
          // We reached our target server, but it returned an error
        }
      };
      peticion.onerror = function() {
        // There was a connection error of some sort
      };
      peticion.send();
  	} // Reportar

	// Esta es la función principal que hace todo
	// Se ejecuta 2 seg después esperando los resultados del rebote
	
	function accion_principal() {
    ventanita=document.createElement('DIV');
    ventanita.style["position"]="fixed";
    ventanita.style["top"]="45px";
    ventanita.style["left"]="0";
    ventanita.style["z-index"]="999";
    ventanita.style["width"]="300px";
    ventanita.style["background-color"]=color_robot;
    ventanita.style["color"]="#ffffff";
    ventanita.style["text-align"]="left";
    ventanita.id="autochorrito";
    estilochorrito=document.createElement("STYLE");
    estilochorrito.innerHTML="#autochorrito p { margin: 0; margin-left: 2px;  text-align: left; }";
    document.body.appendChild(estilochorrito);
    textoventanita="<p style='text-decoration:bold; text-align:center'>"+
      "( ͡° ͜ʖ ͡°) ╭∩╮  v."+version+"<br />"+"───────────────────────</p>";
		if (autorizado) {
      textoventanita+="<p>"+userID+"<br />"+acct_email+"<br />"+estado+"<br />"+estado_captcha+"</p>";
			// activa la rutina para que se ejecute repetidamente de manera asíncrona según condiciones:
			if (!hay_captcha & !bloqueo_ip & !timer_running) {	
				premios.rutina();  // reclama los premios de RP
				var timeout=Math.floor(Math.random() * 60 )*1000+2000; //timeout adicional entre 2 y 62 segundos
				if (document.getElementById('free_play_form_button').style.display!=='none') {
					console.log("Cobrando el premio.");
					setTimeout(function(){document.getElementById('free_play_form_button').click();},timeout);
          setTimeout(function(){document.querySelectorAll('.close-reveal-modal')[22].click();},timeout+12000); // cierra la ventana de dialogo pop-up 12 segundos despues de jugar el chorrito
				}
				setTimeout(function(){location.reload(true);},timeout+3610000); //obliga a hacer un refrescamiento de la pagina en una hora
				Reportar(estatus_reporte); // manda el reporte cada hora
			} else {
				setTimeout(function(){location.reload();},3610000); // nos vemos en una hora.
				if (hay_captcha) estatus_reporte="Balance al día (captcha)";
				if (timer_running) estatus_reporte="Balance al día (timer running)";
				if (bloqueo_ip) estatus_reporte="Balance al día (bloqueo ip)";
				Reportar(estatus_reporte); // reportar cada hora de todas formas
			}
		} else { //si no está autorizado
      textoventanita+="<p>La cuenta "+userID+" no esta autorizada para usar este robot."+
        "Por lo tanto, la paloma sea contigo.</p>";
		}
    ventanita.innerHTML=textoventanita;
    document.body.appendChild(ventanita);
	} // accion_principal
	  // premios es un objeto con una función para activar bonos para
	  // acrecentar rápidamente los puntos reward y cobrar el bono
	  // de aumento premio por lanzamiento cuando tengas suficientes puntos.
	  var premios = {};
	  var estatus_reporte = "Balance a la hora";
	  premios.rutina = function() {
		  var prob_bonos = 0;
      premios.puntos = parseInt(document.querySelectorAll('.user_reward_points')[0].innerHTML.replace(',',""));
      premios.temporizadorbono = {};
      if (document.getElementById("bonus_container_free_points")!== null) {
        premios.temporizadorbono.texto = document.getElementById("bonus_span_free_points").innerHTML;
        premios.temporizadorbono.hora = parseInt(premios.temporizadorbono.texto.split(":")[0]);
        premios.temporizadorbono.minuto = parseInt(premios.temporizadorbono.texto.split(":")[1]);
        premios.temporizadorbono.segundo = parseInt(premios.temporizadorbono.texto.split(":")[2]);
        estatus_reporte+=" ("premios.temporizadorbono.texto+")";
        premios.temporizadorbono.actual = premios.temporizadorbono.hora * 3600 + premios.temporizadorbono.minuto * 60 + premios.temporizadorbono.segundo;
      } else
        premios.temporizadorbono.actual = 0;
        if (premios.temporizadorbono.actual === 0 & tiemporestante()===0) {
			    if (premios.puntos>4854) {
				    RedeemRPProduct('free_points_100');
				    setTimeout(function(){RedeemRPProduct('fp_bonus_1000');},500);
            estatus_reporte="Activando los bonos de 100RP y 1000% por lanzamiento.";
			    }
			    else if (premios.puntos>2800) {
				    prob_bonos=444/1280;
				    if (Math.random()<prob_bonos) {
					    RedeemRPProduct('free_points_100');
					    setTimeout(function(){RedeemRPProduct('fp_bonus_100');},500);
					    estatus_reporte="Activando los bonos de 100RP y 100% por lanzamiento.";
				    } else {
					    RedeemRPProduct('free_points_100');
					    setTimeout(function(){RedeemRPProduct('fp_bonus_500');},500);
					    estatus_reporte="Activando los bonos de 100RP y 500% por lanzamiento.";
            }
          }
			    else if (premios.puntos>2120) {
				    if (Math.random()<0.4) {
					    RedeemRPProduct('free_points_100');
              setTimeout(function(){RedeemRPProduct('fp_bonus_100');},300);
					    setTimeout(function(){RedeemRPProduct('free_lott_50');},600);
					    estatus_reporte="Activando los bonos de 100RP, 100% por lanzamiento y 50 TL.";
			    	}
				    else {
					    RedeemRPProduct('free_points_100');
					    setTimeout(function(){RedeemRPProduct('fp_bonus_100');},500);
					    estatus_reporte="Activando los bonos de 100RP y 100% por lanzamiento.";
		    		}
          }
    			else if (premios.puntos>1200) {
			    	estatus_reporte="Activando el bono de 100RP por lanzamiento.";
				    RedeemRPProduct('free_points_100');
		    	}
			    else if (premios.puntos>600) {
				    estatus_reporte="Activando el bono de 50RP por lanzamiento.";
				    RedeemRPProduct('free_points_50');
          }
			    else if (premios.puntos>120) {
				    estatus_reporte="Activando el bono de 10RP por lanzamiento.";
				    RedeemRPProduct('free_points_10');
			    }
			    else if (premios.puntos>20) {
            estatus_reporte="Activando el bono de 1RP por lanzamiento.";
				    RedeemRPProduct('free_points_1');
			    }
		   }
	   };

	  var autorizado=true;
	  // datos de esta cuenta
	  var userID = (((document.getElementById('edit_tab')).getElementsByTagName('p')[0]).getElementsByTagName('span')[1]).innerHTML;
	  userID = parseInt(userID);
	  var balance_BTC = parseFloat(document.getElementById('balance').innerHTML);
	  var balance_PR = parseInt(document.querySelectorAll('.user_reward_points')[0].innerHTML.replace(',',""));
	  var acct_email=document.getElementById('edit_profile_form_email').value;
	  var estado="Estoy despierto.";
	  // verifica si hay captcha u otras condiciones
	  var hay_captcha=(document.getElementById('captchasnet_free_play_captcha').style.display!=="none")||(document.getElementById('free_play_recaptcha').style.display!=="none");
	  var timer_running=document.getElementById('multi_acct_same_ip').style.display!=="none";
	  var bloqueo_ip=document.getElementById('free_play_error').style.display!="none";
	  var estado_captcha="";
	  var color_robot="#054908";
	  if (hay_captcha) {estado_captcha="¡Fokin Captcha! Reportando a mi amo..."; color_robot="#a40000";}
	  if (timer_running) {estado_captcha="El reloj está corriendo. Reportando a mi amo..."; color_robot="#a40000";}
	if (!timer_running & !hay_captcha) {
		estado_captcha="Voy a cobrar el chorrito";
		if (document.getElementById("bonus_container_free_points")!== null) {estado_captcha+=".";}
		else {estado_captcha+=" y también voy a activar bonos (si tengo suficientes RP).";}
	}
 	setTimeout(accion_principal,2000); // espera 2 seg para ver si está autorizado o no y ejecuta el resto.
})();
