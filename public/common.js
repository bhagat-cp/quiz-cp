const fetchPerformance = async () => {
  if (performanceDisplay) {
    performanceDisplay = !performanceDisplay;
    performanceBtnHTML.innerText = "Show Performance";
    performanceContHTML.style.display = "none";
    questionContHTML.style.display = "block";
    headingHTML.innerText = "Question";
    return;
  }

  let rawRes = await fetch(
    `${BASE_URL}/${userType}/performance?roomcode=${roomCode}`,
    {
      method: "GET",
    }
  );
  let res = await rawRes.json();

  performanceDisplay = !performanceDisplay;

  performanceBtnHTML.innerText = "Hide Performance";
  performanceContHTML.style.display = "block";
  questionContHTML.style.display = "none";
  headingHTML.innerText = "Performance";
  displayPerformance(res);
};

performanceBtnHTML.addEventListener("click", fetchPerformance);

// ////////////////////////////////////////////////////////////////////////

const eachQuestionChart = () => {
  const chart = new CanvasJS.Chart("chartContainer", {
    animationEnabled: true,
    title: {
      text: "Desktop Search Engine Market Share - 2016",
    },
    data: [
      {
        type: "pie",
        startAngle: 240,
        yValueFormatString: '##0.00"%"',
        indexLabel: "{label} {y}",
        dataPoints: [
          { y: 79.45, label: "Google" },
          { y: 7.31, label: "Bing" },
          { y: 7.06, label: "Baidu" },
          { y: 4.91, label: "Yahoo" },
          { y: 1.26, label: "Others" },
        ],
      },
    ],
  });
  chart.render();
};

// ////////////////////////////////////////////////////////////////////

const displayPerformance = (res) => {
  // questionContHTML.innerHTML = "";
  performanceContHTML.innerHTML = "";

  const table = drawMainTable(res.ranks);
  performanceContHTML.appendChild(table);

  const accordion = document.createElement("div");
  accordion.className = "accordion";
  accordion.id = "accordionPerformance";

  for (let i = 0; i < res.eachQuestionDetail.length; i++) {
    const eachQ = res.eachQuestionDetail[i];
    const accordionItem = document.createElement("div");
    accordionItem.className = "accordion-item";
    let accordionH2 = document.createElement("h2");
    accordionH2.className = "accordion-header";
    accordionH2.id = `heading-${i}`;

    const btn = document.createElement("button");
    btn.classList.add("accordion-button", "collapsed");
    btn.setAttribute("type", "button");
    btn.setAttribute("data-bs-toggle", "collapse");
    btn.setAttribute("data-bs-target", `#collapse_${i}`);
    btn.setAttribute("aria-expanded", "false");
    btn.setAttribute("aria-controls", `collapse_${i}`);
    btn.innerText = `Question ${i} : ${eachQ.question}`;
    accordionH2.appendChild(btn);

    const div = document.createElement("div");
    div.id = `collapse_${i}`;
    div.classList.add("accordion-collapse", "collapse", "collapse");
    div.setAttribute("aria-labelledby", `heading-${i}`);
    div.setAttribute("data-bs-parent", "#accordionPerformance");

    const accordionBody = document.createElement("div");
    accordionBody.className = "accordion-body";
    //  content

    // const chartDiv = document.createElement('div');
    // chartDiv.id = "chartContainer";
    // accordionBody.appendChild(chartDiv);
    // chartDiv.style.height = 370;
    // chartDiv.style.width = "100%";

    const accordionTableCont = document.createElement("div");
    const table = drawSubTable(eachQ.answers);
    accordionTableCont.appendChild(table);

    accordionBody.appendChild(accordionTableCont);
    div.appendChild(accordionBody);
    accordionItem.appendChild(accordionH2);
    accordionItem.appendChild(div);

    accordion.appendChild(accordionItem);
  }

  performanceContHTML.appendChild(accordion);
};

// /////////////////////////////////////////////////////////////////////

