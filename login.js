document.getElementById("loginForm").addEventListener("submit", function (e) {
  e.preventDefault();
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  if (username === "admin" && password === "admin") {
    window.location.href = "dashboard.html";
  } else {
    alert("Invalid username or password.");
  }
});
