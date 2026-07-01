from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv
import os

from app.models.models import db
from app.routes.routes import api_bp

load_dotenv()

def create_app(config_name="development"):
    app = Flask(__name__)
    CORS(app)

    if config_name == "testing":
        app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///:memory:"
        app.config["TESTING"] = True
    else:
        app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv(
            "DATABASE_URL",
            "sqlite:///quickbook.db"
        )

    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.config["JWT_SECRET"] = os.getenv("JWT_SECRET", "quickbook_secret_2026")

    db.init_app(app)

    with app.app_context():
        db.create_all()

    app.register_blueprint(api_bp)

    return app