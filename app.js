import app from './server.js';

const port = process.env.PORT || 8080;

const startServer = () => {
  app.listen(port, () => {  // Ganti 'server' menjadi 'app'
    // eslint-disable-next-line
    console.log(`Whoooosshhh speed ${port} 🚀`);
  });
};

startServer();
