import { Column, CreateDateColumn, Entity, PrimaryColumn } from 'typeorm';

/** Виданий refresh-токен (таблиця refresh_tokens): зберігається лише його SHA-256 хеш. */
@Entity('refresh_tokens')
export class RefreshToken {
  @PrimaryColumn({ type: 'uuid' })
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ name: 'token_hash', type: 'text' })
  tokenHash: string;

  @Column({ name: 'expires_at', type: 'timestamptz' })
  expiresAt: Date;

  @Column({ type: 'boolean', default: false })
  revoked: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
