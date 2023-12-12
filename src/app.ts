/* eslint-disable no-console */
import { config } from './config';
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
    console.info('server started');
  }
}

const app = new App();
/**
 * @todo logger
 */
app.init().then(() => {
  console.info('App init completed');
});
