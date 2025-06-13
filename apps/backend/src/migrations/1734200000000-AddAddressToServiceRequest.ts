import { MigrationInterface, QueryRunner, TableColumn, TableForeignKey } from 'typeorm';

export class AddAddressToServiceRequest1734200000000 implements MigrationInterface {
    name = 'AddAddressToServiceRequest1734200000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Agregar columna addressId a la tabla service_request
        await queryRunner.addColumn('service_request', new TableColumn({
            name: 'addressId',
            type: 'int',
            isNullable: false,
        }));

        // Agregar foreign key constraint
        await queryRunner.createForeignKey('service_request', new TableForeignKey({
            columnNames: ['addressId'],
            referencedColumnNames: ['id'],
            referencedTableName: 'address',
            onDelete: 'CASCADE',
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Eliminar foreign key constraint
        const table = await queryRunner.getTable('service_request');
        const foreignKey = table?.foreignKeys.find(fk => fk.columnNames.indexOf('addressId') !== -1);
        if (foreignKey) {
            await queryRunner.dropForeignKey('service_request', foreignKey);
        }

        // Eliminar columna addressId
        await queryRunner.dropColumn('service_request', 'addressId');
    }
}