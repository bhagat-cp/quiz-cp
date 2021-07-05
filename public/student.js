// const BASE_URL = `https://quiz-cp.herokuapp.com`;
const BASE_URL = `http://localhost:5000`;

let chatMode = "default";
let QUESTION;
let ANSWER = "";
let T1, T2;
let TAB = 'default';

const socket = io(`${BASE_URL}`);
socket.on("connection");

const rand = Math.round(Math.random() * (9999 - 1000) + 1000);

const studentName = `Mark_${rand}`;
const roomCode = "1234";
const studentId = Math.random();
const userType = "student";

const toolbarQuizTab = document.querySelector('#toolbar-quiz-tab');

socket.emit("join-room", roomCode);

socket.on("quiz_question", (data) => {
  console.log(data);
  QUESTION = data;
  displayQuestion();
  if(TAB == 'default') {
    toolbarQuizTab.innerText = `Quiz (1)`
  }
});

// ///////////////////////////////////////////////////////////////////////
const chatToolbarHTML = document.querySelector(".chat-toolbar");
const chatToolbarDefaultHTML = document.querySelector("#chat-toolbar-default");
const chatToolbarQuizHTML = document.querySelector("#chat-toolbar-quiz");
const chatBodyDefault = document.querySelector("#chat-body-default");
const chatBodyQuiz = document.querySelector("#chat-body-quiz");
const chatSendDefault = document.querySelector("#chat-send-default");
const chatSendQuiz = document.querySelector("#chat-send-quiz");

const switchToolbarOptions = (e) => {
  const id = e.target.id || e.target.dataset.id;

  if (id === "chat-toolbar-default") {
    chatToolbarDefaultHTML.classList.add("toolbar-option-active", "active");
    chatToolbarQuizHTML.classList.remove("toolbar-option-active", "active");
    chatBodyDefault.classList.remove("hide");
    chatBodyQuiz.classList.add("hide");
    chatSendDefault.classList.remove("hide");
    chatSendQuiz.classList.add("hide");
    TAB = 'default'
  }

  if (id === "chat-toolbar-quiz") {
    chatToolbarDefaultHTML.classList.remove("toolbar-option-active", "active");
    chatToolbarQuizHTML.classList.add("toolbar-option-active", "active");
    chatBodyDefault.classList.add("hide");
    chatBodyQuiz.classList.remove("hide");
    chatSendDefault.classList.add("hide");
    chatSendQuiz.classList.remove("hide");
    TAB = 'quiz';
    toolbarQuizTab.innerText = `Quiz`
  }
};

chatToolbarHTML.addEventListener("click", switchToolbarOptions);

// /////////////////////////////////////////////////////////////////////////////

const studentQuestionHTML = document.querySelector(".student-question");

const displayQuestion = () => {
  const qpartA = `
  <div class="question-header">
  <div class="question-header-number">
  Question ${QUESTION.qIndex + 1}<small>/10</small>
  </div>
  <div class="question-header-subject">${capitalizeWord(QUESTION.difficulty)}</div>
    <div class="question-header-subject">${QUESTION.category}</div>
  </div>
  <div class="question-info">
  ${QUESTION.question}
  </div>
  `;

  let qPartB = ``;
  if (QUESTION.type === "open-ended") {
    qPartB = `
    <div class="question-note">
      <p>
        <strong>Note : </strong>
        <span class="text-red"
          >This is an open ended question where participants can type
          their own answers
        </span>
      </p>
    </div>
    `;
  }

  let num = generateRandomNumber(0, 3);

  if (QUESTION.type === "multiple" || QUESTION.type === "boolean") {
    qPartB = `<div class="question-options">`;
    if(QUESTION.type === "boolean") {
      num = generateRandomNumber(0, 1);
    }

    let counter = 0;
    let maxOption = QUESTION.incorrect_answers.length + 1;
    for(let i = 0; i < num; i++) {
      qPartB += `
      <div class="question-option"  onclick="selectOption(event, '${QUESTION.incorrect_answers[counter]}')">
        <div class="question-option-info" id="question-option-${i+1}">${QUESTION.incorrect_answers[counter]}</div>
        <div class="question-option-correct"></div>
      </div>`;
      counter++;
    }
    qPartB += ` <div class="question-option"  onclick="selectOption(event, '${QUESTION.correct_answer}')">
      <div class="question-option-info" id="question-option-${counter+1}">${QUESTION.correct_answer}</div>
        <div class="question-option-correct">
        </div>
      </div>`;

    for(let i = num+1; i < maxOption; i++) {
      qPartB += `
      <div class="question-option"  onclick="selectOption(event, '${QUESTION.incorrect_answers[counter]}')">
        <div class="question-option-info" id="question-option-${i+1}">${QUESTION.incorrect_answers[counter]}</div>
        <div class="question-option-correct"></div>
      </div>`;
      counter++;
    }

  // if (QUESTION.type === "mcq") {
  //   console.log(QUESTION);
  //   qPartB = `<div class="question-options">`;
  //   QUESTION.options.map((op, index) => {
  //     console.log(op);
  //     qPartB += `
  //     <div class="question-option" onclick="selectOption(event, '${op}')">
  //       <div id="question-option-${
  //         index + 1
  //       }"  class="question-option-info">${op}</div>
  //       <div class="question-option-correct"></div>
  //     </div>`;
  //   });
    qPartB += `</div>`;
  }

  const qPartC = `
  <div class="question-actions">
    <button id="qtn-submit-btn" onclick="submitAnswer()" class="question-action-btn">Next</button>
  </div>
  `;

  const wholeQuestion = qpartA + qPartB + qPartC;
  studentQuestionHTML.innerHTML = wholeQuestion;
  T1 = new Date();
};


