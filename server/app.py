from flask import Flask, request, jsonify
import joblib  # Load ML model
import ssl
import socket
import time  # ✅ Import time module for correct timestamp handling
import re

# List of phishing-related words commonly found in malicious URLs
SUSPICIOUS_WORDS = ["login", "verify", "update", "secure", "bank", "password", 
                    "account", "confirm", "free", "urgent", "webscr", "signin", "ebayisapi", "wp-admin"]

def extract_features(url):
    """
    Extracts key features from a given URL for phishing detection.

    Features:
    1. `has_https` (1 = HTTPS present, 0 = HTTP)
    2. `url_length` (Total length of URL)
    3. `num_digits` (Number of digits in URL)
    4. `num_special_chars` (Number of special characters like `-`, `_`, `/`, etc.)
    5. `suspicious_words_count` (Count of phishing-related words in the URL)

    Returns:
    - A list of extracted numerical features.
    """
    try:
        # Check if HTTPS is present
        has_https = 1 if url.startswith("https") else 0

        # Length of the URL
        url_length = len(url)

        # Count number of digits in the URL
        num_digits = sum(c.isdigit() for c in url)

        # Count number of special characters in the URL
        num_special_chars = sum(not c.isalnum() for c in url)

        # Count phishing-related words in URL
        suspicious_words_count = sum(word in url.lower() for word in SUSPICIOUS_WORDS)

        return [has_https, url_length, num_digits, num_special_chars, suspicious_words_count, 0]

    except Exception as e:
        print(f"URL Parsing Error: {e}")
        return [0, 0, 0, 0, 0, 0]  # Return default values if parsing fails


def validate_ssl(url):
    """
    Checks the SSL certificate validity of a given URL.

    Returns:
    - True if SSL is valid (certificate exists and is not expired).
    - False if SSL is invalid (no certificate or expired).
    """
    try:
        # Check if the URL starts with "http://"
        if url.startswith("http://"):
            return False  # HTTP does not have SSL
        
        # Extract domain from URL
        domain = url.split("//")[-1].split("/")[0]

        # Create a secure SSL context
        context = ssl.create_default_context()

        # Establish a connection to get SSL details
        with socket.create_connection((domain, 443), timeout=5) as sock:
            with context.wrap_socket(sock, server_hostname=domain) as ssock:
                cert = ssock.getpeercert()

                # Convert certificate expiry date to timestamp
                expiry_timestamp = ssl.cert_time_to_seconds(cert['notAfter'])

                # Get current time in timestamp format
                current_timestamp = time.time()  # ✅ Corrected from `ssl.time.gmtime()`

                # Check if certificate is still valid
                return expiry_timestamp > current_timestamp

    except Exception as e:
        print(f"SSL Validation Error: {e}")
        return False  # Return False if SSL validation fails


app = Flask(__name__)

# Load trained phishing detection model
model = joblib.load("ml_model/phishing_model.pkl")

@app.route("/check_url", methods=["POST"])
def check_url():
    data = request.get_json()
    url = data["url"]

    # Extract URL features
    url_features = extract_features(url)
    ssl_valid = validate_ssl(url)

    # Predict phishing risk
    prediction = model.predict([url_features])[0]

    return jsonify({
        "url": url,
        "is_phishing": bool(prediction),
        "ssl_valid": ssl_valid
    })

if __name__ == "__main__":
    app.run(debug=True)
