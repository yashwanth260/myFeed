import { Role } from '@prisma/client';

export interface DemoUser {
  id: string;
  email: string;
  phone: string;
  fullName: string;
  role: Role;
  accountStatus: string;
}

export const DEMO_USERS: DemoUser[] = [
  {
    id: 'usr-admin-01',
    email: 'admin@feedo.dev',
    phone: '+919999900001',
    fullName: 'Platform Administrator',
    role: Role.ADMIN,
    accountStatus: 'ACTIVE',
  },
  {
    id: 'usr-customer-01',
    email: 'customer@feedo.dev',
    phone: '+919999900002',
    fullName: 'Dev Customer',
    role: Role.CUSTOMER,
    accountStatus: 'ACTIVE',
  },
  {
    id: 'usr-staff-01',
    email: 'kitchen@feedo.dev',
    phone: '+919999900003',
    fullName: 'Kitchen Lead',
    role: Role.RESTAURANT_STAFF,
    accountStatus: 'ACTIVE',
  },
  {
    id: 'usr-rider-01',
    email: 'rider@feedo.dev',
    phone: '+919999900004',
    fullName: 'Express Rider',
    role: Role.DELIVERY_PARTNER,
    accountStatus: 'ACTIVE',
  },
];
