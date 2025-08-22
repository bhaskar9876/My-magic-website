// Firebase database reference
const db = firebase.database();

// Audience joins session
function joinSession() {
  const code = document.getElementById("sessionCode").value;
  if(!code) return;
  
  document.getElementById("connect-section").style.display = "none";
  document.getElementById("connected-section").style.display = "block";

  db.ref("sessions/" + code).on("value", snapshot => {
    const data = snapshot.val();
    if(data && data.result) {
      let html = `<div class="search-result">`;
      html += `<h2>${data.result}</h2>`;
      // If it's a YouTube link → embed
      if(data.result.includes("youtube.com")) {
        html += `<iframe width="300" height="200" src="${data.result.replace("watch?v=", "embed/")}" frameborder="0" allowfullscreen></iframe>`;
      }
      html += `</div>`;
      document.getElementById("results").innerHTML = html;
    }
  });
}

// Controller sends result
function sendResult() {
  const code = document.getElementById("sessionCode").value;
  const text = document.getElementById("resultText").value;
  if(!code || !text) return;
  
  db.ref("sessions/" + code).set({ result: text });
}

// Controller disconnects session
function disconnectSession() {
  const code = document.getElementById("sessionCode").value;
  if(!code) return;
  
  db.ref("sessions/" + code).remove();
  document.getElementById("resultText").value = "";
  alert("Session disconnected");
}
