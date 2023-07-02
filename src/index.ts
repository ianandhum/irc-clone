import express from 'express'
import { Request, Response } from 'express'
import fs from 'fs'

import { Server } from 'http'
import { Server as SocketIOServer } from 'socket.io'


const app = express()


const http = new Server(app)
const io = new SocketIOServer(http)

app.use("/", express.static('client/public'))


io.on("connection", (socket) => {
  console.log("New client connected")
  
  socket.onAny((event, args) => {
      let message = {originalEvent: event, args: args }

      socket.broadcast.emit("broadcast", message)
  })
})


http.listen(8443, function() {
   console.log('listening on *:8443')
})