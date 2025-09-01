import React, { useState, useEffect } from 'react';
import { FaStar, FaComment, FaThumbsUp, FaTrash } from 'react-icons/fa';
import config from '../config';
import './CommentSection.css';

const CommentSection = ({ bookId }) => {
  const [comments, setComments] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [newComment, setNewComment] = useState('');
  const [newReview, setNewReview] = useState('');
  const [newRating, setNewRating] = useState(5);
  const [activeTab, setActiveTab] = useState('comments');
  const [isLoading, setIsLoading] = useState(true);
  const [userReview, setUserReview] = useState(null);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [bookAuthor, setBookAuthor] = useState('');
  
  const loggedInUserEmail = localStorage.getItem('loggedInUserEmail');
  const loggedInUserName = localStorage.getItem('loggedInUserName') || loggedInUserEmail?.split('@')[0] || 'Anonymous';

  useEffect(() => {
    fetchComments();
    fetchReviews();
    fetchAverageRating();
    fetchBookAuthor();
    if (loggedInUserEmail) {
      fetchUserReview();
    }
  }, [bookId, loggedInUserEmail]);

  const fetchComments = async () => {
    try {
      const response = await fetch(`${config.API_URL}/api/comments/${bookId}`);
      if (response.ok) {
        const data = await response.json();
        setComments(data);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await fetch(`${config.API_URL}/api/reviews/${bookId}`);
      if (response.ok) {
        const data = await response.json();
        setReviews(data);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAverageRating = async () => {
    try {
      const response = await fetch(`${config.API_URL}/api/reviews/${bookId}/average`);
      if (response.ok) {
        const data = await response.json();
        setAverageRating(data.averageRating);
        setTotalReviews(data.totalReviews);
      }
    } catch (error) {
      console.error('Error fetching average rating:', error);
    }
  };

  const fetchUserReview = async () => {
    try {
      const response = await fetch(`${config.API_URL}/api/reviews/${bookId}`);
      if (response.ok) {
        const data = await response.json();
        const userReview = data.find(review => review.user_email === loggedInUserEmail);
        setUserReview(userReview);
        if (userReview) {
          setNewRating(userReview.rating);
          setNewReview(userReview.review_text || '');
        }
      }
    } catch (error) {
      console.error('Error fetching user review:', error);
    }
  };

  const fetchBookAuthor = async () => {
    try {
      const response = await fetch(`/Books/${bookId}/book.json`);
      if (response.ok) {
        const bookData = await response.json();
        setBookAuthor(bookData.AuthorEmail || '');
      }
    } catch (error) {
      console.error('Error fetching book author:', error);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!loggedInUserEmail) {
      alert('Please log in to add a comment');
      return;
    }
    if (!newComment.trim()) {
      alert('Please enter a comment');
      return;
    }

    try {
      const response = await fetch(`${config.API_URL}/api/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookId,
          userEmail: loggedInUserEmail,
          userName: loggedInUserName,
          comment: newComment.trim()
        })
      });

      if (response.ok) {
        setNewComment('');
        fetchComments();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to add comment');
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      alert('Failed to add comment');
    }
  };

  const handleAddReview = async (e) => {
    e.preventDefault();
    if (!loggedInUserEmail) {
      alert('Please log in to add a review');
      return;
    }
    if (!newRating) {
      alert('Please select a rating');
      return;
    }

    try {
      const response = await fetch(`${config.API_URL}/api/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookId,
          userEmail: loggedInUserEmail,
          userName: loggedInUserName,
          rating: newRating,
          reviewText: newReview.trim()
        })
      });

      if (response.ok) {
        setNewReview('');
        setNewRating(5);
        fetchReviews();
        fetchAverageRating();
        fetchUserReview();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to add review');
      }
    } catch (error) {
      console.error('Error adding review:', error);
      alert('Failed to add review');
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!loggedInUserEmail) {
      alert('Please log in to delete comments');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this comment?')) {
      return;
    }

    try {
      const response = await fetch(`${config.API_URL}/api/comments/${commentId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userEmail: loggedInUserEmail
        })
      });

      if (response.ok) {
        fetchComments();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to delete comment');
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
      alert('Failed to delete comment');
    }
  };

  const handleReply = async (commentId) => {
    if (!loggedInUserEmail) {
      alert('Please log in to reply to comments');
      return;
    }
    if (!replyText.trim()) {
      alert('Please enter a reply');
      return;
    }

    try {
      const response = await fetch(`${config.API_URL}/api/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookId,
          userEmail: loggedInUserEmail,
          userName: loggedInUserName,
          comment: replyText.trim(),
          parentId: commentId
        })
      });

      if (response.ok) {
        setReplyText('');
        setReplyingTo(null);
        fetchComments();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to add reply');
      }
    } catch (error) {
      console.error('Error adding reply:', error);
      alert('Failed to add reply');
    }
  };

  const isAuthor = loggedInUserEmail && loggedInUserEmail.toLowerCase() === bookAuthor.toLowerCase();

  const renderStars = (rating, interactive = false, onStarClick = null) => {
    return Array.from({ length: 5 }, (_, index) => (
      <FaStar
        key={index}
        className={`star ${index < rating ? 'filled' : ''} ${interactive ? 'interactive' : ''}`}
        onClick={interactive ? () => onStarClick(index + 1) : undefined}
      />
    ));
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return <div className="comment-section-loading">Loading comments and reviews...</div>;
  }

  return (
    <div className="comment-section">
      <div className="comment-section-header">
        <div className="rating-summary">
          <div className="average-rating">
            <span className="rating-number">{averageRating.toFixed(1)}</span>
            <div className="stars">{renderStars(Math.round(averageRating))}</div>
            <span className="total-reviews">({totalReviews} reviews)</span>
          </div>
        </div>
        
        <div className="tab-navigation">
          <button
            className={`tab-button ${activeTab === 'comments' ? 'active' : ''}`}
            onClick={() => setActiveTab('comments')}
          >
            <FaComment /> Comments ({comments.length})
          </button>
          <button
            className={`tab-button ${activeTab === 'reviews' ? 'active' : ''}`}
            onClick={() => setActiveTab('reviews')}
          >
            <FaStar /> Reviews ({reviews.length})
          </button>
        </div>
      </div>

      {activeTab === 'comments' && (
        <div className="comments-tab">
          {loggedInUserEmail && (
            <form onSubmit={handleAddComment} className="comment-form">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Share your thoughts about this book..."
                rows="3"
                maxLength="500"
              />
              <div className="form-footer">
                <span className="char-count">{newComment.length}/500</span>
                <button type="submit" disabled={!newComment.trim()}>
                  Post Comment
                </button>
              </div>
            </form>
          )}

          <div className="comments-list">
            {comments.length === 0 ? (
              <p className="no-comments">No comments yet. Be the first to share your thoughts!</p>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="comment-item">
                  <div className="comment-header">
                    <div className="comment-author-info">
                      <span className="comment-author">
                        {comment.user_name}
                        {comment.user_email.toLowerCase() === bookAuthor.toLowerCase() && (
                          <span className="author-badge">Author</span>
                        )}
                      </span>
                      <span className="comment-date">{formatDate(comment.created_at)}</span>
                    </div>
                    <div className="comment-actions">
                      {loggedInUserEmail && (
                        <button
                          onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                          className="reply-button"
                          title="Reply to comment"
                        >
                          Reply
                        </button>
                      )}
                      {loggedInUserEmail === comment.user_email && (
                        <button
                          onClick={() => handleDeleteComment(comment.id)}
                          className="delete-comment-button"
                          title="Delete comment"
                        >
                          <FaTrash />
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="comment-content">{comment.comment}</div>
                  
                  {replyingTo === comment.id && (
                    <div className="reply-form">
                      <textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Write your reply..."
                        rows="3"
                        maxLength="500"
                      />
                      <div className="reply-form-actions">
                        <span className="char-count">{replyText.length}/500</span>
                        <div className="reply-buttons">
                          <button
                            onClick={() => {
                              setReplyingTo(null);
                              setReplyText('');
                            }}
                            className="cancel-reply-button"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleReply(comment.id)}
                            disabled={!replyText.trim()}
                            className="submit-reply-button"
                          >
                            Reply
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {comment.replies && comment.replies.length > 0 && (
                    <div className="replies-container">
                      {comment.replies.map((reply) => (
                        <div key={reply.id} className="reply-item">
                          <div className="reply-header">
                            <div className="reply-author-info">
                              <span className="reply-author">
                                {reply.user_name}
                                {reply.user_email.toLowerCase() === bookAuthor.toLowerCase() && (
                                  <span className="author-badge">Author</span>
                                )}
                              </span>
                              <span className="reply-date">{formatDate(reply.created_at)}</span>
                            </div>
                            {loggedInUserEmail === reply.user_email && (
                              <button
                                onClick={() => handleDeleteComment(reply.id)}
                                className="delete-comment-button"
                                title="Delete reply"
                              >
                                <FaTrash />
                              </button>
                            )}
                          </div>
                          <div className="reply-content">{reply.comment}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === 'reviews' && (
        <div className="reviews-tab">
          {loggedInUserEmail && (
            <form onSubmit={handleAddReview} className="review-form">
              <div className="rating-input">
                <label>Your Rating:</label>
                <div className="star-rating">
                  {renderStars(newRating, true, setNewRating)}
                </div>
              </div>
              <textarea
                value={newReview}
                onChange={(e) => setNewReview(e.target.value)}
                placeholder="Write your review (optional)..."
                rows="4"
                maxLength="1000"
              />
              <div className="form-footer">
                <span className="char-count">{newReview.length}/1000</span>
                <button type="submit">
                  {userReview ? 'Update Review' : 'Submit Review'}
                </button>
              </div>
            </form>
          )}

          <div className="reviews-list">
            {reviews.length === 0 ? (
              <p className="no-reviews">No reviews yet. Be the first to rate this book!</p>
            ) : (
              reviews.map((review) => (
                <div key={review.id} className="review-item">
                  <div className="review-header">
                    <div className="review-author-rating">
                      <span className="review-author">{review.user_name}</span>
                      <div className="review-stars">{renderStars(review.rating)}</div>
                    </div>
                    <span className="review-date">{formatDate(review.created_at)}</span>
                  </div>
                  {review.review_text && (
                    <div className="review-content">{review.review_text}</div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CommentSection; 