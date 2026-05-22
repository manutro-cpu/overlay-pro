function showGoal(){

  const goal = document.getElementById("goalAnimation");
  const ball = document.getElementById("ball");
  const text = document.getElementById("goalText");

  goal.style.display = "flex";

  // reset animazioni
  ball.style.animation = "none";
  text.style.animation = "none";

  // forza reset (fondamentale)
  void ball.offsetWidth;

  // riattiva animazioni sincronizzate
  ball.style.animation = "moveBall 2.5s linear forwards";
  text.style.animation = "revealText 2.5s linear forwards";

  // sparisce dopo animazione
  setTimeout(()=>{
    goal.style.display = "none";
  },2600);
}