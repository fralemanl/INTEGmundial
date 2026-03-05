from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker


import os
if os.environ.get("RAILWAY_ENVIRONMENT") == "production" or os.environ.get("RAILWAY_STATIC_URL") or os.environ.get("RAILWAY_PROJECT_ID"):
    # Railway env vars detected
    SQLALCHEMY_DATABASE_URL = "sqlite:////tmp/quiniela.db"
else:
    SQLALCHEMY_DATABASE_URL = "sqlite:///D:/ProyectosFausto/Quiniela/backend/quiniela.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()
