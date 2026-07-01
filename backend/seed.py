"""
Script de datos iniciales (seed) para QuickBook.
Crea un servicio de ejemplo y turnos disponibles para los próximos 14 días.

Uso:
    python seed.py
"""
from datetime import datetime, timedelta

from app import create_app
from app.models.models import db, Servicio, Disponibilidad

HORAS = ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"]
DIAS_A_GENERAR = 14

app = create_app()

with app.app_context():
    db.create_all()

    servicio = Servicio.query.filter_by(nombre="Consulta general").first()
    if not servicio:
        servicio = Servicio(nombre="Consulta general", duracion_min=30)
        db.session.add(servicio)
        db.session.flush()
        print(f"Servicio creado: {servicio.nombre} (id={servicio.id})")
    else:
        print(f"Servicio ya existente: {servicio.nombre} (id={servicio.id})")

    hoy = datetime.now().date()
    creados = 0
    for i in range(DIAS_A_GENERAR):
        fecha = hoy + timedelta(days=i)
        if fecha.weekday() == 6:  # domingo: sin turnos
            continue
        fecha_str = fecha.strftime("%Y-%m-%d")
        for hora in HORAS:
            existe = Disponibilidad.query.filter_by(
                id_servicio=servicio.id, fecha=fecha_str, hora=hora
            ).first()
            if not existe:
                db.session.add(Disponibilidad(
                    id_servicio=servicio.id, fecha=fecha_str, hora=hora, esta_libre=True
                ))
                creados += 1

    db.session.commit()
    print(f"Turnos de disponibilidad creados: {creados}")
    print("Listo.")
