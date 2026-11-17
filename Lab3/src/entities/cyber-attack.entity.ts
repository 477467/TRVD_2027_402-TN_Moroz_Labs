import { Column, Entity, PrimaryColumn } from 'typeorm';

/** Журнал кібератак (таблиця cyber_attacks). */
@Entity('cyber_attacks')
export class CyberAttack {
  @PrimaryColumn({ type: 'text' })
  id: string;

  @Column({ type: 'text' })
  type: string;

  @Column({ type: 'text' })
  target: string;

  @Column({ type: 'text' })
  severity: string;

  @Column({ type: 'date' })
  date: string;

  @Column({ type: 'text', nullable: true })
  city: string | null;
}
