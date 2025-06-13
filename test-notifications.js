// Script de prueba para verificar notificaciones en tiempo real
// Ejecutar este script en la consola del navegador cuando esté logueado como técnico

console.log('🧪 Iniciando pruebas de notificaciones en tiempo real...');

// Verificar si el WebSocket está conectado
const checkWebSocketConnection = () => {
  console.log('📡 Verificando conexión WebSocket...');
  
  // Verificar si window.webSocketService existe (puede estar disponible globalmente)
  if (window.webSocketService) {
    console.log('✅ WebSocket service encontrado');
    console.log('Estado de conexión:', window.webSocketService.isConnected());
  } else {
    console.log('⚠️ WebSocket service no encontrado globalmente');
  }
  
  // Verificar elementos del DOM relacionados con notificaciones
  const notificationElements = document.querySelectorAll('[class*="notification"]');
  console.log(`📊 Elementos de notificación encontrados: ${notificationElements.length}`);
  
  // Verificar estado de conexión en el header
  const connectionIndicator = document.querySelector('[class*="text-green-600"], [class*="text-red-600"], [class*="text-yellow-600"]');
  if (connectionIndicator) {
    console.log('🔗 Indicador de conexión encontrado:', connectionIndicator.textContent);
  }
};

// Verificar permisos de notificación
const checkNotificationPermissions = () => {
  console.log('🔔 Verificando permisos de notificación...');
  
  if ('Notification' in window) {
    console.log('✅ API de notificaciones soportada');
    console.log('Permiso actual:', Notification.permission);
    
    if (Notification.permission === 'default') {
      console.log('⚠️ Solicitando permisos de notificación...');
      Notification.requestPermission().then(permission => {
        console.log('Nuevo permiso:', permission);
      });
    }
  } else {
    console.log('❌ API de notificaciones no soportada');
  }
};

// Simular una notificación de prueba
const testNotification = () => {
  console.log('🧪 Enviando notificación de prueba...');
  
  if ('Notification' in window && Notification.permission === 'granted') {
    const notification = new Notification('Prueba de Notificación MyHomeTech', {
      body: 'Esta es una notificación de prueba para verificar que el sistema funciona correctamente.',
      icon: '/favicon.ico',
      tag: 'test-notification'
    });
    
    notification.onclick = () => {
      console.log('✅ Notificación clickeada');
      window.focus();
      notification.close();
    };
    
    setTimeout(() => {
      notification.close();
      console.log('🔕 Notificación de prueba cerrada automáticamente');
    }, 5000);
    
    console.log('✅ Notificación de prueba enviada');
  } else {
    console.log('❌ No se pueden enviar notificaciones (permisos no concedidos)');
  }
};

// Ejecutar todas las pruebas
const runAllTests = () => {
  console.log('🚀 Ejecutando todas las pruebas...');
  checkWebSocketConnection();
  checkNotificationPermissions();
  
  setTimeout(() => {
    testNotification();
  }, 2000);
  
  console.log('✅ Pruebas completadas. Revisa los logs anteriores para ver los resultados.');
  console.log('💡 Tip: Mantén la consola abierta para ver logs de conexión WebSocket en tiempo real.');
};

// Ejecutar automáticamente
runAllTests();

// Exponer funciones para uso manual
window.testMyHomeTechNotifications = {
  checkConnection: checkWebSocketConnection,
  checkPermissions: checkNotificationPermissions,
  testNotification: testNotification,
  runAll: runAllTests
};

console.log('🎯 Funciones de prueba disponibles en window.testMyHomeTechNotifications');
