"""Chat routes"""
from fastapi import APIRouter, HTTPException
from app.schemas.chat import ChatMessageRequest, ChatMessageResponse
from app.services.ChatService import ChatService
from app.utils.logger import log_info, log_error

router = APIRouter(prefix="/chat", tags=["Chat"])

# Initialize chat service
chat_service = ChatService()

# Store conversations in memory (in production, use database)
conversations = {}

@router.post("/message", response_model=ChatMessageResponse)
async def send_message(request: ChatMessageRequest):
    """
    Send a message to AI assistant and get response
    
    Args:
        request: ChatMessageRequest containing message and optional conversation_id
        
    Returns:
        ChatMessageResponse with AI response
    """
    log_info(f"📨 Chat API received request")
    log_info(f"   - Message length: {len(request.message)}")
    log_info(f"   - Conversation ID: {request.conversation_id or 'NEW'}")
    
    # Generate or use existing conversation ID
    conversation_id = request.conversation_id or chat_service.generate_conversation_id()
    log_info(f"   - Using conversation ID: {conversation_id}")
    
    # Get conversation history if exists
    conversation_history = conversations.get(conversation_id, [])
    log_info(f"   - Conversation history size: {len(conversation_history)}")
    
    try:
        # Get AI response
        log_info(f"🤖 Calling AI service...")
        ai_response = await chat_service.get_ai_response(
            request.message,
            conversation_history
        )
        log_info(f"✅ AI response received ({len(ai_response)} chars)")
        
        # Store messages in conversation history
        conversation_history.append({
            "role": "user",
            "content": request.message
        })
        conversation_history.append({
            "role": "assistant",
            "content": ai_response
        })
        
        # Save conversation
        conversations[conversation_id] = conversation_history
        
        log_info(f"💾 Conversation saved (total: {len(conversation_history)} messages)")
        
        response = ChatMessageResponse(
            conversation_id=conversation_id,
            user_message=request.message,
            ai_response=ai_response,
            timestamp=chat_service.get_timestamp()
        )
        
        log_info(f"📤 Sending response...")
        return response
        
    except Exception as e:
        import traceback
        error_msg = f"❌ Error in chat endpoint: {str(e)}"
        log_error(error_msg)
        log_error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/conversation/{conversation_id}")
async def get_conversation(conversation_id: str):
    """
    Get conversation history
    
    Args:
        conversation_id: ID of the conversation
        
    Returns:
        Conversation history
    """
    try:
        if conversation_id not in conversations:
            raise HTTPException(status_code=404, detail="Conversation not found")
        
        return {
            "conversation_id": conversation_id,
            "messages": conversations[conversation_id]
        }
        
    except HTTPException:
        raise
    except Exception as e:
        log_error(f"Error retrieving conversation: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/conversation/{conversation_id}")
async def delete_conversation(conversation_id: str):
    """
    Delete a conversation
    
    Args:
        conversation_id: ID of the conversation
        
    Returns:
        Success message
    """
    try:
        if conversation_id in conversations:
            del conversations[conversation_id]
            log_info(f"Conversation {conversation_id} deleted")
        
        return {"message": "Conversation deleted successfully"}
        
    except Exception as e:
        log_error(f"Error deleting conversation: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
