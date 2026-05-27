
# Cardiomegaly Detection System - Flask Backend

This is the backend server for the Cardiomegaly Detection System application, which provides endpoints for:
- Uploading X-ray images and getting cardiomegaly predictions
- Retrieving all previous predictions

## Setup Instructions

1. Create a virtual environment:
   ```
   python -m venv venv
   ```

2. Activate the virtual environment:
   - On Windows: `venv\Scripts\activate`
   - On macOS/Linux: `source venv/bin/activate`

3. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

4. Run the Flask server:
   ```
   python app.py
   ```

The server will run at `http://localhost:5000` by default.

## API Endpoints

### POST /predict
Upload an X-ray image and get a prediction.

**Request:**
- Form data with an "image" field containing the X-ray image file

**Response:**
```json
{
  "image_id": "uuid",
  "prediction": "positive|negative",
  "confidence": 0.95,
  "timestamp": "2023-04-12T15:30:45.123456"
}
```

### GET /predictions
Get all previous predictions.

**Response:**
```json
[
  {
    "image_id": "uuid",
    "prediction": "positive|negative",
    "confidence": 0.95,
    "timestamp": "2023-04-12T15:30:45.123456"
  },
  ...
]
```

## Database

The application uses MySQL running on XAMPP to store prediction results.

### MySQL Setup (XAMPP):

1. Start XAMPP and ensure MySQL is running

2. **Database Setup Options:**

   **Option A: Automatic Setup (Recommended)**
   - The database `cardiomegaly_detection` will be created automatically when you start the server
   - All tables will be created automatically
   - Default users will be seeded automatically

   **Option B: Manual Setup**
   - Open phpMyAdmin (http://localhost/phpmyadmin)
   - Import `flask_backend/complete_database_setup.sql` to create all tables
   - Or run `flask_backend/heartsight_ai_startup.sql` for basic setup

   **Option C: Migration from Old Database**
   - If you have data in `heartsight_ai` database, use `flask_backend/migrate_database.sql`

3. Default configuration uses:
   - Host: `localhost`
   - User: `root`
   - Password: `` (empty - XAMPP default)
   - Database: `cardiomegaly_detection`

If you need to change these settings, edit the `DB_CONFIG` in `config.py`.

## Model Integration

The current implementation uses random values for demonstration. To integrate your trained model:

1. Place your model file (e.g., `.pt`, `.pkl`) in the project directory
2. Modify the `get_model_prediction()` function in `app.py` to load and use your model

Example integration with PyTorch:

```python
import torch
from PIL import Image
import torchvision.transforms as transforms

# Load model once at startup
model = torch.load('your_model.pt')
model.eval()

def get_model_prediction(image_path):
    # Load and preprocess image
    image = Image.open(image_path).convert('RGB')
    preprocess = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
    ])
    input_tensor = preprocess(image).unsqueeze(0)
    
    # Run inference
    with torch.no_grad():
        output = model(input_tensor)
        probabilities = torch.nn.functional.softmax(output[0], dim=0)
        
    # Get prediction
    predicted_class = "positive" if probabilities[1] > probabilities[0] else "negative"
    confidence = float(probabilities[1] if predicted_class == "positive" else probabilities[0])
    
    return predicted_class, confidence
```
