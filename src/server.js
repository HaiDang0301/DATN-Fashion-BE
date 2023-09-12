const express = require("express");
const fileUpload = require("express-fileupload");
const db = require("./config/db");
const router = require("./routes/index");
const app = express();
const dotenv = require("dotenv");
dotenv.config();
const port = process.env.http;
db.connect();
app.use(express.json());
app.use(
  fileUpload({
    useTempFiles: true,
  })
);
router(app);
app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
