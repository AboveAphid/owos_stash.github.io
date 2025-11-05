// Will be filled by the user through their answers
var supplied_labels = []

const current_image = document.getElementById("current-image")

const answer_btns_div = document.getElementById("answer-btns")
const contributing_input_div = document.getElementById("inputting-data")

const creator_name_input = document.getElementById("creator-name-input")
const creator_social_link_input = document.getElementById("creator-social-link-input")

const idk_btn = document.getElementById("idontknow")
const submit_btn = document.getElementById("submit-btn")
const submit_contribute_btn = document.getElementById("finish-contribution")

setTimeout(async () => {
    // Mainly in case they open contribute.html before index.html, unlikely but still possible @_@

    /////////////////////////
    // LOCAL STORAGE CHECK
    // Check if it is time for another database check - to keep files uptodate even if we have them in local storage!!
    /////////////////////////
    
    var should_recheck_database = do_we_recheck_database()
    if (should_recheck_database) {
        await retrieve_from_database()
    }
})

var database_image_urls = localStorage.getItem("")

function open_new_tab(url) {
    window.open(url, '_blank').focus()
}

function next_image() {
    // answer_btns_div.style.display = "block"
    iknow_btn.style.display = "block"

    contributing_input_div.style.display = "none"

    creator_name_input.value = ""
    creator_social_link_input.value = ""

    // TODO: GO TO NEXT IMAGE
}
idk_btn.onclick = next_image

function label_image() {
    // answer_btns_div.style.display = "none"
    iknow_btn.style.display = "none"
    
    contributing_input_div.style.display = "block"

    creator_name_input.value = ""
    creator_social_link_input.value = ""
}
const iknow_btn = document.getElementById("iknow")
iknow_btn.onclick = label_image

async function submit_image_labelling() {
    
    var creator = creator_name_input.value
    var social = creator_social_link_input.value

    if (!creator) {
        popup("Please supply the creator of the image!")
    }

    if (creator.toLowerCase() == "n/a" || creator.toLowerCase() == "na") {
        popup("If you are unsure who made this image please do not press 'I know who made this!', instead press 'IDK / Next Image'!")
    }

    if (!social) {
        popup("Please supply a link to this user's social media, or input 'N/A' if they have none!")
        return
    }

    supplied_labels.push({
        image: current_image.src,
        imageName: current_image.src.split("/").pop(),
        creator: creator,
        creator_social: social 
    })
}
submit_btn.onclick = submit_image_labelling


async function complete_and_submit_issue() {
    console.log("Hello!")

    if (supplied_labels.length <= 0) {
        popup("You haven't contributed anything yet silly!")
        return
    }

    var body = {}
    for (label of supplied_labels) {
        body[label.imageName] = {
            "image_url": `${label.image}`,
            "creator_name": `${label.creator}`,
            "social_link": `${label.creator_social}`
        }
    }

    const issue = {
        title: `Contributing to database (automatic)`,
        body: JSON.stringify(body, null, 4).replaceAll("    ", "%0D%0A    ")
    };

    popup("You are about to be redirected to github...")

    setTimeout(
        () => open_new_tab(`https://github.com/${USERNAME}/${REPO}/issues/new?title=${issue.title}&body=${issue.body}`),
        4000
    )
}
submit_contribute_btn.onclick = complete_and_submit_issue;
