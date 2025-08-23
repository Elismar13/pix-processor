import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class CreateAccounts1755961248000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'accounts',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'name',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'cpf_cnpj',
            type: 'varchar',
            length: '14',
            isNullable: false,
          },
          {
            name: 'ispb',
            type: 'varchar',
            length: '8',
            isNullable: false,
          },
          {
            name: 'agency',
            type: 'varchar',
            length: '10',
            isNullable: false,
          },
          {
            name: 'account_number',
            type: 'varchar',
            length: '20',
            isNullable: false,
          },
          {
            name: 'account_type',
            type: 'varchar',
            length: '4',
            isNullable: false,
          },
          {
            name: 'created_at',
            type: 'timestamp with time zone',
            default: 'now()',
          },
          {
            name: 'updated_at',
            type: 'timestamp with time zone',
            default: 'now()',
          },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'accounts',
      new TableForeignKey({
        columnNames: ['ispb'],
        referencedColumnNames: ['ispb'],
        referencedTableName: 'institutions',
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('accounts');
    if (table) {
      const foreignKey = table.foreignKeys.find(
        (fk) => fk.columnNames.indexOf('ispb') !== -1,
      );
      if (foreignKey) {
        await queryRunner.dropForeignKey('accounts', foreignKey);
      }
    }
    await queryRunner.dropTable('accounts');
  }
}
