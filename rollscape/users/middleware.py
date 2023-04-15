from users.models import Users


class RegisterUserMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        user_id = request.COOKIES.get('user_id', None)

        if user_id:
            request.user_id = user_id
            response = self.get_response(request)
        else:
            user = Users.create()

            request.user_id = user.user_id
            response = self.get_response(request)
            response.set_cookie('user_id', user.user_id)

        return response
