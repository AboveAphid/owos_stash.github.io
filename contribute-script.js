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

    var user_github_login = localStorage.getItem("github-token")

    if (!user_github_login) {
        popup("You haven't logged into github yet! Please follow the steps above to contribute O.O")
        return
    }

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
    var user_github_login = localStorage.getItem("github-token")

    if (!user_github_login) {
        popup("You haven't logged into github yet! Please follow the steps above to contribute O.O")
        return
    }

    if (supplied_labels.length <= 0) {
        popup("You haven't contributed anything silly!")
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
    var issue_body = JSON.stringify(body)

    console.log(string_body)

    const issue = {
        title: `Contributing to database (automatic)`,
        body: `Creator: ${tags.join(', ')}`
    };

    "https://github.com/OWNER/REPO/issues/new?title=ISSUE_TITLE&body=ISSUE_BODY"

    const res = await fetch('https://api.github.com/repos/AboveAphid/owos_stash.github.io/issues', {
        method: 'POST',
        headers: {
        'Authorization': `token ${user_github_login}`,
        'Accept': 'application/vnd.github.v3+json'
        },
        body: issue_body
    });
}
submit_contribute_btn.onclick = complete_and_submit_issue;
