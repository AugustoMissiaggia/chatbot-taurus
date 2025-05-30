from django.urls import path

from core.views.auth import LoginView, RegisterView, LogoutView
from core.views.chat import ChatGPTAPIView, UserMessagesAPIView
from core.views.csv_upload import CsvUploadView

urlpatterns = [
    path('login/', LoginView.as_view(), name='login'),
    path('register/', RegisterView.as_view(), name='register'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('chat/messages/', UserMessagesAPIView.as_view(), name='user-messages'),
    path('chat/send/', ChatGPTAPIView.as_view(), name='chat-send'),
    path('chat/messages/', UserMessagesAPIView.as_view(), name='chat-messages'),
    path('chat/upload_csv/', CsvUploadView.as_view(), name='chat-upload-csv'),
]
