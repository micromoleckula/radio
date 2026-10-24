import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity("users")
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true, length: 254 })
  email!: string;

  @Column({ name: "password_hash", select: false })
  passwordHash!: string;
}
