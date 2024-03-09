let currentSong = new Audio()
let songs;
let currFolder

function formatSeconds(seconds) {

  if(isNaN(seconds)||seconds<0){
    return "00:00"
  }

  var minutes = Math.floor(seconds / 60);
  var remainingSeconds = Math.floor(seconds % 60); // Round down to get integer seconds

  // Add leading zeros if necessary
  var minutesString = minutes < 10 ? '0' + minutes : minutes;
  var secondsString = remainingSeconds < 10 ? '0' + remainingSeconds : remainingSeconds;

  return minutesString + ':' + secondsString;
}

async function getSongs(folder){
  currFolder = folder
  let a = await fetch(`http://127.0.0.1:5500/SpotifyClone/${folder}/`);
  let response = await a.text();
  let div=document.createElement("div");
  div.innerHTML=response;
  let as = div.getElementsByTagName("a");
  // console.log(as);
  songs=[];
  for (let index = 0; index < as.length; index++) {
    const element = as[index];
    
    if (element.href.endsWith(".mp3")) {
      songs.push(element.href.split(`/${folder}/`)[1]);
    }
  };

  //show all the song in tha playlist

  let songUl= document.querySelector(".songList")
  songUl.innerHTML=""

  for (const num of songs) {
    songUl.innerHTML= songUl.innerHTML+ `<li><div class="songDiv">
    <img src="svg/icons8-music.svg" class="invert libraryMusicBtn"> 

  <div class="songName">
  <p>${num.replaceAll("%20"," ")}
  </p>

  </div>
  
  <img src="svg/play.svg" class="invert">

</div></li>`;
  }



  Array.from(document.querySelector(".songBar").getElementsByTagName("li")).forEach(e=>{
    e.addEventListener("click",element=>{
      playSong(e.querySelector(".songName").firstElementChild.innerHTML)
    })
    })
    return songs;

}

let playSong=(track)=>{
  console.log(currFolder)
  currentSong.src=`http://127.0.0.1:5500/SpotifyClone/${currFolder}/`+track
  pause.src="svg/pause.svg"
  currentSong.play()
  document.querySelector("#songInfo").innerHTML=track
  document.querySelector("#songDuration").innerHTML="00:00"
}

async function displayAlbums(){
  let a = await fetch(`http://127.0.0.1:5500/SpotifyClone/Songs/`);
  let response = await a.text();
  let div=document.createElement("div");
  div.innerHTML=response;
  let anchor= div.getElementsByTagName("a");
  let array = Array.from(anchor)
  for (let index = 0; index < array.length; index++) {
    const e = array[index];

    if(e.href.includes("/Songs/")){
      let folder = e.href.split("/").slice(-1)[0];
      // for Our Json.info

      let cardContainer=document.querySelector(".playlist")
      let a = await fetch(`http://127.0.0.1:5500/SpotifyClone/Songs/${folder}/info.json`);
      let response = await a.json();
      console.log(response)
      cardContainer.innerHTML=cardContainer.innerHTML+`
      <div data-folder="${folder}" class="card">
        <div class="cardImg">
        <img src="/SpotifyClone/Songs/${folder}/cover.jpg" alt="">
        <div class="greenBtn"><img src="svg/Spotify-Play-Button.png" ></div>
      </div>
        <div class="cardText invert flex column">
          <h4>${response.title}</h4>
          <p>${response.description}</p>
        </div>
      </div>`
    }
  }

}

