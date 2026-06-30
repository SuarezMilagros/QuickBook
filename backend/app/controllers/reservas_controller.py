from flask import jsonify, request
from datetime import datetime
from sqlalchemy.exc import IntegrityError
from app.models.models import db, Reserva, Usuario, Servicio, Disponibilidad


def crear_reserva():
    data = request.get_json()
    for campo in ["nombre_cliente", "email", "telefono", "servicio_id", "fecha_hora"]:
        if not data or not data.get(campo):
            return jsonify({"error": f"El campo '{campo}' es obligatorio."}), 400

    email = data["email"].strip()
    if "@" not in email or "." not in email.split("@")[-1]:
        return jsonify({"error": "El formato del email no es válido."}), 400

    try:
        fecha_hora_dt = datetime.fromisoformat(data["fecha_hora"])
    except ValueError:
        return jsonify({"error": "El formato de 'fecha_hora' debe ser ISO 8601."}), 400

    servicio = Servicio.query.get(data["servicio_id"])
    if not servicio:
        return jsonify({"error": f"Servicio con id {data['servicio_id']} no encontrado."}), 404

    usuario = Usuario.query.filter_by(email=email).first()
    if not usuario:
        usuario = Usuario(nombre=data["nombre_cliente"], email=email, rol="Cliente")
        usuario.set_password("temporal1234")
        db.session.add(usuario)
        db.session.flush()

    nueva = Reserva(id_usuario=usuario.id, id_servicio=data["servicio_id"], fecha_hora=fecha_hora_dt, estado="Confirmada")
    db.session.add(nueva)

    fecha_str = fecha_hora_dt.strftime("%Y-%m-%d")
    hora_str  = fecha_hora_dt.strftime("%H:%M")
    turno = Disponibilidad.query.filter_by(id_servicio=data["servicio_id"], fecha=fecha_str, hora=hora_str).first()
    if turno:
        if not turno.esta_libre:
            return jsonify({"error": "El turno ya no está disponible."}), 409
        turno.esta_libre = False

    try:
        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        return jsonify({"error": "Conflicto: el turno fue reservado al mismo tiempo por otra persona."}), 409

    return jsonify({
        "status": "Reserva confirmada exitosamente",
        "codigo_verificacion": nueva.codigo_verif,
        "reserva": {"id": nueva.id, "cliente": usuario.nombre, "fecha_hora": fecha_hora_dt.strftime("%Y-%m-%d %H:%M"), "estado": nueva.estado},
    }), 201


def mis_reservas():
    email = request.args.get("email", "").strip()
    if not email:
        return jsonify({"error": "El parámetro 'email' es requerido."}), 400
    usuario = Usuario.query.filter_by(email=email).first()
    if not usuario:
        return jsonify({"error": "No se encontró ningún usuario con ese email."}), 404
    reservas = Reserva.query.filter_by(id_usuario=usuario.id).order_by(Reserva.fecha_hora.desc()).all()
    return jsonify({"cliente": usuario.nombre, "email": usuario.email, "reservas": [r.to_dict() for r in reservas], "total": len(reservas)}), 200


def get_reserva_por_codigo():
    codigo  = request.view_args.get("codigo_verif", "").upper()
    reserva = Reserva.query.filter_by(codigo_verif=codigo).first()
    if not reserva:
        return jsonify({"error": "Código de verificación no encontrado."}), 404
    return jsonify(reserva.to_dict()), 200