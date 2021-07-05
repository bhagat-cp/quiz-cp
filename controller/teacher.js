const axios = require('axios');
const ShortUniqueId = require('short-unique-id');

let questions = require("./../modal/questions");
const studentsAnsweres = require("./../modal/studentsAnswers");
const quizRooms = require("./../modal/quizRooms");

const uid = new ShortUniqueId();

exports.getQuestion = async(req, res, next) => {
  let query = req.query.qindex;
  console.log(query);
  query = Number(query);
  let totalQuestions = questions.length;
  console.log(totalQuestions, query);
  // totalQuestions = 0;
  if(totalQuestions == 0) {
    try {
      let resRaw = await axios.get(`https://opentdb.com/api.php?amount=10`);
      let res = await resRaw.data;
      questions = res.results;
      questions.map(q => {
        q.questionId = uid();
      })
      console.log(questions);
      totalQuestions = questions.length;
    } catch(error) {
      console.log(error.message);    
    }
  }

  if (query >= totalQuestions) {
    return res.status(301).json({
      status: "failed",
      message: "No new question!!",
    });
  }

  let selectedQuestion = questions[query];
  return res.status(200).json({
    status: "success",
    data: {
      ...selectedQuestion,
      qIndex: query,
    },
  });
};

exports.questionAnswered = (req, res, next) => {
  let data = req.body;
  const {
    studentName,
    studentId,
    qIndex,
    questionId,
    status,
    answer,
    timeTaken,
    roomCode,
    teacherId,
    date,
  } = data;

  let correct = false;

  if (questions[qIndex].correct_answer == answer) {
    correct = true;
  }

  let studentIndex = studentsAnsweres.findIndex(
    (stud) => stud.studentId === studentId
  );

  if (studentIndex === -1) {
    studentIndex = studentsAnsweres.length;
    studentsAnsweres.push({
      studentName,
      studentId,
    });
  }

  if (!studentsAnsweres[studentIndex].rooms) {
    studentsAnsweres[studentIndex].rooms = {};
  }

  if (!studentsAnsweres[studentIndex].rooms[roomCode]) {
    studentsAnsweres[studentIndex].rooms[roomCode] = {};
    studentsAnsweres[studentIndex].rooms[roomCode]["qAnswered"];
    studentsAnsweres[studentIndex].rooms[roomCode]["qAnswered"] = [];
    // studentsAnsweres[studentIndex].rooms[roomCode]["qAnswered"]["correct"] = [];
    // studentsAnsweres[studentIndex].rooms[roomCode]["qAnswered"]["wrong"] = [];
    // studentsAnsweres[studentIndex].rooms[roomCode]["qSkipped"] = [];
    studentsAnsweres[studentIndex].rooms[roomCode].score = 0;
    studentsAnsweres[studentIndex].rooms[roomCode].totalTime = 0;
  }

  if (correct) {
    studentsAnsweres[studentIndex].rooms[roomCode].qAnswered.push({
      qIndex,
      questionId,
      answer,
      timeTaken,
      teacherId,
      date,
      status: 'correct',
    });
    studentsAnsweres[studentIndex].rooms[roomCode].score += 1;
  } else {
    studentsAnsweres[studentIndex].rooms[roomCode].qAnswered.push({
      qIndex,
      questionId,
      teacherId,
      timeTaken,
      date,
      status: 'wrong',
    });
  }
  studentsAnsweres[studentIndex].rooms[roomCode].totalTime += timeTaken;

  return res
    .status(201)
    .json({ status: "answer submitted", data: studentsAnsweres });
};

exports.questionSkipped = (req, res, next) => {
//   let data = req.body;
//   const {
//     studentName,
//     studentId,
//     qIndex,
//     questionId,
//     status,
//     roomCode,
//     teacherId,
//     date,
//   } = data;

//   let studentIndex = studentsAnsweres.findIndex(
//     (stud) => stud.studentId === studentId
//   );

//   if (studentIndex === -1) {
//     studentIndex = studentsAnsweres.length;
//     studentsAnsweres.push({
//       studentName,
//       studentId,
//     });
//   }

//   if (!studentsAnsweres[studentIndex].rooms) {
//     studentsAnsweres[studentIndex].rooms = {};
//   }

//   if (!studentsAnsweres[studentIndex].rooms[roomCode]) {
//     studentsAnsweres[studentIndex].rooms[roomCode] = {};
//     studentsAnsweres[studentIndex].rooms[roomCode]["qAnswered"];
//     studentsAnsweres[studentIndex].rooms[roomCode]["qAnswered"] = {};
//     studentsAnsweres[studentIndex].rooms[roomCode]["qAnswered"]["correct"] = [];
//     studentsAnsweres[studentIndex].rooms[roomCode]["qAnswered"]["wrong"] = [];
//     studentsAnsweres[studentIndex].rooms[roomCode].qSkipped = [];
//     studentsAnsweres[studentIndex].rooms[roomCode].score = 0;
//     studentsAnsweres[studentIndex].rooms[roomCode].totalTime = 0;
//   }

//   studentsAnsweres[studentIndex].rooms[roomCode].qSkipped.push({
//     qIndex,
//     questionId,
//     teacherId,
//     date,
//   });

//   return res
//     .status(201)
//     .json({ status: "input recorded", data: studentsAnsweres });
};

exports.createQuizRooms = (req, res, next) => {
  const quizRoom = req.body.roomCode;
  const name = req.body.name;

  for (let i = 0; i < quizRooms.length; i++) {
    if (quizRooms[i].roomId === quizRoom) {
      return res.status(201).json({
        status: false,
        message: `Room with ID ${quizRoom} already exists`,
      });
    }
  }
  quizRooms.push({
    roomId: quizRoom,
    name,
    createdAt: new Date(),
    participants: [],
  });

  return res.status(201).json({
    status: true,
    message: `Room created with ID ${quizRoom}`,
  });
};
