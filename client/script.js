
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
    const regex = /^command\s/
    if(msg.match(regex)){
     item.style.color = 'red';
    }
    else{
        item.style.color = 'black';
    }
    window.scrollTo(0, document.body.scrollHeight);
}


//speak button
var SpeechRecognition = SpeechRecognition || webkitSpeechRecognition;

var recordBtn = document.querySelector('#recordBtn');
recordBtn.addEventListener('click', textSpeech);

//get language
var language= 'en-US' //default
function getLang(){
    const langCheckbox = document.querySelector('#lang');
    langCheckbox.addEventListener('change', (event) => {
        if (event.target.checked) {
            // The checkbox is checked
            language = 'es-MX'
            //console.log('Spanish');
        } 
        else {
            // The checkbox is not checked
            language = 'en-US'
            //console.log('English');
        }
    });
    return language
}
//record speech





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
// var texts = document.querySelectorAll('ul > li');
// texts.forEach(text => { text.addEventListener('click', speak => {console.log('hi')})})
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