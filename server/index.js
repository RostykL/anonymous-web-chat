const express = require("express");
const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);
const cors = require("cors");
const {addToRoom} = require("./helpers/addToRoom");
const {createRoom} = require("./helpers/createRoom");
const {removeFromRoom} = require("./helpers/removeFromRoom");
app.use(cors())

let rooms = [];
let clients = new Map();

io.on('connection', (socket) => {

  socket.on("user looking for a room", ({clientID, interests}) => {
	let clientRoom = createRoom(clientID, interests);
    clients.set(clientID, {interests, room: io.sockets.adapter.rooms})
    let data = addToRoom({user: clientID, name: clientRoom.name, looking_for: clientRoom.looking_for}, rooms, clients)
    rooms = data[0]
    clients = data[1]
    socket.join(clients.get(socket.id))
    socket.to(clients.get(socket.id)).emit("chat message", socket.id + " приєднався")
    console.log(clients, rooms)
  })

  socket.on('chat message', (msg) => {
    let getRoom = clients.get(socket.id)
    console.log(getRoom, msg, 'user', socket.id)
    io.to(getRoom).emit('chat message', msg)
  })

  socket.on('disconnect', () => {
    let getRoom = clients.get(socket.id)
    io.to(getRoom).emit("chat message", socket.id + " покинув чат")
    io.to(getRoom).emit('find another chat', {find: true})

    rooms = removeFromRoom(getRoom, rooms)
    socket.leave(getRoom)
    clients.delete(socket.id)
	console.log('user disconnected', socket.id, 'left room', getRoom, rooms);
  });

});

server.listen(4444, () => {
  console.log('listening on *:4444');
});