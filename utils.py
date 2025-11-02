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

class HashImage():
    path: str | None
    image: ImageFile

    ALGORITHMS = Literal["average", "color", "crop"]

    def __init__(self, path_or_image) -> None:
        if isinstance(path_or_image, str):
            self.path = path_or_image
            self.image = Image.open(path_or_image)
        elif isinstance(path_or_image, ImageFile):
            self.path = None
            self.image = path_or_image
        else:
            raise ValueError("Imaged requires a PIL.ImageFile or path to an image!")

        self.av_hash = imagehash.average_hash(self.image)

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
    
