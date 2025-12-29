from flask import Flask

def create_app():
    app = Flask(__name__)
    
    # Enable CORS
    from flask_cors import CORS
    # Allow specific origin with credentials
    CORS(app, resources={r"/*": {"origins": ["http://localhost:5173", "http://127.0.0.1:5173"]}}, supports_credentials=True)

    # Properties Logging (Production Ready)
    import logging
    from pythonjsonlogger import jsonlogger

    handler = logging.StreamHandler()
    formatter = jsonlogger.JsonFormatter('%(asctime)s %(levelname)s %(message)s')
    handler.setFormatter(formatter)
    app.logger.addHandler(handler)
    app.logger.setLevel(logging.INFO)

    # Register Blueprints
    from .routes import main
    app.register_blueprint(main)
    
    return app
