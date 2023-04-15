from django.urls import path
from .views import game_view, update_score


urlpatterns = [
    path('game/', game_view, name='game_view'),
    path('game/u', update_score, name='update_score')
]
