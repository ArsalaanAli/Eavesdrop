from flask import Flask, request, jsonify

app = Flask(__name__)

@app.route('/check', methods=['POST'])
def check_text():
    data = request.json
    print(data['text'])
    return jsonify({"message": "Text checked successfully"}), 200

if __name__ == '__main__':
    app.run(debug=True)