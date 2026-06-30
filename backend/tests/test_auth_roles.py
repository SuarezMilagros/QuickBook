import pytest
from app import create_app
from app.models.models import db, Usuario, Servicio, Reserva, Rol
from datetime import datetime


@pytest.fixture
def app():
    application = create_app("testing")
    with application.app_context():
        db.create_all()
        admin = Usuario(nombre="Admin", email="admin@qb.com", rol=Rol.ADMIN)
        admin.set_password("admin123")
        op = Usuario(nombre="Operador", email="op@qb.com", rol=Rol.OPERADOR)
        op.set_password("op123456")
        cliente = Usuario(nombre="Cliente", email="cli@qb.com", rol=Rol.CLIENTE)
        cliente.set_password("cli12345")
        db.session.add_all([admin, op, cliente])
        db.session.flush()
        s = Servicio(nombre="Consulta", duracion_min=30)
        db.session.add(s)
        db.session.flush()
        r = Reserva(id_usuario=cliente.id, id_servicio=s.id, id_operador=op.id, fecha_hora=datetime(2026, 6, 25, 9, 0), estado="Confirmada", codigo_verif="QK-TEST-1")
        db.session.add(r)
        db.session.commit()
        yield application
        db.drop_all()

@pytest.fixture
def client(app):
    return app.test_client()

def login(client, email, password):
    return client.post("/api/v1/auth/login", json={"email": email, "password": password}).get_json().get("token")

def test_tc05_password_corta(client):
    r = client.post("/api/v1/auth/register", json={"nombre": "Test", "email": "t@t.com", "password": "abc"})
    assert r.status_code == 400

def test_tc06_email_invalido(client):
    r = client.post("/api/v1/auth/register", json={"nombre": "Test", "email": "doble@@at.com", "password": "pass123"})
    assert r.status_code == 400

def test_tc07_cliente_no_puede_asignar(client):
    token = login(client, "cli@qb.com", "cli12345")
    r = client.patch("/api/v1/reservas/1/operador", json={"id_operador": 2}, headers={"Authorization": f"Bearer {token}"})
    assert r.status_code == 403

def test_tc08_comentario_vacio(client):
    token = login(client, "op@qb.com", "op123456")
    r = client.post("/api/v1/reservas/1/comentarios", json={"texto": ""}, headers={"Authorization": f"Bearer {token}"})
    assert r.status_code == 400

def test_login_exitoso(client):
    r = client.post("/api/v1/auth/login", json={"email": "admin@qb.com", "password": "admin123"})
    assert r.status_code == 200
    assert "token" in r.get_json()

def test_ruta_sin_token(client):
    r = client.get("/api/v1/auth/perfil")
    assert r.status_code == 401