# models.py
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import uuid
import json

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()), unique=True, nullable=False)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False) # Email is required
    password_hash = db.Column(db.String(128), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    email_notifications_enabled = db.Column(db.Boolean, nullable=False, default=True)
    dark_mode_enabled = db.Column(db.Boolean, nullable=False, default=False)
    search_history = db.relationship('SearchHistory', backref='user', lazy=True, cascade="all, delete-orphan")

    def __repr__(self): return f'<User {self.username}>'

class SearchHistory(db.Model):
    __tablename__ = 'search_history'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.String(36), db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    query = db.Column(db.String(255), nullable=False)
    search_term = db.Column(db.String(255), nullable=True)
    best_offer_summary = db.Column(db.Text, nullable=True) # Stores JSON string
    timestamp = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    def __repr__(self): return f'<SearchHistory UserID:{self.user_id} Query:{self.query[:50]}>'

    def set_best_offer(self, best_offer_dict):
        if best_offer_dict and isinstance(best_offer_dict, dict):
            summary = {k: best_offer_dict.get(k) for k in ['title', 'price', 'source', 'link']}
            try: self.best_offer_summary = json.dumps(summary)
            except TypeError: self.best_offer_summary = json.dumps({"error": "Serialization failed."})
        else: self.best_offer_summary = None

    def get_best_offer(self):
        if self.best_offer_summary:
            try: return json.loads(self.best_offer_summary)
            except json.JSONDecodeError: return None
        return None