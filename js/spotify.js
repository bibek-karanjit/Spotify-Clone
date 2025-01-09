let currentSong = new Audio();
let songs;
let currFolder;

// function to convert the time in 00:00 format
function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  // Pad with zeros if needed
  const formattedMinutes = String(minutes).padStart(2, "0");
  const formattedSeconds = String(remainingSeconds).padStart(2, "0");

  return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder) {
  currFolder = `songs/${folder}`;

  const url = `http://127.0.0.1:5500/${currFolder}`;
  const response = await fetch(url);
  const html = await response.text();

  // Parse the HTML into a DOM structure
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  // Find all song links in the parsed HTML
  const songLinks = doc.querySelectorAll('a[href$=".mp3"], a[href$=".m4a"]');

  let songTitles = [];
  songs = [];

  // Log the song names and URLs
  songLinks.forEach((link) => {
    const songTitle = link.title.trim();
    songTitles.push(songTitle);

    const songUrl = link.href;
    songs.push(songUrl);
  });
  return { songs, songTitles };
}

// plays music
const playMusic = (track, pause = false) => {
  currentSong.src = `${currFolder}/${encodeURIComponent(track)}`;

  if (!pause) {
    currentSong.play();
    play.src = "img/pause.svg";
  }
  document.querySelector(".songInfo").innerHTML = track;
  document.querySelector(".songTime").innerHTML = "00:00 / 00:00";
};

async function displayAlbums() {
  const url = `http://127.0.0.1:5500/songs`;
  const response = await fetch(url);
  const html = await response.text();

  // Parse the HTML into a DOM structure
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  let anchors = doc.getElementsByTagName("a");
  let cardContainer = document.querySelector(".cardContainer");
  let array = Array.from(anchors);
  for (let index = 0; index < array.length; index++) {
    const e = array[index];

    if (e.href.includes("/songs/")) {
      let folder = e.href.split("/").slice(-1)[0];
      // Get the meta-data of the folder
      const url = `http://127.0.0.1:5500/songs/${folder}/info.json`;
      const response = await fetch(url);
      const responses = await response.json();

      cardContainer.innerHTML =
        cardContainer.innerHTML +
        ` <div data-folder=${folder} class="card">
      <div class="play">
      <img src="img/playButton.svg" alt="">
      </div>
      <img src="/songs/${folder}/cover.jpg"
      alt="">
      <h2>${responses.title}</h2>
      <p>${responses.description}</p>
      </div>`;
    }
  }
  // load the playlist whenever a card is clicked
  Array.from(document.getElementsByClassName("card")).forEach((e) => {
    e.addEventListener("click", async (item) => {
      // Clear the current song list
      let songUL = document
        .querySelector(".songList")
        .getElementsByTagName("ul")[0];
      songUL.innerHTML = ""; // Clear the playlist

      //get Songs from the selected folder
      songss = await getSongs(`${item.currentTarget.dataset.folder}`);

      // Update the playlist with new songs
      for (const song of songss.songTitles) {
        songUL.innerHTML += `<li>
          <img class="invert musicLogo" src="img/music.svg" alt="">
          <div class="info">
            <div class="names">${song}</div>
          </div>
          <div class="playnow">
            <img class="invert music2" src="img/play2.svg" alt="">
          </div>
        </li>`;
      }

      // Attach click event listener to new `li` elements
      Array.from(songUL.getElementsByTagName("li")).forEach((li) => {
        li.addEventListener("click", () => {
          playMusic(li.querySelector(".info .names").innerText);
        });
      });

      // Pause the current song and update the play/pause button
      if (!currentSong.paused) {
        currentSong.pause();
        play.src = "img/play.svg"; // Update icon to 'play' when paused
      }

      // Play the first song from the new folder
      const randomIndex = Math.floor(Math.random() * songss.songTitles.length);
      playMusic(songss.songTitles[randomIndex], true);
    });
  });
}

