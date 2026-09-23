export type ViewMode = 'rooms' | 'labs' | 'staff';

export type ConflictType = 'double_booking' | 'capacity' | 'staff_overlap' | 'equipment' | 'student_group' | 'room_type' | 'closure';

export interface Conflict {
  id: string;
  type: ConflictType;
  severity: 'hard' | 'soft';
  description: string;
  cell: { row: string; day: number; slot: number };
  alternatives: Alternative[];
}

export interface Alternative {
  id: string;
  score: number;
  day: number;
  slot: number;
  room: string;
  reasons: string[];
}

export interface Session {
  id: string;
  code: string;
  name: string;
  staff: string;
  group: string;
  capacity: number;
  enrolled: number;
  color: string;
  conflictId?: string;
  slot?: number;      // start time-slot index (0 = 08:00), when synced from backend
  duration?: number;  // number of consecutive slots
  academic_year?: number; // 1-4
  major?: 'CS' | 'IT' | 'AI' | 'DS';
}

export const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
export const FULL_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

export const TIME_SLOTS = [
  '08:00', '09:00', '10:00', '11:00', '12:00',
  '13:00', '14:00', '15:00', '16:00', '17:00',
];

export const ROOMS = ['LT-101', 'LT-102', 'LT-201', 'LT-202', 'SEM-A', 'SEM-B', 'SEM-C', 'SEM-D', 'SEM-E', 'Studio-A'];
export const LABS = ['CS-Lab1', 'CS-Lab2', 'CS-Lab3', 'Phys-Lab', 'Phys-Lab2', 'Chem-Lab', 'Chem-Lab B', 'BioLab', 'BioLab2', 'Eng-Workshop'];
export const STAFF = ['Dr. Chen Wei', 'Prof. Amara Nwosu', 'Dr. Lena Kovač', 'Dr. Raj Patel', 'Prof. Sara Johansson', 'Dr. Marcus Bell', 'Dr. Ahmed Hassan', 'Dr. Fatma Ali', 'Prof. John Smith', 'Dr. Mona Khalil', 'Eng. Omar Farouk', 'Dr. Heba Mostafa', 'Prof. Karim Adel', 'Dr. Nadia Samir', 'TA. Youssef Nabil'];

export const SESSION_COLORS: Record<string, string> = {
  'cs': '#2563eb',
  'math': '#7c3aed',
  'phys': '#0891b2',
  'eng': '#059669',
  'chem': '#d97706',
  'bio': '#be185d',
};

