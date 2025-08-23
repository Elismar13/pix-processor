import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateInstitutions1755961247964 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'institutions',
        columns: [
          {
            name: 'ispb',
            type: 'varchar',
            length: '8',
            isNullable: false,
            isPrimary: true,
          },
          {
            name: 'name',
            type: 'varchar',
            length: '50',
            isNullable: true,
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
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('institutions');
  }
}
