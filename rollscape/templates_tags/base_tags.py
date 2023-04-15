from django import template
from rollscape.constants import CONSTANTS

register = template.Library()


@register.simple_tag()
def constants(key):
    return CONSTANTS[key]
