/* eslint-disable no-console */
import bodyParser from 'body-parser';
import type { Router } from 'express';
import express from 'express';
import type { Express } from 'express-serve-static-core';
import * as http from 'http';

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
    // parse application/x-www-form-urlencoded
    this.app.use(bodyParser.urlencoded({ extended: false }));

    // parse application/json
    this.app.use(bodyParser.json());

    this.port = port;
    this.http = http.createServer(this.app);
  }

  public start() {
    console.log(`starting the server on port ${this.port}`);
    this.http.listen(this.port);
  }

  public loadRoutes(basePath: string, router: Router) {
    console.log(`loading routes: ${basePath}`);
    this.app.use(basePath, router);
  }
}
