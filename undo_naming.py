import os, json
from PIL import Image
from imagehash import average_hash
from utils import support_apple_files, make_database_folders, random_string, \
                    LABELS, IMAGES, IMAGE_EXTENSIONS, VIDEOS, VIDEO_EXTENSIONS, GIFS, GIF_EXTENSIONS, SVGS, SVG_EXTENSIONS, UNKNOWN
from rich.progress import track

support_apple_files()
make_database_folders()

prev = []

with open(LABELS)as f:
    labels = json.load(f)

def is_registered(hash):
    global labels
    try: 
        labels[hash]
        return True
    except KeyError:
        return False

for database_folder in [SVGS, GIFS]: # NOTE: Currently only hashing images works
    for filename in track(os.listdir(database_folder), f"Processing `{database_folder}`"):
        ### GET FILE DATA

        full_path = os.path.join(database_folder, filename)
        filename_wo_ext, file_ext = os.path.splitext(filename)
        file_ext_lower = file_ext.lower()
        file_ext_no_dot = file_ext.removeprefix(".")

        ### SKIP ANY WE HAVE DONE BEFORE

        if filename.startswith("bk_bf"):
            filename_cleaned = filename_wo_ext.removeprefix(f"bk_bf_{file_ext_no_dot}-")
            filename_cleaned = '-'.join(filename_cleaned.split('-')[:-1])
            filename_cleaned += file_ext_lower

        print(filename, "\t>\t", filename_cleaned)

        if filename == filename_cleaned:
            continue

        renamed_full_path = os.path.join(database_folder, filename_cleaned)


        os.rename(full_path, renamed_full_path)


with open('Database\\labels.json', 'w')as f:
    json.dump(labels, f, indent=4)