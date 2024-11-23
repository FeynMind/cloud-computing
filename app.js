import app from "./server";

const port = process.env.PORT || 9000;

const startServer = () => {
  app.listen(port, () => {
   
    console.log(` http://Localhost:${port} `);
  });
};

startServer();
