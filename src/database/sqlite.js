/**
 * Module handles database management
 *
 * Server API calls the methods in here to query and update the SQLite database
 */

// Utilities we need
const fs = require("fs");
const dbFile = "./.data/library.db"; // cd .data    rm library.db    ls
const exists = fs.existsSync(dbFile);
const sqlite3 = require("sqlite3").verbose();
const { open } = require("sqlite");
const crypto = require("crypto-js");
const random = require("random");
const data_set = require("./data_set.json");
var db, dynamic, result;

/* 
We're using the sqlite wrapper so that we can make async / await connections
- https://www.npmjs.com/package/sqlite
*/

(async () => {
  const db = await open({
    filename: "/tmp/database.db",
    driver: sqlite3.Database,
  });

  try {
    await db.run(`
    CREATE TABLE users (
      id       INTEGER PRIMARY KEY AUTOINCREMENT,
      user     TEXT NOT NULL UNIQUE CHECK (length(user) >= 4),
      password TEXT NOT NULL        CHECK (length(password) >= 4)
    )
  `);

    await db.run(`
      CREATE TABLE logged (
        admin    TEXT UNIQUE
      )
  `);
    // Add default Admin user to the table
    await db.run(`
    INSERT INTO
    users (user, password)
    VALUES ("Admin", "${process.env.ADMIN_PASSWORD}")
  `);

    // Create books table
    console.log("Creating table class");
    await db.run(`CREATE TABLE class (
      code        TEXT    NOT NULL,
      name        TEXT    NOT NULL,
      professor      TEXT    NOT NULL,
      period       INTEGER NOT NULL,
      hours    INTEGER NOT NULL,
      description TEXT,
      id TEXT NOT NULL)`);
    // Add books from data_set to the table
    for (let materia of data_set) {
      try {
        await db.run(`
        INSERT INTO class
        VALUES (
          "${materia.code}",
          "${materia.name}",
          "${materia.professor}",
          "${materia.period}",
          "${materia.hours}",
          "${materia.description}",
          "${materia.id}"
        )
      `);
      } catch (error) {
        console.log(error);
      }
    }
    result = await db.all("SELECT COUNT(*) as counter FROM class");
    console.log(`${result[0].counter} classes inserted`);

    // Create rents table
    console.log("Creating table rents");
    await db.run(`
    CREATE TABLE rents (
      fk_user  INTEGER NOT NULL CHECK (fk_user > 1),
      isbn     TEXT    NOT NULL CHECK (length(isbn) = 10),
      end_date DATE    NOT NULL
    )
  `);
    console.log("Table rents created");
  } catch (error) {
    console.log("database exists");
    console.log(error);
  }
})();

