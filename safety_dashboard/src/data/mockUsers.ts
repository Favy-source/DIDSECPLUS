// Mock users for super-admin UI
export type UserRole = 'citizen' | 'admin' | 'police';

export type MockUser = {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  location?: string;
  device?: string;
  ticketIds?: string[];
  created_at?: string;
};

const now = Date.now();
const days = (n: number) => new Date(now - n * 86400000).toISOString();

const mockUsers: MockUser[] = [
  {
    id: 'u1',
    username: 'jdoe',
    name: 'John Doe',
    role: 'citizen',
    location: 'Lagos, Ikeja',
    device: 'Android',
    ticketIds: ['t1'],
    created_at: days(1),
  },
  {
    id: 'u2',
    username: 'asmith',
    name: 'Alice Smith',
    role: 'admin',
    location: 'Abuja, Garki',
    device: 'Web',
    ticketIds: ['t2','t3'],
    created_at: days(10),
  },
  {
    id: 'u3',
    username: 'okam',
    name: 'Okam Uche',
    role: 'police',
    location: 'Rivers, Port Harcourt',
    device: 'iOS',
    ticketIds: [],
    created_at: days(5),
  },
  {
    id: 'u4',
    username: 'mbalogun',
    name: 'Mary Balogun',
    role: 'citizen',
    location: 'Lagos, Surulere',
    device: 'Android',
    ticketIds: ['t4'],
    created_at: days(3),
  },
  {
    id: 'u5',
    username: 'sadmin',
    name: 'System Admin',
    role: 'admin',
    location: 'Lagos, Victoria Island',
    device: 'Web',
    ticketIds: [],
    created_at: days(30),
  },
  {
    id: 'u6',
    username: 'police01',
    name: 'Inspector K',
    role: 'police',
    location: 'Kaduna, Kaduna South',
    device: 'Android',
    ticketIds: ['t5'],
    created_at: days(2),
  },
  {
    id: 'u7',
    username: 'citizen99',
    name: 'Grace N',
    role: 'citizen',
    location: 'Enugu, Enugu',
    device: 'iOS',
    ticketIds: [],
    created_at: days(7),
  },
];

export default mockUsers;
