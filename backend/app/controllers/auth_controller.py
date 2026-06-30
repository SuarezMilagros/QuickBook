import re
import jwt
import os
from datetime import datetime, timedelta, timezone
from flask import request, jsonify, g
from sqlalchemy.exc import IntegrityError
from app.models.models import db, Usuario, Rol
from app.middlewares.auth_middleware import JWT_SECRET, JWT_ALGORITHM, token_requerido

EMAIL_REGEX            = re.compile(r"^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$")
TOKEN_EXPIRACION_HORAS = 2


def _generar_token(usuario):
    payload = {
        "user_id": usuario.id,
        "rol":     usuario.rol,
        "exp":     datetime.now(timezone.utc) + timedelta(hours=TOKEN_EXPIRACION_HORAS),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def register():
    data = request.get_json()
    for campo in ["nombre", "email", "password"]:
        if not data or not data.get(campo, "").strip():
            return jsonify({"error": f"El campo '{campo}' es obligatorio."}), 400

    nombre   = data["nombre"].strip()
    email    = data["email"].strip().lower()
    password = data["password"]
    rol      = data.get("rol", Rol.CLIENTE)

    if not EMAIL_REGEX.match(email):
        return jsonify({"error": "El formato del email no es válido."}), 400
    if len(password) < 6:
        return jsonify({"error": "La contraseña debe tener al menos 6 caracteres."}), 400
    if rol not in Rol.TODOS:
        return jsonify({"error": f"Rol inválido. Opciones: {', '.join(Rol.TODOS)}"}), 400

    nuevo = Usuario(nombre=nombre, email=email, rol=rol)
    nuevo.set_password(password)
    db.session.add(nuevo)
    try:
        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        return jsonify({"error": "El email ya está registrado."}), 409

    return jsonify({"message": "Usuario creado con éxito", "usuario": {"id": nuevo.id, "email": nuevo.email, "rol": nuevo.rol}}), 201


def login():
    data     = request.get_json()
    email    = (data or {}).get("email", "").strip().lower()
    password = (data or {}).get("password", "")
    if not email or not password:
        return jsonify({"error": "Email y contraseña son requeridos."}), 400
    usuario = Usuario.query.filter_by(email=email).first()
    if not usuario or not usuario.check_password(password):
        return jsonify({"error": "Credenciales incorrectas."}), 401
    token = _generar_token(usuario)
    return jsonify({"token": token, "usuario": {"nombre": usuario.nombre, "rol": usuario.rol}}), 200


@token_requerido
def perfil():
    return jsonify(g.usuario_actual.to_dict()), 200