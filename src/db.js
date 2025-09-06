// src/db.js
console.log("⚠️  Database disabled: running in in-memory mode");

module.exports = {
  query: async () => {
    throw new Error("Database is disabled: using in-memory storage instead.");
  }
};
