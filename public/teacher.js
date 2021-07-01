const BASE_URL = `https://quiz-cp.herokuapp.com`;
// const BASE_URL = `http://localhost:5000`;

let chatMode = "default";
let participants = 0;
let qIndex = 0;

const socket = io(`${BASE_URL}`);
socket.on("connection");

const teacherName = "Bob";
const roomCode = "1234";
const teacherId = Math.random();
const userType = "teacher";

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

const getQuestion = async (index = qIndex) => {
  console.log(index);
  // try {
  let fetchOptions = {
    method: "GET",
  };
  const url = `${BASE_URL}/teacher/get-question?qindex=${index}`;
  const resRaw = await fetch(url, fetchOptions);
  const res = await resRaw.json();
  if (res.status === "success") {
    displayQuestion(res.data);
  } else {
    // displayQuestion(res);
  }
  // } catch (error) {
  //   console.log(error.message);
  // }
};

// //////////////////////////////////////////////////////////////////////

const teacherQuestionHTML = document.querySelector(".teacher-question");

const displayQuestion = (res) => {
  console.log(res);
  const qpartA = `
  <div class="question-header">
  <div class="question-header-number">
  Question ${qIndex}<small>/2</small>
  </div>
  <div class="question-header-subject">Math</div>
  </div>
  <div class="question-info">
  ${res.question}
  </div>
  `;

  let qPartB = ``;
  if (res.type === "input") {
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

  if (res.type === "mcq") {
    console.log(res);
    qPartB = `<div class="question-options">`;
    res.options.map((op) => {
      let correct = '';
      // console.log(op, res);
      if (op == res.answer) {
        console.log(op);
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
  qIndex = qIndex + 1;
  const qPartC = `
  <div class="question-actions">
    <button id="qtn-next-btn" onclick="getQuestion(${
      qIndex
    })" class="question-action-btn">Next</button>
    <button id="qtn-send-btn" onclick="sendQuestion(event, ${res})" class="question-action-btn">Send</button>
  </div>
  `;

  const wholeQuestion = qpartA + qPartB + qPartC;
  teacherQuestionHTML.innerHTML = wholeQuestion;
};

// ///////////////////////////////////////////////////////////////////////////

// const qtnNextBtnHTML = document.querySelector('#qtn-next-btn');
// const qtnSendBtnHTML = document.querySelector('#qtn-send-btn');

const sendQuestion = (event, res) => {
  socket.emit("ques_send", {
    ...question,
    roomCode: roomCode,
    teacherId,
  });
  document.querySelector("#sendQuestionBtn").style.display = "none";
};
