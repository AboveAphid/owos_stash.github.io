// Hello dirty code reader RAHH >:L

const GITHUB_TOKEN = null

const USERNAME = "AboveAphid"
const REPO = "owos_stash.github.io"

const DATABASE_URL = `https://api.github.com/repos/${USERNAME}/${REPO}/contents/Database`
const IMAGES_URL = DATABASE_URL+"/Images"
const VIDEOS_URL = DATABASE_URL+"/Videos"
const GIFS_URL = DATABASE_URL+"/Gifs"
const SVGS_URL = DATABASE_URL+"/SVGs"

const RECHECK_DATABASE_THRESHOLD_DAYS = 1
const RECHECK_DATABASE_THRESHOLD_HOURS = RECHECK_DATABASE_THRESHOLD_DAYS * 24
const RECHECK_DATABASE_THRESHOLD_MINS = RECHECK_DATABASE_THRESHOLD_HOURS * 60
const RECHECK_DATABASE_THRESHOLD_SECS = RECHECK_DATABASE_THRESHOLD_MINS * 60
const RECHECK_DATABASE_THRESHOLD_MS = RECHECK_DATABASE_THRESHOLD_SECS * 1000

function popup(message, disappear_delay_ms=5000) {
    var info_popup = document.getElementById("info-popup")

    if (info_popup === null) {
        alert(message)
        return
    }
    info_popup.style.opacity = 1
    info_popup.textContent = message

    setTimeout(function () {
        info_popup.style.opacity = 0
        // info_popup.textContent = "Byebye :3"
    }, disappear_delay_ms)
}

async function get_files_from_repo(url) {

    var headers = new Headers({
        "Accept": "application/vnd.github+json"
    })

    if (GITHUB_TOKEN) {
        headers.append(
            "Authorization", `token ${GITHUB_TOKEN}`,
        );
    }


    var res = await fetch(url, {
        headers: headers
    })
    
    var file_urls = []
    
    if (res.ok) {
        var files = await res.json()
        for (const f of files) {
            file_urls.push(f.download_url)
        }
    } else {
        popup("Could not access database! Redirecting to error page...")

        setTimeout(function () {
            window.location.href = "./error.html"
        }, 5000)
    }

    return file_urls
}


async function add_gallery_content(adding_for, should_recheck_database=false) {
    switch (adding_for) {
        case 'images':
            var gallery_id = "image-gallery"
            var localStorage_urls_key = "bk_image_urls"
            var element_type = "img"
            var content_url = IMAGES_URL
            break;
        
        case 'videos':
            var gallery_id = "video-gallery"
            var localStorage_urls_key = "bk_video_urls"
            var element_type = "video"
            var content_url = VIDEOS_URL
            break;

        case 'gifs':
            var gallery_id = "gif-gallery"
            var localStorage_urls_key = "bk_gif_urls"
            var element_type = "img"
            var content_url = GIFS_URL
            break;

        case 'svgs':
            var gallery_id = "svg-gallery"
            var localStorage_urls_key = "bk_svg_urls"
            var element_type = "img"
            var content_url = SVGS_URL
            break;

        default:
            console.warn(`Unknown gallery: '${adding_for}'. You can only use 'images', 'videos', 'gifs', 'svgs'`)
            return
    }

    var gallery = document.getElementById(gallery_id)
    console.log(`Gallery: ${gallery_id} | ${gallery}`)

    // Check if we have them saved in local storage - to save on rate limiting from github
    var file_urls = localStorage.getItem(localStorage_urls_key)
    if (file_urls === null || file_urls == "[]" || should_recheck_database) {
        popup(`Retrieving ${adding_for} from database...`)
        file_urls = await get_files_from_repo(content_url)

        // Update local storage vars
        localStorage.setItem(localStorage_urls_key, JSON.stringify(file_urls))
        localStorage.setItem("bk_last_retrieval", Date.now().toString());
    } else {
        popup(`Using local storage ${adding_for} urls...`)
        file_urls = JSON.parse(file_urls)
    }

    for (url of file_urls) {
        var file_elem = document.createElement(element_type);
        file_elem.src = url;
        file_elem.alt = "¯\\_(ツ)_/¯ Why would I know?"
        file_elem.loading = "lazy" // Let's not freeze the user's webpage alr @_@
        
        file_elem.onclick = async (event) => await click_copy(event.currentTarget)

        if (element_type === "video") {
            // image_elem.controls = true;
            file_elem.loop = true;
            file_elem.onmouseover=file_elem.play 
            file_elem.onmouseout=file_elem.pause

            file_elem.preload = "metadata"; // Only download video metadata at the start so that we don't freeze the tab!
        }


        gallery.appendChild(file_elem)
    }
    
}

async function setCanvasImage(path) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "anonymous"; // Stops Tainted canvases Security Error
        const c = document.createElement("canvas");
        const ctx = c.getContext("2d");

        img.onload = function () {
        c.width = this.naturalWidth;
        c.height = this.naturalHeight;
        ctx.drawImage(this, 0, 0);
        c.toBlob((blob) => {
            resolve(blob);
        }, "image/png");
        };
        img.src = path;
    })
}

async function click_copy(elem) {
    switch (elem.nodeName) {
        case "DIV":
            await navigator.clipboard.writeText(elem.innerText)
                .then(() => popup("Copied!", 3000))
                .catch(() => popup("Failed to copy!", 3000));
            
            break;

        case "IMG":

            if (elem.src.endsWith(".png")) {
                let res = await fetch(elem.src)

                if (res.ok) {
                    var blob = await res.blob()
                }
            } else {
                // Not a png so we have to force it to become one through a canvas!
                blob = await setCanvasImage(elem.src);
            }

            const clipboardItem = new ClipboardItem({
                [blob.type]: blob // blob.type should equal 'image/png' as that is the only thing the browser can support!
            })

            await navigator.clipboard.write([clipboardItem])
                .then(() => popup("Copied to clipboard!", 3000))
                .catch((err) => popup(`Failed to copy! ${err}`, 5000))
            
            break;

        case "VIDEO":
            await navigator.clipboard.writeText(elem.src)
                .then(() => popup("Copied link to video!", 3000))
                .catch(() => popup("Failed to copy!", 3000));
            
            break;
    }
}


setTimeout(async () => {
    
    /////////////////////////
    // LOCAL STORAGE CHECK
    // Check if it is time for another database check - to keep files uptodate even if we have them in local storage!!
    /////////////////////////
    

    const now_timestamp = Date.now();
    var last_retrieval_timestamp = localStorage.getItem("bk_last_retrieval")
    
    if (last_retrieval_timestamp === null) {
        localStorage.setItem("bk_last_retrieval", now_timestamp.toString())
    } else {
        last_retrieval_timestamp = parseInt(last_retrieval_timestamp)
    }

    const time_since_retrieval_ms = now_timestamp - last_retrieval_timestamp

    var should_recheck_database = false
    if (time_since_retrieval_ms >= RECHECK_DATABASE_THRESHOLD_MS) {
        should_recheck_database = true
    }

    /////////////////////////
    // IMAGES
    /////////////////////////

    await add_gallery_content("images", should_recheck_database)
    await add_gallery_content("videos", should_recheck_database)
    await add_gallery_content("gifs", should_recheck_database)
    await add_gallery_content("svgs", should_recheck_database)

}, 10)
