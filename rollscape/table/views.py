from django.shortcuts import render
from users.models import Users


def main_page(request):
    return render(request, 'table/index.html', {'user_data': Users.objects.all()})
