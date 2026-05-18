import React, { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { MessageSquare, Heart, Reply, Send } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface Comment {
  id: string;
  content: string;
  user_id: string;
  created_at: string;
  likes: number;
  replies: Reply[];
  user_has_liked: boolean;
}

interface Reply {
  id: string;
  content: string;
  user_id: string;
  created_at: string;
}

interface CommentsProps {
  poemId: string;
}

export function Comments({ poemId }: CommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      console.warn('Supabase is not configured. Please set up your environment variables.');
      return;
    }

    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    fetchUser();
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    fetchComments();
    const commentsSubscription = supabase
      .channel('comments')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'comments' }, fetchComments)
      .subscribe();

    return () => {
      commentsSubscription.unsubscribe();
    };
  }, [poemId]);

  const fetchComments = async () => {
    if (!isSupabaseConfigured()) return;

    const { data: comments } = await supabase
      .from('comments')
      .select(`
        *,
        likes (count),
        replies (*)
      `)
      .eq('poem_id', poemId)
      .order('created_at', { ascending: false });

    if (comments) {
      const commentsWithLikes = await Promise.all(
        comments.map(async (comment) => {
          const { data: userLike } = await supabase
            .from('likes')
            .select('id')
            .eq('comment_id', comment.id)
            .eq('user_id', user?.id)
            .single();

          return {
            ...comment,
            user_has_liked: !!userLike,
          };
        })
      );
      setComments(commentsWithLikes);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !isSupabaseConfigured()) return;

    await supabase
      .from('comments')
      .insert([
        {
          content: newComment,
          user_id: user.id,
          poem_id: poemId,
        },
      ]);

    setNewComment('');
    fetchComments();
  };

  const handleLike = async (commentId: string, hasLiked: boolean) => {
    if (!user || !isSupabaseConfigured()) return;

    if (hasLiked) {
      await supabase
        .from('likes')
        .delete()
        .eq('comment_id', commentId)
        .eq('user_id', user.id);
    } else {
      await supabase
        .from('likes')
        .insert([
          {
            comment_id: commentId,
            user_id: user.id,
          },
        ]);
    }

    fetchComments();
  };

  const handleSubmitReply = async (commentId: string) => {
    if (!user || !isSupabaseConfigured()) return;

    await supabase
      .from('replies')
      .insert([
        {
          content: replyContent,
          user_id: user.id,
          comment_id: commentId,
        },
      ]);

    setReplyContent('');
    setReplyingTo(null);
    fetchComments();
  };

  if (!isSupabaseConfigured()) {
    return (
      <div className="mt-12 max-w-2xl mx-auto">
        <div className="bg-red-900/20 border border-red-500 rounded-lg p-4 text-red-400">
          <p>Comments are currently unavailable. Please configure Supabase to enable the comments section.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-12 max-w-2xl mx-auto">
      <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
        <MessageSquare className="w-5 h-5" />
        Comments
      </h3>

      {/* Comment Form */}
      <form onSubmit={handleSubmitComment} className="mb-8">
        <div className="flex gap-2">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
          />
          <button
            type="submit"
            disabled={!newComment.trim() || !user}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>

      {/* Comments List */}
      <div className="space-y-6">
        {comments.map((comment) => (
          <div key={comment.id} className="bg-gray-800 rounded-lg p-4">
            <div className="flex justify-between items-start mb-2">
              <div className="text-sm text-gray-400">
                {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
              </div>
              <button
                onClick={() => handleLike(comment.id, comment.user_has_liked)}
                className={`flex items-center gap-1 ${
                  comment.user_has_liked ? 'text-red-500' : 'text-gray-400'
                }`}
              >
                <Heart className="w-4 h-4" />
                <span>{comment.likes}</span>
              </button>
            </div>
            <p className="text-white mb-4">{comment.content}</p>

            {/* Replies */}
            <div className="ml-8 space-y-4">
              {comment.replies?.map((reply) => (
                <div key={reply.id} className="bg-gray-700 rounded p-3">
                  <div className="text-sm text-gray-400 mb-2">
                    {formatDistanceToNow(new Date(reply.created_at), { addSuffix: true })}
                  </div>
                  <p className="text-white">{reply.content}</p>
                </div>
              ))}
            </div>

            {/* Reply Form */}
            {replyingTo === comment.id ? (
              <div className="mt-4 flex gap-2">
                <input
                  type="text"
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="Write a reply..."
                  className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                />
                <button
                  onClick={() => handleSubmitReply(comment.id)}
                  disabled={!replyContent.trim() || !user}
                  className="bg-purple-600 text-white px-3 py-2 rounded-lg hover:bg-purple-500 disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setReplyingTo(comment.id)}
                className="text-gray-400 hover:text-white flex items-center gap-1 mt-2"
              >
                <Reply className="w-4 h-4" />
                Reply
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}