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

  // TODO
  // КОРИСТУВАЧ ЗАХОДИТЬ НА САЙТ І ЙОГО АБО ДОДАЄ ДО КІМНАТИ АБО СТВОРЮЄТЬСЯ НОВА
  // КОЛИ ВІН ВИХОДИТЬ, ЙОГО ПОТРІБНО ВИКЛЮЧАТИ З КІМНАТИ І ЗМІНЮВАТИ ID КІМНАТИ НА ТОГО ЮЗЕРА ЯКИЙ ЗАЛИШИВСЯ

  // let room1 = createRoom("room1", ["male", "female", "idk", "lol"]);
  // let room2 = createRoom("room2", ['bunny']);
  // let room4 = createRoom("room3", ['bunny']);
  // let room3 = createRoom("room3", ["male"]);
  // rooms = addToRoom({user: "room1user", name: room1.name, looking_for: room1.looking_for}, rooms)
  // rooms = addToRoom({user: "room3user", name: room3.name, looking_for: room3.looking_for}, rooms)
  // rooms = addToRoom({user: "room4user", name: room4.name, looking_for: room4.looking_for}, rooms)
  // rooms = addToRoom({user: "room2user", name: room2.name, looking_for: room2.looking_for}, rooms)
  // rooms = removeFromRoom(room1.name, rooms)
  // console.log(rooms)

  socket.on("user looking for a room", ({clientID, interests}) => {
	let clientRoom = createRoom(clientID, interests);
    clients.set(clientID, {interests, room: io.sockets.adapter.rooms})
    let data = addToRoom({user: clientID, name: clientRoom.name, looking_for: clientRoom.looking_for}, rooms, clients)
    rooms = data[0]
    clients = data[1]
    socket.join(clients.get(socket.id))
    console.log(clients, rooms)
  })

  socket.on('chat message', (msg) => {
    let getRoom = clients.get(socket.id)
    console.log(getRoom, msg, 'user', socket.id)
    io.to(getRoom).emit('chat message', msg)
  })

  socket.on('disconnect', () => {
    let getRoom = clients.get(socket.id)
    rooms = removeFromRoom(getRoom, rooms)
    socket.leave(getRoom)
    clients.delete(socket.id)
	console.log('user disconnected', socket.id, 'left room', getRoom, rooms);
  });

});

server.listen(4444, () => {
  console.log('listening on *:4444');
});