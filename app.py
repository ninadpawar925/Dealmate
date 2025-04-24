import os
import re
import json
import logging
from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import create_access_token, jwt_required, JWTManager, get_jwt_identity
from flask_bcrypt import Bcrypt
from flask_cors import CORS
from dotenv import load_dotenv
import google.generativeai as genai
from google.cloud import vision
from sqlalchemy import text as sa_text, desc
from serpapi import GoogleSearch
from models import db, User, SearchHistory

# Load environment
load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
SERPAPI_API_KEY = os.getenv("SERPAPI_API_KEY")
GOOGLE_APPLICATION_CREDENTIALS = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")

# Flask setup
app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = DATABASE_URL
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["JWT_SECRET_KEY"] = JWT_SECRET_KEY
os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = GOOGLE_APPLICATION_CREDENTIALS
CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True)

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Init extensions
db.init_app(app)
migrate = Migrate(app, db)
jwt = JWTManager(app)
bcrypt = Bcrypt(app)

# Gemini setup
USE_AI_SERVICE = bool(GOOGLE_API_KEY)
gemini_model = None
if USE_AI_SERVICE:
    try:
        genai.configure(api_key=GOOGLE_API_KEY)
        gemini_model = genai.GenerativeModel('gemini-1.5-flash-latest')
        logger.info("Gemini client ready")
    except Exception as e:
        logger.error(f"Gemini init failed: {e}")
        USE_AI_SERVICE = False

# Vision API
vision_client = vision.ImageAnnotatorClient()

# === UTILS ===

def fetch_with_serpapi(query):
    logger.info(f"Searching SerpAPI: {query}")
    try:
        params = {
            "engine": "google_shopping",
            "q": query,
            "hl": "en",
            "gl": "in",
            "api_key": SERPAPI_API_KEY
        }
        results = GoogleSearch(params).get_dict().get("shopping_results", [])
        parsed = []
        for item in results:
            title = item.get("title")
            link = item.get("link")
            source = item.get("source")
            price_str = item.get("price")
            if not title or not price_str:
                continue
            match = re.search(r"[\d,.]+", price_str.replace(",", ""))
            if not match: continue
            price = float(match.group())
            parsed.append({
                "title": title,
                "price": round(price, 2),
                "link": link,
                "source": source
            })
        return parsed[:3]
    except Exception as e:
        logger.error(f"SerpAPI error: {e}")
        return []

def generate_ai_summary(query, search_term, best_offer, count, errors):
    if not USE_AI_SERVICE or not gemini_model:
        return f"Top deal for '{search_term}' is ₹{best_offer['price']} at {best_offer['source']}." if best_offer else "No top offer available."
    try:
        prompt = f"You searched for '{query}'."
        if best_offer:
            prompt += f" Best deal: {best_offer['title']} for ₹{best_offer['price']} at {best_offer['source']}."
        prompt += " Provide a short summary."
        response = gemini_model.generate_content(prompt)
        return response.text.strip() if response and response.text else "Summary unavailable."
    except Exception as e:
        logger.error(f"Gemini error: {e}")
        return "Summary unavailable."

# === ROUTES ===

@app.route('/api/search', methods=['POST'])
@jwt_required()
def handle_search():
    user_id = get_jwt_identity()
    query = request.get_json().get("query", "").strip()
    if not query:
        return jsonify({"error": "Missing query"}), 400
    results = fetch_with_serpapi(query)
    best_offer = results[0] if results else None
    summary = generate_ai_summary(query, query, best_offer, len(results), [])
    if user_id:
        try:
            entry = SearchHistory(user_id=user_id, query=query, search_term=query)
            if best_offer:
                entry.set_best_offer(best_offer)
            db.session.add(entry)
            db.session.commit()
        except Exception as e:
            db.session.rollback()
            logger.error(f"DB error: {e}")
    return jsonify({
        "search_term": query,
        "best_offer": best_offer,
        "offers": results,
        "ai_summary": summary,
        "errors": []
    })

@app.route('/api/image-search', methods=['POST'])
@jwt_required()
def image_search():
    user_id = get_jwt_identity()
    file = request.files.get("image")
    if not file:
        return jsonify({"error": "No image uploaded."}), 400
    image = vision.Image(content=file.read())
    labels = vision_client.label_detection(image=image).label_annotations
    detected = [label.description for label in labels]
    if not detected:
        return jsonify({"error": "No label found."}), 200
    query = detected[0]
    results = fetch_with_serpapi(query)
    best_offer = results[0] if results else None
    summary = generate_ai_summary("image", query, best_offer, len(results), [])
    if user_id:
        try:
            entry = SearchHistory(user_id=user_id, query="image", search_term=query)
            if best_offer:
                entry.set_best_offer(best_offer)
            db.session.add(entry)
            db.session.commit()
        except Exception as e:
            db.session.rollback()
            logger.error(f"DB error: {e}")
    return jsonify({
        "search_term": query,
        "best_offer": best_offer,
        "offers": results,
        "ai_summary": summary,
        "errors": []
    })

@app.route('/api/history', methods=['GET'])
@jwt_required()
def get_history():
    user_id = get_jwt_identity()
    page = int(request.args.get("page", 1))
    per_page = int(request.args.get("per_page", 10))
    query = db.session.query(SearchHistory).filter_by(user_id=user_id).order_by(desc(SearchHistory.timestamp))
    pagination = query.paginate(page=page, per_page=per_page, error_out=False)
    return jsonify({
        "items": [{
            "id": item.id,
            "query": item.query,
            "search_term": item.search_term,
            "timestamp": item.timestamp.isoformat(),
            "best_offer": item.get_best_offer()
        } for item in pagination.items],
        "total_pages": pagination.pages
    })

@app.route('/api/history', methods=['DELETE'])
@jwt_required()
def clear_history():
    user_id = get_jwt_identity()
    try:
        db.session.query(SearchHistory).filter_by(user_id=user_id).delete()
        db.session.commit()
        return jsonify({"message": "History cleared"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "Failed to clear history"}), 500

@app.route("/api/login", methods=["POST"])
def login():
    data = request.get_json()
    user = User.query.filter_by(username=data.get("username")).first()
    if user and bcrypt.check_password_hash(user.password_hash, data.get("password")):
        token = create_access_token(identity=user.id)
        return jsonify(access_token=token, user={"id": user.id, "username": user.username})
    return jsonify({"message": "Invalid credentials"}), 401

@app.route("/api/register", methods=["POST"])
def register():
    data = request.get_json()
    if User.query.filter((User.username == data["username"]) | (User.email == data["email"])).first():
        return jsonify({"message": "Username or email already taken"}), 409
    user = User(
        username=data["username"],
        email=data["email"],
        password_hash=bcrypt.generate_password_hash(data["password"]).decode("utf-8")
    )
    db.session.add(user)
    db.session.commit()
    return jsonify({"message": "User registered"}), 201

@app.route('/api/profile', methods=['GET'])
@jwt_required()
def get_profile():
    user = User.query.filter_by(id=get_jwt_identity()).first()
    if not user:
        return jsonify({"message": "User not found"}), 404
    return jsonify({
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "created_at": user.created_at.isoformat()
    })

@app.route('/health')
def health(): return "OK", 200

if __name__ == '__main__':
    with app.app_context():
        try:
            db.session.execute(sa_text("SELECT 1"))
            logger.info("DB connection OK")
        except Exception as e:
            logger.error(f"Database connection failed: {e}")
            exit()
    app.run(debug=True)
