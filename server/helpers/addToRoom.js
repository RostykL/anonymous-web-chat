const addToRoom = (room, rooms, clients) => {
  let room_with_less_than_one_in_room = null;
  let room_looking_for_array = [...room.looking_for].map(el => el[0])

  for(let i = 0; i < rooms.length; i++) {
    let rooms_looking_for_array = [...rooms[i].looking_for].map(el => el[0])
	let looking_for_room = rooms_looking_for_array.some(el => room_looking_for_array.includes(el));
	if (rooms[i].user_count <= 1 && looking_for_room) {
	  room_with_less_than_one_in_room = i;
	  break;
	}
  }
  if (room_with_less_than_one_in_room !== null) {
	rooms[room_with_less_than_one_in_room].users.push(room.user)
	rooms[room_with_less_than_one_in_room].user_count = rooms[room_with_less_than_one_in_room].users.length;
	clients.set(room.user, rooms[room_with_less_than_one_in_room].name)
  } else {
	const newRoom = {
	  name: room.name,
	  user_count: 1,
	  users: [room.user],
	  looking_for: room.looking_for
	}
	clients.set(room.user, room.name)
	rooms.push(newRoom);
  }

  return [rooms, clients]
}

module.exports = {
  addToRoom
}