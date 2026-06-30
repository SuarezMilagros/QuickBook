from flask import jsonify, request
from app.models.models import db, Disponibilidad, Servicio


def get_disponibilidad():
    fecha       = request.args.get("fecha")
    servicio_id = request.args.get("servicio_id", type=int)

    if not fecha or not servicio_id:
        return jsonify({"error": "Los parámetros 'fecha' y 'servicio_id' son requeridos."}), 400

    servicio = Servicio.query.get(servicio_id)
    if not servicio:
        return jsonify({"error": f"Servicio con id {servicio_id} no encontrado."}), 404

    turnos = (
        Disponibilidad.query
        .filter_by(id_servicio=servicio_id, fecha=fecha)
        .order_by(Disponibilidad.hora)
        .all()
    )

    return jsonify({
        "fecha": fecha,
        "servicio_id": servicio_id,
        "servicio_nombre": servicio.nombre,
        "turnos_disponibles": [{"hora": t.hora, "disponible": t.esta_libre} for t in turnos],
    }), 200