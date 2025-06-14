import { DataSource } from 'typeorm';
import { ServiceRequestType } from '../service-request-type/service-request-type.entity';

export async function seedServiceRequestTypes(dataSource: DataSource) {
  const serviceRequestTypeRepo = dataSource.getRepository(ServiceRequestType);

  // Verificar si ya existen datos
  const existingCount = await serviceRequestTypeRepo.count();
  if (existingCount > 0) {
    console.log('Service request types already exist, skipping seed...');
    return;
  }

  const serviceRequestTypes = [
    {
      name: 'repair',
      displayName: 'Reparación',
      description: 'Arreglar un electrodoméstico que no funciona correctamente',
      icon: '🔨',
      sortOrder: 1,
      isActive: true,
    },
    {
      name: 'maintenance',
      displayName: 'Mantenimiento',
      description: 'Mantenimiento preventivo para mantener el equipo en buen estado',
      icon: '🔧',
      sortOrder: 2,
      isActive: true,
    },
    {
      name: 'installation',
      displayName: 'Instalación',
      description: 'Instalar un nuevo electrodoméstico o equipo',
      icon: '⚡',
      sortOrder: 3,
      isActive: true,
    },
  ];

  console.log('Seeding service request types...');
  
  for (const typeData of serviceRequestTypes) {
    const serviceRequestType = serviceRequestTypeRepo.create(typeData);
    await serviceRequestTypeRepo.save(serviceRequestType);
    console.log(`✓ Created service request type: ${typeData.displayName}`);
  }
  
  console.log('Service request types seeded successfully!');
}