'use strict';

// Here's a JavaScript-based config file.
// If you need conditional logic, you might want to use this type of config.
// Otherwise, JSON or YAML is recommended.

module.exports = {
  'check-leaks': true,
  bail: true,
  // diff: true,
  'inline-diffs': true,
  // file: [
  //   'babel.mocha.js',
  //   'test_helper.js'
  // ],
  spec: [
    './src/**/*_test.ts',
  ],
  ignore: [
    "./**/!(*_test.ts)",
    "node_modules"
  ],
  require: [
    'ts-node/register',
    'test_helper.ts'
  ],
  extension: ['ts'],
  package: './package.json',
  reporter: 'spec',
  slow: 75,
  timeout: 2000,
  ui: 'bdd',
  'watch-files': ['./src/**/*.ts'],
  'watch-ignore': ['node_modules']
};