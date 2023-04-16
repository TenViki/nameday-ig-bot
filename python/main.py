import sys
import os
from dotenv import load_dotenv
from instagrapi import Client
import json

load_dotenv()

print(os.environ.get("IG_USERNAME"))

cl = Client()

cl.load_settings("settings.json")

cl.login(
    os.environ.get("IG_USERNAME"),
    os.environ.get("IG_PASSWORD"),
)

print("Login successful")
# user_id = cl.user_id_from_username("tenviki28")
# medias = cl.user_medias(user_id, 20)

# print(medias)

print("Got here")

images = json.loads(sys.argv[1])
names = json.loads(sys.argv[2])

name_string = ""

print("Also here")

for i in range(len(names)):
    name_string += names[i]["name"]
    if i < len(names) - 2:
        name_string += ", "
    elif i == len(names) - 2:
        name_string += " a "


caption = f"""Ke dni {names[0]["day"]} {"mají" if len(name_string) > 1 else "má"} svátek {name_string}.

{sys.argv[3]}

#svatkycz #{" #".join(name["name"] for name in names )} #citat #radost #citatycz #myslienky #memeczsk #srandamusibyt #srandicky #kazdyden #cernyhumor #legrace #cze #motivacia #emefka #sarkazmus #sranda #czechrepublic #volnycas #memecz #zajimavosti #konecne"""

print(caption)
print(images)

if len(images) == 1:
    media = cl.photo_upload(images[0], caption=caption)

else:
    media = cl.album_upload(images, caption=caption)
