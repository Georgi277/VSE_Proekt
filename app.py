from flask import Flask, request, jsonify, render_template

app = Flask(__name__)

posts = [
    {"id": 1, "title": "First Post", "content": "This is the first post."},
    {"id": 2, "title": "Second Post", "content": "This is the second post."}
]
comments = [
    {"post_id": 1, "id": 1, "content": "First comment on first post"},
    {"post_id": 1, "id": 2, "content": "Second comment on first post"},
    {"post_id": 2, "id": 1, "content": "First comment on second post"}
]

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/posts', methods=['GET'])
def get_posts():
    return jsonify(posts), 200

@app.route('/posts', methods=['POST'])
def create_post():
    new_post = request.get_json()
    new_post['id'] = len(posts) + 1
    posts.append(new_post)
    return jsonify(new_post), 201

@app.route('/posts/<int:post_id>', methods=['GET'])
def get_post(post_id):
    post = next((p for p in posts if p['id'] == post_id), None)
    if post:
        return jsonify(post), 200
    return jsonify({"error": "Post not found"}), 404

@app.route('/posts/<int:post_id>', methods=['PUT'])
def update_post(post_id):
    updated_post = request.get_json()
    post = next((p for p in posts if p['id'] == post_id), None)
    if post:
        post.update(updated_post)
        return jsonify(post), 200
    return jsonify({"error": "Post not found"}), 404

@app.route('/posts/<int:post_id>', methods=['PATCH'])
def partial_update_post(post_id):
    updated_fields = request.get_json()
    post = next((p for p in posts if p['id'] == post_id), None)
    if post:
        post.update(updated_fields)
        return jsonify(post), 200
    return jsonify({"error": "Post not found"}), 404

@app.route('/posts/<int:post_id>', methods=['DELETE'])
def delete_post(post_id):
    post = next((p for p in posts if p['id'] == post_id), None)
    if post:
        posts.remove(post)
        return '', 204
    return jsonify({"error": "Post not found"}), 404

@app.route('/posts/<int:post_id>/comments', methods=['GET'])
def get_comments(post_id):
    post_comments = [c for c in comments if c['post_id'] == post_id]
    if post_comments:
        return jsonify(post_comments), 200
    return jsonify({"error": "Comments not found"}), 404

@app.route('/posts/<int:post_id>/comments', methods=['POST'])
def create_comment(post_id):
    new_comment = request.get_json()
    new_comment['post_id'] = post_id
    new_comment['id'] = len(comments) + 1
    comments.append(new_comment)
    return jsonify(new_comment), 201

@app.route('/posts/<int:post_id>/comments/<int:comment_id>', methods=['GET'])
def get_comment(post_id, comment_id):
    comment = next((c for c in comments if c['post_id'] == post_id and c['id'] == comment_id), None)
    if comment:
        return jsonify(comment), 200
    return jsonify({"error": "Comment not found"}), 404

@app.route('/posts/<int:post_id>/comments/<int:comment_id>', methods=['PUT'])
def update_comment(post_id, comment_id):
    updated_comment = request.get_json()
    comment = next((c for c in comments if c['post_id'] == post_id and c['id'] == comment_id), None)
    if comment:
        comment.update(updated_comment)
        return jsonify(comment), 200
    return jsonify({"error": "Comment not found"}), 404

@app.route('/posts/<int:post_id>/comments/<int:comment_id>', methods=['PATCH'])
def partial_update_comment(post_id, comment_id):
    updated_fields = request.get_json()
    comment = next((c for c in comments if c['post_id'] == post_id and c['id'] == comment_id), None)
    if comment:
        comment.update(updated_fields)
        return jsonify(comment), 200
    return jsonify({"error": "Comment not found"}), 404

@app.route('/posts/<int:post_id>/comments/<int:comment_id>', methods=['DELETE'])
def delete_comment(post_id, comment_id):
    comment = next((c for c in comments if c['post_id'] == post_id and c['id'] == comment_id), None)
    if comment:
        comments.remove(comment)
        return '', 204
    return jsonify({"error": "Comment not found"}), 404

if __name__ == '__main__':
    app.run(debug=True)
