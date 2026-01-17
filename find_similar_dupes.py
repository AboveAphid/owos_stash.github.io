# Source - https://stackoverflow.com/a/57100744
# Posted by Jmonsky
# Retrieved 2026-01-17, License - CC BY-SA 4.0

import os, itertools, imagehash, csv
from utils import support_apple_files
from PIL import Image

support_apple_files()

folder_path = "Database\\Images"

dirloc = os.listdir("Database\\Images")

HAMMING_DISTANCE_MAX_THRESHOLD = 5 # Has to be lower than five in difference to be considered similar!

duplicates = []
dup = []

hashes = []

print("Dhashing images...")
for filename in os.listdir(folder_path):
    file = os.path.join(folder_path, filename)
    hashes.append((file, imagehash.dhash(Image.open(file))))
print("Hashed all images!")

print("Comparing images...")
for pair1, pair2 in itertools.combinations(hashes,2):
    f1, dhash1 = pair1
    f2, dhash2 = pair2
    #Honestly not sure which hash method to use, so I went with dhash.
    hashdif = dhash1 - dhash2

    if hashdif < HAMMING_DISTANCE_MAX_THRESHOLD:  #May change the 5 to find more accurate matches
        print("images are similar due to dhash", "image1", f1, "image2", f2)
        duplicates.append(f1)
        dup.append(f2)
print("All images compared!")

#Setting up a CSV file with the similar images to review before deleting
with open("duplicates.csv", "w") as myfile: # also move this out of the loop so you arent rewriting the file every time
    wr = csv.writer(myfile)
    wr.writerows(zip(duplicates, dup)) 
