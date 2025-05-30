from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.generics import ListAPIView

from core.models.message import Message
from core.api.serializers.message_serializers import MessageSerializer
from core.services.gemini_service import ask_gemini


class ChatGPTAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            user_text = request.data.get('message')
            if not user_text:
                return Response({"error": "Mensagem do usuário é obrigatória."}, status=status.HTTP_400_BAD_REQUEST)

            Message.objects.create(user=request.user, sender='user', text=user_text)
            ai_reply = ask_gemini(user_text)

            chatgpt_message = Message.objects.create(user=request.user, sender='chatgpt', text=ai_reply)
            serializer = MessageSerializer(chatgpt_message)
            return Response(serializer.data, status=status.HTTP_200_OK)

        except Exception:
            return Response({"error": "Erro interno no servidor."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class UserMessagesAPIView(ListAPIView):
    serializer_class = MessageSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Message.objects.filter(user=self.request.user).order_by('timestamp')
