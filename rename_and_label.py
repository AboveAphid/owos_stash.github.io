import os, json
from PIL import Image
from imagehash import average_hash
from utils import support_apple_files, make_database_folders, random_string, \
                    LABELS, IMAGES, IMAGE_EXTENSIONS, VIDEOS, VIDEO_EXTENSIONS, GIFS, GIF_EXTENSIONS, SVGS, SVG_EXTENSIONS, UNKNOWN
from rich.progress import track
from copy import deepcopy

support_apple_files()
make_database_folders()

DEFAULT_DISPLAY = "N/A"
DEFAULT_TAGS = []
DEFAULT_NSFW = False
DEFAULT_NOTE = "This is a test note rahhhhhh!<br>I may even have multiple lines like this! Maybe even some <b>bold styling!</b>"

DEFAULT_PLATFORMS = {
    "bsky": None,
    "discord": None,
    "reddit": None,
    "twitter": None,
    "twitch": None,
    "youtube": None,
    "kofi": None,
    "other": None
}

DEFAULT_CREATOR = {
    "display": DEFAULT_DISPLAY,
    "platforms": deepcopy(DEFAULT_PLATFORMS)
}

"""
{
    "<image_hash>": {
        "root": "Database\\Images",
        "type": "png",
        "filename": "cool_image.png",
        "filename_wo_ext": "cool_image",
        
        "nsfw": false,

        "tags": [
            "cute", "cool", "humanewww", "epictag", "literallyblindedmewithawesomeness", "veryhelpfultag"
        ],

        "creator": {
            "display": "Natelie",
            "platforms": {
                "bsky": "natelie_bobington",
                "discord": null,
                "reddit": null,
                "twitter": "natelie_bobington",
                "twitch": null,
                "youtube": null
            }
        },
        "original_post_link": "https://www.google.com/search?q=The+absolutely+amazing+crazy+really+cool+image+omg+this+would+lead+to+the+post",
        "found_from_link": null
    }
}
"""

def normalise_label(label: dict) -> tuple[bool, dict]:
    """
    Normalises a label
    Returning if the label was modified & the new label 
        
    :param label: The label you want to normalise
    :type label: dict
    """

    changed = False

    # Fix missing `creator`
    if "creator" not in label or not isinstance(label["creator"], dict):
        label["creator"] = deepcopy(DEFAULT_CREATOR)
        changed = True

    # Get creator
    creator = label["creator"]

    # Fix missing "display" in `creator`
    if "display" not in creator or not isinstance(creator["display"], str):
        creator["display"] = DEFAULT_DISPLAY
        changed = True
        
    # Fix missing "platforms" in `creator`
    if "platforms" not in creator or not isinstance(creator["platforms"], dict):
        creator["platforms"] = DEFAULT_PLATFORMS.copy()
        changed = True

    # Get platforms
    platforms = creator["platforms"]
    
    # Fix missing keys in `platforms`
    for key, default_value in DEFAULT_PLATFORMS.items():
        if key not in platforms:
            platforms[key] = default_value
            changed = True
    

    # Fix missing "tags"
    if "tags" not in label or not isinstance(label["tags"], list):
        label["tags"] = DEFAULT_TAGS
        changed = True

    # Fix missing "nsfw"
    if "nsfw" not in label or not isinstance(label["nsfw"], bool):
        label["nsfw"] = DEFAULT_NSFW
        changed = True
        
    # Fix missing "links"
    for link_key in ("original_post_link", "found_from_link"):
        if link_key not in label:
            label[link_key] = None
            changed = True

    # Fix missing "root"
    if "root" not in label or not isinstance(label["root"], str):
        label["root"] = None
        changed = True
    
    # Fix missing "type"
    if "type" not in label or not isinstance(label["type"], str):
        label["type"] = None
        changed = True

    # Fix missing "filename"
    if "filename" not in label or not isinstance(label["filename"], str):
        label["filename"] = None
        changed = True

    # Fix missing "filename_wo_ext"
    if "filename_wo_ext" not in label or not isinstance(label["filename_wo_ext"], str):
        label["filename_wo_ext"] = None
        changed = True

    # Fix missing "note"
    if "note" not in label or not isinstance(label["note"], str):
        label["note"] = DEFAULT_NOTE
        changed = True
    
    

    return changed, label


