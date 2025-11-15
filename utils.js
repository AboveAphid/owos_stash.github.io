const GITHUB_TOKEN = null // Not safe to share around aaaa!

const USERNAME = "AboveAphid"
const REPO = "owos_stash.github.io"

const DATABASE_URL = `https://api.github.com/repos/${USERNAME}/${REPO}/contents/Database`
const LABELS_URL = `https://raw.githubusercontent.com/${USERNAME}/${REPO}/refs/heads/main/Database/labels.json`
const IMAGES_URL = DATABASE_URL+"/Images"
const VIDEOS_URL = DATABASE_URL+"/Videos"
const GIFS_URL = DATABASE_URL+"/Gifs"
const SVGS_URL = DATABASE_URL+"/SVGs"

const RECHECK_DATABASE_THRESHOLD_DAYS = 1
const RECHECK_DATABASE_THRESHOLD_HOURS = RECHECK_DATABASE_THRESHOLD_DAYS * 24
const RECHECK_DATABASE_THRESHOLD_MINS = RECHECK_DATABASE_THRESHOLD_HOURS * 60
const RECHECK_DATABASE_THRESHOLD_SECS = RECHECK_DATABASE_THRESHOLD_MINS * 60
const RECHECK_DATABASE_THRESHOLD_MS = RECHECK_DATABASE_THRESHOLD_SECS * 1000

const IMAGE_EXTENSIONS = [
    ".jpg", ".jpeg", ".png", ".bmp", ".tiff", ".tif", ".heif",
    ".heic", ".webp", ".avif", ".raw", ".cr2", ".nef",
    ".orf", ".sr2", ".eps", ".jp2", ".jpx", ".pcx"
]


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

async function download_json_file(url) {
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

    if (res.ok) {
        return await res.json()
    } 
    return null
}

function do_we_recheck_database() {
    const current_time = Date.now()
    var last_retrieval = localStorage.getItem("bk_last_retrieval")

    // First check is if its been a while since we last checked the database
    var should_recheck_database = true;
    if (last_retrieval) {
        last_retrieval = parseInt(last_retrieval)
        const time_since_retrieval_ms = current_time - last_retrieval
        should_recheck_database = time_since_retrieval_ms >= RECHECK_DATABASE_THRESHOLD_MS
    }

    // Second check is if any of the localStorage is missing images & videos & etc
    if (!should_recheck_database) {
        // Assume everything should have AT LEAST ONE item hopefully @_@
        const image_urls = JSON.parse(localStorage.getItem("bk_image_urls") || "[]")
        const video_urls = JSON.parse(localStorage.getItem("bk_video_urls") || "[]")
        const gif_urls = JSON.parse(localStorage.getItem("bk_gif_urls") || "[]")
        const svg_urls = JSON.parse(localStorage.getItem("bk_svg_urls") || "[]")
        const labels = JSON.parse(localStorage.getItem("bk_labels") || "[]")

        should_recheck_database = false;
        if (!image_urls || !video_urls || !gif_urls || !svg_urls || !labels) {
            should_recheck_database = true;
        }
    } 

    console.log(`Should recheck the database for new BK files? ${should_recheck_database}`)

    return should_recheck_database
}

var accounted_for_weird_hash_error = false;

function get_hash_from_url(url) {
    const urlParams = new URL(url)

    var filename = null
    if (urlParams.pathname.includes("/Database/Images/")) {
        filename = urlParams.pathname.split("/Database/Images/").pop()
    }

    if (!filename || !filename.startsWith("bk_")) {
        return null;
    }

    const file_ext = filename.split(".").pop()
    const hash = filename.replace("bk_", "").replace(`.${file_ext}`, "")

    return hash
}

// async function hash_image(image_elem) {
//     if (!accounted_for_weird_hash_error) {
//         var _ = await ahash(image_elem, 8) // For some reason the first one doesn't work and instead returns just 0000s so to get that out of the way I do this
//         accounted_for_weird_hash_error = true;
//     }
//     var avhash = await ahash(image_elem, 8)
//     if (avhash) {
//         return avhash.toHexStringReversed() // The hash given by python is defaultly reversed so we need to reverse the js one as well
//     }
//     return null;
// }

function get_label(hash) {
    const labels = JSON.parse(localStorage.getItem("bk_labels") || "[]")

    try {
        return labels[hash]
    } catch (error) {
        return null;
    }
}