async function main() {
  // get the list of songs
  songss = await getSongs("pop"); // default "pop" folder

  // Display all the albums on the page
  displayAlbums();

  // Play a random song at the very beginning
  const randomIndex = Math.floor(Math.random() * songss.songTitles.length);
  playMusic(songss.songTitles[randomIndex], true);

  // Show all the songs in the playlist
  let songUL = document
    .querySelector(".songList")
    .getElementsByTagName("ul")[0];

  // Add the new songs from the selected folder
  for (const song of songss.songTitles) {
    songUL.innerHTML =
      songUL.innerHTML +
      `<li>
                                <img class="invert musicLogo" src="img/music.svg" alt="">
                                <div class="info">
                                    <div class="names">${song}</div>
                                </div>
                                <div class="playnow">
                                    <img class="invert music2" src="img/play2.svg" alt="">
                                </div>
        
         </li>`;
  }

  // Attach event listener to each song
  Array.from(songUL.getElementsByTagName("li")).forEach((li) => {
    li.addEventListener("click", () => {
      playMusic(li.querySelector(".info .names").innerText);
    });
  });

  // Add event listener to play, pause
  play.addEventListener("click", () => {
    if (currentSong.paused) {
      currentSong.play();
      play.src = "img/pause.svg";
    } else {
      currentSong.pause();
      play.src = "img/play.svg";
    }
  });
}

// Update the time
currentSong.addEventListener("timeupdate", () => {
  document.querySelector(".songTime").innerHTML = `${formatTime(
    currentSong.currentTime
  )} / ${formatTime(currentSong.duration)}`;
  document.querySelector(".circle").style.left = `${
    (currentSong.currentTime / currentSong.duration) * 100
  }%`;
});

// Add an event listner to seekbar
document.querySelector(".seekbar").addEventListener("click", (e) => {
  const seekTime = (e.offsetX / e.target.clientWidth) * currentSong.duration;
  currentSong.currentTime = seekTime;
  document.querySelector(".circle").style.left = `${
    (currentSong.currentTime / currentSong.duration) * 100
  }%`;
});

// Add an event listener to the hamburger
document.querySelector(".hamburger").addEventListener("click", () => {
  document.querySelector(".left").style.left = "0";
});

// Add an event listener to the close button
document.querySelector(".close").addEventListener("click", () => {
  document.querySelector(".left").style.left = "-140%";
});

// Add an event listener to previous
previous.addEventListener("click", () => {
  const findingIndex = decodeURIComponent(
    currentSong.src.split("/").splice(-1)[0]
  );
  let index = songss.songTitles.indexOf(findingIndex);
  if (index > 0) {
    playMusic(songss.songTitles[index - 1]);
  } else {
    playMusic(songss.songTitles[songss.songTitles.length - 1]);
  }
});

// Add an event listener to next
next.addEventListener("click", () => {
  const findingIndex = decodeURIComponent(
    currentSong.src.split("/").splice(-1)[0]
  );
  let index = songss.songTitles.indexOf(findingIndex);
  if (index >= 0 && index < songss.songTitles.length - 1) {
    playMusic(songss.songTitles[index + 1]);
  } else {
    playMusic(songss.songTitles[0]);
  }
});

// Add an event listener to volume
document
  .querySelector(".range")
  .getElementsByTagName("input")[0]
  .addEventListener("change", (e) => {
    currentSong.volume = parseInt(e.target.value) / 100;
  });

// Play the next song when the current song ends
currentSong.addEventListener("ended", () => {
  const findingIndex = decodeURIComponent(
    currentSong.src.split("/").splice(-1)[0]
  );
  let index = songss.songTitles.indexOf(findingIndex);
  if (index >= 0 && index < songss.songTitles.length - 1) {
    playMusic(songss.songTitles[index + 1]);
  } else {
    playMusic(songss.songTitles[0]); // Loop back to the first song
  }
});

main();
