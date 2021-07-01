const BASE_URL = `https://quiz-cp.herokuapp.com`;
// const BASE_URL = `http://localhost:5000`;
let chatMode = "default";
let QUESTION;

const socket = io(`${BASE_URL}`);
socket.on("connection");

const rand = Math.round(Math.random() * (999 - 1000) + 1000);

const studentName = `Mark_${rand}`;
const roomCode = "1234";
const studentId = Math.random();
const userType = "student";

socket.on("connection");

socket.on("quiz_question", (data) => {
  console.log(data);
  QUESTION = data;
  displayQuestion(data);
});

const displayQuestion = data => {
  const qpartA = ``;
  const qpartB = ``;
  const qpartC = ``;
}