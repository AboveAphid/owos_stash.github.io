// Hello dirty code reader RAHH >:L

const sfx = new Audio('assets\\kiss.wav');
document.body.onclick = async function (event) {
    console.log(event.x)

    await sfx.play()
}


async function add_gallery_content(adding_for, labels) {
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
        gallery.appendChild(gallery_item_elem)

        // Actual image/video/gif/svg
        var file_elem = document.createElement(element_type);
        file_elem.src = url;

        file_elem.alt = "¯\\_(ツ)_/¯ Why would I know?"
        file_elem.loading = "lazy" // Let's not freeze the user's webpage alr @_@
        gallery_item_elem.appendChild(file_elem)
        
        // Get hash of file
        var hash = get_hash_from_url(url)

        // Credit to the creator of the image
        var creator_bubble = document.createElement("p")
        creator_bubble.classList.add("creator-credit-bubble")
        gallery_item_elem.appendChild(creator_bubble)
        
        // Simulate known users
        var file_label = get_label(hash)
        var creator_name = "N/A"
        if (file_label) {
            creator_name = file_label.creator.display
        }
        creator_bubble.innerText = `${creator_name}`
        if (creator_name != "N/A") {
            creator_bubble.style.background = "#3c6850ff"
        }

        file_elem.hash = hash // Assign it to this specific element - so that we don't have to worry about the changing hash variable

        // Allow copying/downloading on click
        file_elem.onclick = async (event) => window.location.href = `./image.html?image_id=${event.currentTarget.hash}`

        // Video specific customisation
        if (element_type === "video") {
            // image_elem.controls = true;
            file_elem.loop = true;
            file_elem.onmouseover=file_elem.play 
            file_elem.onmouseout=file_elem.pause
            
            // TODO: Remove once proper hashing is done with videos and it can use the image.html viewer!
            file_elem.onclick = async (event) => await click_copy_or_download(event.currentTarget)

            file_elem.preload = "metadata"; // Only download video metadata at the start so that we don't freeze the tab!
        }


        // Add gallery item to gallery!
        
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