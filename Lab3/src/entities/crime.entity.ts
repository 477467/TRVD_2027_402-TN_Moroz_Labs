import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

/** Довідник кваліфікацій правопорушень (таблиця crimes). */
@Entity('crimes')
export class Crime {
  @PrimaryGeneratedColumn('identity')
  id: number;

  @Column({ type: 'text', unique: true })
  title: string;
}
