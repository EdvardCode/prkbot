const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(__dirname+'/prk.db');
console.log("DB: Загружаем DataBase")
db.serialize(() => {
  console.log("DB: Загружена!")
  db.run(`CREATE TABLE IF NOT EXISTS users (
    userid VARCHAR(32) UNIQUE,
    subscribes TEXT DEFAULT "{}",
    mail BOOLEAN
    )`)

    // Эти чуваки ток посмотрели на списки и се... Зачем их хранить в бд
    db.run("DELETE FROM users WHERE subscribes = '{}'", (err) => {
      if (err) {  
        console.error(err)
      } else {
        console.log('Пользователи с пустыми subscribes удалены успешно');
      }
    });
});

db.createUser = async (id) => {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM users WHERE userid = ?', [id], (err, existingUser) => {
      if (err) {
        console.error(err)
        reject(err);
        return;
      }
      if (existingUser) {
        resolve(existingUser)
        return;
      }

      const insertQuery = 'INSERT INTO users (userid) VALUES (?)';
      db.run(insertQuery, [id], (err) => {
        if (err) {
          console.error(err)
          reject(err);
        } else {
          resolve('User created successfully');
        }
      });
    });
  });
};

db.getUser = async (id) => {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM users WHERE userid = ?', [id], (err, existingUser) => {
      if (err) {
        console.error(err)
        reject(err);
        return;
      }
      if (existingUser) {
        resolve(existingUser)
        return;
      }
      resolve()
    });
  });
};

db.getUserSubScribes = async (id) => {
  return new Promise((resolve, reject) => {
    db.get('SELECT subscribes FROM users WHERE userid = ?', [id], (err, existingUser) => {
      if (err) {
        console.error(err)
        reject(err);
        return;
      }
      if (existingUser) {
        resolve(existingUser)
        return;
      }
      resolve()
    });
  });
};


db.setUserSubScribe = async (id,subscribes) => {
  return new Promise((resolve, reject) => {
    db.run("UPDATE users SET subscribes = ? WHERE userid = ?", [subscribes, id], (err) => {
      if (err) {
        console.error(err)
        reject(err)
      } else {
        resolve()
      }
    });
  });
};


//db.close();

module.exports = db