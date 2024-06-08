document.addEventListener('DOMContentLoaded', function () {
    const postsDiv = document.getElementById('posts');
    const postForm = document.getElementById('post-form');

    function loadPosts() {
        fetch('/posts')
            .then(response => response.json())
            .then(posts => {
                postsDiv.innerHTML = '';
                posts.forEach(post => {
                    const postElement = document.createElement('div');
                    postElement.innerHTML = `
                        <h3>${post.title}</h3>
                        <p>${post.content}</p>
                        <div id="comments-${post.id}">
                            <h4>Comments</h4>
                            <div id="comment-list-${post.id}"></div>
                            <form class="comment-form" data-post-id="${post.id}">
                                <label for="comment-content-${post.id}">New Comment:</label>
                                <input type="text" id="comment-content-${post.id}" required>
                                <button type="submit">Add Comment</button>
                            </form>
                        </div>
                    `;
                    postsDiv.appendChild(postElement);
                    loadComments(post.id);
                });
            });
    }

    function loadComments(postId) {
        fetch(`/posts/${postId}/comments`)
            .then(response => response.json())
            .then(comments => {
                const commentList = document.getElementById(`comment-list-${postId}`);
                commentList.innerHTML = '';
                comments.forEach(comment => {
                    const commentElement = document.createElement('p');
                    commentElement.textContent = comment.content;
                    commentList.appendChild(commentElement);
                });
            });
    }

    postForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const title = document.getElementById('title').value;
        const content = document.getElementById('content').value;

        fetch('/posts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ title, content })
        })
        .then(response => response.json())
        .then(post => {
            loadPosts();
            postForm.reset();
        });
    });

    postsDiv.addEventListener('submit', function (e) {
        if (e.target.classList.contains('comment-form')) {
            e.preventDefault();
            const postId = e.target.dataset.postId;
            const content = document.getElementById(`comment-content-${postId}`).value;

            fetch(`/posts/${postId}/comments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ content })
            })
            .then(response => response.json())
            .then(comment => {
                loadComments(postId);
                e.target.reset();
            });
        }
    });

    loadPosts();
});
