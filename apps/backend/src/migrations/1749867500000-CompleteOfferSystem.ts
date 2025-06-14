import { MigrationInterface, QueryRunner } from "typeorm";

export class CompleteOfferSystem1749867500000 implements MigrationInterface {
    name = 'CompleteOfferSystem1749867500000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // 1. Agregar campos faltantes a service_request si no existen
        await queryRunner.query(`
            DO $$ 
            BEGIN 
                -- Agregar proposedDateTime si no existe
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                              WHERE table_name='service_request' AND column_name='proposedDateTime') THEN
                    ALTER TABLE "service_request" ADD "proposedDateTime" TIMESTAMP;
                END IF;

                -- Agregar clientPrice si no existe
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                              WHERE table_name='service_request' AND column_name='clientPrice') THEN
                    ALTER TABLE "service_request" ADD "clientPrice" DECIMAL(10,2);
                END IF;

                -- Agregar technicianPrice si no existe
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                              WHERE table_name='service_request' AND column_name='technicianPrice') THEN
                    ALTER TABLE "service_request" ADD "technicianPrice" DECIMAL(10,2);
                END IF;
            END $$;
        `);

        // 2. Agregar el estado 'offered' al enum si no existe
        await queryRunner.query(`
            DO $$ 
            BEGIN 
                IF NOT EXISTS (SELECT 1 FROM pg_enum e 
                              JOIN pg_type t ON e.enumtypid = t.oid 
                              WHERE t.typname = 'service_request_status_enum' AND e.enumlabel = 'offered') THEN
                    ALTER TYPE "service_request_status_enum" ADD VALUE 'offered';
                END IF;
            END $$;
        `);

        // 3. Crear tabla service_request_offer si no existe
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "service_request_offer" (
                "id" SERIAL NOT NULL,
                "serviceRequestId" integer NOT NULL,
                "technicianId" integer NOT NULL,
                "price" DECIMAL(10,2) NOT NULL,
                "comment" text,
                "status" "service_request_offer_status_enum" NOT NULL DEFAULT 'pending',
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "resolvedAt" TIMESTAMP,
                CONSTRAINT "PK_service_request_offer" PRIMARY KEY ("id")
            );
        `);

        // 4. Crear el enum para service_request_offer_status si no existe
        await queryRunner.query(`
            DO $$ 
            BEGIN 
                IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'service_request_offer_status_enum') THEN
                    CREATE TYPE "service_request_offer_status_enum" AS ENUM('pending', 'accepted', 'rejected');
                END IF;
            END $$;
        `);

        // 5. Agregar foreign keys si no existen
        await queryRunner.query(`
            DO $$ 
            BEGIN 
                IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                              WHERE constraint_name = 'FK_service_request_offer_serviceRequest') THEN
                    ALTER TABLE "service_request_offer" 
                    ADD CONSTRAINT "FK_service_request_offer_serviceRequest" 
                    FOREIGN KEY ("serviceRequestId") REFERENCES "service_request"("id") ON DELETE CASCADE;
                END IF;

                IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                              WHERE constraint_name = 'FK_service_request_offer_technician') THEN
                    ALTER TABLE "service_request_offer" 
                    ADD CONSTRAINT "FK_service_request_offer_technician" 
                    FOREIGN KEY ("technicianId") REFERENCES "identity"("id") ON DELETE CASCADE;
                END IF;
            END $$;
        `);

        // 6. Crear índices para optimizar consultas
        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "IDX_service_request_offer_serviceRequestId" 
            ON "service_request_offer" ("serviceRequestId");
        `);
        
        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "IDX_service_request_offer_technicianId" 
            ON "service_request_offer" ("technicianId");
        `);

        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "IDX_service_request_offer_status" 
            ON "service_request_offer" ("status");
        `);

        // 7. Actualizar registros existentes con valores por defecto (si es necesario)
        await queryRunner.query(`
            UPDATE "service_request" 
            SET "proposedDateTime" = "createdAt" + INTERVAL '1 day'
            WHERE "proposedDateTime" IS NULL;
        `);

        await queryRunner.query(`
            UPDATE "service_request" 
            SET "clientPrice" = 50000
            WHERE "clientPrice" IS NULL;
        `);

        // 8. Hacer los campos NOT NULL después de asignar valores por defecto
        await queryRunner.query(`
            ALTER TABLE "service_request" 
            ALTER COLUMN "proposedDateTime" SET NOT NULL;
        `);

        await queryRunner.query(`
            ALTER TABLE "service_request" 
            ALTER COLUMN "clientPrice" SET NOT NULL;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Revertir cambios en orden inverso
        await queryRunner.query(`ALTER TABLE "service_request" DROP COLUMN IF EXISTS "technicianPrice"`);
        await queryRunner.query(`ALTER TABLE "service_request" DROP COLUMN IF EXISTS "clientPrice"`);
        await queryRunner.query(`ALTER TABLE "service_request" DROP COLUMN IF EXISTS "proposedDateTime"`);
        
        await queryRunner.query(`DROP TABLE IF EXISTS "service_request_offer"`);
        await queryRunner.query(`DROP TYPE IF EXISTS "service_request_offer_status_enum"`);
        
        // Nota: No eliminamos el valor 'offered' del enum porque podría causar problemas
        // si hay registros existentes que lo usan
    }
}