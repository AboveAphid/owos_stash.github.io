import os, json
from PIL import Image
from imagehash import average_hash
from utils import support_apple_files, IMAGES, make_database_folders
from rich.progress import track

support_apple_files()
make_database_folders()

"""
{
    "<image_hash>": {
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

prev = []

PATH = IMAGES

with open('Database\\labels.json')as f:
    labels = json.load(f)

def make_label(filename, tags=[], creator_display="N/A", nsfw=False):
    filename_wo_ext, file_ext = os.path.splitext(filename)
    
    entry = {
        "parent": "Images",                 # Folder path in Database
        "type": file_ext.removeprefix("."),                 
        "filename": filename,           
        "filename_wo_ext": filename_wo_ext,
        
        "nsfw": nsfw,

        "tags": tags,

        "creator": {
            "display": creator_display,
            "platforms": {
                "bsky": "natelie_bobington",
                "discord": None,
                "reddit": None,
                "twitter": "natelie_bobington",
                "twitch": None,
                "youtube": None
            }
        },
        "original_post_link": "https://www.google.com/search?q=The+absolutely+amazing+crazy+really+cool+image+omg+this+would+lead+to+the+post",
        "found_from_link": None
    }

    labels[hash] = entry

def is_registered(hash):
    global labels
    try: 
        labels[hash]
        return True
    except KeyError:
        return False

for filename in track(os.listdir(PATH), "Processing..."):
    ### GET FILE DATA

    full_path = os.path.join(PATH, filename)
    filename_wo_ext, file_ext = os.path.splitext(filename)

    ### SKIP ANY WE HAVE DONE BEFORE

    if filename.startswith("bk_"):
        hash = filename_wo_ext.removeprefix("bk_")

        if not is_registered(hash):
            make_label(filename)
        continue

    ### HASH IMAGE

    with Image.open(full_path) as img:
        hash = average_hash(img)

    ### RENAME

    hash_filename = f"bk_{hash}{file_ext}"

    if filename == hash_filename:
        continue

    renamed_full_path = os.path.join(PATH, hash_filename)

    # print(filename, "\t>\t", hash_filename)

    os.rename(full_path, renamed_full_path)

    ### MAKE NEW LABEL ENTRY

    make_label(hash_filename)

with open('Database\\labels.json', 'w')as f:
    json.dump(labels, f, indent=4)