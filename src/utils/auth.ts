import { Teacher } from '../types';

// Hardcoded teacher credentials
export const TEACHERS: Teacher[] = [
  {
    id: '001',
    name: 'Kajal',
    username: 'kajal_teacher',
    password: 'Kajal@12344',
    subject: 'All Subjects',
    upiId: 'MSSHREEACADEMY.eazypay@icici'
  },
  {
    id: '002',
    name: 'Dipali',
    username: 'dipali_teacher',
    password: 'Dipali@12345',
    subject: 'All Subjects',
    upiId: 'MSSHREEACADEMY.eazypay@icici'
  },
  {
    id: '003',
    name: 'Varsha',
    username: 'varsha_teacher',
    password: 'Varsha@12345',
    subject: 'All Subjects',
    upiId: 'MSSHREEACADEMY.eazypay@icici'
  }
];

export const authenticateTeacher = (username: string, password: string): Teacher | null => {
  return TEACHERS.find(teacher =>
    teacher.username === username && teacher.password === password
  ) || null;
};

export const getTeacherById = (id: string): Teacher | undefined => {
  return TEACHERS.find(teacher => teacher.id === id);
};