import { DataSource } from 'typeorm';
import { Identity } from '../identity/identity.entity';
import * as bcrypt from 'bcrypt';

export const seedAdmin = async (dataSource: DataSource) => {
  const identityRepo = dataSource.getRepository(Identity);

  console.log('Seeding admin user...');

  // Datos del administrador por defecto
  const adminEmail = 'admin@myhometech.com';
  const adminPassword = 'Admin123!';

  // Verificar si ya existe un administrador
  let adminUser = await identityRepo.findOne({ 
    where: { email: adminEmail } 
  });

  if (!adminUser) {
    // Hash de la contraseña
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(adminPassword, salt);

    // Crear el usuario administrador
    adminUser = new Identity();
    adminUser.firstName = 'Administrador';
    adminUser.firstLastName = 'Sistema';
    adminUser.email = adminEmail;
    adminUser.password = hashedPassword;
    adminUser.role = 'admin';
    adminUser.status = true;

    adminUser = await identityRepo.save(adminUser);
    console.log(`✅ Admin user created successfully:`);
    console.log(`   Email: ${adminEmail}`);
    console.log(`   Password: ${adminPassword}`);
    console.log(`   ⚠️  IMPORTANTE: Cambia la contraseña después del primer login`);
  } else {
    console.log(`ℹ️  Admin user already exists: ${adminEmail}`);
  }

  console.log('Admin seeding completed!');
};