import time, os, PIL
from rich.progress import track
from utils import HashImage, Move, support_apple_files, check_if_corrupted_file, APPLE_FILE_EXTENSIONS, IMAGE_EXTENSIONS, VIDEO_EXTENSIONS, \
    make_database_folders, LIMBO_FILES_FOLDER, COPY_FILE, DUPLICATES, VIDEOS, IMAGES, HEICS, SVGS, GIFS, DIRECTORIES, CORRUPTED, UNKNOWN

st = time.time()

################################
# PREPARE FOLDERS + READ STUFF
################################

support_apple_files()

move = Move(COPY_FILE).move

make_database_folders()

folder_items = os.listdir(LIMBO_FILES_FOLDER)

################################
# SORT
################################

seen_hashes = {}

for image_path in track(folder_items, description="Sorting files..."):
    full_path = os.path.join(LIMBO_FILES_FOLDER, image_path)
    file_root, file_name = os.path.split(full_path)
    file_ext = os.path.splitext(file_name)[1].lower()
    is_directory = os.path.isdir(full_path)
    
    if is_directory:
        print(f"Moving directory: {full_path}")
        move(full_path, os.path.join(DIRECTORIES, file_name))
        continue

    if file_ext in VIDEO_EXTENSIONS:
        print(f"Moving video: {full_path}")
        move(full_path, os.path.join(VIDEOS, file_name))
        continue

    if file_ext == ".gif":
        print(f"Moving GIF: {full_path}")
        move(full_path, os.path.join(GIFS, file_name))
        continue

    if file_ext == ".svg":
        print(f"Moving SVG: {full_path}")
        move(full_path, os.path.join(SVGS, file_name))
        continue
    
    if check_if_corrupted_file(full_path):
        print(f"Moving corrupted file: {full_path}")
        move(full_path, os.path.join(CORRUPTED, file_name))

    try:
        image = HashImage(full_path)
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

    if file_ext in IMAGE_EXTENSIONS:
        print(f"Moving image: {full_path}")
        move(full_path, os.path.join(IMAGES, file_name))
        continue

    seen_hashes[image_hash] = full_path

################################
# TIME TAKEN
################################

time_taken = time.time() - st
print(f"Total time taken is {time_taken:.2f} seconds ({time_taken/60:.2f} minutes)")
