# Generated by Django 5.2 on 2025-06-25 20:19

from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('filme', '0017_episodio_usuarios_deslikes_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='episodio',
            name='usuarios_deslikes',
            field=models.ManyToManyField(blank=True, related_name='episodios_dislike', to=settings.AUTH_USER_MODEL),
        ),
    ]
