const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const io = require('socket.io', )(5010, {
  cors: {
    origin: '*'
  }
});

const studentRoutes = require('./routes/student');
const teacherRoutes = require('./routes/teacher');
const questionAsked = require('./modal/questionAsked');

const PORT = process.env.PORT || 5000;
// const app = express(express.urlencoded({extended: true}));
// const app = express(express.json());

const app = express();
app.use(bodyParser.json())
// app.use(bodyParser.urlencoded())
app.use(cors());

app.use('/student', studentRoutes);
app.use('/teacher', teacherRoutes);
app.use('/', (req, res, next) => {
  res.status(404).json({data: 'Invalid Route'})
})

app.listen(PORT, () => {
  console.log('CONNECTED ON PORT 5000');
})

io.on('connection', socket => {
  // console.log(socket);
  console.log('user connected', socket.id);

  socket.on('join-room', roomCode => {
    socket.join(roomCode);
  })

  socket.on('ques_send', (data) => {
    console.log('ques_send');
    // console.log(data);
    data = {...data, sockedId: socket.id}
    const qIndex = questionAsked.indexOf(q => q.questionId === data.questionId);

    if(qIndex > -1) return;
    questionAsked.push({
      question: data.question,
      questionId: data.questionId
    })

    socket.to(data.roomCode).emit('quiz_question', data)
  })

})