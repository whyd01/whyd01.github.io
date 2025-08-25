from flask import Flask, render_template, request, flash, redirect, url_for, jsonify, send_from_directory
from flask_mail import Mail, Message
import os
import json

app = Flask(__name__, static_folder='static', static_url_path='/static')
@app.route('/')
def home():

    return render_template('naruto.html')
if __name__ == '__main__':
     app.run(host='0.0.0.0', port=4000, debug=True)
