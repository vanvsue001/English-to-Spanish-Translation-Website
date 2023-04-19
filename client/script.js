
const socket = io('http://localhost:3000')
socket.on('connect', () =>{
    const connection = document.querySelector('#connection')
    connection.innerHTML = `connection id: ${socket.id}`
})

socket.on("audio-clients", async (arrayBuffer, msg, lang) => {
    displayMessage(arrayBuffer, msg, lang, 'cyan')       
})

async function displayMessage(arrayBuffer, msg, lang, color){
     //create text with native langauage
     var item = document.createElement('li');
     item.classList.add(
             'outline-1',
             'outline-gray-300',
             'font-bold',
             'text-left',
             'w-full', 
             'p-2',
             'mb-1',
             `bg-${color}-200`,
             `hover:bg-${color}-100`,
             'rounded',
          )
     item.setAttribute('lang', lang)
     item.textContent = msg;
     messages.appendChild(item);
 
 
     //add audio to item   
     var audio2 = document.createElement("audio");
     item.appendChild(audio2)
     
     var blob = new Blob([arrayBuffer], { type: "audio/ogg; codecs=opus" });
     var audioURL= window.URL.createObjectURL(blob);
     audio2.src = audioURL
     item.addEventListener("click", function () {
         audio2.play();
     });
     
    window.scrollTo(0, document.body.scrollHeight);

    //create text with translated langauage
    var translatedItem = document.createElement('li');
    translatedItem.classList.add(
            'outline-1',
            'outline-gray-300',
            'font-bold',
            'text-left',
            'w-full', 
            'p-2',
            'mb-3',
            `bg-${color}-200`,
            `hover:bg-${color}-100`,
            'rounded',
            )
    translatedItem.setAttribute('lang', lang)
    var transatedText = await translateText(msg, lang)
    translatedItem.textContent = transatedText;
    messages.appendChild(translatedItem);

    //add speak to translated item
    translatedItem.addEventListener('click', function (){speak(transatedText, lang == 'en-US' ? 'es-MX': 'en-US' )}); //so it won't call immediately

}

var SpeechRecognition = SpeechRecognition || webkitSpeechRecognition;

var speakBtn = document.querySelector('#speakBtn');
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
                ping.style.display = 'block'

                //start recording
                mediaRecorder.start();
            }
            recognition.onaudioend = function(event) {
                ping.style.display = 'none'

            }
            var speechResult = '';
            recognition.onresult = (event) => {
                speechResult = event.results[0][0].transcript.toLowerCase();
                //stop recording
                mediaRecorder.stop();
            }

            mediaRecorder.onstop = function(e) {
                const blob = new Blob(chunks, { 'type' : 'audio/ogg; codecs=opus' });
                socket.emit('audio', blob, speechResult, lang);
                displayMessage(blob, speechResult, lang, 'orange') //message of self
                chunks = [];
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

var language= 'en-US' //default
const langCheckbox = document.querySelector('#lang');
    langCheckbox.addEventListener('change', (event) => {
        if (event.target.checked) {
            language = 'es-MX'
        } 
        else {
            language = 'en-US'
        }
    });
function getLang(){
    return language
}

async function  translateText(text, lang) {
    translate.engine = "google";
    if(lang == "en-US"){
        translate.from = "en";
        const translatedText = await translate(text, "es");
        return translatedText

    }
    else if(lang == "es-MX"){
        translate.from = "es";
        const translatedText = await translate(text, "en");
        return translatedText

    }
    else{
        return 'error unexpected language'
    }
}

var SpeechRecognitionEvent = SpeechRecognitionEvent || webkitSpeechRecognitionEvent;
const synth = window.speechSynthesis;

function speak(text, lang){
    if (lang == "en-US") {
        const utterThis = new SpeechSynthesisUtterance(text);
        const voices = speechSynthesis.getVoices();
        utterThis.voice = voices[2];
        synth.speak(utterThis);
    }
    if (lang == "es-MX") {
        const utterThis = new SpeechSynthesisUtterance(text);
        const voices = speechSynthesis.getVoices();
        utterThis.voice = voices[7];
        synth.speak(utterThis);
    }
}