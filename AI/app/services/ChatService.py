"""Chat service for AI responses"""
from datetime import datetime
from groq import Groq
from app.config.settings import settings
from app.utils.logger import log_info, log_error

# Initialize Groq client lazily (only when needed)
client = None

def get_groq_client():
    """Get or create Groq client"""
    global client
    if client is None:
        if not settings.GROQ_API_KEY:
            log_error("GROQ_API_KEY not configured")
            return None
        try:
            client = Groq(api_key=settings.GROQ_API_KEY)
            log_info(f"Groq client initialized with key: {settings.GROQ_API_KEY[:10]}...")
        except Exception as e:
            log_error(f"Failed to initialize Groq client: {e}")
            return None
    return client

class ChatService:
    """Service for handling chat messages"""
    
    def __init__(self):
        self.system_prompt = """You are an AI driving assistant for a driving test preparation application called "Drive Master".
Your role is to:
1. Answer questions about driving rules, traffic signs, and road safety
2. Provide explanations about practice test questions
3. Give helpful tips for passing the driving exam
4. Be clear, concise, and beginner-friendly
5. Focus on driving knowledge relevant to driving tests

Always respond in the same language the user uses. If they ask in Vietnamese, respond in Vietnamese.
Keep responses under 500 words and use bullet points for clarity when needed."""
        self.analysis_prompt = """You are a strict driving-exam review tutor.
When the user provides quiz results, analyze only the wrong questions from that input.
Do not mention questions outside the provided list.
Do not answer generically.
    Do not output phrases like 'Đáp án đúng: Không xác định'.

Return exactly 4 Markdown sections in Vietnamese:
1. Điểm yếu chính
2. Phân tích từng câu sai
3. Hướng dẫn ôn tập cụ thể
4. Chủ đề cần ôn thêm

    For each wrong question, include: why it is wrong, the correct driving principle, why that principle is correct, and a short memory trick.
    If exact option text is missing, infer from the explanation and focus on principle-level correction.
    Do not re-list all options/answers of the original question set.
Keep the response practical, specific, and step-by-step."""
        
        # Check if API key is valid (Groq keys start with gsk_)
        self.use_mock = not settings.GROQ_API_KEY or not settings.GROQ_API_KEY.startswith("gsk_")
        
        if self.use_mock:
            log_info("ChatService: Running in MOCK mode (API key not configured)")
        else:
            log_info("ChatService: Running with REAL Groq API")
    
    async def get_ai_response(self, user_message: str, conversation_history: list = None) -> str:
        """
        Get AI response from Groq API or mock
        
        Args:
            user_message: User's question
            conversation_history: List of previous messages
            
        Returns:
            str: AI response
        """
        log_info(f"🔹 get_ai_response called with message length: {len(user_message)}")
        
        # Use mock response for testing if API key not available
        if self.use_mock:
            log_info("Using mock response mode")
            mock_resp = self._get_mock_response(user_message)
            log_info(f"Mock response length: {len(mock_resp)}")
            return mock_resp
        
        try:
            is_analysis_request = any(marker in user_message for marker in [
                "THÔNG TIN CHUNG",
                "CÁC CÂU SAI",
                "YÊU CẦU PHÂN TÍCH",
            ])

            messages = []
            
            # Add system message first
            messages.append({
                "role": "system",
                "content": self.analysis_prompt if is_analysis_request else self.system_prompt
            })
            
            # Add conversation history if provided for regular chat only
            if conversation_history and not is_analysis_request:
                log_info(f" Adding {len(conversation_history)} messages from conversation history")
                messages.extend(conversation_history)
            
            # Add current user message without truncation so long quiz analysis prompts keep full context
            messages.append({
                "role": "user",
                "content": user_message
            })
            
            # Call Groq API
            groq_client = get_groq_client()
            if not groq_client:
                log_error(" Groq client not initialized, using mock")
                return self._get_mock_response(user_message)
            
            log_info(f" Calling Groq API with model: llama-3.1-8b-instant")
            log_info(f" Total messages to send: {len(messages)}")
            
            response = groq_client.chat.completions.create(
                model="llama-3.1-8b-instant",
                messages=messages,
                max_tokens=2048,
                temperature=0.2 if is_analysis_request else 0.7,
            )
            
            ai_response = response.choices[0].message.content
            log_info(f" AI response generated successfully ({len(ai_response)} chars)")
            return ai_response
            
        except Exception as e:
            import traceback
            error_msg = f"❌ Error getting AI response: {str(e)}"
            error_trace = traceback.format_exc()
            log_error(error_msg)
            log_error(f" Full traceback:\n{error_trace}")
            # Fallback to mock
            log_info(" Falling back to mock response")
            return self._get_mock_response(user_message)
    
    def _get_mock_response(self, user_message: str) -> str:
        """Generate mock response for testing"""
        mock_responses = {
            "right": "At an unmarked intersection (no signs or signals), the general rules are:\n\n• You must yield to vehicles approaching from your right.\n• If you are turning left, you must yield to oncoming traffic going straight or turning right.\n• Vehicles already in the intersection have the right of way over vehicles approaching it.",
            "speed": "Speed limits vary by location:\n\n• Urban areas: Usually 40-60 km/h\n• Residential areas: 20-30 km/h\n• Highways: 80-120 km/h\n• Always follow posted signs and adjust for weather/traffic conditions.",
            "parking": "Parking regulations:\n\n• Never park on double yellow lines\n• Leave 1 meter from fire hydrants\n• Don't block driveways or crosswalks\n• Check for time limits on street signs\n• Always engage parking brake on slopes.",
            "default": f"Thank you for your question about '{user_message[:30]}...'. To get an accurate answer, please ensure the AI service is properly configured with a valid API key. For now, I'm running in demo mode. Please update your Groq API key in the .env file."
        }
        
        question_lower = user_message.lower()
        for key, response in mock_responses.items():
            if key in question_lower:
                return response
        
        return mock_responses["default"]
    
    def generate_conversation_id(self) -> str:
        """Generate unique conversation ID"""
        from uuid import uuid4
        return str(uuid4())
    
    def get_timestamp(self) -> str:
        """Get current timestamp"""
        return datetime.now().isoformat()
