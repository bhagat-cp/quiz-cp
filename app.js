const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const studentRoutes = require("./routes/student");
const teacherRoutes = require("./routes/teacher");
const questionAsked = require("./modal/questionAsked");
const quizRooms = require('./modal/quizRooms');

const PORT = process.env.PORT || 5000;
// const app = express(express.urlencoded({extended: true}));
// const app = express(express.json());

const app = express();
app.use(bodyParser.json());
// app.use(bodyParser.urlencoded())
app.use(cors());

app.use("/student", studentRoutes);
app.use("/teacher", teacherRoutes);
app.use("/", (req, res, next) => {
  res.status(404).json({ data: "Invalid Route" });
});

const server =  app.listen(PORT, () => {
  console.log(`CONNECTED ON PORT ${PORT}`);
});

const io = require("socket.io")(server, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {

  socket.on("join-room", (roomCode) => {
    socket.join(roomCode);
    for(let i = 0; i < quizRooms.length; i++) {
      if(quizRooms[i].roomId == roomCode) {
        socket.to(`${roomCode}`).emit('participant-added', quizRooms[i]);
        return

      }
    }
  });

  socket.on("ques_send", (data) => {
    const qIndex = questionAsked.indexOf(
      (q) => q.questionId === data.questionId
    );

    if (qIndex > -1) return;
    questionAsked.push({  
      question: data.question,
      questionId: data.questionId,
    });

    socket.to(data.roomCode).emit("quiz_question", data);
  });
}); 
  