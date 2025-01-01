let currentSong = new Audio();

// function to convert the time in 00:00 format
function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  // Pad with zeros if needed
  const formattedMinutes = String(minutes).padStart(2, '0');
  const formattedSeconds = String(remainingSeconds).padStart(2, '0');

  return `${formattedMinutes}:${formattedSeconds}`;
}


async function getSongs() {
  const url = "http://127.0.0.1:5500/songs/";

  const response = await fetch(url);
  const html = await response.text();

  // Parse the HTML into a DOM structure
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  // Find all song links in the parsed HTML
  const songLinks = doc.querySelectorAll('a[href$=".mp3"], a[href$=".m4a"]');

  let songTitles = [];
  let songs = [];

  // Log the song names and URLs
  songLinks.forEach((link) => {
    // const songName = link.textContent.trim();
    const songTitle = link.title.trim();
    songTitles.push(songTitle);

    const songUrl = link.href;
    songs.push(songUrl);
    // console.log(`Song: ${songName}, URL: ${songUrl}`);
  });
  return { songs, songTitles };
}

// plays music
const playMusic = (track, pause=false) => {
  // let audio = new Audio("/songs/" + track);
  currentSong.src = "/songs/" + track;
  if(!pause){
    currentSong.play();
    play.src = "pause.svg";
  }
  document.querySelector(".songInfo").innerHTML = track;
  document.querySelector(".songTime").innerHTML =  "00:00 / 00:00"; 
};

async function main() {
  // get the list of songs
  let songss = await getSongs();
  // let songTitles = await getSongs();
  
  playMusic(songss.songTitles[0], true);

  let songURLs = songss.songs;
  console.log(songURLs);

  let songUL = document
    .querySelector(".songList")
    .getElementsByTagName("ul")[0];

  // Show all the songs in the playlist
  for (const song of songss.songTitles) {
    songUL.innerHTML =
      songUL.innerHTML +
      `<li>
                                <img class="invert musicLogo" src="music.svg" alt="">
                                <div class="info">
                                    <div class="names">${song}</div>
                                </div>
                                <div class="playnow">
                                    <img class="invert music2" src="play2.svg" alt="">
                                </div>
        
         </li>`;
  }

  // Attach event listener to each song
  Array.from(
    document.querySelector(".songList").getElementsByTagName("li")
  ).forEach((e) => {
    e.addEventListener("click", () => {
      playMusic(e.querySelector(".info").firstElementChild.innerHTML);
      console.log(e.querySelector(".info").firstElementChild.innerHTML);
    });
  });

  // Add event listener to play, pause, next and previous buttons
  play.addEventListener("click", () => {
    if (currentSong.paused) {
      currentSong.play();
      play.src = "pause.svg";
    } else {
      currentSong.pause();
      play.src = "play.svg";
    }
  });
}

// Update the time
currentSong.addEventListener("timeupdate", () =>{
  document.querySelector(".songTime").innerHTML = `${formatTime(currentSong.currentTime)} / ${formatTime(currentSong.duration)}`;
  document.querySelector(".circle").style.left = `${(currentSong.currentTime / currentSong.duration) * 100}%`;
})

// Add an event listner to seekbar
document.querySelector(".seekbar").addEventListener("click", (e) => {
  const seekTime = (e.offsetX / e.target.clientWidth) * currentSong.duration;
  currentSong.currentTime = seekTime;
  document.querySelector(".circle").style.left = `${(currentSong.currentTime / currentSong.duration) * 100}%`;
})

// Add an event listener to the hamburger
document.querySelector(".hamburger").addEventListener("click", () => {
  document.querySelector(".left").style.left = "0";
})

// Add an event listener to the close button
document.querySelector(".close").addEventListener("click", () => {
  document.querySelector(".left").style.left = "-140%";
})

// Add an event listener to previous and next buttons


main();
