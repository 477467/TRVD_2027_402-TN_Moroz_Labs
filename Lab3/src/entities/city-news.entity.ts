import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

/** Регіональні зведення подій (таблиця city_news). */
@Entity('city_news')
export class CityNews {
  @PrimaryGeneratedColumn('identity', { type: 'bigint' })
  id: string;

  @Column({ type: 'text' })
  city: string;

  @Column({ type: 'date' })
  date: string;

  @Column({ type: 'text' })
  headline: string;
}
