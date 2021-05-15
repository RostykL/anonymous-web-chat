const express = require("express");
const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);
const cors = require("cors");
app.use(cors())

let rooms = [];
let finished = false;


io.on('connection', async (socket) => {
  let socket_room_in = [];

  // TODO
  // Користувач зайшов на сторінку
  // створюємо кімнату автоматично | назва кімнати це буде його id
  // новий користувач заходить | ми перевіряємо чи є вільна кімната | вільна кімната буде тоді коли в неї буде 0 людей

  // Коли новий користувач заходить ми перевіряємо чи є кімнати, де знаходиться тільки один користувач якщо такі є то
  // ми додаємо цього користувача до цієї кімнати якщо немає то ми створюємо іншу кімнату і чекаємо поки до нього хтось зайде
  //
  console.log("new connection", socket.id);

  socket.on("check on available rooms", () => {
    finished = false;
    console.log()
    for(let i = 0; i < rooms.length; i++) {
      if(rooms[i].user_count <= 1) {
		socket.join(rooms[i].name) // adding client to a room;
		finished = true;
		rooms[i].users.push(socket.id)
		rooms[i].user_count = rooms[i].users.length;
		socket_room_in = [rooms[i].users[1], rooms[i].users[0]] // [socket.id, room name]
		console.log(rooms, "хоп хей лалель")
		socket.emit("check on available rooms", rooms[i].users[0])
        break;
	  }
	}
    if(!finished) {
      console.log('again??')
	  socket.emit("check on available rooms", {no_room: true})
	  finished = false;
	}

  })

  socket.on('chat message', (msg) => {
    // socket.emit('chat message', msg)
	console.log(socket_room_in, msg)
	io.to(socket_room_in[1]).emit('chat message', msg)
  })



  // handle room creation by `room name` : string
  socket.on('create room', room => {
	socket.join(room.name)

	if(!rooms.some(el => el.name === room.name)) {
	  const roomInfo = {
	    name: room.name,
		user_count: io.sockets.adapter.rooms.get(room.name).size,
		users: [room.user]
	  }
	  socket_room_in = [room.user, room.name]

	  rooms.push(roomInfo)
	} else {
	  let i = 0;
	  rooms.forEach((el, id) => {
	    if(el.name === room.name) {
	      i = id
		}
	  })
   	  rooms[i].users.push(room.user)
	  rooms[i].user_count = rooms[i].users.length;
	}
	console.log(rooms)
  })

  // const details = await io.allSockets();

  // socket.emit("get all client", [...details])
  // socket.emit("get all rooms", rooms)


  socket.on('chatting in a room', (room) => {
	if(room.new) {
	  io.to(room.name).emit('chat message', room.text + " " + socket.id)
	} else {
	  io.to(room.name).emit('chat message', room.text)
	}
  })

  socket.on('typing', (data) => {
	socket.broadcast.emit('typing', data)
  })

  socket.on('disconnect', () => {
	console.log('user disconnected', socket.id);
	console.log(socket_room_in)

	rooms = rooms.map(el => {
	  if(el.name === socket_room_in[1]) {
	    el.users = el.users.filter(name => name !== socket_room_in[0])
		el.user_count--
	  }
	  return el;
	})
	socket.leave(socket_room_in[1]);
	console.log(rooms)
  });
});

server.listen(4444, () => {
  console.log('listening on *:4444');
});