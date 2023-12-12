import type { Bindings as PinoBindings, LoggerOptions as PinoOptions } from 'pino';
import pino from 'pino';

import { config } from '../../config';

/////   LOGGER OPTIONS FROM CONFIG   /////
// default options
/**
 * @since 1.0.0
 */
const loggerOptions: PinoOptions = {
  level: config.logging.level,
  // in JSON format, since we deploy in k8s, remove useless pid and hostname
  redact: {
    paths: ['pid', 'hostname'],
    remove: true,
  },
};

// eventually, replace log level number with label string
if (config.logging.printLevelAsLabel) {
  loggerOptions.formatters = {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    level: (label: string, _number: number) => {
      return { level: label.toUpperCase() };
    },
  };
}

// print nicely when logging in non-json format
if (config.logging.prettyPrint) {
  loggerOptions.transport = {
    target: 'pino-pretty',
    options: {
      colorize: true,
    },
  };
}

// timestamp transform function
let _timestampFn: PinoOptions['timestamp'] | false = false;
switch (config.logging.printTime) {
  case 'epoch':
    _timestampFn = pino.stdTimeFunctions.epochTime;
    break;
  case 'unix':
    _timestampFn = pino.stdTimeFunctions.unixTime;
    break;
  case 'iso':
    _timestampFn = pino.stdTimeFunctions.isoTime;
    break;
  case 'null':
    _timestampFn = pino.stdTimeFunctions.nullTime;
    break;
  default:
    // eslint-disable-next-line no-console
    console.warn(`invalid logger configuration for timestamp logging: '${config.logging.printTime}'`);
}
loggerOptions.timestamp = _timestampFn;

/////   LOGGER   /////
/**
 * @since 1.0.0
 */
const logger = pino(loggerOptions);

export default logger;

// re-export type to centralize pino imports only in this file
export type LoggerOptions = PinoOptions;
export type ChildLoggerBinding = PinoBindings;
export type Logger = typeof logger;
