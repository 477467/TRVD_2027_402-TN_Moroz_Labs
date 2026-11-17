import {
  Column, CreateDateColumn, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, PrimaryColumn,
} from 'typeorm';
import { City } from './city.entity';
import { Crime } from './crime.entity';

/** Обліковий запис особи (таблиця persons). */
@Entity('persons')
export class Person {
  @PrimaryColumn({ type: 'text' })
  id: string;

  @Column({ type: 'text' })
  name: string;

  @Column({ type: 'text' })
  surname: string;

  @Column({ type: 'text' })
  dob: string;

  @Column({ type: 'text', nullable: true })
  address: string | null;

  @Column({ type: 'text' })
  city: string;

  @ManyToOne(() => City, { nullable: false })
  @JoinColumn({ name: 'city', referencedColumnName: 'name' })
  cityRef?: City;

  @Column({ type: 'text' })
  status: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  /** Зв’язок M:N через таблицю person_crimes. */
  @ManyToMany(() => Crime, { eager: true })
  @JoinTable({
    name: 'person_crimes',
    joinColumn: { name: 'person_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'crime_id', referencedColumnName: 'id' },
  })
  crimes: Crime[];
}
