from main import SessionLocal, Match
from datetime import datetime

db = SessionLocal()

try:
    match = Match(
        team_home="Mexico",
        team_away="Sudafrica",
        match_date=datetime(2026, 6, 11, 18, 0),
        phase="Fase de Grupos",
        group="Grupo A",
        stadium="Estadio Azteca, Ciudad de México, MX",
        score_home=None,
        score_away=None,
        is_finished=False
    )

    db.add(match)
    db.commit()

    print("✅ Partido del Mundial 2026 insertado correctamente")

except Exception as e:
    print("❌ Error:", e)

finally:
    db.close()