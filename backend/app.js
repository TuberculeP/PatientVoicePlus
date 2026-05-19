const express = require("express");
const cors = require("cors");
const sequelize = require("./config/database");
const indexRoutes = require("./routes/index");
const centerRoutes = require("./routes/centers");
const formRoutes = require("./routes/forms");

const app = express();
const PORT = process.env.PORT || 10000;

app.use(
  cors({
    origin: [
      "https://patientvoice-frontend.onrender.com",
      "http://localhost:5173",
    ],
    methods: ["GET", "POST", "PUT"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
app.use(express.json());

app.use("/", indexRoutes);
app.use("/centers", centerRoutes);
app.use("/forms", formRoutes);

sequelize
  .sync()
  .then(() => {
    console.log("Database synced");
    require("./models/associations");
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Database sync failed:", error);
  });
