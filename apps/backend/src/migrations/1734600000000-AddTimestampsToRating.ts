import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTimestampsToRating1734600000000 implements MigrationInterface {
    name = 'AddTimestampsToRating1734600000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "rating" ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "rating" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "rating" DROP COLUMN "updatedAt"`);
        await queryRunner.query(`ALTER TABLE "rating" DROP COLUMN "createdAt"`);
    }
}