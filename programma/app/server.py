import subprocess
from flask import Flask, jsonify # type: ignore

app = Flask(__name__)

def draai(commando, cwd=None):
    resultaat = subprocess.run(
        commando, cwd=cwd, capture_output=True, text=True, shell=True
    )
    return resultaat.stdout + resultaat.stderr

@app.route("/run/python")
def run_python():
    output = draai("python /app/python/test.py")
    return jsonify({"output": output})

@app.route("/run/dotnet")
def run_dotnet():
    output = draai("dotnet run", cwd="/app/dotnet")
    return jsonify({"output": output})

@app.route("/run/nodejs")
def run_nodejs():
    output = draai("node /app/nodejs/test.js")
    return jsonify({"output": output})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)