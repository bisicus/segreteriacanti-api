import { join, resolve } from 'path';
import type { JestConfigWithTsJest } from 'ts-jest';

const rootDir = resolve(__dirname);

const config: JestConfigWithTsJest = {
  // [...]
  verbose: true,
  transform: {
    // '^.+\\.[tj]sx?$' to process js/ts with `ts-jest`
    // '^.+\\.m?[tj]sx?$' to process js/ts/mjs/mts with `ts-jest`
    '^.+\\.tsx?$': 'ts-jest',
  },
  globals: {
    rootDir: rootDir,
    assetsDir: join(rootDir, 'tests', '__assets__'),
  },
};

export default config;
