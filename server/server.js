const io = require('socket.io')(3000,{
  cors:{
    origin: ['http://localhost:5500', 'http://127.0.0.1:5500'],
  }
})
io.on('connection', socket =>{
    console.log(`user ${socket.id} connected`);
    socket.on('disconnect', () => {
      console.log('user disconnected');
    });

  socket.on('audio', (data, msg, lang) => {
    console.log('data received by server')
    socket.broadcast.emit('audio-clients', data, msg, lang);
  });
})
