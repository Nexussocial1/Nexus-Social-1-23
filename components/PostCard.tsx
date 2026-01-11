import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Post, User, PostComment } from '../types';
import ShareModal from './ShareModal';
import ReportModal from './ReportModal';
import PostActionModal from './PostActionModal';
import { useReport } from '../hooks/useReport';
import { useFollow } from '../hooks/useFollow';
import { db } from '../firebaseConfig';
import {
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
  increment,
  setDoc,
  deleteDoc,
  serverTimestamp
} from 'firebase/firestore';

interface PostCardProps {
  post: Post;
  currentUser: User;
  onReportPost?: (postId: string) => void;
}

const PostCard: React.FC<PostCardProps> = ({ post, currentUser, onReportPost: onReportPostProp }) => {
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [commentsList, setCommentsList] = useState<PostComment[]>([]);
  const [hasLiked, setHasLiked] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [isRetransmitting, setIsRetransmitting] = useState(false);

  const { toggleSavePost, isSaved, reportPost, muteUser, blockUser } = useReport(currentUser.id);
  const { unfollow, isFollowing } = useFollow(currentUser.id);

  useEffect(() => {
    if (!isCommentsOpen) return;
    const q = query(collection(db, "comments"), where("postId", "==", post.id));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];
      fetched.sort((a, b) => (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0));
      setCommentsList(fetched);
    });
    return () => unsubscribe();
  }, [isCommentsOpen, post.id]);

  useEffect(() => {
    const q = query(collection(db, "likes"), where("postId", "==", post.id), where("userId", "==", currentUser.id));
    const unsubscribe = onSnapshot(q, (snapshot) => setHasLiked(!snapshot.empty));
    return () => unsubscribe();
  }, [post.id, currentUser.id]);

  const safeUpdatePost = async (postId: string, data: any) => {
    try {
      await updateDoc(doc(db, "posts", postId), data);
    } catch {}
  };

  const handleToggleLike = async () => {
    if (isLiking) return;
    setIsLiking(true);
    const likeId = `${currentUser.id}_${post.id}`;
    try {
      if (hasLiked) {
        await deleteDoc(doc(db, "likes", likeId));
        await safeUpdatePost(post.id, { likesCount: increment(-1) });
      } else {
        await setDoc(doc(db, "likes", likeId), {
          postId: post.id,
          userId: currentUser.id,
          createdAt: serverTimestamp()
        });
        await safeUpdatePost(post.id, { likesCount: increment(1) });
      }
    } finally {
      setIsLiking(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    await addDoc(collection(db, "comments"), {
      postId: post.id,
      userId: currentUser.id,
      authorName: currentUser.displayName,
      authorAvatar: currentUser.avatar,
      content: commentText,
      createdAt: serverTimestamp()
    });
    await safeUpdatePost(post.id, { commentsCount: increment(1) });
    setCommentText('');
  };

  return (
    <article className="glass-aura rounded-[3rem] p-10">
      <Link to={`/profile/${post.authorName}`}>{post.authorName}</Link>
      <p>{post.content}</p>

      <button onClick={handleToggleLike}>{hasLiked ? 'Unlike' : 'Like'} ({post.likesCount || 0})</button>
      <button onClick={() => setIsCommentsOpen(!isCommentsOpen)}>Comments ({post.commentsCount || 0})</button>

      {isCommentsOpen && (
        <form onSubmit={handleAddComment}>
          <input value={commentText} onChange={e => setCommentText(e.target.value)} />
          <button type="submit">Send</button>
        </form>
      )}

      <ShareModal post={post} isOpen={isShareModalOpen} onClose={() => setIsShareModalOpen(false)} onShareSuccess={() => {}} />
      <ReportModal user={currentUser} post={post} isOpen={isReportModalOpen} onClose={() => setIsReportModalOpen(false)} onReportSuccess={() => onReportPostProp?.(post.id)} />
      <PostActionModal post={post} isOpen={isActionModalOpen} onClose={() => setIsActionModalOpen(false)} onUnfollow={unfollow} onMute={muteUser} onBlock={blockUser} onReport={() => setIsReportModalOpen(true)} isFollowing={isFollowing(post.userId)} />
    </article>
  );
};

export default PostCard;