// ///////////////////////////////////////////////////////////////////////////

const generateRandomNumber = (min, max) => {
  return Math.floor(Math.random() * (max - min) + min)
}

// //////////////////////////////////////////////////////////////

const capitalizeWord = (word) => {
  const lower = word.toLowerCase();
  return word.charAt(0).toUpperCase() + lower.slice(1);
}

// ///////////////////////////////////////////////////////////////////////////////////

const submitAnswer = async () => {
  T2 = new Date();
  if (!ANSWER) {
    ANSWER = "";
  }

  const d = {
    studentName: studentName,
    studentId: studentId,
    qIndex: QUESTION.qIndex,
    questionId: QUESTION.questionId,
    status: "answered",
    answer: ANSWER,
    timeTaken: T2 - T1,
    roomCode: QUESTION.roomCode,
    teacherId: QUESTION.teacherId,
    date: new Date(),
  };

  let option = {
    method: "POST",
    headers: {
      "Content-Type": "application/json;charset=utf-8",
    },
    body: JSON.stringify(d),
  };
  const rawRes = await fetch(`${BASE_URL}/teacher/question-answered`, option);
  const res = await rawRes.json();

  if (rawRes.status === 201) {
    // alert("answer submitted");
  }
};

// /////////////////////////////////////////////////////////////////////////

const selectOption = (e, op) => {
  console.log(op);
  const quesOp1 = document.querySelector("#question-option-1");
  const quesOp2 = document.querySelector("#question-option-2");
  const quesOp3 = document.querySelector("#question-option-3");
  const quesOp4 = document.querySelector("#question-option-4");

  ANSWER = op;
  // console.log(e.target.nextSibling);
  e.target.parentNode.lastElementChild.innerHTML = `<i class="fas fa-check-circle"></i>`;
  e.target.style.backgroundColor = "green";

  if (e.target.id == "question-option-1") {
    console.log('aaa');
    quesOp1.parentNode.lastElementChild.innerHTML = `<i class="fas fa-check-circle"></i>`;
    quesOp1.style.backgroundColor = "green";

    quesOp2.parentNode.lastElementChild.innerHTML = ``;
    quesOp3.parentNode.lastElementChild.innerHTML = ``;
    quesOp4.parentNode.lastElementChild.innerHTML = ``;
    quesOp2.style.backgroundColor = "rgb(73, 199, 237)";
    quesOp3.style.backgroundColor = "rgb(73, 199, 237)";
    quesOp4.style.backgroundColor = "rgb(73, 199, 237)";
  }

  if (e.target.id == "question-option-2") {
    quesOp2.parentNode.lastElementChild.innerHTML = `<i class="fas fa-check-circle"></i>`;
    quesOp2.style.backgroundColor = "green";

    quesOp1.parentNode.lastElementChild.innerHTML = ``;
    quesOp3.parentNode.lastElementChild.innerHTML = ``;
    quesOp4.parentNode.lastElementChild.innerHTML = ``;
    quesOp1.style.backgroundColor = "rgb(73, 199, 237)";
    quesOp3.style.backgroundColor = "rgb(73, 199, 237)";
    quesOp4.style.backgroundColor = "rgb(73, 199, 237)";
  }

  if (e.target.id == "question-option-3") {
    quesOp3.parentNode.lastElementChild.innerHTML = `<i class="fas fa-check-circle"></i>`;
    quesOp3.style.backgroundColor = "green";

    quesOp1.parentNode.lastElementChild.innerHTML = ``;
    quesOp2.parentNode.lastElementChild.innerHTML = ``;
    quesOp4.parentNode.lastElementChild.innerHTML = ``;
    quesOp1.style.backgroundColor = "rgb(73, 199, 237)";
    quesOp2.style.backgroundColor = "rgb(73, 199, 237)";
    quesOp4.style.backgroundColor = "rgb(73, 199, 237)";
  }

  if (e.target.id == "question-option-4") {
    quesOp4.parentNode.lastElementChild.innerHTML = `<i class="fas fa-check-circle"></i>`;
    quesOp4.style.backgroundColor = "green";

    quesOp1.parentNode.lastElementChild.innerHTML = ``;
    quesOp2.parentNode.lastElementChild.innerHTML = ``;
    quesOp3.parentNode.lastElementChild.innerHTML = ``;
    quesOp1.style.backgroundColor = "rgb(73, 199, 237)";
    quesOp2.style.backgroundColor = "rgb(73, 199, 237)";
    quesOp3.style.backgroundColor = "rgb(73, 199, 237)";
  }
};

