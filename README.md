# HookPhishAI

AI-powered phishing detection Chrome extension.

## Features
✔ Detects phishing websites using machine learning.  
✔ Analyzes website URLs, page content, and SSL certificates.  
✔ Alerts users if a site is potentially dangerous.  
✔ Blocks access to flagged phishing sites dynamically.  
✔ Provides a link to Cisco’s phishing prevention resources.  
✔ User-friendly Chrome extension with a simple UI.  

## Project Structure
```
HookPhishAI/
│── server/                 # Backend (Flask API)
│   ├── ml_model/           # Trained ML model for phishing detection
│   │   ├── phishing_model.pkl  # Machine Learning model file
│   ├── app.py              # Flask API for phishing detection
│   ├── ssl_checker.py      # SSL certificate validation
│   ├── url_parser.py       # URL feature extraction
│── extension/              # Chrome Extension Files
│   ├── manifest.json       # Chrome extension configuration
│   ├── background.js       # Background script handling requests
│   ├── content.js          # Content script for analyzing page content
│   ├── popup.html          # User interface (popup)
│   ├── popup.js            # Handles popup functionality
│   ├── styles.css          # Styling for popup.html
│   ├── rules.json          # Dynamic blocking rules
│   ├── icons/              # Icons for different sizes
│── README.md               # Documentation
│── phishing_dataset.csv    # Dataset for training/testing the model
│── requirements.txt        # Python dependencies
```

## Installation

### 1. Clone the Repository
```sh
git clone https://github.com/yourusername/HookPhishAI.git
cd HookPhishAI
```

### 2. Setup the Backend (Flask API)
```sh
cd server
pip install -r requirements.txt
python app.py
```
This starts the Flask API on http://localhost:5000

### 3. Install the Chrome Extension
1. Open Google Chrome and go to `chrome://extensions/`.  
2. Enable Developer Mode (toggle in the top right corner).  
3. Click "Load unpacked" and select the `extension/` folder.  
4. Click "Scan This Page" to check if the current website is phishing.  

## Technologies Used

### 📌 Frontend (Chrome Extension)
- HTML, CSS, JavaScript – For UI & logic
- Chrome Extensions API – To integrate with Chrome

### 📌 Backend (Machine Learning & API)
- Python (Flask) – API server
- scikit-learn – Machine Learning model
- joblib – Model serialization
- Pandas – Data processing
- SSL, Socket – Certificate validation

## 📊 How It Works

1. User visits a website → URL is sent to the ML model.
2. ML model extracts features from URL, page content, and SSL.
3. If phishing is detected, an alert is shown & the site is blocked dynamically.
4. User can access phishing prevention resources via a link to Cisco.

## API Endpoints

| Method | Endpoint       | Description                     |
|--------|----------------|---------------------------------|
| POST   | /check_url     | Checks if a URL is phishing     |
| POST   | /validate_ssl  | Checks if a website has a valid SSL certificate |

### Example API Request (Using Postman):

#### POST http://localhost:5000/check_url
```json
{
  "url": "http://example.com"
}
```

#### Example Response:
```json
{
  "url": "http://example.com",
  "is_phishing": true,
  "ssl_valid": false
}
```

## Contribution Guide
✔ Fork the repository.  
✔ Create a feature branch (`git checkout -b feature-name`).  
✔ Commit your changes (`git commit -m "Added new feature"`).  
✔ Push to your branch (`git push origin feature-name`).  
✔ Submit a Pull Request (PR).  

## Disclaimer
This extension is a research project and should not be used as the sole measure of security. Always verify websites manually before entering sensitive data.

