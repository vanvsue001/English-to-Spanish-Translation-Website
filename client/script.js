
const socket = io('http://localhost:3000')
socket.on('connect', () =>{
    displayMessage(`You connected with id ${socket.id}`)
})


socket.on('send-clients', (message, lang) =>{ //messages from server
    displayMessage(message,'gray-200', lang)
})

var form = document.getElementById('form');
var input = document.getElementById('input');
form.addEventListener('submit', function(e) {
  const message = input.value
  e.preventDefault();
  if (input.value) {
    var lang = getLang();
    socket.emit('send-message', message, lang);
    displayMessage(message, 'gray-400', lang) //display message you wrote
    input.value = '';
  }
});

function displayMessage(msg, color, lang){
    var item = document.createElement('li');
    item.classList.add(
            'outline-1',
            'outline-gray-300',
            'font-bold',
            'text-left',
            'w-full', 
            'p-2',
            'mb-1',
            //'bg-gray-300',
            `bg-${color}`,
            'rounded',
         )
    item.setAttribute('lang', lang)
    item.textContent = msg;
    messages.appendChild(item);
    //item.addEventListener('click', speak);
    //var playBtn = document.querySelector('#playBtn');
        
    var audio2 = document.createElement("audio");

    socket.on("audio", function (arrayBuffer) {
        var blob = new Blob([arrayBuffer], { type: "audio/ogg; codecs=opus" });
        console.log(blob);
        item.addEventListener("click", function () {
            // Create a new audio element and set the source to the Blob URL    
            audio2.src = window.URL.createObjectURL(blob);
            audio2.play();
        });
    });
    window.scrollTo(0, document.body.scrollHeight);
}


//speak button
var SpeechRecognition = SpeechRecognition || webkitSpeechRecognition;

var speakBtn = document.querySelector('#speakBtn');
// speakBtn.addEventListener('click', textSpeech);
speakBtn.addEventListener('click', speakAndRecord);

function speakAndRecord(){
    if (navigator.mediaDevices.getUserMedia) {
        console.log('getUserMedia supported.');
      
        const constraints = { audio: true };
        let chunks = [];
      
        let onSuccess = function(stream) {
          const mediaRecorder = new MediaRecorder(stream);

            console.log('listening...')
            var recognition = new SpeechRecognition();
            var lang = getLang()
            recognition.lang = lang;
            recognition.start(); 

            var ping = document.querySelector('#ping');
            recognition.onaudiostart = function(event) {
                //Fired when the user agent has started to capture audio.
                console.log('SpeechRecognition.onaudiostart');   
                ping.style.display = 'block'

                //start recording -------------------
                mediaRecorder.start();
                console.log("recorder started");
                recordBtn.style.background = "red";
                stop.disabled = false;
                recordBtn.disabled = true;
            }
            recognition.onresult = function(event){
                var speechResult = event.results[0][0].transcript.toLowerCase();
                console.log(speechResult)
                socket.emit('send-message', speechResult);
                displayMessage(speechResult, 'gray-400', lang)
            }
            recognition.onaudioend = function(event) {
                //Fired when the user agent has finished capturing audio.
                console.log('SpeechRecognition.onaudioend');
                ping.style.display = 'none'

                //stop recording--------------------
                mediaRecorder.stop();
                recordBtn.style.background = "";
                recordBtn.style.color = "";

                stop.disabled = true;
                recordBtn.disabled = false;
            }

            //after mediaRecorder stopped

            mediaRecorder.onstop = function(e) {
                console.log("data available after MediaRecorder.stop() called.");
          
                const clipName = prompt('Enter a name for your sound clip?','My unnamed clip');
          
                const clipContainer = document.createElement('article');
                const clipLabel = document.createElement('p');
                const audio = document.createElement('audio');
                const deleteButton = document.createElement('button');
          
                clipContainer.classList.add('clip');
                audio.setAttribute('controls', '');
                deleteButton.textContent = 'Delete';
                deleteButton.className = 'delete';
          
                if(clipName === null) {
                  clipLabel.textContent = 'My unnamed clip';
                } else {
                  clipLabel.textContent = clipName;
                }
          
                clipContainer.appendChild(audio);
                clipContainer.appendChild(clipLabel);
                clipContainer.appendChild(deleteButton);
                soundClips.appendChild(clipContainer);
          
                audio.controls = true;
                const blob = new Blob(chunks, { 'type' : 'audio/ogg; codecs=opus' });
                console.log(blob)
                socket.emit('audio', blob);
                chunks = [];
                const audioURL = window.URL.createObjectURL(blob);
                audio.src = audioURL;
                console.log("recorder stopped");
          
                deleteButton.onclick = function(e) {
                  e.target.closest(".clip").remove();
                }
          
                clipLabel.onclick = function() {
                  const existingName = clipLabel.textContent;
                  const newClipName = prompt('Enter a new name for your sound clip?');
                  if(newClipName === null) {
                    clipLabel.textContent = existingName;
                  } else {
                    clipLabel.textContent = newClipName;
                  }
                }
        
                //play
                const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
                let source;
        
                // var playBtn = document.querySelector('#playBtn');
        
                // var audio2 = document.createElement("audio");
        
                // socket.on("audio", function (arrayBuffer) {
                //     var blob = new Blob([arrayBuffer], { type: "audio/ogg; codecs=opus" });
                //     console.log(blob);
                //     playBtn.addEventListener("click", function () {
                //         // Create a new audio element and set the source to the Blob URL    
                //         audio2.src = window.URL.createObjectURL(blob);
                //         audio2.play();
                //     });
                // });
               
              }
          
        
            mediaRecorder.ondataavailable = function(event) {
              chunks.push(event.data);
            }
        }
        let onError = function(err) {
            console.log('The following error occured: ' + err);
        }
        
        navigator.mediaDevices.getUserMedia(constraints).then(onSuccess, onError);
    }
    else {
        console.log('getUserMedia not supported on your browser!');
    }
}

