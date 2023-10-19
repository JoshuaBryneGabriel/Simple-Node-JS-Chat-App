const cluster = require('cluster');
const numCPUs = require('os').cpus().length;
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

if (cluster.isMaster) {
  console.log(`Master ${process.pid} is running`);

  // Fork workers.
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }
  cluster.on('exit', (worker, code, signal) => {
    console.log(`worker ${worker.process.pid} died`);
  });
} else {
  const app = express();
  const server = http.createServer(app);
  const io = socketIo(server);

  const PORT = process.env.PORT || 3000;
  const LOCAL_IP ='192.168.10.129';

  // Serve static files from the root directory (ChatApp)
  app.get('/', (req, res) => {
      res.sendFile(path.join(__dirname, 'index.html'));
  });  

  io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('chat message', (message) => {
      io.emit('chat message', message);
    });

    socket.on('disconnect', () => {
      console.log('A user disconnected');
    });
  });

  server.listen(PORT, LOCAL_IP, () => {
      console.log(`Server is running on http://${LOCAL_IP}:${PORT}`);
  });

  console.log(`Worker ${process.pid} started`);
}
