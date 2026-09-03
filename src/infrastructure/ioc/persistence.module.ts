import { Module, Global } from '@nestjs/common';
import Database from 'better-sqlite3';
import { createSqliteDatabase } from '../persistence/sqlite/sqlite-connection.factory';
import { SqliteAuditRepository } from '../persistence/sqlite/sqlite-audit.repository';
import { SqliteFindingRepository } from '../persistence/sqlite/sqlite-finding.repository';
import { SqliteRemediationRepository } from '../persistence/sqlite/sqlite-remediation.repository';
import { AUDIT_REPOSITORY_PORT } from '../../application/ports/audit-repository.port';
import { FINDING_REPOSITORY_PORT } from '../../application/ports/finding-repository.port';
import { REMEDIATION_REPOSITORY_PORT } from '../../application/ports/remediation-repository.port';
import { envConfig } from '../../config/env.config';

export const SQLITE_DB_TOKEN = Symbol('SQLITE_DB_TOKEN');

@Global()
@Module({
  providers: [
    {
      provide: SQLITE_DB_TOKEN,
      useFactory: (): Database.Database => {
        const dbPath = process.env.NODE_ENV === 'test' ? ':memory:' : (envConfig.DATABASE_PATH || 'data/a11yfix.sqlite');
        return createSqliteDatabase(dbPath);
      },
    },
    {
      provide: AUDIT_REPOSITORY_PORT,
      useFactory: (db: Database.Database): SqliteAuditRepository => {
        return new SqliteAuditRepository(db);
      },
      inject: [SQLITE_DB_TOKEN],
    },
    {
      provide: FINDING_REPOSITORY_PORT,
      useFactory: (db: Database.Database): SqliteFindingRepository => {
        return new SqliteFindingRepository(db);
      },
      inject: [SQLITE_DB_TOKEN],
    },
    {
      provide: REMEDIATION_REPOSITORY_PORT,
      useFactory: (db: Database.Database): SqliteRemediationRepository => {
        return new SqliteRemediationRepository(db);
      },
      inject: [SQLITE_DB_TOKEN],
    },
  ],
  exports: [SQLITE_DB_TOKEN, AUDIT_REPOSITORY_PORT, FINDING_REPOSITORY_PORT, REMEDIATION_REPOSITORY_PORT],
})
export class PersistenceModule {}
