import SearchBar from '../components/SearchBar';
import { useState, useEffect } from 'react';

function Community({ account }) {
  console.log('Community account prop:', account);

  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [newPost, setNewPost] = useState('');
  const [newComment, setNewComment] = useState({});
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [error, setError] = useState(null);
  const [likes, setLikes] = useState({}); // { postId: [userId, ...] }
  const [likedByCurrentUser, setLikedByCurrentUser] = useState({}); // { postId: true/false }

  useEffect(() => {
    if (!account?.userId) return;

    const fetchPosts = async () => {
      setLoadingPosts(true);
      try {
        const resPosts = await fetch('http://localhost:3000/api/posts');
        if (!resPosts.ok) throw new Error('Failed to fetch posts');
        const postsData = await resPosts.json();

        const commentsPromises = postsData.map(post =>
          fetch(`http://localhost:3000/api/comments/${post.postId}`).then(res => res.json())
        );
        const commentsData = await Promise.all(commentsPromises);

        const postsWithComments = postsData.map((post, i) => ({
          ...post,
          comments: commentsData[i] || [],
        }));

        const likesPromises = postsData.map(post =>
          fetch(`http://localhost:3000/api/likes/${post.postId}`).then(res => res.json())
        );
        const likesData = await Promise.all(likesPromises);

        const likesMap = {};
        const likedByUserMap = {};
        postsData.forEach((post, i) => {
          likesMap[post.postId] = likesData[i] || [];
          likedByUserMap[post.postId] = likesData[i].some(
            (like) => like.userId === account.userId
          );
        });

        setLikes(likesMap);
        setLikedByCurrentUser(likedByUserMap);
        setPosts(postsWithComments);
        setFilteredPosts(postsWithComments);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoadingPosts(false);
      }
    };

    fetchPosts();
  }, [account]);

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    if (!newPost.trim()) return;
    if (!account?.userId || !account?.username) {
      setError('You must be signed in to post');
      return;
    }
    try {
      const res = await fetch('http://localhost:3000/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: account.userId,
          username: account.username,
          content: newPost.trim(),
        }),
      });
      if (!res.ok) throw new Error('Failed to create post');
      setNewPost('');
      await refreshPosts();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCommentSubmit = async (postId, e) => {
    e.preventDefault();
    const commentText = newComment[postId];
    if (!commentText?.trim()) return;
    if (!account?.userId || !account?.username) {
      setError('You must be signed in to comment');
      return;
    }
    try {
      const res = await fetch('http://localhost:3000/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId,
          userId: account.userId,
          username: account.username,
          content: commentText.trim(),
        }),
      });
      if (!res.ok) throw new Error('Failed to add comment');
      setNewComment({ ...newComment, [postId]: '' });
      await refreshPosts();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleLike = async (postId) => {
    if (!account?.userId) {
      setError('You must be signed in to like');
      return;
    }
    if (likedByCurrentUser[postId]) return;
    try {
      const res = await fetch('http://localhost:3000/api/likes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId,
          userId: account.userId,
        }),
      });
      if (!res.ok) throw new Error('Failed to like post');
      await refreshPosts();
    } catch (err) {
      setError(err.message);
    }
  };

  const refreshPosts = async () => {
    if (!account?.userId) return;
    try {
      const resPosts = await fetch('http://localhost:3000/api/posts');
      if (!resPosts.ok) throw new Error('Failed to fetch posts');
      const postsData = await resPosts.json();

      const commentsPromises = postsData.map(post =>
        fetch(`http://localhost:3000/api/comments/${post.postId}`).then(res => res.json())
      );
      const commentsData = await Promise.all(commentsPromises);

      const postsWithComments = postsData.map((post, i) => ({
        ...post,
        comments: commentsData[i] || [],
      }));

      const likesPromises = postsData.map(post =>
        fetch(`http://localhost:3000/api/likes/${post.postId}`).then(res => res.json())
      );
      const likesData = await Promise.all(likesPromises);

      const likesMap = {};
      const likedByUserMap = {};
      postsData.forEach((post, i) => {
        likesMap[post.postId] = likesData[i] || [];
        likedByUserMap[post.postId] = likesData[i].some(
          (like) => like.userId === account.userId
        );
      });

      setLikes(likesMap);
      setLikedByCurrentUser(likedByUserMap);
      setPosts(postsWithComments);
      setFilteredPosts(postsWithComments);
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  };

  console.log('Textarea disabled:', !account?.username);

  return (
    <div className="container">
      <div className="hero">
        <h1>Community</h1>
        <p>Join the XRP Fuzzy community discussions and connect with fellow enthusiasts!</p>
        <SearchBar posts={posts} setFilteredPosts={setFilteredPosts} />
      </div>
      <div className="community-container">
        {error && <p style={{ color: 'red' }}>{error}</p>}

        <form className="post-form" onSubmit={handlePostSubmit}>
          <textarea
            id="newPost"
            name="newPost"
            value={newPost}
            onChange={(e) => {
              console.log('newPost typing:', e.target.value);
              setNewPost(e.target.value);
            }}
            placeholder={account?.username ? "Share your thoughts..." : "Sign in to post..."}
            className="post-input"
            disabled={!account?.username}
          />
          <button type="submit" className="post-button" disabled={!account?.username}>Post</button>
        </form>

        {loadingPosts ? (
          <p>Loading posts...</p>
        ) : filteredPosts.length > 0 ? (
          filteredPosts.map((post) => (
            <div key={post.postId} className="post-card">
              <div className="post-header">
                <a href={`/profile/${post.userId}`} className="user-link">
                  {post.username}
                </a>
                <span className="post-time">{new Date(post.createdAt).toLocaleString()}</span>
              </div>
              <p className="post-content">{post.content}</p>

              <div>
                <button
                  disabled={!account?.username || likedByCurrentUser[post.postId]}
                  onClick={() => handleLike(post.postId)}
                >
                  {likedByCurrentUser[post.postId] ? 'Liked' : 'Like'} ({likes[post.postId]?.length || 0})
                </button>
              </div>

              <div className="comments-section">
                {post.comments.map((comment) => (
                  <div key={comment.commentId} className="comment">
                    <span className="comment-user">{comment.username}</span>: {comment.content}
                    <span className="comment-time">{new Date(comment.createdAt).toLocaleString()}</span>
                  </div>
                ))}

                <form
                  className="comment-form"
                  onSubmit={(e) => handleCommentSubmit(post.postId, e)}
                >
                  <input
                    id={`comment-${post.postId}`}
                    name={`comment-${post.postId}`}
                    type="text"
                    value={newComment[post.postId] || ''}
                    onChange={(e) =>
                      setNewComment({ ...newComment, [post.postId]: e.target.value })
                    }
                    placeholder={account?.username ? "Comment..." : "Sign in to comment..."}
                    className="comment-input"
                    disabled={!account?.username}
                  />
                  <button
                    type="submit"
                    className="comment-button"
                    disabled={!account?.username}
                  >
                    Comment
                  </button>
                </form>
              </div>
            </div>
          ))
        ) : (
          <p>No posts found.</p>
        )}
      </div>
    </div>
  );
}

export default Community;
