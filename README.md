# English-to-Spanish-Translation-Website

## About
This is a English to Spanish translation website. The top button allows you to toggle from Engligh to Spanish as
your primary langauage. Pushing the speak button will record audio and translate your speech to text that is then trans

## Downloading
After downloading the project make sure to
```
cd server
npm i 
node server
```
to download all dependencies and start the server.

use LiveServer click client folder to run index.html

copy and paste the url [should be http://localhost:5500/client/index.html] into new browser to connect multiple users to the server

## Technical Architecture
The backend of the application employs a web socket to enable the exchange of pub/sub messages among connected users. As long as users are connected to the same wifi network, they can all access the locally hosted service.

For the frontend, the functionality is implemented using JavaScript, while the styling is done using Tailwind. The application also uses Google for translation, and webkitSpeechRecognition to record and transcribe speech into text.