//get language
var language= 'en-US' //default
function getLang(){
    const langCheckbox = document.querySelector('#lang');
    langCheckbox.addEventListener('change', (event) => {
        if (event.target.checked) {
            language = 'es-MX'
        } 
        else {
            language = 'en-US'
        }
    });
    return language
}


//record speech
var recordBtn = document.querySelector('#recordBtn');
var stopBtn = document.querySelector('#stopBtn');
const soundClips = document.querySelector('.sound-clips');

// disable stop button while not recording
stop.disabled = true;

if (navigator.mediaDevices.getUserMedia) {
  console.log('getUserMedia supported.');

  const constraints = { audio: true };
  let chunks = [];

  let onSuccess = function(stream) {
    const mediaRecorder = new MediaRecorder(stream);

    //recordBtn.addEventListener('click', function() {
    speakBtn.addEventListener('click', function() {
        mediaRecorder.start();
        console.log("recorder started");
        recordBtn.style.background = "red";
  
  
        stop.disabled = false;
        recordBtn.disabled = true;
    });
    
    stopBtn.addEventListener('click', function() {
        mediaRecorder.stop();
        recordBtn.style.background = "";
        recordBtn.style.color = "";

        stop.disabled = true;
        recordBtn.disabled = false;
    });
 
    mediaRecorder.onstop = function(e) {
        console.log("data available after MediaRecorder.stop() called.");
  
        const clipName = prompt('Enter a name for your sound clip?','My unnamed clip');
  
        const clipContainer = document.createElement('article');
        const clipLabel = document.createElement('p');
        const audio = document.createElement('audio');
        const deleteButton = document.createElement('button');
  
        clipContainer.classList.add('clip');
        audio.setAttribute('controls', '');
        deleteButton.textContent = 'Delete';
        deleteButton.className = 'delete';
  
        if(clipName === null) {
          clipLabel.textContent = 'My unnamed clip';
        } else {
          clipLabel.textContent = clipName;
        }
  
        clipContainer.appendChild(audio);
        clipContainer.appendChild(clipLabel);
        clipContainer.appendChild(deleteButton);
        soundClips.appendChild(clipContainer);
  
        audio.controls = true;
        const blob = new Blob(chunks, { 'type' : 'audio/ogg; codecs=opus' });
        console.log(blob)
        socket.emit('audio', blob);
        chunks = [];
        const audioURL = window.URL.createObjectURL(blob);
        audio.src = audioURL;
        console.log("recorder stopped");
  
        deleteButton.onclick = function(e) {
          e.target.closest(".clip").remove();
        }
  
        clipLabel.onclick = function() {
          const existingName = clipLabel.textContent;
          const newClipName = prompt('Enter a new name for your sound clip?');
          if(newClipName === null) {
            clipLabel.textContent = existingName;
          } else {
            clipLabel.textContent = newClipName;
          }
        }

        //play
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        let source;

        var playBtn = document.querySelector('#playBtn');

        var audio2 = document.createElement("audio");

        item.appendChild(audio2); //keep multiple audios

        socket.on("audio", function (arrayBuffer) {
            var blob = new Blob([arrayBuffer], { type: "audio/ogg; codecs=opus" });
            console.log(blob);
            playBtn.addEventListener("click", function () {
                // Create a new audio element and set the source to the Blob URL    
                audio2.src = window.URL.createObjectURL(blob);
                audio2.play();
            });
        });
       
      }
  

    mediaRecorder.ondataavailable = function(event) {
      chunks.push(event.data);
      console.log('data sent to server: ');
      console.log(event.data);
    }
  }

  let onError = function(err) {
    console.log('The following error occured: ' + err);
  }

  navigator.mediaDevices.getUserMedia(constraints).then(onSuccess, onError);

} 
else {
   console.log('getUserMedia not supported on your browser!');
}





//text to speech
function textSpeech(){
    
    console.log('listening...')
    var recognition = new SpeechRecognition();
    var lang = getLang()
    recognition.lang = lang;
    console.log(recognition.lang)
    recognition.start(); 
    //show ping when audio start and turn off when ends
    var ping = document.querySelector('#ping');
    recognition.onresult = function(event){
        var speechResult = event.results[0][0].transcript.toLowerCase();
        console.log(speechResult)
        socket.emit('send-message', speechResult);
        displayMessage(speechResult, 'gray-400', lang)
        //resultsText.innerHTML = speechResult;

    }
    recognition.onaudiostart = function(event) {
        //Fired when the user agent has started to capture audio.
        console.log('SpeechRecognition.onaudiostart');   
        ping.style.display = 'block'
    }
    recognition.onaudioend = function(event) {
        //Fired when the user agent has finished capturing audio.
        console.log('SpeechRecognition.onaudioend');
        ping.style.display = 'none'
    }
}

//speak
var SpeechRecognitionEvent = SpeechRecognitionEvent || webkitSpeechRecognitionEvent;
const synth = window.speechSynthesis;

function speak(){
    var lang = this.lang
    console.log(this.lang);

    if (lang == "en-US") {
        const utterThis = new SpeechSynthesisUtterance(this.innerHTML);
        const voices = speechSynthesis.getVoices();
        utterThis.voice = voices[2];
        synth.speak(utterThis);
    }
    if (lang == "es-MX") {
        const utterThis = new SpeechSynthesisUtterance(this.innerHTML);
        const voices = speechSynthesis.getVoices();
        utterThis.voice = voices[7];
        synth.speak(utterThis);
    }
}