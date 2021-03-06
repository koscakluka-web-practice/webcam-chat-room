import express from "express";
import cors from "cors";

import { createServer } from "http";
import { Server } from "socket.io";

const PORT = process.env.PORT || 5000;

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.use(cors());

app.get("/", (req, res) => {
  res.send("Server running...");
});

io.on("connection", (socket) => {
  socket.emit("me", socket.id);

  socket.on("disconnect", () => {
    console.log(`Client (#${socket.id}) Disconnected`);
    socket.broadcast.emit("call-ended");
  });

  socket.on("call-user", ({ calleeId, caller, signalData }) => {
    console.log(`Calling user (#${calleeId} <= #${caller.id})`);
    io.to(calleeId).emit("call-user", { signal: signalData, caller });
  });

  socket.on("answer-call", ({ callerId, callee, signal }) => {
    console.log(`Call accepted (#${callerId} => #${callee.id})`);
    io.to(callerId).emit("call-accepted", { signal, callee });
  });
});

server.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
