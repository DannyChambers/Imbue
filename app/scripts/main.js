
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

		/*var frequencyToNoteNumber = function(f) {
			console.log('Called frequencyToNoteNumber');

			return Math.round(12 * Math.log(f / 440.0) + 69);
		}

		var noteNumberToNote = function(n) {
			console.log('Called noteNumberToNote');

			var notes = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'],
				name = n % 12,
				octave = Math.floor(n / 12) - 1,
				note = notes[name];

			return note + (note.length < 2 ? '-' : '') + octave;
		}

		var frequencyToNote = function(f) {
			console.log('Called frequencyToNote');

			return noteNumberToNote(frequencyToNoteNumber(f));
		}*/

		window.addEventListener('DOMContentLoaded', function() {
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
	
				// Every 3 second copy the video image to the canvas
				setInterval(function() {

					var red = [],
					    green = [],
					    blue = [],
					    alpha = [];

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

				    // log out any pixel here
				    console.log(red[1]);

				}, 3000);


			}, false);

		});


		var audioProcess = function(event) {
			console.log('Called audioProcess');

			var buffer = event.outputBuffer,
				bufferLeft = buffer.getChannelData( 0 ),
				bufferRight = buffer.getChannelData( 1 ),
				numSamples = bufferLeft.length,
				synthOutputBuffer = [];

			if(playing) {
				synthOutputBuffer = theremin.getBuffer( numSamples );
				for(var i = 0; i < synthOutputBuffer.length; i++) {
					bufferLeft[i] = synthOutputBuffer[i];
					bufferRight[i] = synthOutputBuffer[i];
				}
			} else {
				for(var i = 0; i < numSamples; i++) {
					bufferLeft[i] = 0;
					bufferRight[i] = 0;
				}
			}
		}

		var initAudio = function() {
			console.log('Called initAudio');

			theremin = new Theremin();
			
			audioContext = new webkitAudioContext();
			jsNode = audioContext.createJavaScriptNode(4096);
			jsNode.onaudioprocess = audioProcess;

			jsNode.connect( audioContext.destination );
		}

		if(AudioDetector.detects(['webAudioSupport'])) {

			window.addEventListener('mousemove', function(e) {
				pointerX = e.clientX;
				pointerY = e.clientY;

				theremin.setPitchBend( pointerX / window.innerWidth );
				theremin.volume = 1 - pointerY / window.innerHeight;

			}, false);
			
			initAudio();
		}

		document.getElementById('start').addEventListener('click', function(e) {

			e.preventDefault();

			playing = !playing;

		}, false);

	}());

});