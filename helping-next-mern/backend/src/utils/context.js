const { AsyncLocalStorage } = require("node:async_hooks");

// Per-request store so model hooks can know *who* is performing a write
// (this is what powers the activity log, like Laravel's LogsActivity trait).
const als = new AsyncLocalStorage();

module.exports = {
  run: (fn) => als.run({ userId: null }, fn),
  setUser: (id) => {
    const store = als.getStore();
    if (store) store.userId = id;
  },
  getUserId: () => als.getStore()?.userId || null,
};
