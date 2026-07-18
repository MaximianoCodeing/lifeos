from celery import Celery
from celery.schedules import crontab

from app.core.config import settings

celery_app = Celery("lifeos", broker=settings.REDIS_URL, backend=settings.REDIS_URL)
celery_app.autodiscover_tasks(["app.workers"])

# Importa explicitamente para garantir registo das tarefas mesmo sem autodiscover
from app.workers import notification_tasks, backup_tasks  # noqa: E402,F401

celery_app.conf.beat_schedule = {
    "check-habits-pending": {
        "task": "notifications.check_habits_pending",
        "schedule": crontab(hour=20, minute=0),  # 20h, lembrete de hábitos por marcar
    },
    "check-goals-overdue": {
        "task": "notifications.check_goals_overdue",
        "schedule": crontab(hour=9, minute=0),  # 9h, objetivos em atraso
    },
    "check-flashcards-due": {
        "task": "notifications.check_flashcards_due",
        "schedule": crontab(hour=8, minute=0),  # 8h, flashcards para hoje
    },
    "check-pomodoro-reminder": {
        "task": "notifications.check_pomodoro_reminder",
        "schedule": crontab(hour=18, minute=0),  # 18h, lembrete de pomodoro
    },
    "daily-backup": {
        "task": "backup.run_backup",
        "schedule": crontab(hour=3, minute=0),  # 3h da manhã, backup diário de todos
    },
}
celery_app.conf.timezone = "Europe/Lisbon"
