require("dotenv").config();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });
console.log(process.env.NODE_ENV);
const   app = require("../App");
const db= process.env.DB;


mongoose
  .connect(db, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }).then(() => {
    console.log("DB connection successful");
    const PORT = process.env.PORT || 3001;
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      });

  })
  .catch((err) => {
    console.error("DB connection error:", err);
     process.exit(1); // 
  });

  