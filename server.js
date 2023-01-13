const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const manageWit = require("./middleware");
const chatRobot = require("./robot");

var Table = require("cli-table");


const tableChat = new Table({
    head: ["Info", "Valor"],
    colWidths: [10, 100]
})

app.get("/", (req, res)=>{
    res.send("Hola Mundo")
});

const { Server } = require("socket.io")
const io = new Server(server, {
    cors: {
        origin: true,
        credentials: true,
        methods: ["GET", "POST"]
    }
});

let indexChat = 0;
io.on("connection", (socket) => {
    console.log("usuario conectado");
    socket.on("ask", async (data) => {
        let responseWit = await manageWit(data["msg"]);
        console.log(responseWit);
        let serverResponse = await chatRobot(responseWit, indexChat);
        console.log(serverResponse);
        tableChat.push(
            {"Usuario": data["msg"]},
            {"Intents": JSON.stringify(responseWit["intents"])},
            {"Traits": JSON.stringify(responseWit["traitsVal"])},
            {"Entities": JSON.stringify(responseWit["entities"])},
            {"Servidor": serverResponse},
            {"---": "-----------------"}
        );

        console.log(tableChat.toString());

        socket.emit("response", {
            "msg": serverResponse
        });
        indexChat++;
    });
});

server.listen(8000, ()=> console.log("corriendo en el puerto 8000"));