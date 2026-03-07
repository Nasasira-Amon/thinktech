import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, Send, ArrowLeft, Home } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface Message {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
  read_at: string | null;
}

interface Conversation {
  id: string;
  updated_at: string;
  other_user: {
    id: string;
    full_name: string;
    profile_image_url: string | null;
    image_type: string;
  };
  last_message?: {
    content: string;
    created_at: string;
  };
  unread_count: number;
}

export default function Messages() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadConversations();
  }, [user]);

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation);
      markMessagesAsRead(selectedConversation);
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadConversations = async () => {
    if (!user) return;

    try {
      const { data: participantsData, error: participantsError } = await supabase
        .from('conversation_participants')
        .select('conversation_id')
        .eq('user_id', user.id);

      if (participantsError) throw participantsError;

      const conversationIds = participantsData?.map(p => p.conversation_id) || [];

      if (conversationIds.length === 0) {
        setLoading(false);
        return;
      }

      const conversationsWithDetails = await Promise.all(
        conversationIds.map(async (convId) => {
          const { data: otherParticipant } = await supabase
            .from('conversation_participants')
            .select('user_id')
            .eq('conversation_id', convId)
            .neq('user_id', user.id)
            .single();

          if (!otherParticipant) return null;

          const { data: profile } = await supabase
            .from('student_profiles')
            .select('user_id, full_name, profile_image_url, image_type')
            .eq('user_id', otherParticipant.user_id)
            .single();

          const { data: lastMessage } = await supabase
            .from('messages')
            .select('content, created_at')
            .eq('conversation_id', convId)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          const { count: unreadCount } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('conversation_id', convId)
            .neq('sender_id', user.id)
            .is('read_at', null);

          const { data: conv } = await supabase
            .from('conversations')
            .select('updated_at')
            .eq('id', convId)
            .single();

          return {
            id: convId,
            updated_at: conv?.updated_at || new Date().toISOString(),
            other_user: {
              id: otherParticipant.user_id,
              full_name: profile?.full_name || 'Unknown User',
              profile_image_url: profile?.profile_image_url || null,
              image_type: profile?.image_type || 'avatar',
            },
            last_message: lastMessage || undefined,
            unread_count: unreadCount || 0,
          };
        })
      );

      const validConversations = conversationsWithDetails.filter(c => c !== null) as Conversation[];
      validConversations.sort((a, b) =>
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      );

      setConversations(validConversations);
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (conversationId: string) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const markMessagesAsRead = async (conversationId: string) => {
    if (!user) return;

    try {
      await supabase
        .from('messages')
        .update({ read_at: new Date().toISOString() })
        .eq('conversation_id', conversationId)
        .neq('sender_id', user.id)
        .is('read_at', null);

      await supabase
        .from('conversation_participants')
        .update({ last_read_at: new Date().toISOString() })
        .eq('conversation_id', conversationId)
        .eq('user_id', user.id);
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation || !user) return;

    setSending(true);
    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          conversation_id: selectedConversation,
          sender_id: user.id,
          content: newMessage.trim(),
        });

      if (error) throw error;

      setNewMessage('');
      await loadMessages(selectedConversation);
      await loadConversations();
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const selectedConv = conversations.find(c => c.id === selectedConversation);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-white">Loading conversations...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link
              to="/dashboard"
              className="p-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <Link
              to="/dashboard"
              className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Home className="w-5 h-5" />
            </Link>
            <h1 className="text-3xl font-bold text-white">Messages</h1>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-180px)]">
          <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
            <div className="p-4 border-b border-gray-800">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-green-500" />
                Conversations
              </h2>
            </div>
            <div className="overflow-y-auto h-[calc(100vh-280px)]">
              {conversations.length === 0 ? (
                <div className="p-6 text-center text-gray-400">
                  <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No conversations yet</p>
                  <p className="text-sm mt-2">Start connecting from the Discover page</p>
                </div>
              ) : (
                conversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => setSelectedConversation(conv.id)}
                    className={`w-full p-4 border-b border-gray-800 hover:bg-gray-800 transition-colors text-left ${
                      selectedConversation === conv.id ? 'bg-gray-800' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-full bg-gray-800 overflow-hidden flex-shrink-0">
                        {conv.other_user.profile_image_url ? (
                          <img
                            src={conv.other_user.profile_image_url}
                            alt={conv.other_user.full_name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-500 font-semibold">
                            {conv.other_user.full_name.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-semibold text-white truncate">
                            {conv.other_user.full_name}
                          </h3>
                          {conv.unread_count > 0 && (
                            <span className="ml-2 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">
                              {conv.unread_count}
                            </span>
                          )}
                        </div>
                        {conv.last_message && (
                          <p className="text-sm text-gray-400 truncate">
                            {conv.last_message.content}
                          </p>
                        )}
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          <div className="md:col-span-2 bg-gray-900 rounded-lg border border-gray-800 flex flex-col overflow-hidden">
            {selectedConv ? (
              <>
                <div className="p-4 border-b border-gray-800 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-800 overflow-hidden">
                    {selectedConv.other_user.profile_image_url ? (
                      <img
                        src={selectedConv.other_user.profile_image_url}
                        alt={selectedConv.other_user.full_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-500 font-semibold">
                        {selectedConv.other_user.full_name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <h2 className="text-lg font-semibold text-white">
                    {selectedConv.other_user.full_name}
                  </h2>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((message) => {
                    const isOwn = message.sender_id === user?.id;
                    return (
                      <div
                        key={message.id}
                        className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[70%] rounded-lg p-3 ${
                            isOwn
                              ? 'bg-green-600 text-white'
                              : 'bg-gray-800 text-white'
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          <p className="text-xs mt-1 opacity-70">
                            {new Date(message.created_at).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                <form onSubmit={sendMessage} className="p-4 border-t border-gray-800">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1 px-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 focus:outline-none focus:border-green-500"
                      disabled={sending}
                    />
                    <button
                      type="submit"
                      disabled={sending || !newMessage.trim()}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>Select a conversation to start messaging</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
