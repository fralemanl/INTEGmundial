from pydantic import Field
from database import SessionLocal
from models import User, Match, Prediction, ChampionPrediction
from pydantic import BaseModel
from typing import Optional, List
from fastapi import Body

# --- CLASES Pydantic FALTANTES ---
class PasswordResetRequest(BaseModel):
    password: str

class UserCreate(BaseModel):
    username: str
    email: str
    password: str
    champion: str

class UserLogin(BaseModel):
    username: str
    password: str

class MatchCreate(BaseModel):
    team_home: str
    team_away: str
    match_date: str
    score_home: Optional[int] = None
    score_away: Optional[int] = None
    winner: Optional[str] = None
    is_finished: Optional[bool] = False
    phase: Optional[str] = None
    stadium: Optional[str] = None

class MatchUpdate(BaseModel):
    team_home: Optional[str] = None
    team_away: Optional[str] = None
    match_date: Optional[str] = None
    score_home: Optional[int] = None
    score_away: Optional[int] = None
    winner: Optional[str] = None
    is_finished: Optional[bool] = None
    phase: Optional[str] = None
    stadium: Optional[str] = None

class MatchResponse(BaseModel):
    id: int
    team_home: str
    team_away: str
    match_date: str  # ISO string
    score_home: Optional[int]
    score_away: Optional[int]
    winner: Optional[str]
    is_finished: bool
    phase: Optional[str]
    stadium: Optional[str]
    @staticmethod
    def from_orm_force_string(obj):
        # Convierte match_date a string ISO antes de crear el modelo
        return MatchResponse(
            id=obj.id,
            team_home=obj.team_home,
            team_away=obj.team_away,
            match_date=obj.match_date.isoformat() if obj.match_date else None,
            score_home=obj.score_home,
            score_away=obj.score_away,
            winner=obj.winner,
            is_finished=obj.is_finished,
            phase=obj.phase,
            stadium=getattr(obj, 'stadium', None),
        )
    class Config:
        from_attributes = True

class PredictionCreate(BaseModel):
    match_id: int
    predicted_home: int
    predicted_away: int
    winner: Optional[str] = None

class PredictionResponse(BaseModel):
    id: int
    user_id: int
    match_id: int
    predicted_home: int
    predicted_away: int
    winner: Optional[str]
    points: int
    class Config:
        orm_mode = True

class LeaderboardEntry(BaseModel):
    username: str
    total_points: int
    correct_results: int
    correct_scores: int

class AdjustPointsRequest(BaseModel):
    prediction_id: int
    new_points: int
    admin_user_id: int

# Endpoint para ajustar manualmente los puntos de una predicción

# ...existing code...

# (Colocar el endpoint después de la creación de la app y las importaciones)

# ...existing code...
from fastapi import status
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Column, Integer, String, DateTime, ForeignKey, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session, relationship
from pydantic import BaseModel

# Pydantic para predicción de campeón (debe ir después de importar BaseModel)
class ChampionPredictionCreate(BaseModel):
    team: str

class ChampionPredictionResponse(BaseModel):
    user_id: int
    team: str
    class Config:
        from_attributes = True
from datetime import datetime
from typing import List, Optional
import hashlib

# Modelos Pydantic necesarios para endpoints
class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    is_admin: bool
    class Config:
        from_attributes = True

# Modelo para actualizar usuario
class UserUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[str] = None
    is_admin: Optional[bool] = None
    password: Optional[str] = None

# FastAPI App
app = FastAPI(title="Quiniela Mundial API")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Endpoint para obtener la predicción de campeón de un usuario
@app.get("/api/champion/{user_id}", response_model=ChampionPredictionResponse)
def get_champion_prediction(user_id: int, db: Session = Depends(get_db)):
    champion = db.query(ChampionPrediction).filter(ChampionPrediction.user_id == user_id).first()
    if not champion:
        raise HTTPException(status_code=404, detail="Predicción de campeón no encontrada")
    return champion

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()


