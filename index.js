const express = require("express");
const http = require("http");
const socket = require("./src/socket");
const cors = require("cors");
const bodyParser = require("body-parser");
const ExceptionMiddleware = require("./src/middleware/ExceptionMiddleware");
const routes = require("./src/routes");

const app = express();
const server = http.createServer(app);
socket(server);
const port = 5000;

app.use(cors());
app.use(bodyParser.json({ limit: "10mb" }));
app.use(routes);
app.use(ExceptionMiddleware);

server.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