export const TIMETABLE_DATA: Record<string, Record<string, Record<number, Session | null>>> = {
  rooms: {
    'LT-101': {
      0: { id: 's1', code: 'CS301', name: 'Algorithms', staff: 'Dr. Chen Wei', group: 'CS-3A', capacity: 240, enrolled: 108, color: '#2563eb' },
      1: { id: 's2', code: 'MATH201', name: 'Linear Algebra', staff: 'Prof. Sara Johansson', group: 'ENG-2B', capacity: 240, enrolled: 235, color: '#7c3aed', conflictId: 'c1' },
      2: null,
      3: { id: 's3', code: 'CS401', name: 'ML Foundations', staff: 'Dr. Lena Kovač', group: 'CS-4A', capacity: 240, enrolled: 94, color: '#2563eb' },
      4: { id: 's4', code: 'PHYS101', name: 'Mechanics', staff: 'Dr. Raj Patel', group: 'ENG-1A', capacity: 240, enrolled: 120, color: '#0891b2', conflictId: 'c2' },
    },
    'LT-102': {
      0: null,
      1: { id: 's5', code: 'ENG201', name: 'Circuit Analysis', staff: 'Prof. Amara Nwosu', group: 'EE-2A', capacity: 120, enrolled: 72, color: '#059669' },
      2: { id: 's6', code: 'CS201', name: 'Data Structures', staff: 'Dr. Chen Wei', group: 'CS-2A', capacity: 120, enrolled: 78, color: '#2563eb' },
      3: null,
      4: { id: 's7', code: 'MATH301', name: 'Calculus III', staff: 'Prof. Sara Johansson', group: 'MATH-3A', capacity: 120, enrolled: 68, color: '#7c3aed' },
    },
    'LT-201': {
      0: { id: 's8', code: 'BIO101', name: 'Cell Biology', staff: 'Dr. Marcus Bell', group: 'BIO-1A', capacity: 300, enrolled: 187, color: '#be185d' },
      1: null,
      2: { id: 's9', code: 'CHEM201', name: 'Organic Chem', staff: 'Dr. Raj Patel', group: 'CHEM-2B', capacity: 300, enrolled: 143, color: '#d97706' },
      3: { id: 's10', code: 'PHYS201', name: 'Electrodynamics', staff: 'Dr. Raj Patel', group: 'PHYS-2A', capacity: 300, enrolled: 98, color: '#0891b2', conflictId: 'c2' },
      4: null,
    },
    'LT-202': {
      0: { id: 's18', code: 'CS101', name: 'Intro to CS', staff: 'Dr. Ahmed Hassan', group: 'CS-1A', capacity: 180, enrolled: 172, color: '#2563eb' },
      1: { id: 's19', code: 'MATH101', name: 'Calculus I', staff: 'Dr. Fatma Ali', group: 'ENG-1B', capacity: 180, enrolled: 165, color: '#7c3aed' },
      2: null,
      3: { id: 's20', code: 'ENG101', name: 'Statics', staff: 'Prof. John Smith', group: 'MECH-1A', capacity: 180, enrolled: 150, color: '#059669' },
      4: null,
    },
    'SEM-A': {
      0: null,
      1: { id: 's11', code: 'CS501', name: 'Distributed Systems', staff: 'Dr. Lena Kovač', group: 'CS-MSc', capacity: 30, enrolled: 24, color: '#2563eb' },
      2: { id: 's12', code: 'ENG401', name: 'Control Systems', staff: 'Prof. Amara Nwosu', group: 'EE-4A', capacity: 30, enrolled: 28, color: '#059669' },
      3: null,
      4: { id: 's13', code: 'MATH501', name: 'Real Analysis', staff: 'Prof. Sara Johansson', group: 'MATH-MSc', capacity: 30, enrolled: 18, color: '#7c3aed' },
    },
    'SEM-B': {
      0: { id: 's14', code: 'CS601', name: 'Research Methods', staff: 'Dr. Chen Wei', group: 'PhD-1', capacity: 20, enrolled: 12, color: '#2563eb' },
      1: null,
      2: null,
      3: { id: 's15', code: 'BIO301', name: 'Genetics', staff: 'Dr. Marcus Bell', group: 'BIO-3A', capacity: 20, enrolled: 19, color: '#be185d' },
      4: null,
    },
    'SEM-C': {
      0: null,
      1: { id: 's16', code: 'CHEM401', name: 'Spectroscopy', staff: 'Dr. Raj Patel', group: 'CHEM-4A', capacity: 20, enrolled: 16, color: '#d97706', conflictId: 'c4' },
      2: null,
      3: null,
      4: { id: 's17', code: 'ENG301', name: 'Thermodynamics', staff: 'Prof. Amara Nwosu', group: 'MECH-3A', capacity: 20, enrolled: 20, color: '#059669', conflictId: 'c3' },
    },
    'SEM-D': {
      0: { id: 's21', code: 'CS302', name: 'Operating Systems', staff: 'Dr. Mona Khalil', group: 'CS-3B', capacity: 25, enrolled: 23, color: '#2563eb' },
      1: null,
      2: { id: 's22', code: 'ENG202', name: 'Electronics I', staff: 'Eng. Omar Farouk', group: 'EE-2B', capacity: 25, enrolled: 22, color: '#059669', conflictId: 'c5' },
      3: null,
      4: null,
    },
    'SEM-E': {
      0: null,
      1: null,
      2: { id: 's23', code: 'BIO201', name: 'Microbiology', staff: 'Dr. Heba Mostafa', group: 'BIO-2A', capacity: 25, enrolled: 24, color: '#be185d', conflictId: 'c6' },
      3: { id: 's24', code: 'CHEM102', name: 'General Chem II', staff: 'Prof. Karim Adel', group: 'CHEM-1A', capacity: 25, enrolled: 21, color: '#d97706' },
      4: null,
    },
    'Studio-A': {
      0: null,
      1: { id: 's25', code: 'CS402', name: 'HCI Studio', staff: 'Dr. Nadia Samir', group: 'CS-4B', capacity: 22, enrolled: 20, color: '#7c3aed' },
      2: null,
      3: null,
      4: null,
    },
  },
};