async function retrieve_from_database() {

    popup("Retrieving labels from database...")
    var labels = await download_json_file(LABELS_URL)
    console.log("Labels:", labels)
    localStorage.setItem("bk_labels", JSON.stringify(labels))
    
    popup("Retrieving images from database...")
    var image_urls = await get_files_from_repo(IMAGES_URL)
    console.log("Image urls:", image_urls)
    localStorage.setItem("bk_image_urls", JSON.stringify(image_urls))
    
    popup("Retrieving videos from database...")
    var video_urls = await get_files_from_repo(VIDEOS_URL)
    console.log("Video urls:", image_urls)
    localStorage.setItem("bk_video_urls", JSON.stringify(video_urls))
    
    popup("Retrieving gifs from database...")
    var gif_urls = await get_files_from_repo(GIFS_URL)
    console.log("GIF urls:", image_urls)
    localStorage.setItem("bk_gif_urls", JSON.stringify(gif_urls))
    
    popup("Retrieving svgs from database...")
    var svg_urls = await get_files_from_repo(SVGS_URL)
    console.log("SVG urls:", image_urls)
    localStorage.setItem("bk_svg_urls", JSON.stringify(svg_urls))

    
    localStorage.setItem("bk_last_retrieval", Date.now().toString());
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

async function copy_text(text) {
    await navigator.clipboard.writeText(text)
        .then(() => popup("Copied link to item!", 3000))
        .catch(() => popup("Failed to copy!", 3000));
}

async function copy_image(elem, force_convert_to_png=false, force_convert_simple_to_png=true) {
    // force_convert_simple_to_png - "simple"s are images like jpegs, webp which don't have 
    // multiple frames so it is probably best we just convert them to PNGs and copy that, 
    // rather than a URL 

    if (elem.src.endsWith(".png")) {
        let res = await fetch(elem.src)

        if (res.ok) {
            var blob = await res.blob()
        }
    } else if (force_convert_to_png) {
        // It will be converted to an PNG lossing any extra frames (videos/gifs), or resizing properties (svgs/etc)
        blob = await setCanvasImage(elem.src);
    } else if (force_convert_simple_to_png) {
        var is_a_norm_image = false;
        IMAGE_EXTENSIONS.forEach((ext) => {
            if (!is_a_norm_image && elem.src.endsWith(ext)) {
                is_a_norm_image = true;
                return;
            }
        })
        if (is_a_norm_image) {
            blob = await setCanvasImage(elem.src);
        } else {
            // Copy link to file - it is probably a video
            copy_text(elem.src)
            return;
        }
    }

    const clipboardItem = new ClipboardItem({
        [blob.type]: blob // blob.type should equal 'image/png' as that is the only thing the browser can support!
    })

    await navigator.clipboard.write([clipboardItem])
        .then(() => popup("Copied to clipboard!", 3000))
        .catch((err) => popup(`Failed to copy! ${err}`, 5000))
            
}

async function download_file(elem, backup_download_name="download.unknown") {
    let res = await fetch(elem.src)

    if (!res.ok) {
        popup("Failed to download file!")
        return false;
    }

    // Download Video
    var blob = await res.blob()
    var filename = elem.src.split("/").pop() || backup_download_name

    console.log(filename)

    const a_download_elem = document.createElement("a")
    a_download_elem.href = URL.createObjectURL(blob);
    a_download_elem.download = filename;
    document.body.appendChild(a_download_elem);
    a_download_elem.click();

    URL.revokeObjectURL(a_download_elem.href);
    a_download_elem.remove();
    popup("Downloaded file!", 3000)

    return true;
}

async function download_or_copy_src(elem, backup_download_name="download.unknown") {
    if (!download_file(elem, backup_download_name)) {
        // Copy video link instead of downloading
        await copy_text(elem.src)
    }
}

async function click_copy_or_download(elem) {
    switch (elem.nodeName) {
        case "DIV":
            await navigator.clipboard.writeText(elem.innerText)
                .then(() => popup("Copied!", 3000))
                .catch(() => popup("Failed to copy!", 3000));
            
            break;

        case "IMG":
            copy_image(elem)
            break;

        case "VIDEO":
            download_or_copy_src(elem, "video.mp4")
            break;
    }
}

async function click_copy_or_src(params) {
    switch (elem.nodeName) {
        case "DIV":
            await navigator.clipboard.writeText(elem.innerText)
                .then(() => popup("Copied!", 3000))
                .catch(() => popup("Failed to copy!", 3000));
            
            break;

        case "IMG":
            copy_image(elem)
            break;

        case "VIDEO":
            download_or_copy_src(elem, "video.mp4")
            break;
    }
}