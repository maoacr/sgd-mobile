# SGD — Sistema de Gestión Deportiva

## What This Is
App mobile para gestionar canchas de fútbol sintético con múltiples modelos de negocio integrados alrededor del soccer.

## Modelos de Negocio
1. **Alquiler de canchas** — Cualquier usuario alquila en base a disponibilidad
2. **Equipos de fútbol** — Usuarios crean/manjan equipos, se unen a torneos
3. **Partidos open/pickup** — Equipos o jugadores buscan partidos preprogramados
4. **Torneos** — Liga y copa con seguimiento completo

---

## Roles

| Rol | Descripción | Se registra desde la app? |
|-----|-------------|--------------------------|
| `superadmin` | Único. Dueño del sistema. Control total. | No — manual |
| `admin_complejo` | Administra canchas propias. También es jugador. | Sí |
| `player` | Jugador por defecto. Crea equipos, alquila, se une. | Sí |

## Equipos → Relación N:M
- Un usuario puede ser **admin** de algunos equipos y **miembro** de otros
- Un equipo puede tener **múltiples admins**
- Nombre de equipo: **único globalmente**

## Auth
- Email/password (requiere: 1 número, 1 mayúscula, 1 minúscula, 1 special char)
- OAuth Google (opcional, no obligatorio)
- Verificación de email por link

## Perfil de Usuario (mínimo)
- Primer nombre, primer apellido, fecha de nacimiento, email

## Equipos
- Nombre único global
- Logo/escudo, lema opcional
- Email, teléfono/WhatsApp (default: teléfono del creador)
- Cancha local (opcional)
- Admins pueden invitar por email y/o WhatsApp (checkbox)

## Torneos
- Creados por superadmin
- Equipos postulan → pagan → pre-inscrito (opacidad 60%, badge)
- Superadmin envía link de invitación por email + WhatsApp
- Al activar link → equipo 100% inscribed en el torneo
- Tipos: league, knockout, groups, mixed

## Canchas (Venues)
- admin_complejo registra canchas con características
- Horario del complejo, paquetes (1h, 2h, promociones)
- Slots de disponibilidad por cancha
- Características: graderia, baños, parqueadero, tachas, tipo superficie, capacidad
- Galería de fotos + sistema de iconos

## Matches / Open Matches
- Partidos programados por superadmin
- Open matches: admin configura slot → equipos postulan
- Arbitros registran eventos (goles, tarjetas, cambios)
- Resultados finales

---

## Tech Stack
- **Frontend:** Expo SDK 54 + React Native 0.81 + React 19 + Expo Router
- **Backend:** Supabase (Auth + PostgreSQL + RLS)
- **Storage:** AsyncStorage + SecureStore para sesiones
- **Package manager:** pnpm

## Tipos Database
Generados automáticamente: `npx supabase gen types typescript --project-id <ref>`

---

## Fases

### Fase 1: Auth + Perfil + Equipos
- Registro público con rol player
- OAuth Google
- Verificación de email
- Perfil completo
- CRUD equipos (crear → admin automático)
- Nombre único global
- Múltiples admins por equipo
- Sistema de invitación (email, WhatsApp, o ambos)
- Team members: admin/miembro

### Fase 2: Canchas + Alquileres
- CRUD venues por admin_complejo
- Características + amenities + fotos
- Horario + paquetes + promociones
- Slots de disponibilidad
- Bookings (open, tournament, private)

### Fase 3: Torneos
- CRUD torneos por superadmin
- Postulación → pago → pre-inscrito → link → activate
- Fixture, grupos, fases
- Tabla de posiciones

### Fase 4: Matches + Open Matches
- Programación de partidos
- Open match signups
- Arbitros + eventos
- Resultados

### Fase 5: Dashboard + Notificaciones
- Dashboards por rol
- Push notifications
- Email notifications
- Historial completo

---

*Last updated: 2026-04-26*