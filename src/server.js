const express = require("express");
const db = require("./config/db");
const fileUpload = require("express-fileupload");
const router = require("./routes/index");
const cors = require("cors");
const app = express();
const dotenv = require("dotenv");
dotenv.config();
const port = process.env.http;
db.connect();
app.use(
  fileUpload({
    useTempFiles: true,
  })
);
app.use(cors());
app.use(express.json());
router(app);
app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
