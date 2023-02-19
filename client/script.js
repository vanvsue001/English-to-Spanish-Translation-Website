
const socket = io('http://localhost:3000')
socket.on('connect', () =>{
    displayMessage(`You connected with id ${socket.id}`)
})


socket.on('send-clients', (message, lang) =>{ //messages from server
    displayMessage(message,'gray-200', lang)
})


//const audioCtx = new AudioContext();
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
let source;

    socket.on('audio', (data) => {
        console.log('client got data')
        audioCtx.decodeAudioData(data,(buffer) => {
                if (!source) {
                    source = audioCtx.createBufferSource();
                    source.buffer = buffer;
                    source.connect(audioCtx.destination);
                    source.start();
                } else {
                    source.buffer = buffer;
                }
            },
            (err) => {
                console.error(`Error decoding audio data: ${err}`);
            }
        ); 
    });

    //play
    var playBtn = document.querySelector('#playBtn');
    playBtn.addEventListener('click', () => {
        if (!source) {
        console.error('No audio data loaded');
        return;
        }
        source.start(0);
    });

 


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
    item.addEventListener('click', speak);
    window.scrollTo(0, document.body.scrollHeight);
}


//speak button
var SpeechRecognition = SpeechRecognition || webkitSpeechRecognition;

var speakBtn = document.querySelector('#speakBtn');
speakBtn.addEventListener('click', textSpeech);

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

    recordBtn.addEventListener('click', function() {
        mediaRecorder.start();
        console.log("recorder started");
        recordBtn.style.background = "red";
  
  
        stop.disabled = false;
        recordBtn.disabled = true;
    });
    
    stopBtn.addEventListener('click', function() {
        mediaRecorder.stop();
        //console.log(mediaRecorder.state);
        //console.log("recorder stopped");
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




        // //play
        // const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        // let source;

        // var playBtn = document.querySelector('#playBtn');
        // playBtn.addEventListener('click', () => {
        //     getData();
        //     source.start(0);
        //     playBtn.setAttribute("disabled", "disabled");
        // });

        // function getData() {
        //     source = audioCtx.createBufferSource();
        //     const request = new XMLHttpRequest();
        
        //     request.open("GET", audioURL, true);
        
        //     request.responseType = "arraybuffer";
        
        //     request.onload = () => {
        //     const audioData = request.response;
        
        //     audioCtx.decodeAudioData(
        //         audioData,
        //         (buffer) => {
        //         source.buffer = buffer;
        
        //         source.connect(audioCtx.destination);
        //         source.loop = true;
        //         },
        
        //         (err) => console.error(`Error with decoding audio data: ${err.err}`)
        //     );
        //     };
        
        //     request.send();
        // }

       
      }
  

    mediaRecorder.ondataavailable = function(e) {
      chunks.push(e.data);
      console.log('data sent to server: ');
      console.log(e.data);

      socket.emit('audio', e.data);

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