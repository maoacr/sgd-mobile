# Fase 2: Canchas + Alquileres — Completada

## Estado: ✅ Completada (.pending DB migration apply)

## Fecha: 2026-04-28

## Tareas completadas

### Database
- [x] `005_venues_bookings.sql` - tablas venues, venue_amenities, venue_photos, venue_packages, venue_slots, bookings
- [x] `006_rls_venues_bookings.sql` - políticas RLS
- [x] Archivos simplificados para ejecución: `005a_venues_only.sql`, `006a_rls_venues_only.sql`

### Librerías
- [x] `lib/venues.ts` - queries para venues, venue_amenities, venue_photos, venue_packages, venue_slots
- [x] `lib/bookings.ts` - queries para bookings

### Admin (app/(admin)/)
- [x] `venues/index.tsx` - lista de canchas
- [x] `venues/new/index.tsx` - crear cancha
- [x] `venues/[id]/index.tsx` - detalle + eliminar
- [x] `venues/[id]/slots/index.tsx` - gestión de disponibilidad
- [x] `bookings/index.tsx` - gestionar reservas

### Player
- [x] `(tabs)/explore.tsx` - explorar canchas
- [x] `(player)/venues/[id]/index.tsx` - detalle + reservar
- [x] `(player)/bookings/index.tsx` - mis reservas

## Pending
- [ ] Verificar que las tablas yaExisten en Supabase
- [ ] Testear el flow completo

## Notas
- Las migraciones 005 y 006 ya были aplicadas (error: "relation venues already exists")
- No hace falta ejecutarlas de nuevo
- El schema de la DB ya soporta toda la funcionalidad