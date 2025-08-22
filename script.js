const db = firebase.database();
const FIXED_CODE = "9717";

// Predefined media database
const mediaDatabase = {
  "Kala Chashma": "https://www.youtube.com/embed/6Gv8t7tXJ5g",
  "Amitabh Bachchan": "https://upload.wikimedia.org/wikipedia/commons/4/4c/Amitabh_Bachchan_at_Priyanka_Chopra%27s_birthday.jpg",
  "Shape of You": "https://www.youtube.com/embed/JGwWNGJdvx8"
};

// AUDIENCE SIDE
function joinSession() {
  const codeInput = document.getElementById("sessionCode").value;
  if(codeInput !== FIXED_CODE) {
    alert("Wrong code!");
    return;
  }

  document.getElementById("connect-section").style.display = "none";
  document.getElementById("connected-section").style.display = "block";

  db.ref("sessions/" + FIXED_CODE).on("value", snapshot => {
    const data = snapshot.val();
    if(data && data.result) {
      let html = `<div class="search-result"><h2>${data.result}</h2>`;
      const url = mediaDatabase[data.result];
      if(url
