// Hello dirty code reader RAHH >:L

const sfx = new Audio('assets\\kiss.wav');
document.body.onclick = async function (event) {
    console.log(event.x)

    await sfx.play()
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

    var file_urls = localStorage.getItem(localStorage_urls_key)
    popup(`Using local storage ${adding_for} urls...`)
    file_urls = JSON.parse(file_urls)

    popup("Please wait as I fill everything with the images!")

    for (url of file_urls) {
        // Div that will contain the item
        var gallery_item_elem = document.createElement("div")
        gallery_item_elem.classList.add("gallery-item-masonry")

        // Actual image/video/gif/svg
        var file_elem = document.createElement(element_type);
        file_elem.src = url;
        file_elem.alt = "¯\\_(ツ)_/¯ Why would I know?"
        file_elem.loading = "lazy" // Let's not freeze the user's webpage alr @_@
        
        // Credit to the creator of the image
        var creator_bubble = document.createElement("p")
        creator_bubble.classList.add("creator-credit-bubble")
        
        // Simulate known users
        var creator_name = "N/A" 
        if (Math.random() > 0.5) {
            var creator_name = "<Creator Name>"
        } 
        creator_bubble.innerText = `${creator_name}`
        if (creator_name != "N/A") {
            creator_bubble.style.background = "#3c6850ff"
        }




        // Allow copying/downloading on click
        file_elem.onclick = async (event) => await click_copy(event.currentTarget)

        // Video specific customisation
        if (element_type === "video") {
            // image_elem.controls = true;
            file_elem.loop = true;
            file_elem.onmouseover=file_elem.play 
            file_elem.onmouseout=file_elem.pause

            file_elem.preload = "metadata"; // Only download video metadata at the start so that we don't freeze the tab!
        }

        // Add gallery item to gallery!
        gallery_item_elem.appendChild(file_elem)
        gallery_item_elem.appendChild(creator_bubble)
        gallery.appendChild(gallery_item_elem)
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

async function download_or_copy_src(elem, backup_download_name="download.unknown") {
    let res = await fetch(elem.src)

    if (!res.ok) {
        // Copy video link instead of downloading
        await navigator.clipboard.writeText(elem.src)
            .then(() => popup("Copied link to item!", 3000))
            .catch(() => popup("Failed to copy!", 3000));
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
            } else if (elem.src.endsWith(".gif")) {
                download_or_copy_src(elem, "downloaded-gif.gif")
                break;

            } else if (elem.src.endsWith(".svg")) {
                download_or_copy_src(elem, "downloaded-svg.svg")
                blob = await setCanvasImage(elem.src); // Also copy it as a png to clipboard
                
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
            
            let res = await fetch(elem.src)

            if (!res.ok) {
                // Copy video link instead of downloading
                await navigator.clipboard.writeText(elem.src)
                    .then(() => popup("Copied link to video!", 3000))
                    .catch(() => popup("Failed to copy!", 3000));
            }

            // Download Video
            var blob = await res.blob()
            var filename = elem.src.split("/").pop() || "video.mp4"

            console.log(filename)

            const a_download_elem = document.createElement("a")
            a_download_elem.href = URL.createObjectURL(blob);
            a_download_elem.download = filename;
            document.body.appendChild(a_download_elem);
            a_download_elem.click();

            URL.revokeObjectURL(a_download_elem.href);
            a_download_elem.remove();

            popup("Downloading video!", 3000)

            break;
    }
}


setTimeout(async () => {
    
    /////////////////////////
    // LOCAL STORAGE CHECK
    // Check if it is time for another database check - to keep files uptodate even if we have them in local storage!!
    /////////////////////////
    
    var should_recheck_database = do_we_recheck_database()
    if (should_recheck_database) {
        await retrieve_from_database()
    }

    /////////////////////////
    // IMAGES
    /////////////////////////

    await add_gallery_content("images")
    await add_gallery_content("videos")
    await add_gallery_content("gifs")
    await add_gallery_content("svgs")
}, 10)











/*

async function download_all() {
    const zip = new JSZip();

    popup("Retrieving file...")
    console.log("Retrieving file...")

    const video_urls = await get_files_from_repo(VIDEOS_URL)

    const video_folder = zip.folder("Videos")

    popup("Adding files to ZIP...")
    console.log("Adding files to ZIP...")
    var i = 0
    for (const url of video_urls.slice(0, 10)) {
        // Ignore folders >M<
        // if (file.type !== "file") continue;

        const res = await fetch(url);
        
        if (!res.ok) continue

        const filename = url.split("/").pop()

        // TODO: Make sure the file is not a subfolder!

        const blob = await res.blob();
        const arrayBuffer = await blob.arrayBuffer();

        video_folder.file(filename + "_", arrayBuffer);

        i++
        console.log(`${i} / ${video_urls.length}`)
        popup(`Retrieving videos: ${i} / ${video_urls.length}`, 4000)
    }

    popup("Compressing ZIP file...")
    console.log("Compressing ZIP file...")
    const content = await zip.generateAsync({ type: "blob" });
    saveAs(content, "videos.zip"); // Uses FileSaver.js
}

// download_all_btn = document.getElementById("download-all-btn")
// download_all_btn.onclick = download_all

*/