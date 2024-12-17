
async function fetchSongs() {
    const url = "http://127.0.0.1:5500/songs/";
    
        const response = await fetch(url);
        const aa = await response.text();
        
        // Parse the HTML into a DOM structure
        const parser = new DOMParser();
        const doc = parser.parseFromString(aa, "text/html");
        
        // Find all song links in the parsed HTML
        const songLinks = doc.querySelectorAll('a[href$=".mp3"]');

        console.log(songLinks)
        
        // Log the song names and URLs
        songLinks.forEach(link => {
            const songName = link.textContent.trim();
            const songUrl = link.href;
            console.log(`Song: ${songName}, URL: ${songUrl}`);
        });
 
}

fetchSongs();
