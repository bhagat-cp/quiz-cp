const BASE_URL = `https://quiz-cp.herokuapp.com`;

// const BASE_URL = `http://localhost:5000`;

// //////////////////////////////////////////////////////////////////

const questionContHTML = document.querySelector("#questionCont");
const startQuizBtnHTML = document.querySelector("#startQuizBtn");
const headingContHTML = document.querySelector("#headingCont");
const headingHTML = document.querySelector("#heading");
const performanceBtnHTML = document.querySelector("#performanceBtn");
const performanceContHTML = document.querySelector("#performanceCont");
let performanceDisplay = false;

const socket = io(`${BASE_URL}`);
socket.on("connection");

// //////////////////////////////////////////////////////////////////////

const urlParams = new URLSearchParams(window.location.search);
const teacherName = urlParams.get('name');
const roomCode = urlParams.get('roomCode');
const teacherId = Math.random();
const userType = 'teacher';

socket.emit('join-room', roomCode);

// ///////////////////////////////////////////////////////////////////////

const extratParticipantsList = async () => {
  try {
    let options = {
      method: "GET",
    };
    const resRaw = await fetch(
      `${BASE_URL}/teacher/get-participants-list?roomCode=${roomCode}`,
      options
    );
    const res = await resRaw.json();
    displayParticipantList(res.data);
  } catch (error) {
    console.log(error.message);
  }
};

extratParticipantsList();

// ///////////////////////////////////////////////////////////////////

const getQuestion = async (event, data, begining = false) => {
  if(begining) {

  }

  if(performanceDisplay) {
    performanceDisplay = !performanceDisplay;
    performanceBtnHTML.innerText = "Show Performance";
    performanceContHTML.style.display = "none";
    questionContHTML.style.display = "block";
    headingHTML.innerText = "Question"
  }

  try {
    let fetchOptions = {
      method: "GET",
    };
    const url = `${BASE_URL}/teacher/get-question?qindex=${data}`;
    const resRaw = await fetch(url, fetchOptions);
    const res = await resRaw.json();
    if (res.status === "success") {
      displayQuestion(res);
      startQuizBtnHTML.style.display = "none";
      headingHTML.style.display = "block";
    } else {
      displayQuestion(res);
      startQuizBtnHTML.style.display = "block";
      headingHTML.style.display = "none";
    }
  } catch (error) {
    console.log(error.message);
  }
};

startQuizBtnHTML.addEventListener("click", (e) => getQuestion(e, "0", true));

// //////////////////////////////////////////////////////////////////////

const displayQuestion = (res) => {
  questionContHTML.innerHTML = "";
  const questionRow = document.createElement("div");
  questionRow.classList.add("row");
  const questionColumn = document.createElement("div");
  questionColumn.classList.add("col", "m-4");
  const subjectP = document.createElement("p");
  const subjectStrong = document.createElement("strong");
  subjectP.style.display = "flex";
  subjectP.style.justifyContent = "flex-end";
  const questionP = document.createElement("p");

  questionColumn.appendChild(subjectP);
  questionColumn.appendChild(questionP);
  questionRow.appendChild(questionColumn);
  questionContHTML.appendChild(questionRow);
  if (res.status === "failed") {
    questionP.innerText = res.message;
    return;
  }

  subjectStrong.innerText = res.data.subject;
  subjectP.appendChild(subjectStrong);

  questionP.innerText = `Question ${res.data.qIndex + 1}: ${res.data.question}`;

  const questionUl = document.createElement("ul");
  if (res.data.type === "mcq") {
    res.data.options.map((op, index) => {
      const opRadio = document.createElement("input");
      opRadio.setAttribute("type", "radio");
      opRadio.setAttribute("onclick", `answerSelected(event, ${op})`);
      opRadio.setAttribute("name", "answer_option");
      opRadio.setAttribute("class", "answer_option");
      opRadio.setAttribute("defaultValue", op);
      opRadio.setAttribute("id", op);
      opRadio.classList.add("btn", "btn-outline-dark", "m-1");
      
      if(res.data.answer == op) {
        opRadio.setAttribute("checked", true);
      } else {
        opRadio.setAttribute("disabled", true);
      }
      const label = document.createElement("label");
      label.setAttribute("for", op);
      label.innerHTML = op;
      const br = document.createElement("br");
      questionUl.appendChild(opRadio);
      questionUl.appendChild(label);
      questionUl.appendChild(br);
    });
  } 
  if (res.data.type === "input") {
    const opText = document.createElement("input");
    opText.setAttribute("type", "text");
    opText.setAttribute("readonly", false);
    opText.setAttribute("value", res.data.answer);
    questionUl.appendChild(opText);
  }

  questionColumn.appendChild(questionUl);

  const btnNext = document.createElement("button");
  btnNext.classList.add("btn", "btn-danger");
  btnNext.innerText = "Next";
  const btnSend = document.createElement("button");
  btnSend.classList.add("btn", "btn-success");
  btnSend.innerText = "Send";
  btnSend.id = "sendQuestionBtn";
  const nextBtnDiv = document.createElement("div");
  nextBtnDiv.classList.add("col", "m-4");
  nextBtnDiv.style.display = "grid";
  const sendBtnDiv = document.createElement("div");
  sendBtnDiv.classList.add("col", "m-4");
  sendBtnDiv.style.display = "grid";
  const btnsDiv = document.createElement("div");
  btnsDiv.className = "row";

  nextBtnDiv.appendChild(btnNext);
  sendBtnDiv.appendChild(btnSend);
  btnsDiv.appendChild(nextBtnDiv);
  btnsDiv.appendChild(sendBtnDiv);
  questionContHTML.appendChild(btnsDiv);

  btnNext.onclick = (event) => getQuestion(event, `${res.data.qIndex + 1}`);
  btnSend.onclick = (event) => sendQuestion(event, res.data);
};

// //////// ////////////////////////////////////////////////////////////

const sendQuestion = (event, question) => {
  socket.emit("ques_send", {
    ...question,
    roomCode: roomCode,
    teacherId
  });
  document.querySelector('#sendQuestionBtn').style.display = "none"
};

// ////////////////////////////////////////////////////////////////////
