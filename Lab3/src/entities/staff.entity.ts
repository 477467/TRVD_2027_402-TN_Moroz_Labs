import { Column, Entity, PrimaryColumn } from 'typeorm';

/** Особовий склад підрозділу (таблиця staff). */
@Entity('staff')
export class Staff {
  @PrimaryColumn({ type: 'text' })
  id: string;

  @Column({ type: 'text' })
  name: string;

  @Column({ type: 'text' })
  rank: string;

  @Column({ type: 'text' })
  position: string;

  @Column({ type: 'text' })
  department: string;

  @Column({ type: 'integer', default: 0 })
  cases: number;
}
