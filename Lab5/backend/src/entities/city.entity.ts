import { Column, Entity, PrimaryColumn } from 'typeorm';

const numeric = { to: (v: number) => v, from: (v: string) => parseFloat(v) };

/** Довідник міст і координат (таблиця cities). */
@Entity('cities')
export class City {
  @PrimaryColumn({ type: 'text' })
  name: string;

  @Column({ type: 'text' })
  region: string;

  @Column({ type: 'numeric', precision: 9, scale: 6, transformer: numeric })
  lat: number;

  @Column({ type: 'numeric', precision: 9, scale: 6, transformer: numeric })
  lon: number;
}
