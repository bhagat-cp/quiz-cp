const BASE_URL = `https://quiz-cp.herokuapp.com`;
// const BASE_URL = `http://localhost:5000`;

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
  console.log("hey", QINDEX);
  try {
    let fetchOptions = {
      method: "GET",
    };
    const url = `${BASE_URL}/teacher/get-question?qindex=${QINDEX}`;
    console.log(url);
    const resRaw = await fetch(url, fetchOptions);
    console.log(resRaw);
    const res = await resRaw.json();
    console.log(res);
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
    Question ${QINDEX + 1}<small>/10</small>
    </div>
    <div class="question-header-subject">${capitalizeWord(
      QUESTION.difficulty
    )}</div>
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
    if (QUESTION.type === "boolean") {
      num = generateRandomNumber(0, 1);
    }

    let counter = 0;
    let maxOption = QUESTION.incorrect_answers.length + 1;
    for (let i = 0; i < num; i++) {
      qPartB += `
      <div class="question-option">
        <div class="question-option-info">${QUESTION.incorrect_answers[counter]}</div>
      </div>`;
      counter++;
    }
    qPartB += ` <div class="question-option">
      <div class="question-option-info">${QUESTION.correct_answer}</div>
        <div class="question-option-correct">
          <i class="fas fa-check-circle"></i>
        </div>
      </div>`;
    for (let i = num + 1; i < maxOption; i++) {
      qPartB += `
      <div class="question-option">
        <div class="question-option-info">${QUESTION.incorrect_answers[counter]}</div>
      </div>`;
      counter++;
    }
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

const generateRandomNumber = (min, max) => {
  return Math.floor(Math.random() * (max - min) + min);
};

// //////////////////////////////////////////////////////////////

const capitalizeWord = (word) => {
  const lower = word.toLowerCase();
  return word.charAt(0).toUpperCase() + lower.slice(1);
};

// ///////////////////////////////////////////////////////////////////////////

function sendQuestion(e) {
  const qtnNextBtnHTML = document.querySelector("#qtn-next-btn");
  const qtnSendBtnHTML = document.querySelector("#qtn-send-btn");

  qtnSendBtnHTML.innerText = "Sent";
  qtnSendBtnHTML.style.backgroundColor = `rgb(73, 199, 237)`;
  qtnSendBtnHTML.style.color = "white";
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
const questionListOptionHTML = document.querySelector("#question-list-option");
const leaderboardOptionHTML = document.querySelector("#leaderboard-option");

const questionToolbarHandler = (e) => {
  let id = e.target.id || e.target.dataset.id;

  if (id == "question-list-option") {
    chatQuizHTML.classList.remove("hide");
    leaderboardHTML.classList.add("hide");
    questionListOptionHTML.classList.add("active");
    leaderboardOptionHTML.classList.remove("active");
  }

  if (id == "leaderboard-option") {
    chatQuizHTML.classList.add("hide");
    leaderboardHTML.classList.remove("hide");
    questionListOptionHTML.classList.remove("active");
    leaderboardOptionHTML.classList.add("active");
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
    if (rank?.totalTime != 0) {
      avgTime = Math.round(rank?.totalTime / 1000 / rank?.score);
    }

    tr += `<tr class="table-row-margin">
    <th class="table-col-padding">${index + 1}</th>
    <th class="table-col-padding ${index + 1 === 1 ? "first-postion" : ""} ${
      index + 1 === 2 ? "second-postion" : ""
    } ${index + 1 === 3 ? "third-postion" : ""}"  >
      <i class="fas fa-award"></i> ${rank?.studentName}
    </th>
    <th class="table-col-padding">${avgTime}</th>
    <th class="table-col-padding">${rank?.score}</th>
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
    eachQuestion += ``;
    const tableData = displayEachQuestionTable(eq.answers, index);
    eachQuestionChartData(eq.answers, index);
    eachQuestion += tableData;
    eachQuestion += `</div></div>`;
  });

  questionListHTML.innerHTML = eachQuestion;
  displayCharts();
};

// //////////////////////////////////////////////////////////////////////

const chartData = {};
const eachQuestionChartData = (res, index) => {
  console.log(res, index);
  if (res == null) return;
  if (chartData[`q${index}`] == null) {
    chartData[`q${index}`] = {
      scores: [],
      names: [],
    };
  }
  res.map((r) => {
    console.log(r);
    if (r == null) return;
    chartData[`q${index}`].scores.push(r.score);
  });
  res.map((r) => {
    if (r == null) return;
    chartData[`q${index}`].names.push(r.studentName);
  });
};

// //////////////////////////////////////////////////////////////////////

const displayCharts = () => {
  let c = 0;
  console.log(chartData);
  for (const prop in chartData) {
    console.log(prop);
    console.log(chartData[prop]);
    const node = document.querySelector(`#myChart-${c}`);
    node.parentNode.style.height = '300px';
    node.parentNode.style.width = '300px';
    node.parentNode.style.margin = 'auto';
    const labels = chartData[`q${c}`].names;
    const scores = chartData[`q${c}`].scores;
    let correctScores = 0;
    chartData[`q${c}`].scores.map(s => {
      if(s == 1) {
        correctScores++
      }
    })
    const length = labels.length;
    const correctPercent = Math.round((correctScores/length)*100);
    const wrongPercent = length - correctScores;

    const bgColors = [];
    const borderColors = [];
    for (let i = 0; i < length; i++) {
      const r = randomNumGenerate(100, 255);
      const g = randomNumGenerate(100, 255);
      const b = randomNumGenerate(100, 255);
      bgColors.push(`rgba(${r}, ${g}, ${b}, 0.2)`);
      // borderColors.push(`rgba(${r}, ${g}, ${b}, 1)`);
    }
    c++;
    // new Chart(node, {
    //   type: "bar",
    //   data: {
    //     labels: [...labels],
    //     datasets: [
    //       {
    //         label: "# Scores",
    //         data: [...scores],
    //         backgroundColor: [...bgColors],
    //         borderColor: [...borderColors],
    //         borderWidth: 1,
    //       },
    //     ],
    //   },
    //   options: {
    //     scales: {
    //       y: {
    //         beginAtZero: true,
    //       },
    //     },
    //   },
    // });

    new Chart(node, {
      type: "pie",
      data: {
        labels: ["Correct", "Wrong"],
        datasets: [
          {
            label: "Students Perform",
            data: [correctScores, wrongPercent],
            backgroundColor: [
              ...bgColors
            ],
            hoverOffset: 4,
          },
        ],
      },
      
    });
  }
};

// //////////////////////////////////////////////////////////////////////

const randomNumGenerate = (max, min) => {
  return Math.round(Math.random() * (max - min) + min);
};

// ///////////////////////////////////////////////////////////////////////

const displayEachQuestionTable = (res, index) => {
  let wholeTable = `
  <div class="each-question-body hide">
    <div class="question-body-chart">
      <canvas id="myChart-${index}" class="pie-chart"></canvas>
    </div>
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

  res?.map((answer, index) => {
    let t = 0;
    if (answer?.timeTaken) {
      t = Math.round(answer.timeTaken / 1000);
    }
    let tr = `
    <tr class="each-question-tbody">
      <th class="table-col-padding">${index + 1}</th>
      <th class="table-col-padding ${index + 1 === 1 ? "first-postion" : ""} ${
        index + 1 === 2 ? "second-postion" : ""
      } ${index + 1 === 3 ? "third-postion" : ""}"">
        <i class="fas fa-award"></i> ${answer?.studentName}
      </th>
      <th class="table-col-padding">${t}</th>
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
  console.log(res);
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
