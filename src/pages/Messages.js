import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import messageService from '../services/messageService';

export default function Messages() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation.userId);
    }
  }, [selectedConversation]);

  const loadConversations = () => {
    try {
      const convs = messageService.getConversations();
      setConversations(convs);
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = (userId) => {
    try {
      const msgs = messageService.getMessagesWith(userId);
      setMessages(msgs);
      
      // Mark messages as read
      messageService.markAsRead(userId);
      
      // Reload conversations to update unread counts
      loadConversations();
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      await messageService.sendMessage(selectedConversation.userId, newMessage.trim());
      setNewMessage('');
      loadMessages(selectedConversation.userId);
      loadConversations();
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Error sending message. Please try again.');
    }
  };

  const formatMessageTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInDays === 1) {
      return 'Yesterday';
    } else if (diffInDays < 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  if (loading) {
    return (
      <div style={styles.loading}>
        <div>Loading messages...</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Conversations Sidebar */}
      <div style={styles.sidebar}>
        <div style={styles.sidebarHeader}>
          <h2 style={styles.sidebarTitle}>Messages</h2>
        </div>
        
        <div style={styles.conversationsList}>
          {conversations.length === 0 ? (
            <div style={styles.emptyConversations}>
              <div style={styles.emptyIcon}>💬</div>
              <p>No conversations yet</p>
              <p style={styles.emptySubtext}>
                Start a conversation by contacting someone from the Browse page
              </p>
            </div>
          ) : (
            conversations.map(conversation => (
              <div
                key={conversation.userId}
                onClick={() => setSelectedConversation(conversation)}
                style={{
                  ...styles.conversationItem,
                  ...(selectedConversation?.userId === conversation.userId ? styles.activeConversation : {})
                }}
              >
                <div style={styles.conversationAvatar}>
                  {conversation.user?.avatar}
                </div>
                <div style={styles.conversationInfo}>
                  <div style={styles.conversationHeader}>
                    <span style={styles.conversationName}>
                      {conversation.user?.name}
                    </span>
                    <span style={styles.conversationTime}>
                      {conversation.lastMessage && formatMessageTime(conversation.lastMessage.timestamp)}
                    </span>
                  </div>
                  <div style={styles.lastMessageContainer}>
                    <span style={styles.lastMessage}>
                      {conversation.lastMessage ? (
                        conversation.lastMessage.content.length > 40
                          ? `${conversation.lastMessage.content.substring(0, 40)}...`
                          : conversation.lastMessage.content
                      ) : 'No messages yet'}
                    </span>
                    {conversation.unreadCount > 0 && (
                      <span style={styles.unreadBadge}>
                        {conversation.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div style={styles.chatArea}>
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div style={styles.chatHeader}>
              <div style={styles.chatUserInfo}>
                <span style={styles.chatAvatar}>
                  {selectedConversation.user?.avatar}
                </span>
                <div>
                  <h3 style={styles.chatUserName}>
                    {selectedConversation.user?.name}
                  </h3>
                  <p style={styles.chatUserStatus}>
                    {selectedConversation.user?.isOnline ? 'Online' : 'Offline'}
                  </p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div style={styles.messagesContainer}>
              {messages.length === 0 ? (
                <div style={styles.emptyMessages}>
                  <p>No messages yet. Start the conversation!</p>
                </div>
              ) : (
                messages.map(message => (
                  <div
                    key={message.id}
                    style={{
                      ...styles.messageWrapper,
                      ...(message.senderId === user.id ? styles.sentMessageWrapper : styles.receivedMessageWrapper)
                    }}
                  >
                    <div
                      style={{
                        ...styles.message,
                        ...(message.senderId === user.id ? styles.sentMessage : styles.receivedMessage)
                      }}
                    >
                      <div style={styles.messageContent}>
                        {message.content}
                      </div>
                      <div style={styles.messageTime}>
                        {formatMessageTime(message.timestamp)}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Message Input */}
            <div style={styles.messageInput}>
              <form onSubmit={sendMessage} style={styles.messageForm}>
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  style={styles.messageTextInput}
                />
                <button 
                  type="submit" 
                  disabled={!newMessage.trim()}
                  style={{
                    ...styles.sendButton,
                    ...(newMessage.trim() ? {} : styles.sendButtonDisabled)
                  }}
                >
                  Send
                </button>
              </form>
            </div>
          </>
        ) : (
          <div style={styles.noChatSelected}>
            <div style={styles.noChatIcon}>💬</div>
            <h3>Select a conversation</h3>
            <p>Choose a conversation from the sidebar to start messaging</p>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    height: 'calc(100vh - 60px)', // Account for navbar height
    backgroundColor: '#f8f9fa'
  },
  loading: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '50vh',
    fontSize: '18px',
    color: '#666'
  },
  sidebar: {
    width: '350px',
    backgroundColor: 'white',
    borderRight: '1px solid #e1e5e9',
    display: 'flex',
    flexDirection: 'column'
  },
  sidebarHeader: {
    padding: '20px 25px',
    borderBottom: '1px solid #e1e5e9'
  },
  sidebarTitle: {
    fontSize: '24px',
    fontWeight: '600',
    color: '#333',
    margin: 0
  },
  conversationsList: {
    flex: 1,
    overflow: 'auto'
  },
  emptyConversations: {
    textAlign: 'center',
    padding: '40px 20px',
    color: '#666'
  },
  emptyIcon: {
    fontSize: '48px',
    marginBottom: '15px'
  },
  emptySubtext: {
    fontSize: '12px',
    color: '#999',
    marginTop: '10px'
  },
  conversationItem: {
    display: 'flex',
    alignItems: 'center',
    padding: '15px 25px',
    cursor: 'pointer',
    borderBottom: '1px solid #f8f9fa',
    transition: 'background-color 0.2s'
  },
  activeConversation: {
    backgroundColor: '#f0f8ff',
    borderRight: '3px solid #667eea'
  },
  conversationAvatar: {
    fontSize: '32px',
    marginRight: '15px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '48px',
    height: '48px'
  },
  conversationInfo: {
    flex: 1,
    minWidth: 0
  },
  conversationHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '5px'
  },
  conversationName: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#333'
  },
  conversationTime: {
    fontSize: '12px',
    color: '#888'
  },
  lastMessageContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  lastMessage: {
    fontSize: '14px',
    color: '#666',
    flex: 1,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  unreadBadge: {
    backgroundColor: '#ff4757',
    color: 'white',
    borderRadius: '50%',
    width: '20px',
    height: '20px',
    fontSize: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    marginLeft: '8px'
  },
  chatArea: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: 'white'
  },
  chatHeader: {
    padding: '20px 25px',
    borderBottom: '1px solid #e1e5e9',
    backgroundColor: 'white'
  },
  chatUserInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px'
  },
  chatAvatar: {
    fontSize: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  chatUserName: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#333',
    margin: '0 0 5px 0'
  },
  chatUserStatus: {
    fontSize: '12px',
    color: '#888',
    margin: 0
  },
  messagesContainer: {
    flex: 1,
    padding: '20px',
    overflow: 'auto',
    backgroundColor: '#fafbfc'
  },
  emptyMessages: {
    textAlign: 'center',
    color: '#666',
    marginTop: '50px'
  },
  messageWrapper: {
    marginBottom: '15px',
    display: 'flex'
  },
  sentMessageWrapper: {
    justifyContent: 'flex-end'
  },
  receivedMessageWrapper: {
    justifyContent: 'flex-start'
  },
  message: {
    maxWidth: '70%',
    borderRadius: '18px',
    padding: '12px 16px',
    fontSize: '14px',
    lineHeight: '1.4'
  },
  sentMessage: {
    backgroundColor: '#667eea',
    color: 'white'
  },
  receivedMessage: {
    backgroundColor: 'white',
    color: '#333',
    border: '1px solid #e1e5e9'
  },
  messageContent: {
    marginBottom: '4px'
  },
  messageTime: {
    fontSize: '11px',
    opacity: 0.7
  },
  messageInput: {
    padding: '20px 25px',
    borderTop: '1px solid #e1e5e9',
    backgroundColor: 'white'
  },
  messageForm: {
    display: 'flex',
    gap: '10px'
  },
  messageTextInput: {
    flex: 1,
    padding: '12px 16px',
    border: '1px solid #e1e5e9',
    borderRadius: '25px',
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.3s'
  },
  sendButton: {
    padding: '12px 24px',
    backgroundColor: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '25px',
    cursor: 'pointer',
    fontWeight: '500',
    fontSize: '14px',
    transition: 'background-color 0.3s'
  },
  sendButtonDisabled: {
    backgroundColor: '#ccc',
    cursor: 'not-allowed'
  },
  noChatSelected: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#666',
    backgroundColor: '#fafbfc'
  },
  noChatIcon: {
    fontSize: '64px',
    marginBottom: '20px'
  }
};
