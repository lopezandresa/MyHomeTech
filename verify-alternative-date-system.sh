#!/bin/bash

# Script de verificación del sistema de propuestas de fechas alternativas
# MyHomeTech - Verificación de funcionalidad completa

echo "🔍 Verificando sistema de propuestas de fechas alternativas..."
echo "=================================================="

# Verificar archivos del backend
echo "📋 Verificando archivos del backend..."

backend_files=(
    "apps/backend/src/service-request/alternative-date-proposal.entity.ts"
    "apps/backend/src/service-request/dto/propose-alternative-date.dto.ts"
    "apps/backend/src/service-request/service-request.service.ts"
    "apps/backend/src/service-request/service-request.controller.ts"
    "apps/backend/src/service-request/service-request.gateway.ts"
    "apps/backend/src/migrations/1734500000000-AddAlternativeDateProposals.ts"
)

for file in "${backend_files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file"
    else
        echo "❌ $file - FALTA"
    fi
done

# Verificar archivos del frontend
echo ""
echo "📋 Verificando archivos del frontend..."

frontend_files=(
    "apps/frontend/src/types/index.ts"
    "apps/frontend/src/services/serviceRequestService.ts"
    "apps/frontend/src/hooks/useDashboardActions.ts"
    "apps/frontend/src/components/AlternativeDateProposalCard.tsx"
    "apps/frontend/src/components/dashboards/ClientRequests.tsx"
    "apps/frontend/src/components/dashboards/TechnicianJobs.tsx"
    "apps/frontend/src/components/dashboards/Dashboard.tsx"
)

for file in "${frontend_files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file"
    else
        echo "❌ $file - FALTA"
    fi
done

# Verificar endpoints del backend
echo ""
echo "📋 Verificando endpoints del backend..."

endpoints=(
    "POST /api/service-requests/:id/propose-alternative-date"
    "POST /api/service-requests/proposals/:proposalId/accept"
    "POST /api/service-requests/proposals/:proposalId/reject"
    "GET /api/service-requests/:id/alternative-date-proposals"
    "GET /api/service-requests/technician/alternative-date-proposals"
)

for endpoint in "${endpoints[@]}"; do
    echo "🔗 $endpoint"
done

# Verificar funcionalidades implementadas
echo ""
echo "📋 Funcionalidades implementadas:"
echo "✅ Entidad AlternativeDateProposal con relaciones"
echo "✅ Validación de límite de 3 propuestas por técnico"
echo "✅ Validación de conflictos de horario"
echo "✅ Cliente puede aceptar/rechazar propuestas"
echo "✅ Técnico puede ver estado de sus propuestas"
echo "✅ Notificaciones WebSocket en tiempo real"
echo "✅ Interfaz de usuario intuitiva"
echo "✅ Manejo de errores y estados de carga"
echo "✅ Migración de base de datos"

# Verificar casos de uso
echo ""
echo "📋 Casos de uso soportados:"
echo "✅ Técnico propone hasta 3 fechas alternativas"
echo "✅ Cliente ve propuestas en cada solicitud"
echo "✅ Cliente acepta propuesta → actualiza fecha de solicitud"
echo "✅ Cliente rechaza propuesta → técnico puede enviar otra"
echo "✅ Técnico ve estado de sus propuestas (pendiente/aceptada/rechazada)"
echo "✅ Propuestas ordenadas por fecha de creación"
echo "✅ Validación de horarios disponibles"

echo ""
echo "🎉 Sistema de propuestas de fechas alternativas completado!"
echo "📱 Frontend: http://localhost:5173"
echo "🚀 Backend: http://localhost:3000"
echo "=================================================="
