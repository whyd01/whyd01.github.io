from flask import Flask, render_template, request, jsonify, url_for
import os
import uuid
import json

app = Flask(__name__)

# Direktori untuk menyimpan file yang diunggah dan file data
UPLOAD_FOLDER = 'static/naruto'
DATA_FILE = 'static/images.json'

# Ini memberitahu Flask di mana folder unggahan berada.
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Pastikan folder dan file ada
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

# Fungsi untuk memuat data dari file JSON
def load_data(filename):
    if not os.path.exists(filename) or os.stat(filename).st_size == 0:
        return {"naruto": []}
    with open(filename, 'r') as f:
        try:
            return json.load(f)
        except json.JSONDecodeError:
            return {"naruto": []}

# Fungsi untuk menyimpan data ke file JSON
def save_data(data, filename):
    with open(filename, 'w') as f:
        json.dump(data, f, indent=4)

# Muat data awal saat server dimulai
images_db = load_data(DATA_FILE)

notifications_db = []
messages_db = []

def load_notifications():
    return notifications_db

def load_messages():
    return messages_db

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/upload-image', methods=['POST'])
def upload_image():
    """Endpoint untuk mengunggah gambar dan menyimpannya secara permanen."""
    try:
        if 'file' not in request.files:
            return jsonify({"success": False, "message": "No file part"}), 400
        file = request.files['file']
        if file.filename == '':
            return jsonify({"success": False, "message": "No selected file"}), 400
        
        if file:
            # Hasilkan nama file unik untuk menghindari konflik
            unique_filename = str(uuid.uuid4()) + os.path.splitext(file.filename)[1]
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)
            file.save(filepath)

            # Buat objek gambar baru
            new_image = {
                "id": unique_filename,
                "title": request.form.get('title', 'Gambar Baru'),
                "category": request.form.get('category', 'Uploaded'),
                "src": url_for('static', filename=f'naruto/{unique_filename}'),
                "likes": 985
            }
            
            # Tambahkan gambar ke dalam list di dalam dictionary
            images_db['images'].append(new_image)
            save_data(images_db, DATA_FILE)
            
            return jsonify({"success": True, "image": new_image})
    
    except Exception as e:
        return jsonify({"success": False, "message": f"Terjadi kesalahan: {str(e)}"}), 500

@app.route('/get-naruto')
def get_naruto():
    """Endpoint untuk mengambil semua gambar."""
    return jsonify({"naruto": images_db['naruto']})

@app.route('/add-notification', methods=['POST'])
def add_notification():
    """
    Endpoint untuk menambahkan notifikasi baru
    (misalnya, dari event like/share)
    """
    data = request.json
    new_notification_text = data.get('text', 'Aktivitas baru!')
    new_notification = {
        "id": len(notifications_db) + 1,
        "text": new_notification_text
    }
    notifications_db.append(new_notification)
    return jsonify({"success": True, "notification": new_notification})

@app.route('/get-notifications')
def get_notifications():
    """Endpoint untuk mengambil semua notifikasi."""
    return jsonify({"notifications": load_notifications()})

@app.route('/get-messages')
def get_messages():
    """Endpoint untuk mengambil semua pesan."""
    return jsonify({"messages": load_messages()})
@app.route('/musik')
def musik_page():
    return render_template('musik.html')

@app.route('/second')
def second_page():
    return render_template('second.html')

@app.route('/auth')
def auth_page():
    return render_template('auth.html')
if __name__ == '__main__':
     app.run(host='localhost', port=4000, debug=True)
