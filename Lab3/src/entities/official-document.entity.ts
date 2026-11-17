import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { Person } from './person.entity';
import { Staff } from './staff.entity';

/** Службовий документ (таблиця documents). */
@Entity('documents')
export class OfficialDocument {
  @PrimaryColumn({ type: 'text' })
  id: string;

  @Column({ type: 'text' })
  title: string;

  @Column({ type: 'text' })
  type: string;

  @Column({ type: 'text' })
  classification: string;

  @Column({ type: 'text', nullable: true })
  content: string | null;

  @Column({ name: 'person_id', type: 'text', nullable: true })
  personId: string | null;

  @ManyToOne(() => Person, { nullable: true })
  @JoinColumn({ name: 'person_id' })
  person?: Person;

  @Column({ name: 'author_id', type: 'text', nullable: true })
  authorId: string | null;

  @ManyToOne(() => Staff, { nullable: true })
  @JoinColumn({ name: 'author_id' })
  author?: Staff;
}
