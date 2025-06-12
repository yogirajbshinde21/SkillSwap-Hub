// Service for handling messages and communications
import authService from './authService';

class MessageService {
  // Get all conversations for current user
  getConversations() {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) return [];

    const messages = this.getAllMessages();
    const conversations = {};

    messages.forEach(message => {
      const otherUserId = message.senderId === currentUser.id ? message.receiverId : message.senderId;
      
      if (!conversations[otherUserId]) {
        conversations[otherUserId] = {
          userId: otherUserId,
          user: authService.getUserById(otherUserId),
          messages: [],
          lastMessage: null,
          unreadCount: 0
        };
      }

      conversations[otherUserId].messages.push(message);
      
      if (!conversations[otherUserId].lastMessage || 
          new Date(message.timestamp) > new Date(conversations[otherUserId].lastMessage.timestamp)) {
        conversations[otherUserId].lastMessage = message;
      }

      if (message.receiverId === currentUser.id && !message.read) {
        conversations[otherUserId].unreadCount++;
      }
    });

    return Object.values(conversations).sort((a, b) => 
      new Date(b.lastMessage?.timestamp || 0) - new Date(a.lastMessage?.timestamp || 0)
    );
  }

  // Get messages between current user and another user
  getMessagesWith(userId) {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) return [];

    const messages = this.getAllMessages();
    
    return messages
      .filter(message => 
        (message.senderId === currentUser.id && message.receiverId === userId) ||
        (message.senderId === userId && message.receiverId === currentUser.id)
      )
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  }

  // Send a message
  sendMessage(receiverId, content, type = 'text') {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      throw new Error('User must be logged in to send messages');
    }

    const messages = this.getAllMessages();
    const newMessage = {
      id: Date.now().toString(),
      senderId: currentUser.id,
      receiverId: receiverId,
      content: content,
      type: type,
      timestamp: new Date().toISOString(),
      read: false
    };

    messages.push(newMessage);
    localStorage.setItem('messages', JSON.stringify(messages));
    
    return newMessage;
  }

  // Mark messages as read
  markAsRead(senderId) {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) return;

    const messages = this.getAllMessages();
    const updatedMessages = messages.map(message => {
      if (message.senderId === senderId && message.receiverId === currentUser.id) {
        return { ...message, read: true };
      }
      return message;
    });

    localStorage.setItem('messages', JSON.stringify(updatedMessages));
  }

  // Get all messages (private method)
  getAllMessages() {
    return JSON.parse(localStorage.getItem('messages')) || [];
  }

  // Get unread message count
  getUnreadCount() {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) return 0;

    const messages = this.getAllMessages();
    return messages.filter(message => 
      message.receiverId === currentUser.id && !message.read
    ).length;
  }

  // Start a conversation (exchange request)
  startExchange(postId, message) {
    const posts = JSON.parse(localStorage.getItem('skillPosts')) || [];
    const post = posts.find(p => p.id === postId);
    
    if (!post) {
      throw new Error('Post not found');
    }

    // Send initial message
    const initialMessage = this.sendMessage(
      post.userId, 
      `Hi! I'm interested in your post "${post.title}". ${message}`,
      'exchange_request'
    );

    // Create exchange record
    const exchanges = JSON.parse(localStorage.getItem('exchanges')) || [];
    const newExchange = {
      id: Date.now().toString(),
      postId: postId,
      requesterId: authService.getCurrentUser().id,
      postOwnerId: post.userId,
      status: 'pending',
      createdAt: new Date().toISOString(),
      messages: [initialMessage.id]
    };

    exchanges.push(newExchange);
    localStorage.setItem('exchanges', JSON.stringify(exchanges));

    return newExchange;
  }
}

export default new MessageService();
