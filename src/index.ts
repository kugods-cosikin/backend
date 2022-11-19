import express from 'express';
import helmet from 'helmet';
import http from 'http';
import dotenv from 'dotenv';

import router from '@/routes';


// create app of express
async function expressLoader() {

  const app = express();
  app.use(helmet());

  // parsers
  app.use(express.json());
  app.use(express.urlencoded({ extended: true, limit: '5mb' }));

  // app.use(logger) // todo - logger

  app.enable('trust proxy');


  app.use(router);
  app.all('*', (_, res) => {
    res.status(404).json({ data: null, error: { message: 'URL Not Found' } });
  });
  // app.use(errorHandler); // todo - error handler

  return app;
}

async function createServer() {
  dotenv.config();
  const app = await expressLoader();
  const httpServer = http.createServer(app);
  // maybe, we're attatching socket io server here
  // const io = new socketio.Server(server);

  // todo - different dev and prod settings
  const port = process.env.PORT || 8080;

  httpServer.listen(port, () => {
    console.log(`server listening on port ${port}`);
  });
}

createServer()
  .then(() => {
    console.log('server created');
  })
  .catch((err) => {
    console.log(err);
  });
