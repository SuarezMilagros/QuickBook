from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime
import uuid

db = SQLAlchemy()

class Rol:
    CLIENTE  = "Cliente"
    OPERADOR = "Operador"
    ADMIN    = "Admin"
    TODOS    = ["Cliente", "Operador", "Admin"]


class Usuario(db.Model):
    __tablename__ = "usuarios"

    id        = db.Column(db.Integer, primary_key=True, autoincrement=True)
    nombre    = db.Column(db.String(100), nullable=False)
    email     = db.Column(db.String(150), unique=True, nullable=False)
    pass_hash = db.Column(db.String(256), nullable=False)
    rol       = db.Column(db.String(20), nullable=False, default=Rol.CLIENTE)

    reservas    = db.relationship("Reserva", back_populates="usuario", lazy=True, foreign_keys="Reserva.id_usuario")
    comentarios = db.relationship("Comentario", back_populates="autor", lazy=True)

    def set_password(self, password):
        self.pass_hash = generate_password_hash(password, method="pbkdf2:sha256")

    def check_password(self, password):
        return check_password_hash(self.pass_hash, password)

    def to_dict(self):
        return {"id": self.id, "nombre": self.nombre, "email": self.email, "rol": self.rol}


class Servicio(db.Model):
    __tablename__ = "servicios"

    id           = db.Column(db.Integer, primary_key=True, autoincrement=True)
    nombre       = db.Column(db.String(100), nullable=False)
    duracion_min = db.Column(db.Integer, nullable=False)

    reservas       = db.relationship("Reserva", back_populates="servicio", lazy=True)
    disponibilidad = db.relationship("Disponibilidad", back_populates="servicio", lazy=True)

    def to_dict(self):
        return {"id": self.id, "nombre": self.nombre, "duracion_min": self.duracion_min}


class Disponibilidad(db.Model):
    __tablename__ = "disponibilidades"

    id          = db.Column(db.Integer, primary_key=True, autoincrement=True)
    id_servicio = db.Column(db.Integer, db.ForeignKey("servicios.id"), nullable=False)
    fecha       = db.Column(db.String(10), nullable=False)
    hora        = db.Column(db.String(5), nullable=False)
    esta_libre  = db.Column(db.Boolean, nullable=False, default=True)

    servicio = db.relationship("Servicio", back_populates="disponibilidad")

    def to_dict(self):
        return {"id": self.id, "servicio_id": self.id_servicio, "fecha": self.fecha, "hora": self.hora, "disponible": self.esta_libre}


class Reserva(db.Model):
    __tablename__ = "reservas"
    __table_args__ = (
        db.UniqueConstraint("id_servicio", "fecha_hora", name="uq_servicio_fecha_hora"),
        db.UniqueConstraint("id_operador", "fecha_hora", name="uq_operador_fecha_hora"),
    )

    id           = db.Column(db.Integer, primary_key=True, autoincrement=True)
    id_usuario   = db.Column(db.Integer, db.ForeignKey("usuarios.id"), nullable=False)
    id_servicio  = db.Column(db.Integer, db.ForeignKey("servicios.id"), nullable=False)
    id_operador  = db.Column(db.Integer, db.ForeignKey("usuarios.id"), nullable=True)
    fecha_hora   = db.Column(db.DateTime, nullable=False)
    estado       = db.Column(db.String(20), nullable=False, default="Confirmada")
    codigo_verif = db.Column(db.String(20), nullable=False, unique=True)

    usuario     = db.relationship("Usuario", back_populates="reservas", foreign_keys=[id_usuario])
    operador    = db.relationship("Usuario", foreign_keys=[id_operador])
    servicio    = db.relationship("Servicio", back_populates="reservas")
    comentarios = db.relationship("Comentario", back_populates="reserva", lazy=True, cascade="all, delete-orphan")

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        if not self.codigo_verif:
            uid = uuid.uuid4().hex.upper()
            self.codigo_verif = f"QK-{uid[:4]}-{uid[4]}"

    def to_dict(self, include_comentarios=False):
        data = {
            "id": self.id,
            "id_usuario": self.id_usuario,
            "id_servicio": self.id_servicio,
            "id_operador": self.id_operador,
            "fecha_hora": self.fecha_hora.strftime("%Y-%m-%d %H:%M"),
            "estado": self.estado,
            "codigo_verificacion": self.codigo_verif,
        }
        if include_comentarios:
            data["comentarios"] = [c.to_dict() for c in self.comentarios]
        return data


class Comentario(db.Model):
    __tablename__ = "comentarios"

    id         = db.Column(db.Integer, primary_key=True, autoincrement=True)
    reserva_id = db.Column(db.Integer, db.ForeignKey("reservas.id"), nullable=False)
    usuario_id = db.Column(db.Integer, db.ForeignKey("usuarios.id"), nullable=False)
    texto      = db.Column(db.Text, nullable=False)
    creado_en  = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    reserva = db.relationship("Reserva", back_populates="comentarios")
    autor   = db.relationship("Usuario", back_populates="comentarios")

    def to_dict(self):
        return {
            "id": self.id,
            "reserva_id": self.reserva_id,
            "autor": self.autor.nombre if self.autor else None,
            "usuario_id": self.usuario_id,
            "texto": self.texto,
            "creado_en": self.creado_en.strftime("%Y-%m-%d %H:%M"),
        }