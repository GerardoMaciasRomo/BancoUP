# Banco UP — Sistema de Transferencias Bancarias

Proyecto Final — Ingeniería de Software | 8vo Semestre | Universidad Panamericana

Equipo: Gerardo Macías Romo · André Guillermo Raymundo Rodríguez · Max Georges Sainte Guzman

---

## Stack

| Capa | Tecnología |
|------|-----------|
| Frontend | React 18 + Vite + Tailwind CSS (estilo BBVA #003087) |
| Backend | FastAPI + Uvicorn (Python 3.10) |
| Base de Datos | SQLite + SQLAlchemy ORM |
| Auth | JWT (python-jose) + bcrypt |

---

## Ejecutar el proyecto

### Backend
```powershell
cd backend
pip install -r requirements.txt
python run.py
# → http://localhost:8000  |  Swagger: http://localhost:8000/docs
```

### Frontend (otra terminal)
```powershell
cd frontend
npm install
npm run dev
# → http://localhost:5173
```

### Cuentas de prueba (creadas automáticamente)

| Rol | Correo | Contraseña |
|-----|--------|-----------|
| Cliente | cliente1@bancoup.mx | Test1! |
| Cliente | cliente2@bancoup.mx | Test1! |
| Admin | admin@bancoup.mx | Admin1! |

---

## API Endpoints

| Método | Endpoint | Auth | RF |
|--------|----------|------|----|
| POST | /api/auth/register | — | — |
| POST | /api/auth/login | — | RF-01, RF-03 |
| GET | /api/auth/me | JWT | — |
| POST | /api/transactions/ | JWT | RF-05 a RF-12 |
| GET | /api/transactions/ | JWT | RF-13 |
| GET | /api/admin/blocked-users | JWT Admin | RF-15 |
| POST | /api/admin/unblock/{id} | JWT Admin | RF-15 |
| GET | /api/admin/audit-log | JWT Admin | RF-16 |

---

## Reglas de negocio implementadas

| Regla | Implementación |
|-------|----------------|
| Contraseña 5-8 chars + mayús + número + especial | `dependencies.py → validate_password()` |
| Bloqueo tras 3 intentos fallidos | `routers/auth.py → login()` |
| Monto mínimo $500, máximo $7,000 MXN | `schemas.py → TransferRequest.valid_amount` |
| Saldo máximo $50,000 MXN | `routers/transactions.py → MAX_BALANCE` |
| No sobregiro | `routers/transactions.py → sender balance check` |
| Log de auditoría | `models.AuditLog` insertado en cada fallo |

---

## Documentación

- [docs/er_diagram.md](docs/er_diagram.md) — Diagrama ER en Mermaid
- [docs/architecture.md](docs/architecture.md) — Diagrama arquitectónico
- [JIRA_GUIDE.md](JIRA_GUIDE.md) — Cómo crear el proyecto y stories en Jira
- [COMMITS.md](COMMITS.md) — Commits por integrante con mensajes listos para copiar
