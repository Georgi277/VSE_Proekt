from flask import Flask, request, jsonify, render_template
import json

app = Flask(__name__)

DATA_FILE = 'data.json'

def load_data():
    with open(DATA_FILE, 'r') as file:
        return json.load(file)

def save_data(data):
    with open(DATA_FILE, 'w') as file:
        json.dump(data, file, indent=4)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/posts', methods=['GET'])
def get_posts():
    data = load_data()
    return jsonify(data['posts']), 200

@app.route('/posts', methods=['POST'])
def create_post():
    new_post = request.get_json()
    data = load_data()
    new_post['id'] = len(data['posts']) + 1
    data['posts'].append(new_post)
    save_data(data)
    return jsonify(new_post), 201

@app.route('/posts/<int:post_id>', methods=['GET'])
def get_post(post_id):
    data = load_data()
    post = next((p for p in data['posts'] if p['id'] == post_id), None)
    if post:
        return jsonify(post), 200
    return jsonify({"error": "Post not found"}), 404

@app.route('/posts/<int:post_id>', methods=['PUT'])
def update_post(post_id):
    updated_post = request.get_json()
    data = load_data()
    post = next((p for p in data['posts'] if p['id'] == post_id), None)
    if post:
        post.update(updated_post)
        save_data(data)
        return jsonify(post), 200
    return jsonify({"error": "Post not found"}), 404

@app.route('/posts/<int:post_id>', methods=['DELETE'])
def delete_post(post_id):
    data = load_data()
    post = next((p for p in data['posts'] if p['id'] == post_id), None)
    if post:
        data['posts'].remove(post)
        data['comments'] = [c for c in data['comments'] if c['post_id'] != post_id]
        save_data(data)
        return '', 204
    return jsonify({"error": "Post not found"}), 404

@app.route('/posts/<int:post_id>/comments', methods=['GET'])
def get_comments(post_id):
    data = load_data()
    post_comments = [c for c in data['comments'] if c['post_id'] == post_id]
    if post_comments:
        return jsonify(post_comments), 200
    return jsonify({"error": "Comments not found"}), 404

@app.route('/posts/<int:post_id>/comments', methods=['POST'])
def create_comment(post_id):
    new_comment = request.get_json()
    data = load_data()
    new_comment['post_id'] = post_id
    new_comment['id'] = len(data['comments']) + 1
    data['comments'].append(new_comment)
    save_data(data)
    return jsonify(new_comment), 201

@app.route('/posts/<int:post_id>/comments/<int:comment_id>', methods=['GET'])
def get_comment(post_id, comment_id):
    data = load_data()
    comment = next((c for c in data['comments'] if c['post_id'] == post_id and c['id'] == comment_id), None)
    if comment:
        return jsonify(comment), 200
    return jsonify({"error": "Comment not found"}), 404

@app.route('/posts/<int:post_id>/comments/<int:comment_id>', methods=['PUT'])
def update_comment(post_id, comment_id):
    updated_comment = request.get_json()
    data = load_data()
    comment = next((c for c in data['comments'] if c['post_id'] == post_id and c['id'] == comment_id), None)
    if comment:
        comment.update(updated_comment)
        save_data(data)
        return jsonify(comment), 200
    return jsonify({"error": "Comment not found"}), 404

@app.route('/posts/<int:post_id>/comments/<int:comment_id>', methods=['DELETE'])
def delete_comment(post_id, comment_id):
    data = load_data()
    comment = next((c for c in data['comments'] if c['post_id'] == post_id and c['id'] == comment_id), None)
    if comment:
        data['comments'].remove(comment)
        save_data(data)
        return '', 204
    return jsonify({"error": "Comment not found"}), 404

if __name__ == '__main__':
    app.run(debug=True)
