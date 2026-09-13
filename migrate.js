const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'backend', 'finora.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error connecting to database:', err.message);
    process.exit(1);
  }
});

db.serialize(() => {
  db.run("BEGIN TRANSACTION");
  
  db.run(`CREATE TABLE IF NOT EXISTS transactions_new (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sn TEXT NOT NULL,
    date TEXT NOT NULL,
    final_description TEXT,
    created_by TEXT
  )`, (err) => {
    if (err) { console.error("Error creating table", err); return; }
  });

  db.run(`INSERT INTO transactions_new (id, sn, date, final_description, created_by) 
          SELECT id, sn, date, final_description, created_by FROM transactions`, (err) => {
    if (err) { console.error("Error inserting data", err); return; }
  });

  db.run(`DROP TABLE transactions`, (err) => {
    if (err) { console.error("Error dropping table", err); return; }
  });

  db.run(`ALTER TABLE transactions_new RENAME TO transactions`, (err) => {
    if (err) { console.error("Error renaming table", err); return; }
  });

  db.run("COMMIT", (err) => {
    if (err) {
      console.error("Transaction failed", err);
    } else {
      console.log("Migration successful");
    }
    db.close();
  });
});
