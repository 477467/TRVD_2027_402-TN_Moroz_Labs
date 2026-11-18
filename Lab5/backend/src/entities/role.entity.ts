import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

/** Роль користувача (таблиця roles): admin або operator. */
@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn('identity')
  id: number;

  @Column({ type: 'text', unique: true })
  name: string;
}
