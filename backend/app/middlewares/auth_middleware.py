import os
from functools import wraps

import jwt
from flask import request, jsonify, g

from app.models.models import Usuario, Rol

JWT_SECRET    = os.getenv("JWT_SECRET", "quickbook_secret_2026")
JWT_ALGORITHM = "HS256"


def _obtener_usuario_desde_token():
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        return None, ("Token no proporcionado.", 401)

    token = auth_header.split(" ", 1)[1]
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except jwt.ExpiredSignatureError:
        return None, ("El token ha expirado.", 401)
    except jwt.InvalidTokenError:
        return None, ("Token inválido.", 401)

    usuario = Usuario.query.get(payload.get("user_id"))
    if not usuario:
        return None, ("Usuario no encontrado.", 401)

    return usuario, None


def token_requerido(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        usuario, error = _obtener_usuario_desde_token()
        if error:
            mensaje, codigo = error
            return jsonify({"error": mensaje}), codigo
        g.usuario_actual = usuario
        return f(*args, **kwargs)
    return wrapper


def solo_admin(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        usuario, error = _obtener_usuario_desde_token()
        if error:
            mensaje, codigo = error
            return jsonify({"error": mensaje}), codigo
        if usuario.rol != Rol.ADMIN:
            return jsonify({"error": "Solo un administrador puede realizar esta acción."}), 403
        g.usuario_actual = usuario
        return f(*args, **kwargs)
    return wrapper


def admin_o_operador(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        usuario, error = _obtener_usuario_desde_token()
        if error:
            mensaje, codigo = error
            return jsonify({"error": mensaje}), codigo
        if usuario.rol not in [Rol.ADMIN, Rol.OPERADOR]:
            return jsonify({"error": "Solo un administrador u operador puede realizar esta acción."}), 403
        g.usuario_actual = usuario
        return f(*args, **kwargs)
    return wrapper
