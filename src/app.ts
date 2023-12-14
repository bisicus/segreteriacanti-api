import { config } from './config';
import logger from './modules/logger';
import { HttpServer } from './modules/server';
import { v1Routes } from './routes/v1';

/**
 * @since 1.0.0
 */
class App {
  /**
   * @todo logger
   * @todo DB connection
   */
  public async init() {
    const server = new HttpServer(config.server.httpPort);
    server.loadRoutes('/api/v1/', v1Routes);
    server.start();
    logger.info('server started');
  }
}

const app = new App();
/**
 * @todo logger
 */
app.init().then(() => {
  logger.info('App init completed');
});
