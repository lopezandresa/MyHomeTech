import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm'

export class AddExpiredAtToServiceRequest1734300000000 implements MigrationInterface {
  name = 'AddExpiredAtToServiceRequest1734300000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'service_request',
      new TableColumn({
        name: 'expiredAt',
        type: 'timestamp',
        isNullable: true,
      })
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('service_request', 'expiredAt')
  }
}