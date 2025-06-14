# Test del Sistema de Propuestas de Fechas Alternativas - MyHomeTech

## Flujo Completo de Prueba

### 1. Crear Solicitud de Servicio (Cliente)
- Login como cliente
- Crear nueva solicitud de servicio
- Verificar que aparezca en el dashboard

### 2. Proponer Fecha Alternativa (Técnico)
- Login como técnico
- Ver solicitudes disponibles
- Proponer hasta 3 fechas alternativas para una solicitud
- Verificar que se guarden correctamente

### 3. Gestionar Propuestas (Cliente)
- Login como cliente
- Ver propuestas recibidas en cada solicitud
- Opciones disponibles:
  - ✅ **Aceptar propuesta**: Actualiza fecha de la solicitud
  - ❌ **Rechazar propuesta**: Permite al técnico enviar otra
- Verificar notificaciones en tiempo real

### 4. Límites y Validaciones
- Técnico puede proponer máximo 3 fechas por solicitud
- Cliente puede aceptar/rechazar propuestas
- Solo propuestas pendientes se pueden gestionar
- Validación de conflictos de horario

## Funcionalidades Implementadas ✅

### Backend
- [x] Entidad `AlternativeDateProposal`
- [x] Endpoints para proponer fechas
- [x] Endpoints para aceptar/rechazar propuestas
- [x] Validaciones de límites y conflictos
- [x] Notificaciones WebSocket
- [x] Migración de base de datos

### Frontend
- [x] Componente `AlternativeDateProposalCard`
- [x] Integración en `ClientRequests`
- [x] Handlers en `useDashboardActions`
- [x] Servicios API actualizados
- [x] Tipos TypeScript definidos

## Casos de Prueba

### Caso 1: Propuesta Aceptada
1. Cliente crea solicitud
2. Técnico propone fecha alternativa
3. Cliente acepta propuesta
4. Solicitud se actualiza con nueva fecha
5. Otras propuestas se marcan como rechazadas automáticamente

### Caso 2: Propuesta Rechazada
1. Cliente rechaza propuesta
2. Técnico puede enviar otra propuesta (hasta 3 total)
3. Cliente ve todas las propuestas con sus estados

### Caso 3: Límite de Propuestas
1. Técnico envía 3 propuestas
2. Sistema impide enviar más propuestas
3. Cliente puede gestionar las 3 propuestas

## Estructura de la Propuesta

```typescript
interface AlternativeDateProposal {
  id: number
  serviceRequestId: number
  technicianId: number
  proposedDateTime: string
  status: 'pending' | 'accepted' | 'rejected'
  comment?: string
  proposalCount: number
  createdAt: string
  resolvedAt?: string
  technician: {
    id: number
    firstName: string
    firstLastName: string
  }
}
```

## URLs de Prueba

- Frontend: http://localhost:5173
- Backend API: http://localhost:3000/api
- WebSocket: ws://localhost:3000/socket.io

## Comandos de Desarrollo

```bash
# Backend
cd apps/backend
npm run start:dev

# Frontend  
cd apps/frontend
npm run dev
```

## Próximos Pasos

1. **Interfaz para Técnicos**: Agregar vista para que los técnicos vean el estado de sus propuestas
2. **Notificaciones Push**: Implementar notificaciones push para móviles
3. **Historial de Propuestas**: Agregar página de historial de propuestas
4. **Métricas**: Agregar métricas de aceptación/rechazo de propuestas
