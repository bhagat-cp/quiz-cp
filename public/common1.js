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
