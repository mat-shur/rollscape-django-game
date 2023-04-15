from django.db import models

import string
import random


def generate_user_id():
    user_id = ''.join(random.choices(string.ascii_letters + string.digits, k=30))
    return user_id


def generate_username():
    adjectives = ['Awesome', 'Brilliant', 'Clever', 'Daring', 'Energetic', 'Fantastic', 'Gorgeous', 'Happy', 'Incredible', 'Jolly', 'Kind', 'Lucky', 'Magical', 'Nice', 'Outstanding', 'Powerful', 'Quick', 'Radiant', 'Smart', 'Terrific', 'Unique', 'Vibrant', 'Wonderful', 'Xtraordinary', 'Yummy']
    animals = ['Aardvark', 'Bear', 'Cat', 'Dog', 'Elephant', 'Fox', 'Giraffe', 'Hedgehog', 'Iguana', 'Jaguar', 'Kangaroo', 'Lion', 'Monkey', 'Narwhal', 'Octopus', 'Penguin', 'Quokka', 'Raccoon', 'Sloth', 'Turtle', 'Unicorn', 'Vulture', 'Walrus', 'Xenopus', 'Yak', 'Zebra']

    adjective = random.choice(adjectives)
    animal = random.choice(animals)

    return f'{adjective} {animal}'


class Users(models.Model):
    user_id = models.CharField(blank=False, max_length=30, primary_key=True)
    username = models.CharField(blank=False, max_length=128)
    score = models.IntegerField(blank=False, default=0)

    class Meta:
        ordering = ['-score']

    @staticmethod
    def create():
        user = Users()
        user.user_id = generate_user_id()
        user.username = generate_username()
        user.save()

        return user

    @staticmethod
    def get_by_id(user_id):
        return Users.objects.get(user_id=user_id) if Users.objects.filter(user_id=user_id) else None

    @staticmethod
    def update_score_user(user_id, score):
        user = Users.get_by_id(user_id)
        user.score = score
        user.save()
