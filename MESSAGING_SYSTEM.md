# Messaging System Documentation

## Overview
The Ad-Diin messaging system enables real-time communication between users and admins, similar to WhatsApp or Messenger interfaces.

## Features
- **One-to-One Conversations**: Direct messaging between users and support admins
- **Auto-Assignment**: Admins are automatically assigned to conversations on first reply
- **Read Status**: Track whether messages have been read
- **Unread Badges**: Display count of unread messages
- **Conversation Management**: Admins can close conversations when resolved
- **Real-Time Updates**: Automatic refresh for new messages and conversations

## Architecture

### Database Tables
- `conversations`: Stores conversation metadata (user, assigned admin, subject, status)
- `messages`: Stores individual messages with sender info and read status

### API Endpoints
All endpoints require JWT authentication.

- `GET /v1/messages` - Get conversations for current user/admin
- `POST /v1/messages/create` - Start new conversation
- `GET /v1/messages/{id}` - Get messages in conversation
- `POST /v1/messages/{id}/send` - Send message
- `PATCH /v1/messages/{id}/close` - Close conversation (admin only)
- `GET /v1/messages/unread` - Get unread message count

### Models
- `Conversation`: Manages user-admin conversations
- `Message`: Represents individual messages in a conversation

## User Flows

### For Users
1. Visit `/contact` page
2. Click "Open Messaging" button
3. Click "New Message" to start conversation
4. Chat with support team in real-time
5. Conversation auto-loads messages

### For Admins
1. Open Admin Panel
2. Navigate to Messages tab
3. Select conversation from list
4. Reply to user
5. System auto-assigns conversation to admin on first reply
6. Can close conversation when resolved

## Frontend Components
- `MessagingPage.tsx`: Main messaging interface with conversation list and chat window
- `AdminPanel.tsx`: Admin messaging tab with conversation management

## Future Enhancements
- WebSocket integration for true real-time updates
- File/attachment support
- Typing indicators
- Message search
- Conversation categories/tags
- Admin notes/annotations
- Notification system
