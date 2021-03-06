const webSocketsServerPort = 8000;
const webSocketServer = require("websocket").server;
const http = require("http");
const express = require("express");

const app = express();

app.get("/", (req, res) => {
  return res.send("App is running");
});

// Spinning the http server and the websocket server.
// const server = http.createServer();

const server = http
  .createServer(function (req, res) {
    res.writeHead(200, { "Content-Type": "text/html" }); // http header
    var url = req.url;
    if (url === "/about") {
      res.write("<h1>about us page<h1>"); //write a response
      res.end(); //end the response
    } else if (url === "/contact") {
      res.write("<h1>contact us page<h1>"); //write a response
      res.end(); //end the response
    } else {
      res.write("<h1>Hello World!<h1>"); //write a response
      res.end(); //end the response
    }
  })
  .listen(process.env.PORT || webSocketsServerPort, function () {
    console.log("server start at port " + webSocketsServerPort); //the server object listens on port 3000
  });

// server.listen(process.env.PORT || webSocketsServerPort);
// server.listen(process.env.PORT || webSocketsServerPort, () => {
//   console.log(`Server is running on PORT ${webSocketsServerPort}`);
// });

// console.log("listening on port 8000");

const wsServer = new webSocketServer({
  httpServer: server,
});

const clients = {};

// This code generates unique userid for everyuser.
const getUniqueID = () => {
  const s4 = () =>
    Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  return s4() + s4() + "-" + s4();
};

wsServer.on("request", function (request) {
  var userID = getUniqueID();
  console.log(
    new Date() +
      " Recieved a new connection from origin " +
      request.origin +
      "."
  );

  // You can rewrite this part of the code to accept only the requests from allowed origin
  const connection = request.accept(null, request.origin);
  clients[userID] = connection;
  console.log(
    "connected: " + userID + " in " + Object.getOwnPropertyNames(clients)
  );

  connection.on("message", function (message) {
    if (message.type === "utf8") {
      console.log("Received Message: ", message.utf8Data);

      // broadcasting message to all connected clients
      for (key in clients) {
        clients[key].sendUTF(message.utf8Data);
        console.log("sent Message to: ", clients[key]);
      }
    }
  });
});
