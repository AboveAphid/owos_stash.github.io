import imagehash, shutil, os
from pillow_heif import register_heif_opener
from PIL.ImageFile import ImageFile
from typing import Literal
from PIL import Image

APPLE_FILE_EXTENSIONS = [
    ".heif", ".heic"
]

IMAGE_EXTENSIONS = [
    ".jpg", ".jpeg", ".png", ".bmp", ".tiff", ".tif", ".heif",
    ".heic", ".webp", ".avif", ".raw", ".cr2", ".nef",
    ".orf", ".sr2", ".eps", ".jp2", ".jpx", ".pcx"
]

VIDEO_EXTENSIONS = [
    ".mp4", ".mov", ".avi", ".wmv", ".flv", ".webm", ".mkv", ".mpg", ".mpeg",
    ".3gp", ".3g2", ".m4v", ".ogv", ".vob", ".qt", ".asf", ".rm", ".amv",
    ".f4v", ".f4p", ".f4a", ".f4b", ".mod", ".ts", ".m2ts", ".mts"
]

COPY_FILE = False # If true it move the file through copying rather than just moving it

DATABASE_FOLDER = "Database" # f"Sorted-{IMAGE_FOLDER}"

LIMBO_FOLDER = "Limbo"
LIMBO_FILES_FOLDER = os.path.join(LIMBO_FOLDER, "Files")

DUPLICATES = os.path.join(DATABASE_FOLDER, "Duplicates")
VIDEOS = os.path.join(DATABASE_FOLDER, "Videos")
IMAGES = os.path.join(DATABASE_FOLDER, "Images")
HEICS = os.path.join(DATABASE_FOLDER, "HEIC Images")
SVGS = os.path.join(DATABASE_FOLDER, "SVGs")
GIFS = os.path.join(DATABASE_FOLDER, "Gifs")
DIRECTORIES = os.path.join(DATABASE_FOLDER, "Directories")
CORRUPTED = os.path.join(DATABASE_FOLDER, "Corrupted")
UNKNOWN = os.path.join(DATABASE_FOLDER, "Unknown")
LABELS = os.path.join(DATABASE_FOLDER, "labels.json")

def make_database_folders(exist_ok=True):
    os.makedirs(LIMBO_FOLDER, exist_ok=exist_ok)
    os.makedirs(LIMBO_FILES_FOLDER, exist_ok=exist_ok)

    os.makedirs(DATABASE_FOLDER, exist_ok=exist_ok)
    os.makedirs(DUPLICATES, exist_ok=exist_ok)
    os.makedirs(IMAGES, exist_ok=exist_ok)
    os.makedirs(HEICS, exist_ok=exist_ok)
    os.makedirs(VIDEOS, exist_ok=exist_ok)
    os.makedirs(GIFS, exist_ok=exist_ok)
    os.makedirs(SVGS, exist_ok=exist_ok)
    os.makedirs(DIRECTORIES, exist_ok=exist_ok)
    os.makedirs(UNKNOWN, exist_ok=exist_ok)
    os.makedirs(CORRUPTED, exist_ok=exist_ok)

    if not os.path.exists(LABELS):
        with open(LABELS, 'w') as f:
            f.write("{}")

class HashImage():
    path: str | None
    image: ImageFile

    ALGORITHMS = Literal["average", "color", "crop"]

    def __init__(self, path_or_image, ignore_possible_pillow_warning=False) -> None:
        """
        If `ignore_possible_pillow_warning` is False I recommend you check `get_path` afterwards incase the file was converted and changed!
        """

        if isinstance(path_or_image, str):
            if ignore_possible_pillow_warning:
                self.path = path_or_image
                self.image = Image.open(path_or_image)
            else:
                self.image, self.path = self._open_image(path_or_image)
        elif isinstance(path_or_image, ImageFile):
            self.path = None
            self.image = path_or_image
        else:
            raise ValueError("Imaged requires a PIL.ImageFile or path to an image!")

        self.av_hash = imagehash.average_hash(self.image)

    def get_path(self) -> str:
        """
        Will return the path of the image (in case `_open_image` updated it!)
        """
        return self.path or ""

    def _open_image(self, path: str) -> tuple[ImageFile, str]:
        """
        Will attempt to open the image, if it is found to be RGBA compatible but not using it, then it will change the file to RGBA and save it as a PNG.
        
        ***This stops the chance of Pillow's warning running:***
            
            `UserWarning: Palette images with Transparency expressed in bytes should be converted to RGBA images`
        """
        img = Image.open(path)
        path_without_ext = os.path.splitext(path)[0]
        if img.format == 'PNG':
            # and is not RGBA
            if img.mode != 'RGBA':
                print(f"Fixing file (`{path}`) to RGBA...")
                img.convert("RGBA").save(f"{path_without_ext}.png")
                img = Image.open(f"{path_without_ext}.png")
                if not os.path.isdir(path): # Just double check that we aren't removing a directory #_#
                    os.remove(path) # Remove old file that wasn't converted
        return img, path

    def difference(self, other_image, algorithm:ALGORITHMS="average") -> bool:
        match (algorithm):
            case 'average':
                this_hash = self.average_hash()
                other_hash = imagehash.average_hash(other_image)
            case 'color':
                this_hash = self.color_hash()
                other_hash = imagehash.colorhash(other_image)
            case 'crop':
                this_hash = self.crop_resistant_hash()
                other_hash = imagehash.crop_resistant_hash(other_image)
            case _:
                raise ValueError(f"`{algorithm}` is an unknown difference algorithm!")
        return this_hash == other_hash

    def average_hash(self):
        if self.av_hash is None:
            self.av_hash = imagehash.average_hash(self.image)
        return self.av_hash
    
    def color_hash(self):
        if self.col_hash is None:
            self.col_hash = imagehash.colorhash(self.image)
        return self.col_hash
    
    def crop_resistant_hash(self):
        if self.crop_hash is None:
            self.crop_hash = imagehash.crop_resistant_hash(self.image)
        return self.crop_hash

class Move():
    def __init__(self, keep_original=False) -> None:
        self.keep_original = keep_original
    
    def move(self, src, dst):
        if self.keep_original:
            shutil.copy2(src, dst)
        else:
            shutil.move(src, dst)


def support_apple_files():
    register_heif_opener()


def check_if_corrupted_file(path):
    file_ext = os.path.splitext(path)[1]
    
    if file_ext not in IMAGE_EXTENSIONS:
        return False

    try:
        im = Image.open(path)
        im.verify()
        im.close()
        return False
    except (IOError, OSError, Image.DecompressionBombError):
        return True
    
