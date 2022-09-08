import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class UserDetail {
  @PrimaryGeneratedColumn({
    name: 'user_id',
  })
  id: number;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column()
  address: string;

  @Column()
  amount: string;

  @Column()
  tokenAmount: string;

  @Column()
  txnId: string;

  @Column()
  phone: string;

  @Column({
    nullable: true,
  })
  paymentMode: string;
}
