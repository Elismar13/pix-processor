import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class CreatePixMessages1755961248001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'pix_messages',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'ispb',
            type: 'varchar',
            length: '8',
            isNullable: false,
          },
          {
            name: 'end_to_end_id',
            type: 'varchar',
            length: '32',
            isNullable: false,
            isUnique: true,
          },
          {
            name: 'amount',
            type: 'decimal',
            precision: 15,
            scale: 2,
            isNullable: false,
          },
          {
            name: 'payer_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'receiver_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'free_field',
            type: 'varchar',
            length: '128',
            default: "''",
          },
          {
            name: 'tx_id',
            type: 'varchar',
            length: '18',
            isNullable: false,
          },
          {
            name: 'payment_datetime',
            type: 'timestamp with time zone',
            isNullable: false,
          },
          {
            name: 'is_processed',
            type: 'boolean',
            default: false,
          },
          {
            name: 'is_delivered',
            type: 'boolean',
            default: false,
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

    // Add foreign keys for accounts
    await queryRunner.createForeignKey(
      'pix_messages',
      new TableForeignKey({
        columnNames: ['payer_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'accounts',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'pix_messages',
      new TableForeignKey({
        columnNames: ['receiver_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'accounts',
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('pix_messages');
    if (table) {
      const foreignKeyPayer = table.foreignKeys.find(
        (fk) => fk.columnNames.indexOf('payer_id') !== -1,
      );
      const foreignKeyReceiver = table.foreignKeys.find(
        (fk) => fk.columnNames.indexOf('receiver_id') !== -1,
      );

      if (foreignKeyPayer)
        await queryRunner.dropForeignKey('pix_messages', foreignKeyPayer);

      if (foreignKeyReceiver)
        await queryRunner.dropForeignKey('pix_messages', foreignKeyReceiver);

      await queryRunner.dropTable('pix_messages');
    }
  }
}
