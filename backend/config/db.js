const mongoose =
  require("mongoose");

mongoose.set("strictQuery", false);

const connectDB =
  async () => {

    try {

      // Attempt to extract database name from the URI to force exact casing
      const uri = process.env.MONGO_URI || "";
      let dbName;
      const m = uri.match(/\/([^\/?]+)(\?|$)/);
      if (m && m[1]) dbName = m[1];

      const conn =
        await mongoose.connect(
          uri,
          dbName ? { dbName } : undefined
        );

      console.log("");

      console.log(
        "✅ MongoDB Connected"
      );

      console.log(
        `📦 Database Host : ${conn.connection.host}`
      );

      if (conn.connection && conn.connection.db && conn.connection.db.databaseName) {
        console.log(
          `🗄️  Database Name : ${conn.connection.db.databaseName}`
        );
      }

      console.log("");

    } catch (error) {

      console.error("");

      console.error(
        "❌ MongoDB Connection Failed"
      );

      console.error(
        error.message
      );

      console.error("");

      process.exit(1);

    }

  };

module.exports =
  connectDB;