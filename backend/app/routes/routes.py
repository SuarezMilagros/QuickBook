from flask import Blueprint
from app.controllers.auth_controller import register, login, perfil
from app.controllers.disponibilidad_controller import get_disponibilidad
from app.controllers.reservas_controller import crear_reserva, mis_reservas, get_reserva_por_codigo
from app.controllers.roles_comentarios_controller import asignar_operador, listar_operadores, agregar_comentario, listar_comentarios

api_bp = Blueprint("api_v1", __name__, url_prefix="/api/v1")

# Auth
api_bp.add_url_rule("/auth/register", view_func=register,  methods=["POST"])
api_bp.add_url_rule("/auth/login",    view_func=login,     methods=["POST"])
api_bp.add_url_rule("/auth/perfil",   view_func=perfil,    methods=["GET"])

# Disponibilidad
api_bp.add_url_rule("/disponibilidad", view_func=get_disponibilidad, methods=["GET"])

# Reservas
api_bp.add_url_rule("/reservas",                              view_func=crear_reserva,        methods=["POST"])
api_bp.add_url_rule("/reservas/mis-reservas",                 view_func=mis_reservas,         methods=["GET"])
api_bp.add_url_rule("/reservas/<string:codigo_verif>",        view_func=get_reserva_por_codigo, methods=["GET"])
api_bp.add_url_rule("/reservas/<int:id_reserva>/operador",    view_func=asignar_operador,     methods=["PATCH"])
api_bp.add_url_rule("/reservas/<int:id_reserva>/comentarios", view_func=agregar_comentario,   methods=["POST"])
api_bp.add_url_rule("/reservas/<int:id_reserva>/comentarios", view_func=listar_comentarios,   methods=["GET"], endpoint="listar_comentarios")

# Operadores
api_bp.add_url_rule("/operadores", view_func=listar_operadores, methods=["GET"])