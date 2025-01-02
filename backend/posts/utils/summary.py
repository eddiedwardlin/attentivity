from dotenv import load_dotenv
import os
import google.generativeai as genai
from urllib.parse import unquote
import time
import requests
import mimetypes
import tempfile

load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_KEY"))
model = genai.GenerativeModel("gemini-1.5-flash")
DEV_MODE = os.getenv("DEV_MODE") == "TRUE"

def getSummary(instance, comments): # Instance is a post
    response = ""
    if instance.image:
        imagePath = ""
        mime_type = ""

        if DEV_MODE:
            imagePath = instance.image.path # Use image path if in dev mode
            mime_type, _ = mimetypes.guess_type(instance.image.path)
        else :
            # Download image and store it temporarily to upload to Gemini
            imageResponse = requests.get(instance.image.url)

            with tempfile.NamedTemporaryFile(delete=False) as tmp_file:
                tmp_file.write(imageResponse.content)
                imagePath = tmp_file.name
            
            mime_type = imageResponse.headers.get('Content-Type') # Need to pass mime type as well as path
        
        try:
            myfile = genai.upload_file(path=imagePath, mime_type=mime_type) # Upload image to Gemini
        except Exception as e:
            print(f"Upload failed: {e}")

        if not DEV_MODE:
            os.remove(imagePath) # remove temp file

        # Generate a response based on the uploaded image (prompt is stored in file)
        # prompt = f"This work is described by the author as: {instance.body}\n\nWhat changes should they make to the {mime_type} based on this feedback: {unquote(comments)}"
        file_path = os.path.join(os.path.dirname(__file__), 'imagePrompt.txt')
        
        with open(file_path, 'r') as file:
            prompt = file.read()

        prompt = prompt.format(
            type=mime_type,
            title=instance.title,
            body=instance.body,
            comments=unquote(comments)
        )

        response = model.generate_content(
            [myfile, "\n\n", prompt]
        )
        
    elif instance.file:
        imagePath = ""
        mime_type = ""

        if DEV_MODE:
            filePath = instance.file.path # Use file path if in dev mode
            mime_type, _ = mimetypes.guess_type(instance.file.path)
        else:
            # Download file and store it temporarily to upload to Gemini
            fileResponse = requests.get(instance.file.url)

            with tempfile.NamedTemporaryFile(delete=False) as tmp_file:
                tmp_file.write(fileResponse.content)
                filePath = tmp_file.name

            mime_type = fileResponse.headers.get('Content-Type') # Need to pass mime type as well as path if using temp storage

        try:
            myfile = genai.upload_file(path=filePath, mime_type=mime_type) # Upload file to Gemini
        except Exception as e:
            print(f"Upload failed: {e}")

        if not DEV_MODE:
            os.remove(filePath) # remove temp file

        # Wait for video file state to become ACTIVE
        if mime_type.startswith('video'):
            while myfile.state.name == "PROCESSING":
                time.sleep(10)
                myfile = genai.get_file(myfile.name)
        
        # Generate a response based on the uploaded document
        # prompt = "This work is described by the author as: ", instance.body, "\n\nWhat changes should I make to the", mime_type, "based on this feedback:", unquote(comments)
        if mime_type.startswith('video'):
            file_path = os.path.join(os.path.dirname(__file__), 'videoPrompt.txt')
        else:
            file_path = os.path.join(os.path.dirname(__file__), 'documentPrompt.txt')
        
        with open(file_path, 'r') as file:
            prompt = file.read()

        prompt = prompt.format(
            type=mime_type,
            title=instance.title,
            body=instance.body,
            comments=unquote(comments)
        )

        response = model.generate_content(
            [myfile, "\n\n", prompt], 
            request_options={"timeout": 600}
        )
    else:
        # Generate response with no image/file
        # prompt = "This work is described by the author as: ", instance.body, "\n\nHow would you implement this feedback: " + unquote(comments)
        file_path = os.path.join(os.path.dirname(__file__), 'otherPrompt.txt')
        
        with open(file_path, 'r') as file:
            prompt = file.read()

        prompt = prompt.format(
            title=instance.title,
            body=instance.body,
            comments=unquote(comments)
        )

        response = model.generate_content(prompt)

    return response.text