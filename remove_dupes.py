import time, os, PIL
from rich.progress import track
from utils import HashImage, Move, support_apple_files, check_if_corrupted_file, APPLE_FILE_EXTENSIONS, IMAGE_EXTENSIONS, VIDEO_EXTENSIONS, \
    make_database_folders, COPY_FILE, DUPLICATES, VIDEOS, IMAGES, HEICS, SVGS, GIFS, DIRECTORIES, CORRUPTED, UNKNOWN

st = time.time()

################################
# CONFIGURE
################################


HASHABLE_FILES_FOLDERS = [IMAGES, HEICS]

################################
# PREPARE FOLDERS + READ STUFF
################################

support_apple_files()
make_database_folders()

move = Move(COPY_FILE).move

################################
# SORT
################################


for img_folder in HASHABLE_FILES_FOLDERS:
    seen_hashes = {} # Reset every folder
    folder_items = os.listdir(img_folder)
    for image_path in track(folder_items, description=f"Sorting files in `{img_folder}`..."):
        full_path = os.path.join(img_folder, image_path)
        is_directory = os.path.isdir(full_path)

        if is_directory:
            # Assume it is meant to be here and just move on
            # move(full_path, os.path.join(DIRECTORIES, file_name))
            continue

        try:
            image = HashImage(full_path, ignore_possible_pillow_warning=False)
            full_path = image.get_path()
            file_root, file_name = os.path.split(full_path)
            file_ext = os.path.splitext(file_name)[1].lower()
        except PIL.UnidentifiedImageError:
            move(full_path, UNKNOWN)
            continue

        image_hash = image.average_hash()

        if image_hash in seen_hashes:
            print(f"Duplicate Found: {image.path} | Matches: {seen_hashes[image_hash]}")
            move(full_path, os.path.join(DUPLICATES, file_name))
            continue
        # else:
            # print("Safe image:", file_name)

        seen_hashes[image_hash] = full_path

################################
# TIME TAKEN
################################

time_taken = time.time() - st
print(f"Total time taken is {time_taken:.2f} seconds ({time_taken/60:.2f} minutes)")
