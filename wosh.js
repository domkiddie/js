import Fuse from 'https://cdn.jsdelivr.net/npm/fuse.js@6.5.3/dist/fuse.esm.js'
import JSON5 from './json5.min.js'

const BASE_URL = `https://watchonline.ag`;
const API_URL = `https://basic-bundle-fancy-sky-d60a.rustedcorn.workers.dev/?https://watchonline.ag`;
const CORS_URL = `https://basic-bundle-fancy-sky-d60a.rustedcorn.workers.dev/?${BASE_URL}`;
let phpsessid;
async function fetchDocument(url) {        
    let response = await fetch(url);
    let text = await response.text();
    if (!fetchDocument.parser) fetchDocument.parser = new DOMParser(); // the dom parser is reusable
    return fetchDocument.parser.parseFromString(text, "text/html");
}

async function findContent(searchTerm, type,imdb) {
    var title, slug;
    try {
        if (type == "movie"){

        const searchUrl = `${CORS_URL}/api/v1/movies?per-page=5&filters[q]=${encodeURIComponent(searchTerm)}`;
        const searchRes = await fetch(searchUrl).then(res => { 
	      return res.json()
        }
   
        );
Object.entries(searchRes)[0][1].forEach(findImdb);
        // Parse DOM to find search results on full search page
function findImdb (res){
    if("tt" + res['imdb_id'] == imdb){
          title = res['title'];
         imdb = res['imdb_id'];
         slug = res['slug'];
    }
}

  return {
                options: [{ title, slug, type, imdb, source: 'lookmovie' }]
            }
        }else{
    const searchUrl = `${CORS_URL}/api/v1/shows?per-page=5&filters[q]=${encodeURIComponent(searchTerm)}`;
        const searchRes = await fetch(searchUrl).then(res => { 
	      return res.json()
        }
        );
        
        
Object.entries(searchRes['items']).forEach(findImdb);
console.log(Object.entries(searchRes['items']));
        // Parse DOM to find search results on full search page
function findImdb (res){
    if(res[1].imdb_id == imdb){
       console.log( res[1].title);
         title = res[1].title;
        imdb = res[1].imdb_id;
        slug = res[1].slug;
    }
}
        return {
                options: [{ title, slug, type, imdb, source: 'lookmovie' }]
            }
            
        }  
            
        
    } catch (e) {
        return { options: e }
    }
}
async function getVideoUrl(config) {
    let url = '';

    if (config.type === 'movie') {
        
        url = `${CORS_URL}/api/v1/security/movie-access?id_movie=${config.id}`;
        
    } else if (config.type === 'show') {
        url = `${CORS_URL}/api/v1/security/episode-access?id=${config.id}`;
    }

    const data = await fetch(url).then((d) => d.json());

    const subs = data?.subtitles;

    // Find video URL and return it (with a check for a full url if needed)
    const opts = ["1080p", "1080", "720p", "720", "480p", "480", "auto"];

    let videoUrl = '';
    let str = []
    for (let res of opts) {
        if (data.streams[res] && !data.streams[res].includes('dummy') && !data.streams[res].includes('earth-1984') ) {
            videoUrl = data.streams[res]
            
            str[res] = data.streams[res]
        }
        
    }

    return {
        videoUrl: videoUrl.startsWith("/") ? `${BASE_URL}${videoUrl}` : videoUrl, 
        subs: subs, 
        str: str
        
    };
}

async function getEpisodes(slug) {
    const url = `${CORS_URL}/shows/play/${slug}`;
    const pageReq = await fetch(url, {
        headers: { phpsessid },
    }).then((d) => d.text());

    const data = JSON5.parse("{" +
        pageReq
            .slice(pageReq.indexOf(`show_storage`))
            .split("};")[0]
            .split("= {")[1]
            .trim() +
        "}"
    );

    let seasons = [];
    let episodes = [];
    data.seasons.forEach((e) => {
        if (!seasons.includes(e.season))
            seasons.push(e.season);

        if (!episodes[e.season])
            episodes[e.season] = []
        episodes[e.season].push(e.episode)
    })

    return { seasons, episodes }
}
 function video() {
             const controls = [
            'play-large', // The large play button in the center
            'restart', // Restart playback
            'rewind', // Rewind by the seek time (default 10 seconds)
            'play', // Play/pause playback
            'fast-forward', // Fast forward by the seek time (default 10 seconds)
            'progress', // The progress bar and scrubber for playback and buffering
            'current-time', // The current time of playback
            'duration', // The full duration of the media
            'mute', // Toggle mute
            'volume', // Volume control
            'captions', // Toggle captions
            'settings', // Settings menu
            'pip', // Picture-in-picture (currently Safari only)
            'airplay', // Airplay (currently Safari only)
           // 'download', Show a download button with a link to either the current source or a custom URL you specify in your options
            'fullscreen',// Toggle fullscreen
             'quality'
        ];
      
      const player = Plyr.setup('#player', { controls });
   var video = document.querySelector('#player');
   return player;
}
async function getStreamUrl(slug, type, season, episode) {
    
        let url = '';
   
        if (type === 'movie') {
        url = `${CORS_URL}/${type}s/view/${slug}`;
    } else if (type === 'show') {
        
         url = `${CORS_URL}/${type}s/view/${slug}`;
         
    }
  let id = '';
    if (type === "movie") {
            const pageReq = await fetch(url).then((d) => d.text());
    
   
    const data = JSON5.parse("{" +
        pageReq
            .slice(pageReq.indexOf(`${type}_storage`))
            .split("};")[0]
            .split("= {")[1]
            .trim() +
        "}"
    );
        id = data.id_movie;
    } else if (type === "show") {

        let doc = await fetchDocument(url)
   id = doc.getElementsByClassName('episodes-items')[season-1].children[episode-1].getAttribute('data-id-episode');
    }
 
    if (id === '') {
        return { url: '' }
    }

    const videoUrl = await getVideoUrl({
        slug: slug,
        id: id,
        type: type
    }); 

    return { url: videoUrl.videoUrl, subtitles: videoUrl.subs,urls:videoUrl.str };
}



export { findContent, getStreamUrl, video };
