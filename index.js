const teacherBtnHTML = document.querySelector("#teacherBtn");
const teacherFormHTML = document.querySelector("#teacherForm");
const studentFormHTML = document.querySelector("#studentForm");

// //////////////////////////////////////////////////////////////////////

// const generateQuizRoomId = () => {
//   const rand = Math.round(Math.random() * (9999 - 1000) + 1000 );
//   teacherFormHTML["roomCode"].value = rand;
// }

// teacherBtnHTML.addEventListener('click', generateQuizRoomId);

// ///////////////////////////////////////////////////////////////////////

const submitTeacherForm = async (e) => {
  e.preventDefault();

  const name = teacherFormHTML["name"].value;
  const roomCode = teacherFormHTML["roomCode"].value;

  try {
    let options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json;charset=utf-8",
      },
      body: JSON.stringify({
        name,
        roomCode,
      }),
    };
    const rawRes = await fetch(
      "http://localhost:5000/teacher/create-quiz-room", options
    );
    const res = await rawRes.json();

    if (!res.status) {
      alert("Quiz Id already exists. Change your quiz id");
      return;
    }
    window.location.href = `./teacher.html?roomCode=${roomCode}&name=${name}`;
  } catch (error) {
    console.log(error.message);
  }
};
teacherFormHTML.addEventListener("submit", submitTeacherForm);

// //////////////////////////////////////////////////////////////////////

const submitStudentForm = async (e) => {
  e.preventDefault();

  const name = studentFormHTML["name"].value;
  const roomCode = studentFormHTML["roomCode"].value;

  try {
    let options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json;charset=utf-8",
      },
      body: JSON.stringify({
        name,
        roomCode,
      }),
    };
    const rawRes = await fetch("http://localhost:5000/student/join-quiz-room", options);
    const res = await rawRes.json();

    if (!res.status) {
      alert("Quiz Id does not exist. Change your quiz id");
      return;
    }
    window.location.href = `./student.html?roomCode=${roomCode}&name=${name}`;
  } catch (error) {
    console.log(error.message);
  }
};

studentFormHTML.addEventListener("submit", submitStudentForm);
