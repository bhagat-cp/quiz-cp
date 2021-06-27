const quizRooms = require("./../modal/quizRooms");

exports.joinQuizRoom = (req, res, next) => {
  const quizRoom = req.body.roomCode;
  const name = req.body.name;

  for (let i = 0; i < quizRooms.length; i++) {
    if (quizRooms[i].roomId === quizRoom) {
      quizRooms[i].participants.push({
        name,
        joinedAt: new Date()
      })
      return res.status(201).json({
        status: true,
        message: `Joined the Room with ID ${quizRoom}`,
      });
    }
  }
 
  return res.status(201).json({
    status: false,
    message: `No Room exsits with ID ${quizRoom}`,
  });
}

