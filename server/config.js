require("dotenv").config();

const config = {
  db: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    port: process.env.DB_PORT,
  },
  listPerPage: 6,
};

//用於管理，使其在其他檔案可以require
module.exports = config;
