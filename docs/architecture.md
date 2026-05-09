# Diagrama Arquitectónico — Banco UP

## Vista de 3 Capas

```
┌──────────────────────────────────────────────────────────────────┐
│                    CAPA DE PRESENTACIÓN                          │
│                                                                  │
│   ┌──────────────────────────────────────────────────────────┐   │
│   │              React 18 + Vite + Tailwind CSS              │   │
│   │                  Paleta BBVA: #003087 + blanco           │   │
│   │                                                          │   │
│   │  ┌──────────┐  ┌───────────┐  ┌──────────┐  ┌───────┐  │   │
│   │  │ Login.jsx│  │Dashboard  │  │Transfer  │  │History│  │   │
│   │  │(RF01-04) │  │.jsx       │  │.jsx      │  │.jsx   │  │   │
│   │  └──────────┘  └───────────┘  │(RF05-12) │  │(RF13) │  │   │
│   │                               └──────────┘  └───────┘  │   │
│   │  ┌─────────────┐  ┌──────────────┐  ┌──────────────┐   │   │
│   │  │ Admin.jsx   │  │AuthContext   │  │  api.js      │   │   │
│   │  │(RF15-16)    │  │(JWT state)   │  │(Axios+JWT)   │   │   │
│   │  └─────────────┘  └──────────────┘  └──────────────┘   │   │
│   └──────────────────────────────────────────────────────────┘   │
│                       │  HTTP/REST  (proxy Vite :5173 → :8000)   │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│                     CAPA DE NEGOCIO                              │
│                                                                  │
│   ┌──────────────────────────────────────────────────────────┐   │
│   │              FastAPI 0.115 + Uvicorn (Python 3.10)       │   │
│   │                                                          │   │
│   │  POST /api/auth/register   → Validar pw, crear user      │   │
│   │  POST /api/auth/login      → Verificar, bloquear si 3x   │   │
│   │  GET  /api/auth/me         → Perfil del usuario          │   │
│   │                                                          │   │
│   │  POST /api/transactions/   → Transferir (validar límites)│   │
│   │  GET  /api/transactions/   → Historial ordenado          │   │
│   │                                                          │   │
│   │  GET  /api/admin/blocked-users  → Lista cuentas bloq.    │   │
│   │  POST /api/admin/unblock/{id}   → Desbloquear (RF-15)    │   │
│   │  GET  /api/admin/audit-log      → Log intentos (RF-16)   │   │
│   │                                                          │   │
│   │  ┌─────────────────────────────────────────────────┐    │   │
│   │  │  Reglas de negocio (dependencies.py)            │    │   │
│   │  │  • Contraseña: 5-8 chars, Mayús, #, Especial   │    │   │
│   │  │  • JWT 8h de expiración                         │    │   │
│   │  │  • require_admin() para endpoints /admin/*      │    │   │
│   │  └─────────────────────────────────────────────────┘    │   │
│   └──────────────────────────────────────────────────────────┘   │
│                       │  SQLAlchemy ORM                          │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│                       CAPA DE DATOS                              │
│                                                                  │
│   ┌────────────────────────────────────────────────────────┐     │
│   │              SQLite 3 — bancoup.db                     │     │
│   │                                                        │     │
│   │   ┌──────────┐   1:N   ┌──────────────┐               │     │
│   │   │  users   ├────────►│ transactions │               │     │
│   │   │          │◄────────┤              │               │     │
│   │   └──────────┘   1:N   └──────────────┘               │     │
│   │                                                        │     │
│   │   ┌────────────┐                                       │     │
│   │   │ audit_logs │ (registros de intentos fallidos)      │     │
│   │   └────────────┘                                       │     │
│   └────────────────────────────────────────────────────────┘     │
└──────────────────────────────────────────────────────────────────┘
```

---

## Flujo de transferencia (RF-05 a RF-12)

```
Usuario                React/Transfer.jsx         FastAPI              SQLite
  │                           │                      │                    │
  │── Llena formulario ──────►│                      │                    │
  │   (cuenta, monto, concepto)                      │                    │
  │                           │── POST /transactions ►│                   │
  │                           │                      │── Busca receiver   │
  │                           │                      │   por account_num ►│
  │                           │                      │◄── receiver data ──│
  │                           │                      │                    │
  │                           │                      │ Validaciones:       │
  │                           │                      │ • 500 ≤ monto ≤ 7000│
  │                           │                      │ • sender.balance ≥ monto
  │                           │                      │ • receiver.balance + monto ≤ 50,000
  │                           │                      │                    │
  │                           │                      │── UPDATE balances ►│
  │                           │                      │── INSERT transaction►│
  │                           │◄── 201 success ───── │                    │
  │◄── Pantalla de éxito ─────│                      │                    │
```

---

## Flujo de bloqueo de cuenta (RF-03, RF-15, RF-16)

```
Intento fallido #1 → audit_logs INSERT + failed_attempts = 1
Intento fallido #2 → audit_logs INSERT + failed_attempts = 2
Intento fallido #3 → audit_logs INSERT + failed_attempts = 3 + is_blocked = TRUE
                           ↓
                   HTTP 403 "Cuenta bloqueada"
                           ↓
                  Admin ve la cuenta en /admin/blocked-users
                           ↓
                  Admin hace POST /admin/unblock/{id}
                           ↓
                  is_blocked = FALSE, failed_attempts = 0
```

---

## Stack completo

```
Frontend:  React 18  ·  Vite 5  ·  Tailwind CSS 3  ·  React Router 6  ·  Axios
Backend:   Python 3.10  ·  FastAPI 0.115  ·  Uvicorn  ·  SQLAlchemy 2  ·  python-jose  ·  passlib/bcrypt
Base datos: SQLite 3  (archivo local: bancoup.db)
Auth:      JWT (8h expiración)  +  bcrypt (factor 12)
```