def normalise_all_labels(labels:dict):
    """
    Adds any missing keys in labels.
    Returns how many labels had to be normalised.

    :param labels: The labels you want to normalise
    :type labels: dict
    """
    normalised = 0

    for label_hash, label in labels.items():
        modified, _ = normalise_label(label)
        if modified:
            normalised += 1

    return normalised


def make_label(
        hash, filename, 
        tags:list|None=None, nsfw=False,
        creator_display:str|None=None,
        platforms:dict|None=None,
        original_post_link=None, found_from_link=None,
        note:str|None=None
    ):
    if tags is None:
        tags = []
    if platforms is None:
        platforms = {}
    if creator_display is None:
        creator_display = DEFAULT_DISPLAY
    if note is None:
        note = DEFAULT_NOTE

    filename_wo_ext, file_ext = os.path.splitext(filename)
    
    if file_ext in IMAGE_EXTENSIONS:
        parent = IMAGES
    elif file_ext in VIDEO_EXTENSIONS:
        parent = VIDEOS
    elif file_ext in GIF_EXTENSIONS:
        parent = GIFS
    elif file_ext in SVG_EXTENSIONS:
        parent = SVGS
    else:
        parent = UNKNOWN

    creator = deepcopy(DEFAULT_CREATOR)
    creator["display"] = creator_display
    all_platforms = creator["platforms"]

    for platform_key, platform_link in platforms.items():
        all_platforms[platform_key] = platform_link

    entry = {
        "root": parent,                 # Folder path in Database
        "type": file_ext.removeprefix("."),                 
        "filename": filename,           
        "filename_wo_ext": filename_wo_ext,
        
        "nsfw": nsfw,

        "tags": tags,

        "creator": creator,
        "original_post_link": original_post_link,
        "found_from_link": found_from_link,
        "note": note
    }

    labels[hash] = entry

def is_registered(hash):
    global labels
    return hash in labels


prev = []

with open(LABELS)as f:
    labels: dict = json.load(f)
    amt_normalised = normalise_all_labels(labels)

    print(f"Normalised {amt_normalised} labels that had missing/incorrect fields!")

for database_folder in [IMAGES, SVGS, GIFS]: # NOTE: Currently only hashing images works
    for filename in track(os.listdir(database_folder), f"Processing `{database_folder}`"):
        ### GET FILE DATA

        full_path = os.path.join(database_folder, filename)
        filename_wo_ext, file_ext = os.path.splitext(filename)
        file_ext = file_ext.lower()
        file_ext_no_dot = file_ext.removeprefix(".")

        ### SKIP ANY WE HAVE DONE BEFORE

        if filename.startswith("bk_"):
            hash = filename_wo_ext.removeprefix("bk_")

            if not is_registered(hash):
                make_label(hash, filename)
            continue

        ### HASH IMAGE
        if file_ext in IMAGE_EXTENSIONS:
            with Image.open(full_path) as img:
                hash = str(average_hash(img))
        else:
            # bf = Boy Failure - We failed to generate a hash for the image so it is now a boy failure :L
            hash = f"bf_{file_ext_no_dot}-{filename_wo_ext}-{random_string(length=8)}" # Set hash to filename if we cannot hash it ourselves
            # Note: The hash will still have 'bk_' at the start! Even if we have 'bf_'

        ### RENAME
        hash_filename = f"bk_{hash}{file_ext}"

        if filename == hash_filename:
            continue

        renamed_full_path = os.path.join(database_folder, hash_filename)

        # print(filename, "\t>\t", hash_filename)

        os.rename(full_path, renamed_full_path)

        ### MAKE NEW LABEL ENTRY

        make_label(hash, hash_filename)

with open('Database\\labels.json', 'w')as f:
    json.dump(labels, f, indent=4)