// /////////////////////////////////////////////////////////////////////////

const chatSendQuestionHTML = document.querySelector(".chat-send-question");
const chatQuizHTML = document.querySelector("#chat-quiz");
const leaderboardHTML = document.querySelector("#leaderboard");

const questionToolbarHandler = (e) => {
  let id = e.target.id || e.target.dataset.id;

  if (id == "question-list-option") {
    chatQuizHTML.classList.remove("hide");
    leaderboardHTML.classList.add("hide");
  }

  if (id == "leaderboard-option") {
    chatQuizHTML.classList.add("hide");
    leaderboardHTML.classList.remove("hide");
    fetchPerformance();
  }
};

chatSendQuestionHTML.addEventListener("click", questionToolbarHandler);

// /////////////////////////////////////////////////////////////////////////

const leaderboardTableBodyHTML = document.querySelector(
  ".leaderboard-table-body"
);

const displayMainLeaderBoard = (res) => {
  let tr = ``;
  res.map((rank, index) => {
    // console.log(rank);
    let avgTime = 0;
    if(rank?.totalTime != 0) {
      avgTime = Math.round((rank?.totalTime/1000)/rank?.score)
    }
    tr += `<tr class="table-row-margin">
    <td class="table-col-padding">${index + 1}</td>
    <td class="table-col-padding leaderboard-table-name">
      <i class="fas fa-award"></i> ${rank?.studentName}
    </td>
    <td class="table-col-padding">${avgTime}</td>
    <td class="table-col-padding">${rank?.score}</td>
    </tr>
    `;
  });
  leaderboardTableBodyHTML.innerHTML = tr;
};

// ////////////////////////////////////////////////////////////////////

const questionListHTML = document.querySelector(".question-list");

const displayQuestionsList = (res) => {
  let eachQuestion = ``;

  res.map((eq, index) => {
    console.log(eq);
    eachQuestion += `
    <div class="each-question-container" >
      <div class="each-question" onclick="expandQuestion(event)" >
        <div class="each-question-header">
          <div class="each-question-heading">
            <strong>Question ${index + 1}</strong>
          </div>
          <div class="each-question-subject">${eq.qSubject}</div>
        </div>
        <div class="each-question-label">
          ${eq.question}
        </div>
      </div>`;
    const tableData = displayEachQuestionTable(eq.answers);
    eachQuestion += tableData;
    eachQuestion += `</div></div>`;
  });

  questionListHTML.innerHTML = eachQuestion;
};

// //////////////////////////////////////////////////////////////////////

const displayEachQuestionTable = (res) => {
  let wholeTable = `
  <div class="each-question-body hide">
    <div class="question-body-chart"></div>
    <div class="body-table-container">
      <table class="question-body-table table">`;

  let tableHeader = `
  <thead>
    <tr>
      <th class="table-col-padding">Rank</th>
      <th class="table-col-padding">Name</th>
      <th class="table-col-padding">Avg Time (Sec)</th>
    </tr>
  </thead>`;

  let tableBody = `
  <tbody>`;

  let tr = ``;

  res?.map((answer, index) => {
    console.log(answer);
    tr += `
    <tr>
      <td class="table-col-padding">${index + 1}</td>
      <td class="table-col-padding">
        <i class="fas fa-award"></i> ${answer?.studentName}
      </td>
      <td class="table-col-padding">${Math.round((answer.timeTaken)/1000)}</td>
    </tr>
    `;
    tableBody += tr;
  });

  tableBody += ` </tbody>`;
  wholeTable += tableHeader + tableBody;
  wholeTable += `
      </table>
    </div>
  </div>`;

  return wholeTable;
};

// /////////////////////////////////////////////////////////////////////

const fetchPerformance = async () => {
  const rawRes = await fetch(
    `${BASE_URL}/${userType}/performance?roomcode=${roomCode}`,
    {
      method: "GET",
    }
  );
  const res = await rawRes.json();
  // console.log(res);
  displayMainLeaderBoard(res.ranks);
  displayQuestionsList(res.eachQuestionDetail);
};

// ///////////////////////////////////////////////////////////////////

const mainLeaderbaordHTML = document.querySelector(".main-leaderboard");
const expandQuestion = (e) => {
  e.target.parentNode.parentNode.lastElementChild.classList.remove("hide");
  console.log(e.target.parentNode.parentNode.lastElementChild);
  mainLeaderbaordHTML.parentNode.classList.add("hide");
};
