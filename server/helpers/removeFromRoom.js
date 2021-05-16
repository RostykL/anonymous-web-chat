const removeFromRoom = (room_name, rooms) => {
	return rooms.filter(el => el.name !== room_name);
}

module.exports = {
  removeFromRoom
}