export const CONFLICTS: Conflict[] = [
  {
    id: 'c1',
    type: 'capacity',
    severity: 'hard',
    description: 'MATH201: 235 enrolled in LT-101 (capacity 240) — safety margin under 5%. Move to larger hall.',
    cell: { row: 'LT-101', day: 1, slot: 1 },
    alternatives: [
      {
        id: 'a1',
        score: 97,
        day: 1,
        slot: 1,
        room: 'LT-201',
        reasons: ['Capacity 300 — 22% buffer', 'Same time slot retained', 'Prof. Johansson available'],
      },
      {
        id: 'a2',
        score: 82,
        day: 3,
        slot: 1,
        room: 'LT-101',
        reasons: ['Same room, Thu 09:00 free', 'Group has no conflicts Thu', 'Equipment match 100%'],
      },
      {
        id: 'a3',
        score: 71,
        day: 1,
        slot: 3,
        room: 'LT-201',
        reasons: ['LT-201 free at 11:00 Tue', 'Moderate group impact', 'Staff available'],
      },
    ],
  },
  {
    id: 'c2',
    type: 'staff_overlap',
    severity: 'hard',
    description: 'Dr. Raj Patel double-booked: PHYS101 (LT-101) and PHYS201 (LT-201) both at Fri 12:00',
    cell: { row: 'LT-101', day: 4, slot: 4 },
    alternatives: [
      {
        id: 'a4',
        score: 94,
        day: 4,
        slot: 7,
        room: 'LT-101',
        reasons: ['PHYS101 → Fri 15:00, room free', 'Dr. Patel free after 14:30', 'Group ENG-1A no afternoon conflict'],
      },
      {
        id: 'a5',
        score: 88,
        day: 2,
        slot: 4,
        room: 'LT-201',
        reasons: ['Move PHYS101 → Wed 12:00', 'Both staff and room available', 'Capacity sufficient'],
      },
      {
        id: 'a6',
        score: 63,
        day: 0,
        slot: 5,
        room: 'LT-102',
        reasons: ['Mon 13:00 open', 'Smaller room — 120 cap fits 120 enrolled', 'Travel time issue SEM block'],
      },
    ],
  },
  {
    id: 'c3',
    type: 'closure',
    severity: 'hard',
    description: 'SEM-C Fri 12:00 — ENG301 overlaps building close-down window (needs 60 min, only 30 left).',
    cell: { row: 'SEM-C', day: 4, slot: 4 },
    alternatives: [
      {
        id: 'a7',
        score: 91,
        day: 4,
        slot: 2,
        room: 'SEM-C',
        reasons: ['Fri 10:00 — 90 min clearance', 'Room unoccupied', 'Full session fits'],
      },
      {
        id: 'a8',
        score: 85,
        day: 3,
        slot: 3,
        room: 'SEM-A',
        reasons: ['Thu 11:00, SEM-A free', 'Prof. Nwosu available', 'Group MECH-3A no clashes'],
      },
      {
        id: 'a8b',
        score: 78,
        day: 4,
        slot: 1,
        room: 'SEM-D',
        reasons: ['Fri 09:00 free', 'Capacity 25 fits 20', 'No closure conflict'],
      },
    ],
  },
  {
    id: 'c4',
    type: 'equipment',
    severity: 'hard',
    description: 'CHEM401 in SEM-C: practical needs Fume Hoods + Spectrometers, room has only Smartboard.',
    cell: { row: 'SEM-C', day: 1, slot: 1 },
    alternatives: [
      {
        id: 'a9',
        score: 96,
        day: 1,
        slot: 2,
        room: 'Chem-Lab B',
        reasons: ['Fume Hoods + Spectrometers present', 'Capacity 30 fits 16', 'Staff available'],
      },
      {
        id: 'a10',
        score: 84,
        day: 2,
        slot: 1,
        room: 'Chem-Lab',
        reasons: ['Full equipment match', 'Tue 09:00 free', 'Group CHEM-4A free'],
      },
      {
        id: 'a11',
        score: 70,
        day: 3,
        slot: 1,
        room: 'Phys-Lab2',
        reasons: ['Spectrometers present, no fume hood', 'Partial match — needs supervision', 'Available Thu'],
      },
    ],
  },
  {
    id: 'c5',
    type: 'student_group',
    severity: 'hard',
    description: 'Group EE-2B clash: ENG202 (SEM-D) overlaps ENG201 lab for same group Tue 10:00.',
    cell: { row: 'SEM-D', day: 2, slot: 2 },
    alternatives: [
      {
        id: 'a12',
        score: 93,
        day: 3,
        slot: 2,
        room: 'SEM-D',
        reasons: ['Thu 10:00 group free', 'Same room retained', 'Staff Eng. Omar Farouk free'],
      },
      {
        id: 'a13',
        score: 86,
        day: 2,
        slot: 4,
        room: 'SEM-E',
        reasons: ['Wed 12:00 free', 'Capacity fits', 'No group overlap'],
      },
      {
        id: 'a14',
        score: 75,
        day: 0,
        slot: 2,
        room: 'LT-102',
        reasons: ['Mon 10:00 free', 'Larger room, more waste', 'Resolves group clash'],
      },
    ],
  },
  {
    id: 'c6',
    type: 'room_type',
    severity: 'hard',
    description: 'BIO201 practical placed in SEM-E (seminar). Practicals require Science Lab type.',
    cell: { row: 'SEM-E', day: 2, slot: 2 },
    alternatives: [
      {
        id: 'a15',
        score: 95,
        day: 2,
        slot: 2,
        room: 'BioLab2',
        reasons: ['Science Lab with Microscopes', 'Capacity 24 fits 24', 'Same slot retained'],
      },
      {
        id: 'a16',
        score: 88,
        day: 4,
        slot: 2,
        room: 'BioLab',
        reasons: ['Microscopes + Centrifuges', 'Fri 10:00 free', 'Staff available'],
      },
      {
        id: 'a17',
        score: 72,
        day: 1,
        slot: 3,
        room: 'Phys-Lab2',
        reasons: ['Lab type ok, equipment partial', 'Tue 11:00 free', 'Needs setup time'],
      },
    ],
  },
];
