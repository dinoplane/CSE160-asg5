import {MusicPlayer} from "./music.js"


// Define variables
let musicPlayer;

function addActionsToHTMLUI(){
    document.getElementById("play1").onclick = function(ev){
        sendTextToHTML("Playing", "stateDisplay");
        musicPlayer.playChannel();
    };

    document.getElementById("stop").onclick = function(ev){
        sendTextToHTML("Stop", "stateDisplay");
        musicPlayer.stopChannel();
    };
}

function main(){
    musicPlayer = new MusicPlayer();
    musicPlayer.addChannel();
    addActionsToHTMLUI();
}

function sendTextToHTML(text, htmlID){
    var htmllm = document.getElementById(htmlID);
    if (!htmllm){
      console.log("Failed to get " + htmlID + " from HTML");
      return;
    }
    htmllm.innerHTML = text;
}

main();