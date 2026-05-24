const express = require("express");
const http = require("http");
const WebSocket = require("ws");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.static(__dirname));

let state = {
  score1: 0,
  score2: 0,
  team1: "ALCIGNE",
  team2: "VIKI HATZ",
  logo1: "https://cdn-icons-png.flaticon.com/512/53/53283.png",
  logo2: "https://cdn-icons-png.flaticon.com/512/53/53283.png",
  seconds: 0,
  running: false
};

// Teniamo traccia di chi ha segnato l'ultimo gol per sapere chi scalare con la VAR
let lastGoalTeam = null;

function formatTime(){
  let m = Math.floor(state.seconds / 60);
  let s = state.seconds % 60;
  return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
}

function broadcast(){
  const data = { ...state, timer: formatTime() };

  wss.clients.forEach(c=>{
    if(c.readyState === 1){
      c.send(JSON.stringify(data));
    }
  });
}

setInterval(()=>{
  if(state.running) state.seconds++;
  broadcast();
},1000);

wss.on("connection",(ws)=>{

  ws.send(JSON.stringify({...state,timer:formatTime()}));

  ws.on("message",(msg)=>{
    const data = JSON.parse(msg);

    switch(data.type){

      case "goal1": 
        state.score1++; 
        lastGoalTeam = 1; // Salva che ha segnato la squadra 1
        break;
        
      case "goal2": 
        state.score2++; 
        lastGoalTeam = 2; // Salva che ha segnato la squadra 2
        break;

      case "var":
        // Se l'ultimo gol lo ha fatto la squadra 1 ed è maggiore di 0, togli 1 punto
        if (lastGoalTeam === 1 && state.score1 > 0) {
          state.score1--;
          lastGoalTeam = null; // Resetta l'ultimo gol salvato
        } 
        // Se l'ultimo gol lo ha fatto la squadra 2 ed è maggiore di 0, togli 1 punto
        else if (lastGoalTeam === 2 && state.score2 > 0) {
          state.score2--;
          lastGoalTeam = null; // Resetta l'ultimo gol salvato
        }
        break;

      case "reset":
        state = {
          ...state,
          score1:0,
          score2:0,
          seconds:0,
          running:false
        };
        lastGoalTeam = null;
        break;

      case "timer":
        state.running = !state.running;
        break;

      case "team":
        state.team1 = data.team1;
        state.team2 = data.team2;
        break;

      case "logo":
        state.logo1 = data.logo1;
        state.logo2 = data.logo2;
        break;
    }

    broadcast();
  });

});

server.listen(3000,()=>console.log("RUNNING"));
