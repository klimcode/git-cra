/* eslint-disable no-console */
module.exports = {
  LOG: console.log,
  ERR: console.error,

  // LOG: (msg, extra) => {
  //   console.log('\x1b[35m%s\x1b[0m', msg, '\n');
  //   if (extra) console.log(...[...arguments].slice(1));
  // },
  // ERR: (msg, extra) => {
  //   console.error('\x1b[31m%s\x1b[0m', msg, '\n');
  //   if (extra) console.error(...[...arguments].slice(1));
  // },
};
