from src import create_app

app = create_app()

if __name__ == '__main__':
    from src.config import Config
    # Run server
    app.run(host='0.0.0.0', port=Config.PORT, debug=True)
