from fastapi import APIRouter

from app.api.v1 import (
    auth, users, dashboard, tasks, projects, calendar, pomodoro,
    goals, habits, journal, notes, library, flashcards, search,
    ai, stats, notifications, trash, backup, import_export, overview,
)

api_router = APIRouter()
api_router.include_router(auth.router)
api_router.include_router(users.router)
api_router.include_router(dashboard.router)
api_router.include_router(overview.router)
api_router.include_router(tasks.router)
api_router.include_router(projects.router)
api_router.include_router(calendar.router)
api_router.include_router(pomodoro.router)
api_router.include_router(goals.router)
api_router.include_router(habits.router)
api_router.include_router(journal.router)
api_router.include_router(notes.router)
api_router.include_router(library.router)
api_router.include_router(flashcards.router)
api_router.include_router(search.router)
api_router.include_router(ai.router)
api_router.include_router(stats.router)
api_router.include_router(notifications.router)
api_router.include_router(trash.router)
api_router.include_router(backup.router)
api_router.include_router(import_export.router)
