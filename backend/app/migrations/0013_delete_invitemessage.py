# Generated by Django 5.2 on 2025-04-23 23:41

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('app', '0012_alter_invitemessage_link'),
    ]

    operations = [
        migrations.DeleteModel(
            name='InviteMessage',
        ),
    ]
