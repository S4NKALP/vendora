# Generated by Django 5.2 on 2025-04-23 22:39

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('app', '0008_contact'),
    ]

    operations = [
        migrations.AlterField(
            model_name='contact',
            name='value',
            field=models.CharField(max_length=255),
        ),
    ]
