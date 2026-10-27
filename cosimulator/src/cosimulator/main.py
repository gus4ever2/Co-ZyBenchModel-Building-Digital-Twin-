import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from cosimulator.api.router import router
from cosimulator.core.config import settings


app = FastAPI(
    title=settings.app_name,
    description=settings.app_description,
    version=settings.app_version,
    debug=settings.debug,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)


@app.get("/")
def root() -> dict[str, str]:
    return {
        "name": app.title,
        "version": app.version,
        "documentation": "/docs",
    }


if __name__ == "__main__":
    uvicorn.run(
        "cosimulator.main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.debug,
    )