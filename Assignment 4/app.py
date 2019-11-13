from flask import Flask, render_template, request
from flask_cors import CORS
from routes.home import home
from servers.server import api

def main_app():
    app = Flask(__name__)
    CORS(app)
    app.register_blueprint(api)
    app.register_blueprint(home)
    app.jinja_env.auto_reload = True
    app.config['TEMPLATES_AUTO_RELOAD'] = True
    app.run(debug= True, host='127.0.0.1')
    return app

if __name__ == "__main__":
    main_app()