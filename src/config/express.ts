import express from 'express';
import helmet from 'helmet';
import router from '@/routes';
// create app of express
const expressLoader = () => {
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
};

export default expressLoader;
