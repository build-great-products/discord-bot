import type { Kysely } from 'kysely'

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .createTable('guild')
    .addColumn('id', 'text', (col) => col.primaryKey())
    .addColumn('rough_workspace_id', 'text', (col) => col.notNull())
    .addColumn('rough_workspace_public_id', 'text', (col) => col.notNull())
    .addColumn('name', 'text', (col) => col.notNull())
    .addColumn('api_token', 'text', (col) => col.notNull())
    .addColumn('created_at', 'integer', (col) => col.notNull())
    .addColumn('updated_at', 'integer', (col) => col.notNull())
    .execute()

  await db.schema
    .createTable('guild_user')
    .addColumn('guild_id', 'text', (col) => col.notNull())
    .addColumn('user_id', 'text', (col) => col.notNull())
    .addColumn('rough_user_id', 'text', (col) => col.notNull())
    .addColumn('name', 'text', (col) => col.notNull())
    .addColumn('created_at', 'integer', (col) => col.notNull())
    .addColumn('updated_at', 'integer', (col) => col.notNull())
    .addPrimaryKeyConstraint('guild_user:primaryKey(guild_id,user_id)', [
      'guild_id',
      'user_id',
    ])
    .addForeignKeyConstraint(
      'guild_user:foreignKey(guid_id,guild.id)',
      ['guild_id'],
      'guild',
      ['id'],
    )
    .execute()
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropTable('guild_user').execute()
  await db.schema.dropTable('guild').execute()
}
