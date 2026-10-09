"""Standalone Python API for Python Adventure.

This service is intentionally separate from the existing Node.js backend.
It does not create, migrate, or modify any database tables.
"""
import os
from contextlib import asynccontextmanager

import psycopg
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from psycopg.conninfo import make_conninfo


def allowed_origins() -> list[str]:
    raw = os.getenv("FRONTEND_ORIGINS", "*").strip()
    if raw == "*":
        return ["*"]
    return [origin.strip() for origin in raw.split(",") if origin.strip()]


app = FastAPI(
    title="Python Adventure API",
    description="A separate Python/FastAPI service for the Python Adventure project.",
    version="0.1.0",
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins(),
    allow_credentials=False,
    allow_methods=["GET"],
    allow_headers=["*"],
)


@app.get("/", tags=["service"])
def root() -> dict[str, str]:
    return {
        "service": "Python Adventure Python API",
        "status": "running",
        "health": "/health",
        "docs": "/docs",
    }


@app.get("/health", tags=["health"])
def health() -> dict[str, object]:
    """Report app status and test PostgreSQL connectivity without changing data."""
    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        return {
            "status": "running",
            "database": "not_configured",
            "note": "Set DATABASE_URL in the hosting service to enable the database check.",
        }

    try:
        # Add a short timeout without changing the supplied connection URL.
        conninfo = make_conninfo(database_url, connect_timeout=3)
        with psycopg.connect(conninfo) as connection:
            with connection.cursor() as cursor:
                cursor.execute("SELECT 1")
                cursor.fetchone()
        return {"status": "ok", "database": "connected"}
    except Exception:
        # Do not expose connection strings, credentials, or internal exception details.
        return {"status": "degraded", "database": "unavailable"}


@app.get("/api/v1/health", tags=["health"])
def api_health() -> dict[str, str]:
    return {"api": "python-adventure", "status": "ok"}
