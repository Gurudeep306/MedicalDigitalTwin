from sqlalchemy import Column, Integer, String, Float, Text, DateTime, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime

Base = declarative_base()

class Medicine(Base):
    __tablename__ = "medicines"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), unique=True, index=True)
    active_ingredient = Column(String(255))
    dosage = Column(String(100))
    manufacturer = Column(String(255))
    description = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

class Patient(Base):
    __tablename__ = "patients"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255))
    age = Column(Integer)
    gender = Column(String(20))
    height = Column(Float)
    weight = Column(Float)
    bmi = Column(Float)
    medical_history = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

class SideEffect(Base):
    __tablename__ = "side_effects"
    
    id = Column(Integer, primary_key=True, index=True)
    medicine_id = Column(Integer, ForeignKey("medicines.id"))
    name = Column(String(255))
    severity = Column(String(50))
    description = Column(Text)
    affected_organs = Column(Text)

class DrugInteraction(Base):
    __tablename__ = "drug_interactions"
    
    id = Column(Integer, primary_key=True, index=True)
    medicine_id_1 = Column(Integer, ForeignKey("medicines.id"))
    medicine_id_2 = Column(Integer, ForeignKey("medicines.id"))
    interaction_type = Column(String(50))
    description = Column(Text)
