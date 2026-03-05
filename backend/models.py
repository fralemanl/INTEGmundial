from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    password = Column(String)
    is_admin = Column(Boolean, default=False)
    predictions = relationship("Prediction", back_populates="user")
    champion_prediction = relationship("ChampionPrediction", back_populates="user", uselist=False)

class Match(Base):
    __tablename__ = "matches"
    id = Column(Integer, primary_key=True, index=True)
    team_home = Column(String)
    team_away = Column(String)
    match_date = Column(DateTime)
    score_home = Column(Integer, nullable=True)
    score_away = Column(Integer, nullable=True)
    winner = Column(String, nullable=True)
    is_finished = Column(Boolean, default=False)
    phase = Column(String, nullable=True)
    stadium = Column(String, nullable=True)
    predictions = relationship("Prediction", back_populates="match")

class Prediction(Base):
    __tablename__ = "predictions"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    match_id = Column(Integer, ForeignKey("matches.id"))
    predicted_home = Column(Integer)
    predicted_away = Column(Integer)
    winner = Column(String, nullable=True)
    points = Column(Integer, default=0)
    user = relationship("User", back_populates="predictions")
    match = relationship("Match", back_populates="predictions")

class ChampionPrediction(Base):
    __tablename__ = "champion_predictions"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    team = Column(String)
    user = relationship("User", back_populates="champion_prediction")
