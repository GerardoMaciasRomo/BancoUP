# Guía: Subir Requerimientos a Jira — Banco UP

## 1. Crear el proyecto

1. Ve a [jira.atlassian.com](https://jira.atlassian.com) → **Crear proyecto**
2. Plantilla: **Scrum**
3. Nombre: `Banco UP`  |  Clave: `BUP`
4. Clic en **Crear**

---

## 2. Épicas (Epics)

Crea estas épicas primero:

| Clave | Épica |
|-------|-------|
| BUP-EP1 | Autenticación y Seguridad |
| BUP-EP2 | Transferencias Bancarias |
| BUP-EP3 | Historial de Movimientos |
| BUP-EP4 | Panel de Administrador |
| BUP-EP5 | Infraestructura y API |

---

## 3. Historias de Usuario

### Épica: Autenticación (BUP-EP1)

**BUP-1 — Inicio de sesión con correo y contraseña** `RF-01`
```
Como cliente del banco,
quiero iniciar sesión con mi correo y contraseña,
para acceder a mi cuenta de forma segura.

Criterios de aceptación:
- [ ] Correo debe contener "@" y dominio válido
- [ ] Contraseña correcta → redirige a dashboard
- [ ] Credenciales incorrectas → mensaje genérico de error
Story Points: 3 | Asignado: Gerardo Macías
```

**BUP-2 — Validación de contraseña segura** `RF-02`
```
Como sistema,
quiero que las contraseñas cumplan reglas de seguridad,
para proteger las cuentas de los usuarios.

Criterios de aceptación:
- [ ] Entre 5 y 8 caracteres
- [ ] Al menos 1 mayúscula, 1 número, 1 carácter especial
- [ ] Validación en frontend (tiempo real) y backend
- [ ] Mensaje de error específico por regla incumplida
Story Points: 2 | Asignado: Gerardo Macías
```

**BUP-3 — Bloqueo tras 3 intentos fallidos** `RF-03, RNF-04`
```
Como sistema de seguridad,
quiero bloquear automáticamente la cuenta tras 3 intentos fallidos,
para prevenir accesos no autorizados por fuerza bruta.

Criterios de aceptación:
- [ ] Contador de intentos por cuenta
- [ ] Al llegar a 3: is_blocked = true
- [ ] HTTP 403 con mensaje de cuenta bloqueada
- [ ] Solo admin puede desbloquear
Story Points: 3 | Asignado: Gerardo Macías
```

**BUP-4 — Registro de nuevos usuarios** `(implícito en alcance)`
```
Como nuevo cliente,
quiero crear una cuenta con nombre, correo y contraseña,
para usar la plataforma de transferencias.

Criterios de aceptación:
- [ ] Email único, validación de formato
- [ ] Contraseña con reglas RF-02
- [ ] Número de cuenta de 16 dígitos auto-generado
- [ ] Saldo inicial de $10,000 MXN (demo)
Story Points: 3 | Asignado: André Guillermo
```

---

### Épica: Transferencias (BUP-EP2)

**BUP-5 — Formulario de transferencia** `RF-05, RF-06`
```
Como cliente autenticado,
quiero transferir dinero ingresando cuenta destino, monto y concepto,
para enviar fondos de forma inmediata.

Criterios de aceptación:
- [ ] Campo cuenta destino (exactamente 16 dígitos)
- [ ] Campo monto (número decimal)
- [ ] Campo concepto (texto requerido)
- [ ] Pantalla de confirmación antes de ejecutar
Story Points: 5 | Asignado: André Guillermo
```

**BUP-6 — Validaciones de montos** `RF-07, RF-08, RF-09, RF-10`
```
Como sistema bancario,
quiero validar montos y saldos antes de ejecutar transferencias,
para garantizar la integridad del sistema.

Criterios de aceptación:
- [ ] Monto mínimo $500 MXN, máximo $7,000 MXN
- [ ] Saldo nunca negativo (no sobregiro)
- [ ] Cuenta destino no puede superar $50,000 MXN
- [ ] Error claro si alguna validación falla, sin mover fondos
Story Points: 5 | Asignado: Gerardo Macías
```

**BUP-7 — Confirmación de transferencia exitosa** `RF-11`
```
Como cliente,
quiero ver un mensaje de confirmación al completar una transferencia,
para saber que la operación fue exitosa.

Criterios de aceptación:
- [ ] Pantalla de éxito con monto y cuenta destino
- [ ] Botón "Nueva transferencia" y "Ir al inicio"
- [ ] Saldo actualizado en dashboard
Story Points: 2 | Asignado: Max Georges
```

---

### Épica: Historial (BUP-EP3)

**BUP-8 — Historial de movimientos** `RF-13, RF-14`
```
Como cliente,
quiero ver mi historial de movimientos del más reciente al más antiguo,
para llevar control de mis finanzas.

Criterios de aceptación:
- [ ] Lista ordenada descendente por fecha
- [ ] Muestra: tipo (enviado/recibido), monto, concepto, fecha
- [ ] Diferencia visual entre enviados (rojo) y recibidos (verde)
- [ ] Sin filtro por fechas en esta versión
Story Points: 3 | Asignado: Max Georges
```

---

### Épica: Administrador (BUP-EP4)

**BUP-9 — Desbloquear cuentas** `RF-15`
```
Como administrador,
quiero ver la lista de cuentas bloqueadas y desbloquearlas,
para restaurar el acceso a clientes legítimos.

Criterios de aceptación:
- [ ] Ruta /admin visible solo para rol "admin"
- [ ] Lista de usuarios con is_blocked = true
- [ ] Botón "Desbloquear" por cuenta
- [ ] Confirmación visual del desbloqueo
Story Points: 3 | Asignado: André Guillermo
```

**BUP-10 — Log de auditoría** `RF-16, RNF-03`
```
Como administrador,
quiero ver el registro de todos los intentos fallidos de login,
para detectar patrones de acceso sospechosos.

Criterios de aceptación:
- [ ] Tabla con: correo, motivo, fecha y hora
- [ ] Ordenado del más reciente al más antiguo
- [ ] Máximo 200 registros por página
Story Points: 2 | Asignado: Max Georges
```

---

### Épica: Infraestructura (BUP-EP5)

**BUP-11 — API REST con autenticación JWT** `RNF-07`
```
Como equipo de desarrollo,
quiero una API REST propia con autenticación JWT,
para conectar el frontend con la base de datos de forma segura.

Criterios de aceptación:
- [ ] Swagger UI en /docs
- [ ] JWT expira en 8 horas
- [ ] CORS configurado para localhost:5173
Story Points: 5 | Asignado: Gerardo Macías
```

---

## 4. Sprint sugerido

| Story | Puntos | Sprint |
|-------|--------|--------|
| BUP-1 Login | 3 | Sprint 1 |
| BUP-2 Validación pwd | 2 | Sprint 1 |
| BUP-3 Bloqueo | 3 | Sprint 1 |
| BUP-4 Registro | 3 | Sprint 1 |
| BUP-5 Formulario | 5 | Sprint 1 |
| BUP-6 Validaciones | 5 | Sprint 1 |
| BUP-11 API | 5 | Sprint 1 |
| BUP-7 Confirmación | 2 | Sprint 2 |
| BUP-8 Historial | 3 | Sprint 2 |
| BUP-9 Admin cuentas | 3 | Sprint 2 |
| BUP-10 Audit log | 2 | Sprint 2 |

---

## 5. Tip: vincular commits de GitHub con Jira

Instala **GitHub for Jira** en tu proyecto y menciona el ticket en cada commit:
```bash
git commit -m "BUP-6 feat: validate transfer amount limits (500-7000 MXN)"
```
El commit aparece automáticamente en la historia de Jira.
