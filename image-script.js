const img = document.getElementById("main-image")
const urlParams = new URLSearchParams(window.location.search.slice(1));
const image_id = urlParams.get("image_id")

async function main() {
    if (do_we_recheck_database()) {
        await retrieve_from_database()
    }

    const label = get_label(image_id)
    
    console.log("Image id:", image_id)
    console.log("Label:", label)
    
    const parent_folder = label["parent"] || ""
    const filename = label["filename"] || ""
    const tags = label["tags"] || []
    const creator_display = label["creator"]["display"] || "N/A"
    const creator_socials = label["creator"]["platforms"] || {}

    // Add image
    const file_url = `https://raw.githubusercontent.com/${USERNAME}/${REPO}/main/Database/${parent_folder}/${filename}`
    img.src = file_url

    // Set title
    const heading = document.getElementById("image-heading")
    heading.innerText = `${filename} by ${creator_display}`

    // Add tags
    const tags_div = document.getElementById("image-tags")
    
    console.log(tags)

    tags.forEach(tag => {
        const tag_elem = document.createElement("p")

        tag_elem.classList.add("tag")

        tag_elem.innerText = tag

        tags_div.appendChild(tag_elem)
    });

    
    // Add image description
    const description_elem = document.getElementById("image-description")
    
    var has_at_least_one_social = false;

    var social_blob_html = ""
    for (const [social, link] of Object.entries(creator_socials)) {

        console.log(`${social} | ${link}`)

        if (link !== null) {
            social_blob_html += `<li style="margin-left:1rem;"><a href="${link}">${social}</a></li>`
            has_at_least_one_social = true;
        }
    }

    if (creator_display === "N/A" || !creator_display) {
        description_elem.innerHTML = `We don't know who made this image! :<`
    } else {
        description_elem.innerHTML = `This image was created by <a>${creator_display}</a>!`
    }

    if (has_at_least_one_social) {
        description_elem.innerHTML += `<br>The artist is available on: ${social_blob_html}`
    } else {
        description_elem.innerHTML += "<br>We don't have any of their social links."
    }
    
    // Go to artist btn
    const download_btn = document.getElementById("download-btn")
    download_btn.onclick = async () => await download_file(img)

    const copy_btn = document.getElementById("copy-btn")
    copy_btn.onclick = async () => await copy_image(img, false)
    

}

setTimeout(main, 1)
