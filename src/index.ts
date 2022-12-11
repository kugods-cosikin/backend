import http from 'http';

import expressLoader from '@/config/express';
import AppDataSource from './config/app-data-source';

const createServer = async () => {
  const app = expressLoader();
  const httpServer = http.createServer(app);
  await AppDataSource.initialize();
  console.log('database connected');

  // maybe, we're attatching socket io server here
  // const io = new socketio.Server(server);

  // todo - different dev and prod settings
  const port = process.env.PORT || 8080;

  httpServer.listen(port, () => {
    console.log(`server listening on port ${port}`);
  });
};

createServer()
  .then(() => {
    console.log('server created');
  })
  .catch((err) => {
    console.log(err);
  });
