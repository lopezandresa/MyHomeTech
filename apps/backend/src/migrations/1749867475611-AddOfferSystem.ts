import { MigrationInterface, QueryRunner } from "typeorm";

export class AddOfferSystem1749867475611 implements MigrationInterface {
    name = 'AddOfferSystem1749867475611'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "service_request" ADD "proposedDateTime" TIMESTAMP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "service_request" DROP COLUMN "proposedDateTime"`);
    }

}
