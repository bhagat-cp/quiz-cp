const studentsAnswers = require("./../modal/studentsAnswers");
const questionAsked = require("./../modal/questionAsked");
const quizRooms = require("./../modal/quizRooms");

const descendingOrder = (obj1, obj2) => {
  if (obj1.score < obj2.score) return 1;
  if (obj1.score > obj2.score) return -1;
  return;
};

exports.performance = (req, res, next) => {
  const query = req.query.roomcode;

  const results = studentsAnswers.map((ans) => {
    if (!ans.rooms[query]) return;
    let filterData = {};
    filterData.studentName = ans.studentName;
    // filterData.studentId = ans.studentId;
    filterData.answeres = ans.rooms[query].qAnswered;
    // filterData.wrongAnswers = ans.rooms[query].qAnswered.wrong;
    // filterData.qSkipped = ans.rooms[query].qSkipped;
    filterData.score = ans.rooms[query].score;
    if (ans.rooms[query].score > 0) {
      filterData.totalTime = ans.rooms[query].totalTime;
    } else {
      filterData.totalTime = 0;
    }
    return filterData;
  });

  const eachQuestionDetail = questionAsked.map((q) => {
    let answeres = results.map((r) => {
      for (let i = 0; i < r?.answeres.length; i++) {
        const ca = r.answeres[i];
        if (ca.questionId === q.questionId) {
          let score;
          if(ca.status === 'correct') {
            score = 1
          }
          if(ca.status === 'wrong') {
            score = 0
          }
          return {
            studentName: r.studentName,
            timeTaken: ca.timeTaken,
            score: score   
          };
        }
      }
    });
    if(answeres.length === 0) {
      answeres = []
    }
    console.log(q);        
    return {
      question: q.question,
      // questionId: q.questionId,
      qSubject: q.category,
      answers: answeres || [],
    };  
  });

  results.sort(descendingOrder);
  if(results.length > 3) {
    results.length = 3;    

  }  

  return res
    .status(200)
    .json({ ranks: results, eachQuestionDetail: eachQuestionDetail });
};

exports.getParticipantsList = (req, res, next) => {
  const query = req.query.roomCode;

  for (let i = 0; i < quizRooms.length; i++) {
    if (quizRooms[i].roomId == query) {  
      return res.status(200).json({ data: quizRooms[i] });
    }
  }  
};
    