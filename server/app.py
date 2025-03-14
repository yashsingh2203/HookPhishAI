from flask import Flask, request, jsonify
import joblib
import re

app = Flask(__name__)

# Load trained phishing detection model
model_path = os.path.join(os.path.dirname(__file__), "ml_model/phishing_model.pkl")
model = joblib.load(model_path)


# Function to extract URL features (simplified example)
def extract_features(url):
    return [
        len(url),
        url.count('.'),
        url.count('-'),
        url.count('/'),
        1 if "https" in url else 0
    ]

@app.route("/check_url", methods=["POST"])
def check_url():
    data = request.get_json()
    url = data["url"]

    # Extract URL features and predict
    features = extract_features(url)
    prediction = model.predict([features])[0]

    return jsonify({"is_phishing": bool(prediction)})

if __name__ == "__main__":
    app.run(debug=True)