# Update user endpoint
@app.put("/api/users/{user_id}", response_model=UserResponse)
def update_user(user_id: int, user_update: UserUpdate, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    if user_update.username is not None:
        user.username = user_update.username
    if user_update.email is not None:
        user.email = user_update.email
    if user_update.is_admin is not None:
        user.is_admin = user_update.is_admin
    if user_update.password is not None:
        user.password = hash_password(user_update.password)
    db.commit()
    db.refresh(user)
    return user

@app.post("/api/users/{user_id}/reset_password")
def reset_password(user_id: int, req: PasswordResetRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    user.password = hash_password(req.password)
    db.commit()
    db.refresh(user)
    return {"detail": "Contraseña actualizada"}
@app.delete("/api/users/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    db.delete(user)
    db.commit()
    return {"detail": "Usuario eliminado"}
@app.post("/api/users/register", response_model=UserResponse)
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    # Verificar si el usuario ya existe
    existing_user = db.query(User).filter(
        (User.username == user.username) | (User.email == user.email)
    ).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Usuario o email ya existe")

    # Crear nuevo usuario
    db_user = User(
        username=user.username,
        email=user.email,
        password=hash_password(user.password),
        is_admin=False
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    # Guardar predicción de campeón
    champion_prediction = ChampionPrediction(user_id=db_user.id, team=user.champion)
    db.add(champion_prediction)
    db.commit()

    return db_user

@app.post("/api/users/login", response_model=UserResponse)
def login_user(credentials: UserLogin, db: Session = Depends(get_db)):
    try:
        user = db.query(User).filter(User.username == credentials.username).first()
        if not user:
            print(f"Login failed: user '{credentials.username}' not found.")
            raise HTTPException(status_code=401, detail="Usuario no encontrado")
        if user.password != hash_password(credentials.password):
            print(f"Login failed: incorrect password for user '{credentials.username}'.")
            raise HTTPException(status_code=401, detail="Credenciales inválidas")
        print(f"Login success for user '{credentials.username}'.")
        return user
    except Exception as e:
        print(f"Login error: {e}")
        raise HTTPException(status_code=500, detail="Error interno en login")

@app.get("/api/users", response_model=List[UserResponse])
def get_users(db: Session = Depends(get_db)):
    return db.query(User).all()

# Endpoints de Partidos
@app.post("/api/reset_all", status_code=status.HTTP_200_OK)
def reset_all(db: Session = Depends(get_db), admin_user_id: int = None):
    """
    Elimina todos los partidos, predicciones y predicción de campeón. Solo para admins.
    admin_user_id: Debe ser el ID de un usuario admin (proteger en frontend y backend si es necesario).
    """
    if admin_user_id is None:
        raise HTTPException(status_code=400, detail="Se requiere el ID de usuario admin")
    admin = db.query(User).filter(User.id == admin_user_id, User.is_admin == True).first()
    if not admin:
        raise HTTPException(status_code=403, detail="Solo los administradores pueden resetear todo")

    # Eliminar predicciones de campeón
    db.query(ChampionPrediction).delete()
    # Eliminar predicciones
    db.query(Prediction).delete()
    # NO eliminar partidos
    db.commit()
    return {"message": "Todos los puntajes y campeón han sido reseteados, los partidos se mantienen"}
@app.post("/api/matches", response_model=MatchResponse)
def create_match(match: MatchCreate, db: Session = Depends(get_db)):
    match_data = match.dict()
    # Convertir string ISO a datetime si es necesario
    if isinstance(match_data["match_date"], str):
        # Soporta formato con 'Z' (UTC)
        match_data["match_date"] = datetime.fromisoformat(match_data["match_date"].replace("Z", "+00:00"))
    db_match = Match(**match_data)
    db.add(db_match)
    db.commit()
    db.refresh(db_match)
    return MatchResponse.from_orm_force_string(db_match)


@app.get("/api/matches", response_model=List[MatchResponse])
def get_matches(db: Session = Depends(get_db)):
    matches = db.query(Match).order_by(Match.match_date).all()
    return [MatchResponse.from_orm_force_string(m) for m in matches]


@app.get("/api/matches/{match_id}", response_model=MatchResponse)
def get_match(match_id: int, db: Session = Depends(get_db)):
    match = db.query(Match).filter(Match.id == match_id).first()
    if not match:
        raise HTTPException(status_code=404, detail="Partido no encontrado")
    return MatchResponse.from_orm_force_string(match)

@app.put("/api/matches/{match_id}", response_model=MatchResponse)
def update_match(match_id: int, match_update: MatchUpdate, db: Session = Depends(get_db)):
    match = db.query(Match).filter(Match.id == match_id).first()
    if not match:
        raise HTTPException(status_code=404, detail="Partido no encontrado")
    
    # Solo permitir modificar equipos, goles, estadio y finalizar partido
    if hasattr(match_update, 'team_home') and match_update.team_home is not None:
        match.team_home = match_update.team_home
    if hasattr(match_update, 'team_away') and match_update.team_away is not None:
        match.team_away = match_update.team_away
    if match_update.score_home is not None or match_update.score_home == 0:
        match.score_home = match_update.score_home
    if match_update.score_away is not None or match_update.score_away == 0:
        match.score_away = match_update.score_away
    if match_update.winner is not None:
        match.winner = match_update.winner
    if match_update.stadium is not None:
        match.stadium = match_update.stadium
    if match_update.is_finished is not None:
        match.is_finished = match_update.is_finished
        if match.is_finished:
            calculate_points_for_match(match_id, db)

    db.commit()
    db.refresh(match)
    return MatchResponse.from_orm_force_string(match)

@app.delete("/api/matches/{match_id}")
def delete_match(match_id: int, db: Session = Depends(get_db)):
    match = db.query(Match).filter(Match.id == match_id).first()
    if not match:
        raise HTTPException(status_code=404, detail="Partido no encontrado")
    db.delete(match)
    db.commit()
    return {"message": "Partido eliminado"}

# Endpoints de Predicciones


@app.post("/api/predictions", response_model=PredictionResponse)
def create_prediction(prediction: PredictionCreate, user_id: int, db: Session = Depends(get_db)):
    # Verificar si el partido existe
    match = db.query(Match).filter(Match.id == prediction.match_id).first()
    if not match:
        raise HTTPException(status_code=404, detail="Partido no encontrado")
        # Verificar si el partido ya comenzó
    # Verificar si el partido ya comenzó
    if match.is_finished or datetime.now() > match.match_date:
        raise HTTPException(status_code=400, detail="No se pueden hacer predicciones para partidos que ya comenzaron")

    # Calcular winner automáticamente en fase de grupos si no lo envía el usuario
    import unicodedata
    def normalize_phase(phase):
        if not phase:
            return ""
        # Quitar tildes y espacios, minúsculas
        nfkd = unicodedata.normalize("NFKD", phase)
        only_ascii = "".join([c for c in nfkd if not unicodedata.combining(c)])
        return only_ascii.replace(" ", "").lower()

    phase = match.phase or "Fase de Grupos"
    knockout_phases = [
        "dieciseisavos",
        "octavos",
        "octavosdefinal",
        "octavos de final",
        "cuartos",
        "cuartosdefinal",
        "cuartos de final",
        "cuartosdefinales",
        "semifinal",
        "semifinales",
        "final",
        "tercerlugar",
        "tercer lugar",
        "tercerpuesto",
        "tercer puesto"
    ]
    knockout_phases = [normalize_phase(p) for p in knockout_phases]
    norm_phase = normalize_phase(phase)
    winner_value = getattr(prediction, "winner", None)
    if norm_phase not in knockout_phases:
        # Solo para fase de grupos
        if winner_value is None:
            if prediction.predicted_home is not None and prediction.predicted_away is not None:
                if prediction.predicted_home > prediction.predicted_away:
                    winner_value = match.team_home
                elif prediction.predicted_home < prediction.predicted_away:
                    winner_value = match.team_away
                else:
                    winner_value = "Empate"
    else:
        # Para knockout, calcular siempre el winner aunque no sea empate
        if prediction.predicted_home is not None and prediction.predicted_away is not None:
            if prediction.predicted_home > prediction.predicted_away:
                winner_value = match.team_home
            elif prediction.predicted_home < prediction.predicted_away:
                winner_value = match.team_away
            else:
                winner_value = prediction.winner  # En empate, usar el seleccionado en penales

    # Verificar si ya existe una predicción
    existing = db.query(Prediction).filter(
        Prediction.user_id == user_id,
        Prediction.match_id == prediction.match_id
    ).first()

    if existing:
        # Actualizar predicción existente
        existing.predicted_home = prediction.predicted_home
        existing.predicted_away = prediction.predicted_away
        if norm_phase not in knockout_phases:
            if prediction.predicted_home is not None and prediction.predicted_away is not None:
                if prediction.predicted_home > prediction.predicted_away:
                    existing.winner = match.team_home
                elif prediction.predicted_home < prediction.predicted_away:
                    existing.winner = match.team_away
                else:
                    existing.winner = "Empate"
            else:
                existing.winner = None
        else:
            # Para knockout, calcular siempre el winner aunque no sea empate
            if prediction.predicted_home is not None and prediction.predicted_away is not None:
                if prediction.predicted_home > prediction.predicted_away:
                    existing.winner = match.team_home
                elif prediction.predicted_home < prediction.predicted_away:
                    existing.winner = match.team_away
                else:
                    existing.winner = prediction.winner  # En empate, usar el seleccionado en penales
            else:
                existing.winner = None
        db.commit()
        db.refresh(existing)
        return existing
    # Crear nueva predicción
    db_prediction = Prediction(
        user_id=user_id,
        match_id=prediction.match_id,
        predicted_home=prediction.predicted_home,
        predicted_away=prediction.predicted_away,
        winner=winner_value
    )
    db.add(db_prediction)
    db.commit()
    db.refresh(db_prediction)
    return db_prediction

@app.get("/api/predictions/user/{user_id}", response_model=List[PredictionResponse])
def get_user_predictions(user_id: int, db: Session = Depends(get_db)):
    predictions = db.query(Prediction).filter(Prediction.user_id == user_id).all()
    # Filtrar predicciones con match_id nulo
    return [p for p in predictions if p.match_id is not None]

@app.get("/api/predictions/match/{match_id}", response_model=List[PredictionResponse])
def get_match_predictions(match_id: int, db: Session = Depends(get_db)):
    return db.query(Prediction).filter(Prediction.match_id == match_id).all()

from fastapi import status

# Endpoint para ajustar manualmente los puntos de una predicción
@app.post("/api/predictions/adjust_points", status_code=status.HTTP_200_OK)
def adjust_prediction_points(request: AdjustPointsRequest, db: Session = Depends(get_db)):
    # Verificar que el usuario admin existe y es admin
    admin_user = db.query(User).filter(User.id == request.admin_user_id, User.is_admin == True).first()
    if not admin_user:
        raise HTTPException(status_code=403, detail="Solo un administrador puede ajustar los puntos.")
    prediction = db.query(Prediction).filter(Prediction.id == request.prediction_id).first()
    if not prediction:
        raise HTTPException(status_code=404, detail="Predicción no encontrada.")
    prediction.points = request.new_points
    db.commit()
    db.refresh(prediction)
    return {"detail": f"Puntos actualizados a {request.new_points} para la predicción {request.prediction_id}"}

# Endpoint de Clasificación
@app.get("/api/leaderboard", response_model=List[LeaderboardEntry])
def get_leaderboard(db: Session = Depends(get_db)):
    users = db.query(User).filter(User.is_admin == False).all()
    leaderboard = []
    
    for user in users:
        # Filtrar predicciones solo de partidos finalizados
        predictions = db.query(Prediction).join(Match).filter(Prediction.user_id == user.id, Match.is_finished == True).all()
        total_points = 0
        correct_results = 0
        correct_scores = 0
        for p in predictions:
            # Obtener la fase del partido
            match = db.query(Match).filter(Match.id == p.match_id).first()
            phase = match.phase if match and match.phase else "Fase de Grupos"
            # Sistema de puntaje por fase
            phase_points = {
                "Fase de Grupos": {"exacto": 5, "ganador": 3, "parcial": 1},
                "Dieciseisavos": {"exacto": 6, "ganador": 3},
                "Octavos": {"exacto": 7, "ganador": 4},
                "Cuartos": {"exacto": 9, "ganador": 5},
                "Semifinal": {"exacto": 12, "ganador": 6},
                "Final": {"exacto": 15, "ganador": 8},
                "Tercer Lugar": {"exacto": 10, "ganador": 5},
            }
            # Sumar puntos según la fase y tipo de acierto
            if phase in phase_points:
                if p.points == phase_points[phase]["exacto"]:
                    correct_scores += 1
                elif p.points == phase_points[phase]["ganador"]:
                    correct_results += 1
            total_points += p.points
        # Sumar 15 puntos si acertó el campeón
        champion_prediction = db.query(ChampionPrediction).filter(ChampionPrediction.user_id == user.id).first()
        final_match = db.query(Match).filter(Match.phase == "Final", Match.is_finished == True).first()
        if champion_prediction and final_match and final_match.winner:
            if champion_prediction.team == final_match.winner:
                total_points += 15
        leaderboard.append(LeaderboardEntry(
            username=user.username,
            total_points=total_points,
            correct_results=correct_results,
            correct_scores=correct_scores
        ))
    
    # Ordenar por puntos totales
    leaderboard.sort(key=lambda x: x.total_points, reverse=True)
    return leaderboard

# Función auxiliar para calcular puntos
def calculate_points_for_match(match_id: int, db: Session):
    match = db.query(Match).filter(Match.id == match_id).first()
    if not match or not match.is_finished:
        return
    
    predictions = db.query(Prediction).filter(Prediction.match_id == match_id).all()
    
    # Sistema de puntaje por fase
    phase_points = {
        "Fase de Grupos": {"exacto": 5, "ganador": 3, "parcial": 1},
        "Dieciseisavos": {"exacto": 6, "ganador": 3},
        "Octavos": {"exacto": 7, "ganador": 4},
        "Cuartos": {"exacto": 9, "ganador": 5},
        "Semifinal": {"exacto": 12, "ganador": 6},
        "Final": {"exacto": 15, "ganador": 8},
        "Tercer Lugar": {"exacto": 10, "ganador": 5},
    }
    import unicodedata
    def normalize_phase(phase):
        if not phase:
            return ""
        nfkd = unicodedata.normalize("NFKD", phase)
        only_ascii = "".join([c for c in nfkd if not unicodedata.combining(c)])
        return only_ascii.replace(" ", "").lower()

    phase = match.phase or "Fase de Grupos"
    norm_phase = normalize_phase(phase)
    # Mapeo de fases normalizadas a claves de phase_points
    phase_map = {
        normalize_phase("Fase de Grupos"): "Fase de Grupos",
        normalize_phase("Dieciseisavos"): "Dieciseisavos",
        normalize_phase("Octavos"): "Octavos",
        normalize_phase("Octavos de Final"): "Octavos",
        normalize_phase("Cuartos"): "Cuartos",
        normalize_phase("Cuartos de Final"): "Cuartos",
        normalize_phase("Semifinal"): "Semifinal",
        normalize_phase("Final"): "Final",
        normalize_phase("Tercer Lugar"): "Tercer Lugar",
        normalize_phase("Tercer Puesto"): "Tercer Lugar",
    }
    knockout_phases = [normalize_phase(p) for p in [
        "Dieciseisavos",
        "Octavos",
        "Octavos de Final",
        "Cuartos",
        "Cuartos de Final",
        "Semifinal",
        "Final",
        "Tercer Lugar",
        "Tercer Puesto"
    ]]
    for prediction in predictions:
        points = 0
        # Usar la clave normalizada para acceder a phase_points
        phase_key = phase_map.get(norm_phase, "Fase de Grupos")
        if norm_phase == normalize_phase("Dieciseisavos"):
            # 3 puntos por acertar el ganador
            if prediction.winner and match.winner and prediction.winner == match.winner:
                points += 3
            # 3 puntos adicionales si acierta ambos goles
            if prediction.predicted_home == match.score_home and prediction.predicted_away == match.score_away:
                points += 3
        elif norm_phase in knockout_phases:
            # Marcador exacto KO y Tercer Lugar
            if (
                prediction.predicted_home == match.score_home and
                prediction.predicted_away == match.score_away
            ):
                points = phase_points[phase_key]["exacto"]
            # Ganador KO y Tercer Lugar (incluye empate solo en fases que lo permiten)
            elif (
                (prediction.winner and match.winner and prediction.winner == match.winner)
            ):
                points = phase_points[phase_key]["ganador"]
        else:
            # Fase de grupos: sistema personalizado
            points = 0
            # 3 puntos si acierta el ganador (Empate, Local o Visitante)
            if prediction.winner and match.winner and prediction.winner == match.winner:
                points += 3
            # 1 punto por cada gol acertado
            if prediction.predicted_home == match.score_home:
                points += 1
            if prediction.predicted_away == match.score_away:
                points += 1
            # Máximo 5 puntos
            if points > 5:
                points = 5
        prediction.points = points
    
    db.commit()
    
from fastapi.responses import FileResponse

@app.get("/download-db")
def download_db():
    db_path = "/tmp/quiniela.db"  # O usa "/tmp/quiniela.db" si tu db está ahí
    return FileResponse(db_path, filename="quiniela.db")

@app.get("/")
def root():
    return {"message": "Quiniela Mundial API - Bienvenido!"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
