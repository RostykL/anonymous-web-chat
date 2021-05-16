const createRoom = (name, looking_for) => {
  //  looking_for is an array of all people the users is looking for [male, female...]
  let new_looking_for = new Map();
  for(let i = 0; i < looking_for.length; i++) {
    new_looking_for.set(looking_for[i], true)
  }
  return {
    name,
    users: [],
    looking_for: new_looking_for
  }

}

module.exports = {
  createRoom
}