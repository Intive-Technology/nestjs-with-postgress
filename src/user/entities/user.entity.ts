import { Column, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  @Unique('email', ['email'])
  email: string;

  @Column({ select: false })
  password?: string;

  @Column({ default: true })
  isActive: boolean;
}
