
var IMBUE = IMBUE || {};

$(document).ready(function () {
	'use strict';

	IMBUE.init = (function() {
		console.log('Called init');

		var pointer, pointerX = 0, pointerY = 0,
			playing = false,
			audioContext, jsNode, theremin;

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

		function audioProcess(event) {
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