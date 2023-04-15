from django.shortcuts import render
from django.http import HttpResponse

from users.models import Users


def update_score(request):
    user_id = request.COOKIES.get('user_id')
    score = request.POST.get('score')

    user = Users.get_by_id(user_id)

    if int(score) > user.score:
        Users.update_score_user(user_id, score)

        return render(request, "game/award_icon.html", {'result': 'success'})
    else:
        return HttpResponse(status=204)


def game_view(request):
    return render(request, 'game/index.html')
