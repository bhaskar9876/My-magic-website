// Audience side (Result Page)
function joinSession() {
  const code = document.getElementById("sessionCode").value;
  const db = firebase.database();
  db.ref("sessions/" + code).on("value", snapshot => {
    const data = snapshot.val();
    if (data && data.result) {
      // Show result text
      document.getElementById("results").innerHTML =
        `<h2>Search Result for: ${data.result}</h2>` +
        // If it's a YouTube link → embed it
        (data.result.includes("youtube.com")
          ? `<iframe width="300" height="200" src="${data.result.replace("watch?v=", "embed/")}" frameborder="0" allowfullscreen></iframe>`
          : "");
    }
  });
}

// Controller side (Friend)
function sendResult() {
  const code = document.getElementById("sessionCode").value;
  const text = document.getElementById("searchText").value;
  const db = firebase.database();
  db.ref("sessions/" + code).set({ result: text });
}