const drawMainTable = (data) => {
  const mainTable = document.createElement("table");
  mainTable.className = "table";
  const thead = document.createElement("thead");
  const tr = document.createElement("tr");
  const th = document.createElement("th");
  th.setAttribute("scope", "col");
  th.innerText = "#";
  tr.appendChild(th);
  const th1 = document.createElement("th");
  th1.setAttribute("scope", "col");
  th1.innerText = "Name";
  tr.appendChild(th1);
  const th2 = document.createElement("th");
  th2.setAttribute("scope", "col");
  th2.innerText = "Average Time";
  tr.appendChild(th2);
  const th3 = document.createElement("th");
  th3.setAttribute("scope", "col");
  th3.innerText = "Score";
  tr.appendChild(th3);
  thead.appendChild(tr);
  mainTable.appendChild(thead);

  const tbody = document.createElement("tbody");
  mainTable.appendChild(tbody);

  if (data.length === 0) {
    const tr1 = document.createElement("tr");
    tr1.innerText = "No Participants";
    tbody.appendChild(tr1);
    return mainTable;
  }

  for (let i = 0; i < data.length; i++) {
    const tr1 = document.createElement("tr");
    const th4 = document.createElement("th");
    th4.setAttribute("scope", "row");
    th4.innerText = `${i + 1}`;
    const td = document.createElement("td");
    td.innerText = data[i].studentName;

    let avgTime = data[i].totalTime / 1000 / data[i].score;

    if (data[i].totalTime == 0) {
      avgTime = 0;
    }
    avgTime.toFixed(2);
    avgTime.toString();

    const td1 = document.createElement("td");
    td1.innerText = `${avgTime} sec`;
    const td2 = document.createElement("td");
    td2.innerText = data[i].score;
    tr1.appendChild(th4);
    tr1.appendChild(td);
    tr1.appendChild(td1);
    tr1.appendChild(td2);
    tbody.appendChild(tr1);
  }

  return mainTable;
};

// ////////////////////////////////////////////////////////////////////

const drawSubTable = (data) => {
  const subTable = document.createElement("table");
  subTable.className = "table";
  const thead = document.createElement("thead");
  const tr = document.createElement("tr");
  const th = document.createElement("th");
  th.setAttribute("scope", "col");
  th.innerText = "#";
  tr.appendChild(th);
  const th1 = document.createElement("th");
  th1.setAttribute("scope", "col");
  th1.innerText = "Name";
  tr.appendChild(th1);
  const th2 = document.createElement("th");
  th2.setAttribute("scope", "col");
  th2.innerText = "Average Time";
  tr.appendChild(th2);
  const th3 = document.createElement("th");
  th3.setAttribute("scope", "col");
  th3.innerText = "Status";
  tr.appendChild(th3);

  thead.appendChild(tr);
  subTable.appendChild(thead);

  const tbody = document.createElement("tbody");

  for (let i = 0; i < data.length; i++) {
    if (!data[i]) continue;
    const tr1 = document.createElement("tr");
    const th4 = document.createElement("th");
    th4.setAttribute("scope", "row");
    th4.innerText = 1;
    const td = document.createElement("td");
    td.innerText = data[i].studentName;

    let avgTime = data[i].timeTake / 1000;
    avgTime.toFixed(2);
    avgTime.toString();

    const td1 = document.createElement("td");
    td1.innerText = `${avgTime} sec`;

    const td2 = document.createElement("td");
    td2.innerText = data[i].status;

    tr1.appendChild(th4);
    tr1.appendChild(td);
    tr1.appendChild(td1);
    tr1.appendChild(td2);
    tbody.appendChild(tr1);
  }

  subTable.appendChild(tbody);
  return subTable;
};

// ///////////////////////////////////////////////////////////////////////

const leftHeadingHTML = document.querySelector("#left-heading");
const participantsListHTML = document.querySelector("#participants-list");
const participantsHeadingHTML = document.querySelector("#participantsHeading");
const roomCodeHeadingHTML = document.querySelector("#roomCodeHeading");

const displayParticipantList = (data) => {
  participantsListHTML.innerHTML = "";
  const cardDiv = document.createElement("div");
  cardDiv.classList.add("card");
  const cardBody = document.createElement("div");
  cardBody.classList.add("card-body");
  const name = document.createElement("h6");
  const time = document.createElement("p");
  name.innerText = `Host: ${data.name}`;
  time.innerText = new Date(data.createdAt);

  cardBody.appendChild(name);
  cardBody.appendChild(time);
  cardDiv.appendChild(cardBody);
  participantsListHTML.appendChild(cardDiv);

  data.participants.map((participant) => {
    const cardDiv1 = document.createElement("div");
    cardDiv1.classList.add("card");
    const cardBody1 = document.createElement("div");
    cardBody1.classList.add("card-body");
    const name1 = document.createElement("p");
    const time1 = document.createElement("p");
    name1.innerText = participant.name;
    time1.innerText = `${new Date(participant.joinedAt)}`;

    cardBody1.appendChild(name1);
    cardBody1.appendChild(time1);
    cardDiv1.appendChild(cardBody1);
    participantsListHTML.appendChild(cardDiv1);
  });

  const totalParticipants = data.participants.length + 1;
  participantsHeadingHTML.innerText = `Participants - ${totalParticipants}`;
  roomCodeHeadingHTML.innerText = `Room Code: ${data.roomId}`;
};

socket.on("participant-added", (data) => {
  displayParticipantList(data);
});
