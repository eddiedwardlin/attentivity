# Generated by Django 5.1.3 on 2024-11-24 13:15

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('posts', '0005_post_file'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='post',
            name='file',
        ),
        migrations.AddField(
            model_name='post',
            name='document',
            field=models.FileField(blank=True, null=True, upload_to='files/%Y/%m/%d', verbose_name='Post document'),
        ),
    ]
