# Generated by Django 5.2 on 2025-04-24 00:33

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('app', '0015_alter_slider_category'),
    ]

    operations = [
        migrations.AlterField(
            model_name='slider',
            name='image',
            field=models.ImageField(blank=True, null=True, upload_to='sliders/'),
        ),
    ]
