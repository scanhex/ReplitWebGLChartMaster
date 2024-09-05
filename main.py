from flask import Flask, render_template, request
import json
import base64

app = Flask(__name__)

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/save_test_results", methods=["POST"])
def save_test_results():
    data = request.json
    with open('test_results.json', 'w') as f:
        json.dump(data, f, indent=2)
    return "Test results saved", 200

@app.route("/save_screenshot", methods=["POST"])
def save_screenshot():
    data = request.json
    image_data = data['imageData'].split(',')[1]
    image_binary = base64.b64decode(image_data)
    
    with open(f"{data['name']}.png", "wb") as f:
        f.write(image_binary)
    
    return "Screenshot saved", 200

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
