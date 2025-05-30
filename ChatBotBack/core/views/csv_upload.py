from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser
from django.http import HttpResponse
import traceback
import io
import pandas as pd
from core.models.message import Message
from core.api.serializers.message_serializers import MessageSerializer
from core.services.csv_service import process_csv_and_respond


class CsvUploadView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser]

    def post(self, request):
        file_obj = request.FILES.get('file')
        user_instruction = request.data.get('instruction')

        if not file_obj or not file_obj.name.endswith('.csv'):
            return Response({"error": "Arquivo CSV obrigatório."}, status=status.HTTP_400_BAD_REQUEST)
        if not user_instruction:
            return Response({"error": "Instrução do usuário é obrigatória."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            result = process_csv_and_respond(request.user, file_obj, user_instruction)
            if isinstance(result, HttpResponse):
                return result  
            return Response(result, status=status.HTTP_200_OK)
        except Exception as e:
            print("Erro ao processar CSV:", e)
            traceback.print_exc()
            return Response({"error": "Erro ao processar o arquivo CSV."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)