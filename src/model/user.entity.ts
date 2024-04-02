import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'mobileNumber', length: 255 })
  mobileNumber: string;

  @Column({ name: 'botID', length: 255 })
  botID: string;

  @Column({ name: 'user_context', length: 255 })
  userContext: string;

  @Column({ name: 'button_response', length: 255 })
  buttonResponse: string;

  @Column({ name: 'language', type: 'text' })
  language: string;
}
