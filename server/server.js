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

    socket.on('send-message',(message, lang) => {
      socket.broadcast.emit('send-clients', message, lang)
    })

  //   socket.on('send-blob', function(data){
  //     console.log("recieved data:");
  //     console.log(data);

  //     var bufArr = new ArrayBuffer(4);
  //     //var bufView = new Uint8Array(bufArr);
  //     var bufView = new Int32Array(bufArr);
  //     bufView[0]=6;
  //     bufView[1]=7;
  //     bufView[2]=8;
  //     bufView[3]=9;
  //     socket.emit('send-blob', bufArr);
  // });
  socket.on('audio', (data) => {
    console.log('data received by server')
    console.log(data);
    //socket.broadcast.emit('audio', data);
    socket.emit('audio', data.buffer);
  });
})
