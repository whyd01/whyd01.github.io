import os
import requests
from flask import Flask, request, jsonify
from dotenv import load_dotenv
import time
import re

# Memuat variabel lingkungan dari file .env
load_dotenv()

app = Flask(__name__)

@app.route('/api/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400

    file = request.files['file']
    title = request.form.get('title', 'untitled')
    category = request.form.get('category', 'general')

    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    if file:
        dropbox_access_token = os.getenv('DROPBOX_ACCESS_TOKEN')
        if not dropbox_access_token:
            return jsonify({"error": "Dropbox access token is not set"}), 500

        # Membersihkan judul dari karakter yang tidak valid
        safe_title = re.sub(r'[^a-zA-Z0-9\s-]', '', title)
        safe_title = safe_title.replace(' ', '_')

        # Membuat nama file unik berdasarkan kategori, waktu, dan judul
        timestamp = int(time.time())
        filename = f"/{category}/{timestamp}_{safe_title}.jpeg"

        headers = {
            "Authorization": f"Bearer {dropbox_access_token}",
            "Content-Type": "application/octet-stream",
            "Dropbox-API-Arg": f"{{ \"path\": \"{filename}\", \"mode\": \"add\" }}"
        }

        try:
            response = requests.post("https://content.dropboxapi.com/2/files/upload",
                                     headers=headers,
                                     data=file.read())

            if response.status_code == 200:
                # Dapatkan URL shareable dari Dropbox
                share_url_response = requests.post(
                    "https://api.dropboxapi.com/2/sharing/create_shared_link_with_settings",
                    headers={
                        "Authorization": f"Bearer {dropbox_access_token}",
                        "Content-Type": "application/json"
                    },
                    json={"path": response.json()["path_display"]}
                )

                if share_url_response.status_code == 200:
                    share_data = share_url_response.json()
                    raw_url = share_data['url'].replace('dl=0', 'raw=1')
                    return jsonify({"message": "File uploaded successfully!", "url": raw_url}), 200
                else:
                    return jsonify({"error": "Failed to create shared link", "details": share_url_response.text}), share_url_response.status_code

            else:
                return jsonify({"error": "Failed to upload to Dropbox", "details": response.text}), response.status_code

        except Exception as e:
            return jsonify({"error": "An error occurred", "details": str(e)}), 500

    return jsonify({"error": "Something went wrong"}), 500
