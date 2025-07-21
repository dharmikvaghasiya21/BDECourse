const dotenv = require('dotenv');

export const config = {
  PORT: process.env.PORT,
  DB_URL: process.env.DB_URL,
  BACKEND_URL: process.env.BACKEND_URL || "http://localhost:2222",
  JWT_TOKEN_SECRET: process.env.JWT_TOKEN_SECRET,

}