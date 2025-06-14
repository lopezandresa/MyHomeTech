import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveUpdatedAtFromRating1734601000000 implements MigrationInterface {
    name = 'RemoveUpdatedAtFromRating1734601000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "rating" DROP COLUMN "updatedAt"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "rating" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()`);
    }
}