import pytest
from app import create_app
from app.models.models import db, Servicio, Disponibilidad


@pytest.fixture
def app():
    application = create_app("testing")
    with application.app_context():
        db.create_all()
        s = Servicio(nombre="Consulta", duracion_min=30)
        db.session.add(s)
        db.session.flush()
        db.session.add_all([
            Disponibilidad(id_servicio=s.id, fecha="2026-06-25", hora="09:00", esta_libre=True),
            Disponibilidad(id_servicio=s.id, fecha="2026-06-25", hora="10:00", esta_libre=False),
            Disponibilidad(id_servicio=s.id, fecha="2026-06-25", hora="11:00", esta_libre=True),
        ])
        db.session.commit()
        yield application
        db.drop_all()

@pytest.fixture
def client(app):
    return app.test_client()

PAYLOAD = {"nombre_cliente": "Milagros Suarez", "email": "milagros@email.com", "telefono": "1123456789", "servicio_id": 1, "fecha_hora": "2026-06-25T09:00:00"}

def test_get_disponibilidad(client):
    r = client.get("/api/v1/disponibilidad?fecha=2026-06-25&servicio_id=1")
    assert r.status_code == 200
    assert len(r.get_json()["turnos_disponibles"]) == 3

def test_cp01_crear_reserva_valida(client):
    r = client.post("/api/v1/reservas", json=PAYLOAD)
    assert r.status_code == 201
    assert r.get_json()["codigo_verificacion"].startswith("QK-")

def test_cp02_race_condition(client):
    client.post("/api/v1/reservas", json=PAYLOAD)
    r = client.post("/api/v1/reservas", json=PAYLOAD)
    assert r.status_code == 409

def test_cp03_email_invalido(client):
    r = client.post("/api/v1/reservas", json={**PAYLOAD, "email": "sin-arroba"})
    assert r.status_code == 400

def test_mis_reservas(client):
    client.post("/api/v1/reservas", json=PAYLOAD)
    r = client.get("/api/v1/reservas/mis-reservas?email=milagros@email.com")
    assert r.status_code == 200
    assert r.get_json()["total"] == 1