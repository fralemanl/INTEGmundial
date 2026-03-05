# Script para limpiar predicciones con match_id nulo
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

SQLALCHEMY_DATABASE_URL = "sqlite:///./quiniela.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def main():
    db = SessionLocal()
    from sqlalchemy import text
    deleted = db.execute(text("DELETE FROM predictions WHERE match_id IS NULL"))
    db.commit()
    print(f"Predicciones eliminadas: {deleted.rowcount}")
    db.close()

if __name__ == "__main__":
    main()
