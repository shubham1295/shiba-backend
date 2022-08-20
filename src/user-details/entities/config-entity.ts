import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('config')
export class ConfigEntity {
  @PrimaryGeneratedColumn({
    name: 'config_id',
  })
  id: number;

  @Column()
  key: string;

  @Column()
  value: string;

  @Column({ nullable: true })
  discription: string;
}
