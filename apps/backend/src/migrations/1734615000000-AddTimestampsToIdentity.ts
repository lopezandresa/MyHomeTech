import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTimestampsToIdentity1734615000000 implements MigrationInterface {
    name = 'AddTimestampsToIdentity1734615000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "identity" ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "identity" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "identity" DROP COLUMN "updatedAt"`);
        await queryRunner.query(`ALTER TABLE "identity" DROP COLUMN "createdAt"`);
    }
}