// Our server script will call these methods to connect to the db
module.exports = {
  // Find user in the database

  setAdminAsLogged: async (isAdmin) => {
    console.log("exec db setAdminAsLogged");
    const db = await open({
      filename: "/tmp/database.db",
      driver: sqlite3.Database,
    });

    try {
      db.all(`
      DELETE FROM logged
      `);

      result = db.all(`
      INSERT INTO
      logged (admin)
      VALUES ("${isAdmin}")
      `);
      console.log("result", await result);
      return result;
    } catch (dbError) {
      // Database connection error
      console.error(dbError);
    }
  },

  getAdminLogged: async () => {
    console.log("exec db getAdminLogged");
    const db = await open({
      filename: "/tmp/database.db",
      driver: sqlite3.Database,
    });
    try {
      result = db.all(`
        SELECT *
        FROM logged
      `);
      return result;
    } catch (dbError) {
      // Database connection error
      console.error(dbError);
    }
  },

  getUser: async (user) => {
    console.log("exec db getUser");
    const db = await open({
      filename: "/tmp/database.db",
      driver: sqlite3.Database,
    });
    // We use a try catch block in case of db errors
    try {
      result = db.all(`
        SELECT *
        FROM users
        WHERE user="${user}"
      `);
      console.log("result", await result);
      return result;
    } catch (dbError) {
      // Database connection error
      console.error(dbError);
    }
  },

  // Get all users in the database
  getUsers: async () => {
    console.log("exec db getUsers");
    const db = await open({
      filename: "/tmp/database.db",
      driver: sqlite3.Database,
    });
    // We use a try catch block in case of db errors
    try {
      result = db.all(`
        SELECT *
        FROM users
      `);
      return result;
    } catch (dbError) {
      // Database connection error
      console.error(dbError);
    }
  },

  // Create a new user in the database
  createUser: async (user, password) => {
    const db = await open({
      filename: "/tmp/database.db",
      driver: sqlite3.Database,
    });
    console.log("exec db createUser");
    // We use a try catch block in case of db errors

    try {
      await db.run(`
        INSERT INTO
        users (user, password)
        VALUES ("${user}", "${password}")
      `);
    } catch (dbError) {
      // Database connection error
      console.error(dbError);
      throw dbError;
    }
  },

  // Update password of user in the database
  updatePassword: async (id, user, password) => {
    const db = await open({
      filename: "/tmp/database.db",
      driver: sqlite3.Database,
    });
    console.log("exec db deleteUser");
    // We use a try catch block in case of db errors
    try {
      await db.run(`
        UPDATE users
        SET password="${password}"
        WHERE
          id=${id} AND
          user="${user}"
      `);
    } catch (dbError) {
      // Database connection error
      console.error(dbError);
      throw dbError;
    }
  },

  // Delete a user in the database
  deleteUser: async (id, user) => {
    const db = await open({
      filename: "/tmp/database.db",
      driver: sqlite3.Database,
    });
    console.log("exec db deleteUser");
    // We use a try catch block in case of db errors
    try {
      await db.run(`
        DELETE FROM users
        WHERE
          id = ${id} AND
          user = "${user}"
      `);
    } catch (dbError) {
      // Database connection error
      console.error(dbError);
      throw dbError;
    }
  },

  // Get a book by isbn in the database
  getBook: async (isbn) => {
    const db = await open({
      filename: "/tmp/database.db",
      driver: sqlite3.Database,
    });
    console.log("exec db getBook");
    // We use a try catch block in case of db errors
    try {
      result = await db.all(`
        SELECT *
        FROM books
        WHERE isbn="${isbn}"
      `);
      return result;
    } catch (dbError) {
      // Database connection error
      console.error(dbError);
    }
  },

  // Get a book by name in the database
  getBookName: async (name) => {
    const db = await open({
      filename: "/tmp/database.db",
      driver: sqlite3.Database,
    });
    console.log("exec db getBookName");
    // We use a try catch block in case of db errors
    try {
      result = await db.all(`
        SELECT *
        FROM books
        WHERE lower(name)=lower("${name}")
      `);
      return result;
    } catch (dbError) {
      // Database connection error
      console.error(dbError);
    }
  },

  // Get all books in the database
  getClasses: async () => {
    const db = await open({
      filename: "/tmp/database.db",
      driver: sqlite3.Database,
    });
    console.log("exec db getCLasses");
    // We use a try catch block in case of db errors
    try {
      result = await db.all(`
        SELECT *
        FROM class
        ORDER BY code
      `);
      return result;
    } catch (dbError) {
      // Database connection error
      console.error(dbError);
    }
  },

  // Get all books with no inventory in the database
  getBooks0: async () => {
    const db = await open({
      filename: "/tmp/database.db",
      driver: sqlite3.Database,
    });
    console.log("exec db getBooks0");
    // We use a try catch block in case of db errors
    try {
      result = await db.all(`
        SELECT *
        FROM books
        WHERE quantity = 0
        ORDER BY name
      `);
      return result;
    } catch (dbError) {
      // Database connection error
      console.error(dbError);
    }
  },

  addSubject: async (materia) => {
    const db = await open({
      filename: "/tmp/database.db",
      driver: sqlite3.Database,
    });
    console.log("exec db addSubject");
    try {
      result = await db.all(`
      INSERT INTO class
      VALUES (
        "${materia.code}",
        "${materia.name}",
        "${materia.professor}",
        "${materia.period}",
        "${materia.hours}",
        "${materia.description}",
        "${materia.id}"
      )
      `);
      return result;
    } catch (dbError) {
      // Database connection error
      console.error(dbError);
    }
  },

  // Update book quantity in the database
  updateBook: async (
    isbn,
    name,
    author,
    pages,
    quantity,
    image,
    description
  ) => {
    const db = await open({
      filename: "/tmp/database.db",
      driver: sqlite3.Database,
    });
    console.log("exec db updateBook");
    // We use a try catch block in case of db errors
    try {
      await db.run(`
        UPDATE books
        SET
          name="${name}",
          author="${author}",
          pages=${pages},
          quantity=${quantity},
          image="${image}",
          description="${description}"
        WHERE isbn="${isbn}"
      `);
    } catch (dbError) {
      // Database connection error
      console.error(dbError);
      throw dbError;
    }
  },

  // Create book in the database
  createBook: async (
    isbn,
    name,
    author,
    pages,
    quantity,
    image,
    description
  ) => {
    const db = await open({
      filename: "/tmp/database.db",
      driver: sqlite3.Database,
    });
    console.log("exec db createBook");
    // We use a try catch block in case of db errors
    try {
      await db.run(`
        INSERT INTO books
        VALUES (
          "${isbn}",
          "${name}",
          "${author}",
          ${pages},
          ${quantity},
          "${image}",
          "${description}"
        )
      `);
    } catch (dbError) {
      // Database connection error
      console.error(dbError);
      throw dbError;
    }
  },

  // Delete a book in the database
  deleteBook: async (isbn, name) => {
    const db = await open({
      filename: "/tmp/database.db",
      driver: sqlite3.Database,
    });
    console.log("exec db deleteRent");
    // We use a try catch block in case of db errors
    try {
      await db.run(`
        DELETE FROM books
        WHERE
          isbn = ${isbn} AND
          name = "${name}"
      `);
    } catch (dbError) {
      // Database connection error
      console.error(dbError);
      throw dbError;
    }
  },

  // Create a rent in the database
  createRent: async (id_user, isbn, days) => {
    const db = await open({
      filename: "/tmp/database.db",
      driver: sqlite3.Database,
    });
    console.log("exec db createRent");
    // We use a try catch block in case of db errors
    try {
      await db.run(`
        INSERT INTO rents
        VALUES (
          ${id_user},
          "${isbn}",
          date('now', '+${days} day')
        )
      `);
    } catch (dbError) {
      // Database connection error
      console.error(dbError);
      throw dbError;
    }
  },

  // Find duplicate rent in the database
  duplicatedRent: async (user, isbn) => {
    const db = await open({
      filename: "/tmp/database.db",
      driver: sqlite3.Database,
    });
    console.log("exec db duplicatedRent");
    // We use a try catch block in case of db errors
    try {
      result = await db.all(`
        SELECT *
        FROM rents r
        JOIN users u ON
          r.fk_user = u.id
        WHERE
          u.user = "${user}" AND
          r.isbn = "${isbn}"
      `);
      return result;
    } catch (dbError) {
      // Database connection error
      console.error(dbError);
    }
  },

  // Delete a rent in the database
  deleteRent: async (id_user, isbn) => {
    const db = await open({
      filename: "/tmp/database.db",
      driver: sqlite3.Database,
    });
    console.log("exec db deleteRent");
    // We use a try catch block in case of db errors
    try {
      await db.run(`
        DELETE FROM rents
        WHERE
          fk_user = ${id_user} AND
          isbn = "${isbn}"
      `);
    } catch (dbError) {
      // Database connection error
      console.error(dbError);
      throw dbError;
    }
  },

  // Get all rents from user in the database
  getUserRents: async (user) => {
    const db = await open({
      filename: "/tmp/database.db",
      driver: sqlite3.Database,
    });
    console.log("exec db getUserRents");
    // We use a try catch block in case of db errors
    try {
      user != "Admin"
        ? (dynamic = `WHERE u.user = "${user}" ORDER BY end_date`) // User  = User rents
        : (dynamic = "ORDER BY end_date"); // Admin = All rents
      result = await db.all(`
        SELECT
          b.name,
          r.isbn,
          STRFTIME('%d/%m/%Y', r.end_date) as end_date,
          u.user
        FROM rents r
        JOIN books b ON
          r.isbn = b.isbn
        JOIN users u ON
          r.fk_user = u.id
        ${dynamic}
      `);
      return result;
    } catch (dbError) {
      // Database connection error
      console.error(dbError);
    }
  },
};
