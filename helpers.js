/* eslint-disable no-console */
module.exports = {
  LOG: (msg, extra) => {
    console.log('\x1b[1m%s\x1b[0m', msg);
    if (extra) console.log(...[...arguments].slice(1));
  },
  ERR: (msg, extra) => {
    console.error('\x1b[31m%s\x1b[0m', msg);
    if (extra) console.error(...[...arguments].slice(1));
  },
};