let music = []
async function main(){
  await getSongs("songs/tsg");
  // display albums
  displayAlbums();

  pause.addEventListener("click",()=>{
    if(currentSong.paused){
      currentSong.play();
      pause.src="svg/pause.svg"
    }
    else{
      currentSong.pause();
      pause.src="svg/play.svg"
    }
})

//timestps

currentSong.addEventListener("timeupdate",()=>{
  //  console.log(currentSong.currentTime,currentSong.duration)
   document.querySelector("#songDuration").innerHTML=`${formatSeconds(currentSong.currentTime)}/${formatSeconds(currentSong.duration)}`
   document.querySelector(".playCircle").style.left=(currentSong.currentTime/currentSong.duration)*100 + "%";
})

document.querySelector(".seekBar").addEventListener("click",e=>{
  let percent=(e.offsetX/e.target.getBoundingClientRect().width)*100;
  document.querySelector(".playCircle").style.left=percent + "%";
  currentSong.currentTime = (currentSong.duration*percent)/100;
})

document.querySelector(".hamBurger").addEventListener("click",()=>{
  document.querySelector(".leftSection").style.left="0"
})

document.querySelector(".cancelIcon").addEventListener("click",()=>{
  document.querySelector(".leftSection").style.left="-130%"
})

previous.addEventListener("click",()=>{
  let index =(songs.indexOf(currentSong.src.split("/").slice(-1)[0]))

  if((index-1)>=0){
    playSong(decodeURIComponent(songs[index-1]))
  }

})

next.addEventListener("click",()=>{
  let index =(songs.indexOf(currentSong.src.split("/").slice(-1)[0]))

  if((index+1)< songs.length){
    playSong(decodeURIComponent(songs[index+1]))
  }

})



var volumeContainer = document.querySelector(".volume");
var volumeRange = document.querySelector("#volRange");
var timeoutId;

// listner for volume Bar Appears

volumeContainer.addEventListener('mouseenter', function() {
  // clearTimeout(timeoutId); // Clear any existing timeout
    document.querySelector(".volumeControl").style.left = "95vw";
});


document.addEventListener('click', function() {
      timeoutId = setTimeout(function() {
      document.querySelector(".volumeControl").style.left = "-130%";
    }, 5000);
});


// listner for volume icon visibility & Volume Range

document.querySelector("#volRange").addEventListener("change",e=>{
  currentSong.volume = parseInt(e.target.value)/100;

  if(currentSong.volume==1){
    document.querySelector("#volDown").style.visibility = "visible";
    document.querySelector("#silent").style.visibility = "collapse";
    document.querySelector("#fullVol").style.visibility = "collapse";
  }
  if(currentSong.volume>0||currentSong.volume<1){
    document.querySelector("#volDown").style.visibility = "collapse";
    document.querySelector("#silent").style.visibility = "collapse";
    document.querySelector("#fullVol").style.visibility = "visible";
  }
  if(currentSong.volume==0){
    document.querySelector("#silent").style.visibility = "visible";
    document.querySelector("#volDown").style.visibility = "collapse";
    document.querySelector("#fullVol").style.visibility = "collapse";
  }
})

// for mute when click on volume icon
document.querySelector(".volume").addEventListener("click",e=>{
if(e.target.src.includes("volume.svg")){
   e.target.src=e.target.src.replace("volume.svg","silent.svg")
   currentSong.volume=0
   document.querySelector("#volRange").value=0
}
else{
  e.target.src=e.target.src.replace("silent.svg","volume.svg")
  currentSong.volume=1
  document.querySelector("#volRange").value=100
}
})

Array.from(document.getElementsByClassName("card")).forEach(e=>{
  e.addEventListener("click",async item=>{
    songs=await getSongs(`songs/${item.currentTarget.dataset.folder}`);
    playSong(songs[0])
  })
})




}


main()









  // songs.forEach(function(num){
//     songUl.innerHTML= songUl.innerHTML+ `<li><div class="songDiv">
//     <img src="svg/icons8-music.svg" class="invert libraryMusicBtn">

//   <div>
//   <p class="songName">${num.replaceAll("%20"," ").split("-")[0]}</p>
//   <p>${num.replaceAll("%20"," ").replace(".mp3","").split("-")[1]}</p>
//   </div>
  
//   <img src="svg/play.svg" class="invert">

// </div></li>`;
//   })

//   Array.from(document.querySelector(".songList").getElementsByTagName("p")).forEach(num=>console.log(num.querySelector(".songName")))


// let a= document.querySelector(".songList").getElementsByTagName("li")
// console.log(a)