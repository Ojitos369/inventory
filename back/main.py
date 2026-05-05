from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from urls import urls_router, add_404_handler

from core.conf.settings import (
    allow_origin_regex, allow_credentials, allow_methods, allow_headers,
)

app = FastAPI(title="invhome")

app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=allow_origin_regex,
    allow_credentials=allow_credentials,
    allow_methods=allow_methods,
    allow_headers=allow_headers,
)

app.include_router(urls_router, prefix="")

add_404_handler(app)


# uvicorn main:app --host 0.0.0.0 --port 8373 --reload
