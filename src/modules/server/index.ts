/* eslint-disable no-console */
import bodyParser from 'body-parser';
import type { Router } from 'express';
import express from 'express';
import type { Express } from 'express-serve-static-core';
import * as http from 'http';

import { errorHandler } from '../../middlewares/ErrorHandler';
import requestID from '../../middlewares/requestID';

/**
 * @since 1.0.0
 */
export class HttpServer {
  protected app: Express;
  public http: http.Server;
  public port: number;

  /**
   * @todo logging framework
   * @todo logging middleware
   * @todo session
   */
  constructor(port: number) {
    this.app = express();

    // =====   MIDDLEWARES   ===== //
    // Append ID to incoming request
    this.app.use(requestID());

    // parse application/x-www-form-urlencoded
    this.app.use(bodyParser.urlencoded({ extended: false }));

    // parse application/json
    this.app.use(bodyParser.json());

    this.port = port;
    this.http = http.createServer(this.app);
  }

  public start() {
    // default error handler
    this.app.use(errorHandler);

    console.log(`starting the server on port ${this.port}`);
    this.http.listen(this.port);
  }

  public loadRoutes(basePath: string, router: Router) {
    console.log(`loading routes: ${basePath}`);
    this.app.use(basePath, router);
  }
}
