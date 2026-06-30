from flask import request, jsonify, g
from datetime import datetime
from app.models.models import db, Reserva, Usuario, Comentario, Rol
from app.middlewares.auth_middleware import token_requerido, solo_admin, admin_o_operador


@solo_admin
def asignar_operador(id_reserva):
    data        = request.get_json()
    id_operador = data.get("id_operador")
    if not id_operador:
        return jsonify({"error": "El campo 'id_operador' es requerido."}), 400

    reserva = db.session.get(Reserva, id_reserva)
    if not reserva:
        return jsonify({"error": f"Reserva #{id_reserva} no encontrada."}), 404

    operador = db.session.get(Usuario, id_operador)
    if not operador:
        return jsonify({"error": "Operador no encontrado."}), 404
    if operador.rol not in [Rol.OPERADOR, Rol.ADMIN]:
        return jsonify({"error": "El usuario no tiene rol de Operador o Admin."}), 400

    conflicto = Reserva.query.filter(
        Reserva.id_operador == id_operador,
        Reserva.fecha_hora  == reserva.fecha_hora,
        Reserva.id          != id_reserva,
        Reserva.estado      != "Cancelada",
    ).first()
    if conflicto:
        return jsonify({"error": f"El operador ya tiene un turno asignado en ese horario."}), 409

    reserva.id_operador = id_operador
    db.session.commit()
    return jsonify({"message": "Operador asignado exitosamente.", "reserva_id": id_reserva, "operador": operador.to_dict()}), 200


@token_requerido
def listar_operadores():
    operadores = Usuario.query.filter(Usuario.rol.in_([Rol.OPERADOR, Rol.ADMIN])).all()
    return jsonify([u.to_dict() for u in operadores]), 200


@admin_o_operador
def agregar_comentario(id_reserva):
    data  = request.get_json()
    texto = (data or {}).get("texto", "").strip()
    if not texto:
        return jsonify({"error": "El comentario no puede estar vacío."}), 400
    if len(texto) > 500:
        return jsonify({"error": f"El comentario supera los 500 caracteres ({len(texto)} enviados)."}), 400

    reserva = db.session.get(Reserva, id_reserva)
    if not reserva:
        return jsonify({"error": f"Reserva #{id_reserva} no encontrada."}), 404

    usuario = g.usuario_actual
    if usuario.rol == Rol.OPERADOR and reserva.id_operador != usuario.id:
        return jsonify({"error": "Solo el operador asignado a esta reserva puede dejar comentarios."}), 403

    nuevo = Comentario(reserva_id=id_reserva, usuario_id=usuario.id, texto=texto, creado_en=datetime.utcnow())
    db.session.add(nuevo)
    db.session.commit()
    return jsonify({"message": "Comentario agregado exitosamente.", "comentario": nuevo.to_dict()}), 201


@admin_o_operador
def listar_comentarios(id_reserva):
    reserva = db.session.get(Reserva, id_reserva)
    if not reserva:
        return jsonify({"error": f"Reserva #{id_reserva} no encontrada."}), 404

    usuario = g.usuario_actual
    if usuario.rol == Rol.OPERADOR and reserva.id_operador != usuario.id:
        return jsonify({"error": "Solo el operador asignado puede ver los comentarios."}), 403

    comentarios = Comentario.query.filter_by(reserva_id=id_reserva).order_by(Comentario.creado_en.asc()).all()
    return jsonify([c.to_dict() for c in comentarios]), 200