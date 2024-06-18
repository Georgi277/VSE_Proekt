document.addEventListener('DOMContentLoaded', function () {
    const postsDiv = document.getElementById('posts');
    const postForm = document.getElementById('post-form');
    let posts = []; 

    function loadPosts() {
        fetch('/posts')
            .then(response => response.json())
            .then(data => {
                posts = data;
                renderPosts(posts);
            });
    }

    function renderPosts(posts) {
        postsDiv.innerHTML = '';
        posts.forEach(post => {
            const postElement = createPostElement(post);
            postsDiv.appendChild(postElement);
            loadComments(post.id);
        });
    }

    function createPostElement(post) {
        const postElement = document.createElement('div');
        postElement.innerHTML = `
            <h3>${post.title}</h3>
            <p>${post.content}</p>
            <button class="edit-post" data-post-id="${post.id}">Edit</button>
            <button class="delete-post" data-post-id="${post.id}">Delete</button>
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
        return postElement;
    }

    function loadComments(postId) {
        fetch(`/posts/${postId}/comments`)
            .then(response => response.json())
            .then(comments => {
                const commentList = document.getElementById(`comment-list-${postId}`);
                commentList.innerHTML = '';
                comments.forEach(comment => {
                    const commentElement = createCommentElement(comment);
                    commentList.appendChild(commentElement);
                });
            });
    }

    function createCommentElement(comment) {
        const commentElement = document.createElement('div');
        commentElement.innerHTML = `
            <p>${comment.content}</p>
            <button class="edit-comment" data-post-id="${comment.post_id}" data-comment-id="${comment.id}">Edit</button>
            <button class="delete-comment" data-post-id="${comment.post_id}" data-comment-id="${comment.id}">Delete</button>
        `;
        return commentElement;
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

    postsDiv.addEventListener('click', function (e) {
        if (e.target.classList.contains('edit-post')) {
            const postId = e.target.dataset.postId;
            const post = posts.find(p => p.id === parseInt(postId));
            if (post) {
                const newTitle = prompt('Enter new title:', post.title);
                const newContent = prompt('Enter new content:', post.content);
                if (newTitle && newContent) {
                    fetch(`/posts/${postId}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ title: newTitle, content: newContent })
                    })
                    .then(response => {
                        if (response.ok) {
                            return response.json();
                        } else {
                            throw new Error('Failed to update post.');
                        }
                    })
                    .then(updatedPost => {
                        const index = posts.findIndex(p => p.id === updatedPost.id);
                        posts[index] = updatedPost;
                        renderPosts(posts);
                    })
                    .catch(error => {
                        console.error('Error updating post:', error);
                        alert('Failed to update post.');
                    });
                }
            }
        } else if (e.target.classList.contains('delete-post')) {
            const postId = e.target.dataset.postId;
            if (confirm('Are you sure you want to delete this post?')) {
                fetch(`/posts/${postId}`, {
                    method: 'DELETE'
                })
                .then(response => {
                    if (response.ok) {
                        posts = posts.filter(p => p.id !== parseInt(postId));
                        renderPosts(posts);
                    } else {
                        throw new Error('Failed to delete post.');
                    }
                })
                .catch(error => {
                    console.error('Error deleting post:', error);
                    alert('Failed to delete post.');
                });
            }
        }
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

    postsDiv.addEventListener('click', function (e) {
        if (e.target.classList.contains('edit-comment')) {
            const postId = e.target.dataset.postId;
            const commentId = e.target.dataset.commentId;
            const commentElement = e.target.parentElement;
            const commentText = commentElement.querySelector('p').textContent;
            const newContent = prompt('Enter new comment:', commentText);
            if (newContent) {
                fetch(`/posts/${postId}/comments/${commentId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ content: newContent })
                })
                .then(response => {
                    if (response.ok) {
                        return response.json();
                    } else {
                        throw new Error('Failed to update comment.');
                    }
                })
                .then(updatedComment => {
                    commentElement.querySelector('p').textContent = updatedComment.content;
                })
                .catch(error => {
                    console.error('Error updating comment:', error);
                    alert('Failed to update comment.');
                });
            }
        } else if (e.target.classList.contains('delete-comment')) {
            const postId = e.target.dataset.postId;
            const commentId = e.target.dataset.commentId;
            if (confirm('Are you sure you want to delete this comment?')) {
                fetch(`/posts/${postId}/comments/${commentId}`, {
                    method: 'DELETE'
                })
                .then(response => {
                    if (response.ok) {
                        loadComments(postId);
                    } else {
                        throw new Error('Failed to delete comment.');
                    }
                })
                .catch(error => {
                    console.error('Error deleting comment:', error);
                    alert('Failed to delete comment.');
                });
            }
        }
    });

    loadPosts();
});
