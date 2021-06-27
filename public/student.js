const BASE_URL = `https://quiz-cp.herokuapp.com`;

// const BASE_URL = `http://localhost:5000`;

// //////////////////////////////////////////////////////////////////
const socket = io(`${BASE_URL}`);
const headingHTML = document.querySelector("#heading");
const questionContHTML = document.querySelector("#questionCont");
let QUESTION;

let T1, T2;
let answer;
let btnAnswer;
let performanceDisplay = false;
const performanceBtnHTML = document.querySelector("#performanceBtn");
const performanceContHTML = document.querySelector("#performanceCont");

socket.on("connection");

socket.on("quiz_question", (data) => {
  // display question
  console.log(data);
  QUESTION = data;
  performanceDisplay = false;
  performanceBtnHTML.innerText = "Show Performance";
  performanceContHTML.style.display = "none";
  questionContHTML.style.display = "block";
  displayQuestion(data);
});

// /////////////////////////////////////////////////////////////

const urlParams = new URLSearchParams(window.location.search);
const studentName = urlParams.get("name");
const roomCode = urlParams.get("roomCode");
const studentId = Math.random();
const userType = "student";
socket.emit("join-room", roomCode);

// ////////////////////////////////////////////////////////////////

const extratParticipantsList = async () => {
  try {
    let options = {
      method: "GET",
    };
    const resRaw = await fetch(
      `${BASE_URL}/student/get-participants-list?roomCode=${roomCode}`,
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

const displayQuestion = (data) => {
  questionContHTML.innerHTML = "";
  const questionRow = document.createElement("div");
  questionRow.classList.add("row");
  const questionColumn = document.createElement("div");
  questionColumn.classList.add("col", "m-4");
  const subjectP = document.createElement("p");
  const subjectStrong = document.createElement("strong");
  const questionP = document.createElement("p");

  questionColumn.appendChild(subjectP);
  questionColumn.appendChild(questionP);
  questionRow.appendChild(questionColumn);
  questionContHTML.appendChild(questionRow);

  subjectStrong.innerText = data.subject;
  subjectP.appendChild(subjectStrong);

  questionP.innerText = `Question: ${data.question}`;

  const questionUl = document.createElement("ul");
  if (data.type === "mcq") {
    data.options.map((op, index) => {
      const opRadio = document.createElement("input");
      opRadio.setAttribute("type", "radio");
      opRadio.setAttribute("onclick", `answerSelected(event, ${op})`);
      opRadio.setAttribute("name", "answer_option");
      opRadio.setAttribute("class", "answer_option");
      opRadio.setAttribute("defaultValue", op);
      opRadio.setAttribute("id", op);
      opRadio.classList.add("btn", "btn-outline-dark", "m-1");

      const label = document.createElement("label");
      label.setAttribute("for", op);
      label.innerHTML = op;
      const br = document.createElement("br");
      questionUl.appendChild(opRadio);
      questionUl.appendChild(label);
      questionUl.appendChild(br);
    });
  }

  questionColumn.appendChild(questionUl);

  const btnSkip = document.createElement("button");
  btnSkip.classList.add("btn", "btn-danger");
  btnSkip.innerText = "Skip";
  btnAnswer = document.createElement("button");
  btnAnswer.disabled = true;
  btnAnswer.classList.add("btn", "btn-success");
  btnAnswer.innerText = "Answer";
  const skipBtnDiv = document.createElement("div");
  skipBtnDiv.classList.add("col", "m-4");
  skipBtnDiv.style.display = "grid";
  const answerBtnDiv = document.createElement("div");
  answerBtnDiv.classList.add("col", "m-4");
  answerBtnDiv.style.display = "grid";
  const btnsDiv = document.createElement("div");
  btnsDiv.className = "row";

  skipBtnDiv.appendChild(btnSkip);
  answerBtnDiv.appendChild(btnAnswer);
  btnsDiv.appendChild(skipBtnDiv);
  btnsDiv.appendChild(answerBtnDiv);
  questionContHTML.appendChild(btnsDiv);

  btnSkip.onclick = (event) => skipQuestion(event, data);
  btnAnswer.onclick = (event) => answerQuestion(event, data);
  T1 = new Date();

  if (data.type === "input") {
    const opText = document.createElement("input");
    opText.setAttribute("type", "text");
    opText.id = "q_input_ans";

    questionUl.appendChild(opText);
    btnAnswer.disabled = false;
  }
};

// ////////////////////////////////////////////////////////////////////

const answerSelected = (e, option) => {
  btnAnswer.disabled = false;
  answer = option;
  T2 = new Date();
};

// ///////////////////////////////////////////////////////////////////

const skipQuestion = async (e, data) => {
  const d = {
    studentName: studentName,
    studentId: studentId,
    qIndex: data.qIndex,
    questionId: data.questionId,
    status: "skipped",
    roomCode: data.roomCode,
    teacherId: data.teacherId,
    date: new Date(),
  };
  console.log(d);
  let option = {
    method: "POST",
    headers: {
      "Content-Type": "application/json;charset=utf-8",
    },
    body: JSON.stringify(d),
  };
  const rawRes = await fetch(`${BASE_URL}/teacher/question-skipped`, option);
  const res = await rawRes.json();
  // console.log(res);
  if (rawRes.status === 201) {
    alert("your input recorded");
    questionContHTML.innerHTML = "";
  }
  // socket.to(data.sockedId).emit('question_skipped', d);
};

// //////////////////////////////////////////////////////////////////////

const answerQuestion = async (e, data) => {
  if (data.type === "input") {
    answer = document.querySelector('#q_input_ans').value;
  }
  T2 = new Date();

  const d = {
    studentName: studentName,
    studentId: studentId,
    qIndex: data.qIndex,
    questionId: data.questionId,
    status: "answered",
    answer: answer,
    timeTaken: T2 - T1,
    roomCode: data.roomCode,
    teacherId: data.teacherId,
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
  console.log(res);
  if (rawRes.status === 201) {
    alert("answer submitted");
    questionContHTML.innerHTML = "";
  }
  // socket.to(data.sockedId).emit('question_answered', d);
};
