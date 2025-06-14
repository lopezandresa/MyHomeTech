import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class AddAlternativeDateProposals1734500000000 implements MigrationInterface {
  name = 'AddAlternativeDateProposals1734500000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Crear tabla para propuestas de fechas alternativas
    await queryRunner.createTable(
      new Table({
        name: 'alternative_date_proposal',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'serviceRequestId',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'technicianId',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'proposedDateTime',
            type: 'timestamp',
            isNullable: false,
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['pending', 'accepted', 'rejected'],
            default: "'pending'",
          },
          {
            name: 'comment',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'resolvedAt',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'proposalCount',
            type: 'int',
            default: 1,
          },
        ],
        foreignKeys: [
          {
            columnNames: ['serviceRequestId'],
            referencedTableName: 'service_request',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
          {
            columnNames: ['technicianId'],
            referencedTableName: 'identity',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
        ],
      }),
      true
    );    // Crear índices para optimizar consultas
    await queryRunner.createIndex(
      'alternative_date_proposal',
      new TableIndex({
        name: 'IDX_alternative_date_proposal_service_request',
        columnNames: ['serviceRequestId']
      })
    );

    await queryRunner.createIndex(
      'alternative_date_proposal',
      new TableIndex({
        name: 'IDX_alternative_date_proposal_technician',
        columnNames: ['technicianId']
      })
    );

    await queryRunner.createIndex(
      'alternative_date_proposal',
      new TableIndex({
        name: 'IDX_alternative_date_proposal_status',
        columnNames: ['status']
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Eliminar índices
    await queryRunner.dropIndex('alternative_date_proposal', 'IDX_alternative_date_proposal_service_request');
    await queryRunner.dropIndex('alternative_date_proposal', 'IDX_alternative_date_proposal_technician');
    await queryRunner.dropIndex('alternative_date_proposal', 'IDX_alternative_date_proposal_status');

    // Eliminar tabla
    await queryRunner.dropTable('alternative_date_proposal');
  }
}
