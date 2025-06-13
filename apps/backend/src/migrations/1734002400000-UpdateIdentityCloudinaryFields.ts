import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateIdentityCloudinaryFields1734002400000 implements MigrationInterface {
    name = 'UpdateIdentityCloudinaryFields1734002400000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Agregar nuevas columnas para Cloudinary
        await queryRunner.query(`ALTER TABLE "identity" ADD "profilePhotoUrl" character varying`);
        await queryRunner.query(`ALTER TABLE "identity" ADD "profilePhotoPublicId" character varying`);
        
        // Migrar datos existentes si hay fotos de perfil locales
        await queryRunner.query(`
            UPDATE "identity" 
            SET "profilePhotoUrl" = 'http://localhost:3000/' || "profilePhotoPath"
            WHERE "profilePhotoPath" IS NOT NULL
        `);
        
        // Eliminar la columna antigua (opcional - comentado por seguridad)
        // await queryRunner.query(`ALTER TABLE "identity" DROP COLUMN "profilePhotoPath"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Restaurar columna antigua si se eliminó
        // await queryRunner.query(`ALTER TABLE "identity" ADD "profilePhotoPath" character varying`);
        
        // Eliminar nuevas columnas
        await queryRunner.query(`ALTER TABLE "identity" DROP COLUMN "profilePhotoPublicId"`);
        await queryRunner.query(`ALTER TABLE "identity" DROP COLUMN "profilePhotoUrl"`);
    }
}