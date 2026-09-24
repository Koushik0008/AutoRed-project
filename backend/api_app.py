from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.database.database import Base, engine

from backend.api.targets import router as targets_router
from backend.api.campaigns import router as campaigns_router
from backend.api.findings import router as findings_router
from backend.api.dashboard import router as dashboard_router
from backend.api.attacks import router as attacks_router
from backend.api.reports import router as reports_router


# Create database tables
Base.metadata.create_all(bind=engine)


# Create FastAPI application
app = FastAPI(
    title="AutoRed API",
    description="Autonomous LLM Red-Teaming Platform",
    version="1.0.0"
)


# --------------------------------------------------
# CORS CONFIGURATION
# --------------------------------------------------

app.add_middleware(
    CORSMiddleware,

    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],

    allow_credentials=True,

    allow_methods=["*"],

    allow_headers=["*"],
)


# --------------------------------------------------
# ROOT ENDPOINT
# --------------------------------------------------

@app.get("/")
def root():
    return {
        "message": "AutoRed API is running."
    }


# --------------------------------------------------
# API ROUTES
# --------------------------------------------------

app.include_router(targets_router)

app.include_router(campaigns_router)

app.include_router(findings_router)

app.include_router(dashboard_router)

app.include_router(attacks_router)

app.include_router(reports_router)