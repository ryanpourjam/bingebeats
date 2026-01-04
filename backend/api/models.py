from django.db import models
from django.contrib.auth.models import AbstractUser

# Create your models here.
class User(AbstractUser):
    ranked_show_ids = models.JSONField(default=list)  
    disliked_ids = models.JSONField(default=list)     

    def __str__(self):
        return self.username