
var IMBUE = IMBUE || {};

$(document).ready(function () {
	'use strict';

	IMBUE.init = (function() {
		console.log('Called init');

		var pointer, pointerX = 0, 
			pointerY = 0,
			playing = false,
			audioContext,
			jsNode,
			theremin,
			video = $("#live").get()[0],
			canvas = $("#canvas"),
			ctx = canvas.get()[0].getContext('2d');

		function getVideo() {
			var isStreaming = false,
			    video = document.getElementById('video'),
			    canvas = document.getElementById('canvas'),
			    con = canvas.getContext('2d'),
			    w = 200, 
			    h = 200;

			navigator.getUserMedia = (navigator.getUserMedia || 
			                          navigator.webkitGetUserMedia || 
			                          navigator.mozGetUserMedia || 
			                          navigator.msGetUserMedia);

			if (navigator.getUserMedia) {
			   
			    navigator.getUserMedia(
			     {
			        video:true,
			        audio:false
			     },        
		         function(stream) {
		            var url = window.URL || window.webkitURL;
		            video.src = url ? url.createObjectURL(stream) : stream;
		            video.play();
		         },
		         function(error) {
		            console.log('Something went wrong. (error code ' + error.code + ')');
		            return;
		         }
			  );
			}
			else {
			  console.log('Sorry, the browser you are using doesn\'t support getUserMedia');
			  return;
			}

			video.addEventListener('canplay', function(e) {
			   if (!isStreaming) {
			      // videoWidth isn't always set correctly in all browsers
			      if (video.videoWidth > 0) h = video.videoHeight / (video.videoWidth / w);
			      canvas.setAttribute('width', w);
			      canvas.setAttribute('height', h);
			      // Reverse the canvas image
			      con.translate(w, 0);
			      con.scale(-1, 1);
			      isStreaming = true;
			   }
			}, false);


			video.addEventListener('play', function() {

				var red = [],
				    green = [],
				    blue = [],
				    alpha = [];

			    function getCrossection(){
			    	//console.log('getCrossection');

				    var v, crossSection = [];

				    for(v = 75; v < red.length; v = v + 74){

				    	crossSection.push(v);

				    }

				    function runTheremin(){

					    for(var l = 0; l < crossSection.length; l++){

							theremin.setPitchBend( (red[crossSection[l]] + green[crossSection[l]] +  blue[crossSection[l]]) / 3000 );
							theremin.volume = 1 -  (red[crossSection[l]] + green[crossSection[l]] +  blue[crossSection[l]]) / 3000;

							if(l == crossSection.length){

								runTheremin();

							}

					    }
					}

					runTheremin();

				}
	
				setInterval(function() {

					if (video.paused || video.ended) return;
					con.fillRect(0, 0, w, h);
					con.drawImage(video, 0, 0, w, h);

					var imgData = con.getImageData(0,0,canvas.width,canvas.height);
					var data = imgData.data;
    				var index = 0;

				    for (var y = 0; y < 100; y += 2) {

				        for (var x = 0; x < 200; x += 2) {
				            index = (y * imgData.width + x) * 4;

				            red.push(data[index]);
				            green.push(data[index + 1]);
				            blue.push(data[index + 2]);
				            alpha.push(data[index + 3]);

				        }
				    }

					getCrossection();

				}, 33);

			}, false);

		};

		var audioProcess = function(event) {
			//console.log('Called audioProcess');

			var buffer = event.outputBuffer,
				bufferLeft = buffer.getChannelData( 0 ),
				numSamples = bufferLeft.length,
				synthOutputBuffer = [];

			if(playing) {
				synthOutputBuffer = theremin.getBuffer( numSamples );
				for(var i = 0; i < synthOutputBuffer.length; i++) {
					bufferLeft[i] = synthOutputBuffer[i];
				}
			} else {
				for(var i = 0; i < numSamples; i++) {
					bufferLeft[i] = 0;
				}
			}
		}

		var initAudio = function() {
			//console.log('Called initAudio');

			theremin = new Theremin();
			
			var audioContext;

			try {
				// Fix up for prefixing
				window.AudioContext = window.AudioContext||window.webkitAudioContext;
				audioContext = new AudioContext();
			}
				catch(e) {
				alert('Web Audio API is not supported in this browser');
			}


			//jsNode = audioContext.createJavaScriptNode(4096);

			jsNode = audioContext.createScriptProcessor(2048, 1, 1);
			jsNode.onaudioprocess = audioProcess;

			jsNode.connect( audioContext.destination );
		}
			
		initAudio();

		document.getElementById('start').addEventListener('click', function(e) {

			e.preventDefault();

			var $this = $(this), videoReq = false;

			if(!$this.hasClass('stop')){

				if(videoReq === false){

					videoReq = true;
					getVideo();

				}

				playing = !playing;

				$this.text('Stop').addClass('stop');

			} else {

				playing = !playing;

				$this.text('Start').removeClass('stop');

			}

		}, false);

	}());

});