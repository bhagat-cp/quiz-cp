// const BASE_URL = `https://quiz-cp.herokuapp.com`;
const BASE_URL = `http://localhost:5000`;

let chatMode = "default";
let participants = 0;
let QINDEX = 0;
let QUESTION;
const socket = io(`${BASE_URL}`);
socket.on("connection");

const teacherName = "Bob";
const roomCode = "1234";
const teacherId = Math.random();
const userType = "teacher";

socket.emit("join-room", roomCode);

const chatToolbarHTML = document.querySelector(".chat-toolbar");
const chatToolbarDefaultHTML = document.querySelector("#chat-toolbar-default");
const chatToolbarQuizHTML = document.querySelector("#chat-toolbar-quiz");
const chatBodyDefault = document.querySelector("#chat-body-default");
const chatBodyQuiz = document.querySelector("#chat-body-quiz");
const chatSendDefault = document.querySelector("#chat-send-default");
const chatSendQuiz = document.querySelector("#chat-send-quiz");

// ///////////////////////////////////////////////////////////////////

const switchToolbarOptions = (e) => {
  const id = e.target.id || e.target.dataset.id;

  if (id === "chat-toolbar-default") {
    chatToolbarDefaultHTML.classList.add("toolbar-option-active", "active");
    chatToolbarQuizHTML.classList.remove("toolbar-option-active", "active");
    chatBodyDefault.classList.remove("hide");
    chatBodyQuiz.classList.add("hide");
    chatSendDefault.classList.remove("hide");
    chatSendQuiz.classList.add("hide");
  }

  if (id === "chat-toolbar-quiz") {
    chatToolbarDefaultHTML.classList.remove("toolbar-option-active", "active");
    chatToolbarQuizHTML.classList.add("toolbar-option-active", "active");
    chatBodyDefault.classList.add("hide");
    chatBodyQuiz.classList.remove("hide");
    chatSendDefault.classList.add("hide");
    chatSendQuiz.classList.remove("hide");
    getQuestion();
  }
};

chatToolbarHTML.addEventListener("click", switchToolbarOptions);

// /////////////////////////////////////////////////////////////////

const getQuestion = async () => {
  try {
    let fetchOptions = {
      method: "GET",
    };
    const url = `${BASE_URL}/teacher/get-question?qindex=${QINDEX}`;
    const resRaw = await fetch(url, fetchOptions);
    const res = await resRaw.json();
    if (res.status === "success") {
      QUESTION = res.data;
      displayQuestion(res.data);
    } else {
      // displayQuestion(res);
    }
  } catch (error) {
    console.log(error.message);
  }
};

// //////////////////////////////////////////////////////////////////////

const teacherQuestionHTML = document.querySelector(".teacher-question");

const displayQuestion = () => {
  const qpartA = `
    <div class="question-header">
    <div class="question-header-number">
    Question ${QINDEX}<small>/2</small>
    </div>
    <div class="question-header-subject">Math</div>
    </div>
    <div class="question-info">
    ${QUESTION.question}
    </div>
  `;

  let qPartB = ``;
  if (QUESTION.type === "input") {
    qPartB = `
    <div class="question-note">
      <p>
        <strong>Note : </strong>
        <span class="text-red"
          >This is an open ended questionwhere participants can type
          their own answers
        </span>
      </p>
    </div>
    `;
  }

  if (QUESTION.type === "mcq") {
    qPartB = `<div class="question-options">`;
    QUESTION.options.map((op) => {
      let correct = "";
      // console.log(op, QUESTION);
      if (op == QUESTION.answer) {
        correct = `
        <div class="question-option-correct">
          <i class="fas fa-check-circle"></i>
        </div>`;
      }

      qPartB += `
      <div class="question-option">
        <div class="question-option-info">${op}</div>
        ${correct}
      </div>`;
    });
    qPartB += `</div>`;
  }

  QINDEX = QINDEX + 1;
  const qPartC = `
  <div class="question-actions">
    <button id="qtn-next-btn" onclick="getQuestion()" class="question-action-btn">Next</button>
    <button id="qtn-send-btn" onclick="sendQuestion(event)" class="question-action-btn">Send</button>
  </div>
  `;

  const wholeQuestion = qpartA + qPartB + qPartC;
  teacherQuestionHTML.innerHTML = wholeQuestion;
};

// ///////////////////////////////////////////////////////////////////////////

// const qtnNextBtnHTML = document.querySelector('#qtn-next-btn');
// const qtnSendBtnHTML = document.querySelector('#qtn-send-btn');

function sendQuestion(e) {
  // console.log(event);
  console.log(QUESTION);
  socket.emit("ques_send", {
    ...QUESTION,
    roomCode: roomCode,
    teacherId,
  });
}

// /////////////////////////////////////////////////////////////////////////////

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
    console.log(rank);
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

const mainLeaderbaordHTML = document.querySelector('.main-leaderboard');
const expandQuestion = e => {
  e.target.parentNode.parentNode.lastElementChild.classList.remove("hide");
  console.log(e.target.parentNode.parentNode.lastElementChild);
  mainLeaderbaordHTML.parentNode.classList.add("hide")
}