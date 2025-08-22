const db = firebase.database();
const FIXED_CODE = "9717";

// Dynamic / Predefined media database example
const mediaDatabase = {
  "Kala Chashma": "https://www.youtube.com/embed/6Gv8t7tXJ5g",
  "Amitabh Bachchan": "https://upload.wikimedia.org/wikipedia/commons/4/4c/Amitabh_Bachchan_at_Priyanka_Chopra%27s_birthday.jpg",
  "Shape of You": "https://www.youtube.com/embed/JGwWNGJdvx8"
};

// -------------------- AUDIENCE --------------------
function joinSession() {
  const codeInput = document.getElementById("sessionCode").value;
  if(codeInput !== FIXED_CODE) {
    alert("Wrong code!");
    return;
  }

  document.getElementById("connect-section").style.display = "none";
  document.getElementById("connected-section").style.display = "block";

  // Listen for controller result
  db.ref("sessions/" + FIXED_CODE).on("value", snapshot => {
    const data = snapshot.val();
    if(data && data.result) {
      let html = `<div class="search-result"><h2>${data.result}</h2>`;
      const url = mediaDatabase[data.result];
      if(url) {
        if(url.includes("youtube.com/embed")) {
          html += `<iframe width="300" height="200" src="${url}" frameborder="0" allowfullscreen></iframe>`;
        } else {
          html += `<img src="${url}" width="300" />`;
        }
      }
      html += `</div>`;
      document.getElementById("results").innerHTML = html;
    }
  });
}

// -------------------- CONTROLLER --------------------
function sendResult() {
  const text = document.getElementById("resultText").value;
  if(!text) return;

  db.ref("sessions/" + FIXED_CODE).set({ result: text });
  document.getElementById("connection-status").innerText = "Audience Connected";
  document.getElementById("connection-status").className = "connected";
}

function disconnectSession() {
  db.ref("sessions/" + FIXED_CODE).remove();
  document.getElementById("resultText").value = "";
  document.getElementById("connection-status").innerText = "Disconnected";
  document.getElementById("connection-status").className = "disconnected";
}
