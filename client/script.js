
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
        //console.log(mediaRecorder.state);
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
        // mediaRecorder.requestData();
  
        stop.disabled = true;
        recordBtn.disabled = false;
      });
 

    mediaRecorder.onstop = function(e) {
      //console.log("data available after MediaRecorder.stop() called.");
      console.log("recorder stopped");

      const blob = new Blob(chunks, { 'type' : 'audio/ogg; codecs=opus' });
      
      chunks = [];
      const audioURL = window.URL.createObjectURL(blob);
      console.log(blob)
      
      //console.log("recorder stopped");
      

    }

    mediaRecorder.ondataavailable = function(e) {
      chunks.push(e.data);
      console.log('chunks: ');
      console.log(chunks);

      //socket.emit('send-blob', 'hola from js client');
      socket.emit('send-blob', chunks);
      
      socket.on('send-blob', function(chunks){
        var bufView = new Int32Array(chunks);
        console.log('chuncks: ')
        console.log(chunks)
      });
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