import os
import torch
from torchvision import transforms, models
from PIL import Image

# -------- ML MODEL CONFIGURATION --------
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")
IMG_SIZE = 224

# Model paths
XRAY_FILTER_MODEL_PATH = os.path.join(os.path.dirname(__file__), "xray_filter_model.pth")
CARDIOMEGALY_MODEL_PATH = os.path.join(os.path.dirname(__file__), "cardiomegaly_model_improved.pth")

# Class names
XRAY_CLASSES = ['chest_xray', 'random_image']
CARDIO_CLASSES = ['negative', 'positive']

# Image transform for preprocessing (same for both models)
image_transform = transforms.Compose([
    transforms.Resize((IMG_SIZE, IMG_SIZE)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406],
                         [0.229, 0.224, 0.225])
])

# Global model instances
xray_filter_model = None
cardiomegaly_model = None


def load_xray_filter_model():
    """Load the X-ray filter model"""
    global xray_filter_model
    try:
        model = models.resnet18(weights=None)
        in_features = model.fc.in_features
        model.fc = torch.nn.Linear(in_features, len(XRAY_CLASSES))
        model.load_state_dict(torch.load(XRAY_FILTER_MODEL_PATH, map_location=DEVICE))
        model = model.to(DEVICE)
        model.eval()
        xray_filter_model = model
        print(f"X-ray filter model loaded successfully from {XRAY_FILTER_MODEL_PATH}")
        return model
    except Exception as e:
        print(f"Error loading X-ray filter model: {e}")
        return None


def load_cardiomegaly_model():
    """Load the cardiomegaly model"""
    global cardiomegaly_model
    try:
        model = models.resnet18(weights=None)
        in_features = model.fc.in_features
        model.fc = torch.nn.Linear(in_features, len(CARDIO_CLASSES))
        model.load_state_dict(torch.load(CARDIOMEGALY_MODEL_PATH, map_location=DEVICE))
        model = model.to(DEVICE)
        model.eval()
        cardiomegaly_model = model
        print(f"Cardiomegaly model loaded successfully from {CARDIOMEGALY_MODEL_PATH}")
        return model
    except Exception as e:
        print(f"Error loading cardiomegaly model: {e}")
        return None


def init_models():
    """Initialize both models at startup"""
    load_xray_filter_model()
    load_cardiomegaly_model()


def predict_with_model(model, image_tensor, class_names):
    """Helper function to predict with a model"""
    with torch.no_grad():
        outputs = model(image_tensor)
        _, predicted = torch.max(outputs, 1)
        label = class_names[predicted.item()]
        confidence = torch.softmax(outputs, dim=1)[0][predicted.item()].item()
    return label, confidence


def get_model_prediction(image_path):
    """Get prediction from trained models (two-stage pipeline)"""
    # Check if models are loaded
    if xray_filter_model is None or cardiomegaly_model is None:
        print("Models not loaded, returning default prediction")
        return "error", 0.0, "Models not loaded"
    
    try:
        # Load and preprocess image
        image = Image.open(image_path).convert("RGB")
        image_tensor = image_transform(image).unsqueeze(0).to(DEVICE)
        
        # Step 1: Check if the image is a chest X-ray
        xray_label, xray_confidence = predict_with_model(xray_filter_model, image_tensor, XRAY_CLASSES)
        print(f"X-ray filter result: {xray_label} ({xray_confidence*100:.2f}%)")
        
        if xray_label != "chest_xray":
            return "not_xray", xray_confidence, "Image is not a chest X-ray"
        
        # Step 2: Run cardiomegaly prediction
        cardio_label, cardio_confidence = predict_with_model(cardiomegaly_model, image_tensor, CARDIO_CLASSES)
        print(f"Cardiomegaly result: {cardio_label} ({cardio_confidence*100:.2f}%)")
        
        return cardio_label, cardio_confidence, None
    
    except Exception as e:
        print(f"Error during prediction: {e}")
        return "error", 0.0, str(e)
