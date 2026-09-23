export type RoomType = 'Lecture Theatre' | 'Seminar Room' | 'Computer Lab' | 'Science Lab' | 'Studio' | 'Workshop';

export type AccessTag =
  | 'Wheelchair Access'
  | 'Hearing Loop'
  | 'Braille Signage'
  | 'Elevator Access'
  | 'Accessible WC Nearby'
  | 'Level Access';

export type EquipmentItem =
  | 'Projector (4K)'
  | 'Smartboard'
  | 'Document Camera'
  | 'PA System'
  | 'Video Conferencing'
  | 'Whiteboards'
  | 'PC Workstations'
  | 'Mac Workstations'
  | 'Oscilloscopes'
  | 'Fume Hoods'
  | '3D Printers'
  | 'Laser Cutters'
  | 'Recording Studio Gear'
  | 'Microscopes'
  | 'Centrifuges'
  | 'Spectrometers';

export interface ClosureWindow {
  label: string;
  from: string;
  to: string;
  reason: string;
}

export interface Room {
  id: string;
  name: string;
  building: string;
  floor: number;
  type: RoomType;
  capacity: number;
  examCapacity: number;
  accessibility: AccessTag[];
  equipment: EquipmentItem[];
  closures: ClosureWindow[];
  status: 'Available' | 'Maintenance' | 'Closed';
  bookingRate: number; // % utilisation this semester
  notes: string;
}

export const BUILDINGS = [
  'Alan Turing Building',
  'Maxwell Physics Block',
  'Faraday Engineering Wing',
  'Darwin Life Sciences',
  'Curie Chemistry Centre',
  'Lovelace Computing Hub',
];

export const ALL_ROOMS: Room[] = [
  {
    id: 'r1',
    name: 'LT-101',
    building: 'Alan Turing Building',
    floor: 1,
    type: 'Lecture Theatre',
    capacity: 240,
    examCapacity: 180,
    accessibility: ['Wheelchair Access', 'Hearing Loop', 'Elevator Access', 'Level Access'],
    equipment: ['Projector (4K)', 'PA System', 'Video Conferencing', 'Document Camera', 'Smartboard'],
    closures: [
      { label: 'Winter Recess', from: '2025-12-20', to: '2026-01-05', reason: 'University closure' },
      { label: 'AV Upgrade', from: '2026-03-10', to: '2026-03-12', reason: 'Infrastructure works' },
    ],
    status: 'Available',
    bookingRate: 87,
    notes: 'Primary teaching theatre. Tiered seating. Requires 48h advance booking.',
  },
  {
    id: 'r2',
    name: 'LT-102',
    building: 'Alan Turing Building',
    floor: 1,
    type: 'Lecture Theatre',
    capacity: 120,
    examCapacity: 90,
    accessibility: ['Wheelchair Access', 'Hearing Loop', 'Level Access'],
    equipment: ['Projector (4K)', 'Smartboard', 'PA System', 'Whiteboards'],
    closures: [
      { label: 'Winter Recess', from: '2025-12-20', to: '2026-01-05', reason: 'University closure' },
    ],
    status: 'Available',
    bookingRate: 74,
    notes: 'Flat-floor lecture room. Movable seating.',
  },
  {
    id: 'r3',
    name: 'LT-201',
    building: 'Alan Turing Building',
    floor: 2,
    type: 'Lecture Theatre',
    capacity: 300,
    examCapacity: 240,
    accessibility: ['Wheelchair Access', 'Hearing Loop', 'Elevator Access', 'Braille Signage', 'Accessible WC Nearby'],
    equipment: ['Projector (4K)', 'PA System', 'Video Conferencing', 'Smartboard', 'Document Camera'],
    closures: [
      { label: 'Winter Recess', from: '2025-12-20', to: '2026-01-05', reason: 'University closure' },
      { label: 'Graduation', from: '2026-07-14', to: '2026-07-16', reason: 'Ceremony venue' },
    ],
    status: 'Available',
    bookingRate: 92,
    notes: 'Largest teaching space on campus. Priority access for 200+ cohorts.',
  },
  {
    id: 'r4',
    name: 'SEM-A',
    building: 'Alan Turing Building',
    floor: 2,
    type: 'Seminar Room',
    capacity: 30,
    examCapacity: 24,
    accessibility: ['Wheelchair Access', 'Hearing Loop'],
    equipment: ['Smartboard', 'Video Conferencing', 'Whiteboards'],
    closures: [],
    status: 'Available',
    bookingRate: 61,
    notes: 'Small-group teaching. Circular seating arrangement.',
  },
  {
    id: 'r5',
    name: 'SEM-B',
    building: 'Alan Turing Building',
    floor: 2,
    type: 'Seminar Room',
    capacity: 20,
    examCapacity: 16,
    accessibility: ['Wheelchair Access'],
    equipment: ['Smartboard', 'Whiteboards'],
    closures: [
      { label: 'Renovation', from: '2026-02-01', to: '2026-02-28', reason: 'Flooring replacement' },
    ],
    status: 'Maintenance',
    bookingRate: 48,
    notes: 'Undergoing flooring renovation Feb 2026.',
  },
  {
    id: 'r6',
    name: 'CS-Lab1',
    building: 'Lovelace Computing Hub',
    floor: 1,
    type: 'Computer Lab',
    capacity: 60,
    examCapacity: 60,
    accessibility: ['Wheelchair Access', 'Hearing Loop', 'Level Access', 'Accessible WC Nearby'],
    equipment: ['PC Workstations', 'Smartboard', 'Projector (4K)', 'Video Conferencing'],
    closures: [
      { label: 'Winter Recess', from: '2025-12-20', to: '2026-01-05', reason: 'University closure' },
    ],
    status: 'Available',
    bookingRate: 95,
    notes: '60 × Dell Precision workstations. Dual-monitor setup. GPU cluster access.',
  },
  {
    id: 'r7',
    name: 'CS-Lab2',
    building: 'Lovelace Computing Hub',
    floor: 1,
    type: 'Computer Lab',
    capacity: 40,
    examCapacity: 40,
    accessibility: ['Wheelchair Access', 'Level Access'],
    equipment: ['Mac Workstations', 'Smartboard', 'Projector (4K)'],
    closures: [],
    status: 'Available',
    bookingRate: 78,
    notes: '40 × Apple Mac Studio. Adobe CC and Xcode licensed.',
  },
  {
    id: 'r8',
    name: 'Phys-Lab',
    building: 'Maxwell Physics Block',
    floor: 1,
    type: 'Science Lab',
    capacity: 48,
    examCapacity: 32,
    accessibility: ['Wheelchair Access', 'Level Access'],
    equipment: ['Oscilloscopes', 'Spectrometers', 'Projector (4K)', 'Whiteboards'],
    closures: [
      { label: 'Safety Inspection', from: '2026-01-13', to: '2026-01-14', reason: 'Annual safety audit' },
    ],
    status: 'Available',
    bookingRate: 69,
    notes: 'Optics and electronics lab. Laser safety protocol required.',
  },
  {
    id: 'r9',
    name: 'Chem-Lab A',
    building: 'Curie Chemistry Centre',
    floor: 1,
    type: 'Science Lab',
    capacity: 36,
    examCapacity: 24,
    accessibility: ['Wheelchair Access', 'Accessible WC Nearby'],
    equipment: ['Fume Hoods', 'Spectrometers', 'Centrifuges', 'Projector (4K)'],
    closures: [
      { label: 'COSHH Refit', from: '2026-04-01', to: '2026-04-30', reason: 'Fume hood replacement' },
      { label: 'Winter Recess', from: '2025-12-20', to: '2026-01-05', reason: 'University closure' },
    ],
    status: 'Available',
    bookingRate: 55,
    notes: 'Wet chemistry. Full COSHH compliance. Supervisor must be present at all times.',
  },
  {
    id: 'r10',
    name: 'BioLab',
    building: 'Darwin Life Sciences',
    floor: 2,
    type: 'Science Lab',
    capacity: 28,
    examCapacity: 20,
    accessibility: ['Elevator Access', 'Wheelchair Access'],
    equipment: ['Microscopes', 'Centrifuges', 'Projector (4K)', 'Fume Hoods'],
    closures: [],
    status: 'Available',
    bookingRate: 81,
    notes: 'Microbiology suite. BSL-1 rated. Autoclave on-site.',
  },
  {
    id: 'r11',
    name: 'Fab-Studio',
    building: 'Faraday Engineering Wing',
    floor: 0,
    type: 'Workshop',
    capacity: 24,
    examCapacity: 0,
    accessibility: ['Level Access', 'Wheelchair Access'],
    equipment: ['3D Printers', 'Laser Cutters', 'Whiteboards'],
    closures: [
      { label: 'H&S Audit', from: '2026-02-15', to: '2026-02-16', reason: 'Health and safety inspection' },
    ],
    status: 'Available',
    bookingRate: 43,
    notes: 'Fabrication studio. Induction mandatory before first use.',
  },
  {
    id: 'r12',
    name: 'SEM-C',
    building: 'Alan Turing Building',
    floor: 2,
    type: 'Seminar Room',
    capacity: 20,
    examCapacity: 16,
    accessibility: ['Wheelchair Access'],
    equipment: ['Smartboard', 'Whiteboards', 'Video Conferencing'],
    closures: [],
    status: 'Closed',
    bookingRate: 0,
    notes: 'Closed pending structural survey outcome.',
  },
  {
    id: 'r13',
    name: 'LT-202',
    building: 'Alan Turing Building',
    floor: 2,
    type: 'Lecture Theatre',
    capacity: 180,
    examCapacity: 140,
    accessibility: ['Wheelchair Access', 'Hearing Loop', 'Elevator Access'],
    equipment: ['Projector (4K)', 'PA System', 'Smartboard', 'Video Conferencing'],
    closures: [],
    status: 'Available',
    bookingRate: 76,
    notes: 'Second large theatre. Backup for 150+ cohorts.',
  },
  {
    id: 'r14',
    name: 'SEM-D',
    building: 'Alan Turing Building',
    floor: 3,
    type: 'Seminar Room',
    capacity: 25,
    examCapacity: 20,
    accessibility: ['Wheelchair Access', 'Level Access'],
    equipment: ['Smartboard', 'Whiteboards', 'Video Conferencing'],
    closures: [],
    status: 'Available',
    bookingRate: 58,
    notes: 'Small-group teaching, north wing.',
  },
  {
    id: 'r15',
    name: 'SEM-E',
    building: 'Alan Turing Building',
    floor: 3,
    type: 'Seminar Room',
    capacity: 25,
    examCapacity: 20,
    accessibility: ['Wheelchair Access'],
    equipment: ['Smartboard', 'Whiteboards'],
    closures: [],
    status: 'Available',
    bookingRate: 52,
    notes: 'Tutorial rooms, movable tables.',
  },
  {
    id: 'r16',
    name: 'Studio-A',
    building: 'Faraday Engineering Wing',
    floor: 1,
    type: 'Studio',
    capacity: 22,
    examCapacity: 0,
    accessibility: ['Level Access', 'Wheelchair Access'],
    equipment: ['Smartboard', 'Video Conferencing', 'Recording Studio Gear', 'Whiteboards'],
    closures: [],
    status: 'Available',
    bookingRate: 47,
    notes: 'HCI/design studio. Crit wall + recording gear.',
  },
  {
    id: 'r17',
    name: 'CS-Lab3',
    building: 'Lovelace Computing Hub',
    floor: 2,
    type: 'Computer Lab',
    capacity: 50,
    examCapacity: 50,
    accessibility: ['Wheelchair Access', 'Level Access'],
    equipment: ['PC Workstations', 'Smartboard', 'Projector (4K)'],
    closures: [],
    status: 'Available',
    bookingRate: 71,
    notes: '50 workstations. Linux + GPU access.',
  },
  {
    id: 'r18',
    name: 'Phys-Lab2',
    building: 'Maxwell Physics Block',
    floor: 2,
    type: 'Science Lab',
    capacity: 40,
    examCapacity: 28,
    accessibility: ['Wheelchair Access', 'Level Access'],
    equipment: ['Oscilloscopes', 'Spectrometers', 'Whiteboards'],
    closures: [],
    status: 'Available',
    bookingRate: 63,
    notes: 'Electronics overflow lab.',
  },
  {
    id: 'r19',
    name: 'Chem-Lab',
    building: 'Curie Chemistry Centre',
    floor: 1,
    type: 'Science Lab',
    capacity: 30,
    examCapacity: 20,
    accessibility: ['Wheelchair Access'],
    equipment: ['Fume Hoods', 'Spectrometers', 'Centrifuges'],
    closures: [],
    status: 'Available',
    bookingRate: 60,
    notes: 'General chemistry teaching lab.',
  },
  {
    id: 'r20',
    name: 'Chem-Lab B',
    building: 'Curie Chemistry Centre',
    floor: 2,
    type: 'Science Lab',
    capacity: 30,
    examCapacity: 20,
    accessibility: ['Wheelchair Access', 'Accessible WC Nearby'],
    equipment: ['Fume Hoods', 'Spectrometers', 'Projector (4K)'],
    closures: [{ label: 'COSHH Refit', from: '2026-05-01', to: '2026-05-07', reason: 'Filter replacement' }],
    status: 'Available',
    bookingRate: 57,
    notes: 'Spectroscopy focus lab.',
  },
  {
    id: 'r21',
    name: 'BioLab2',
    building: 'Darwin Life Sciences',
    floor: 2,
    type: 'Science Lab',
    capacity: 24,
    examCapacity: 18,
    accessibility: ['Elevator Access', 'Wheelchair Access'],
    equipment: ['Microscopes', 'Centrifuges', 'Projector (4K)'],
    closures: [],
    status: 'Available',
    bookingRate: 66,
    notes: 'Microbiology overflow.',
  },
  {
    id: 'r22',
    name: 'Eng-Workshop',
    building: 'Faraday Engineering Wing',
    floor: 0,
    type: 'Workshop',
    capacity: 30,
    examCapacity: 0,
    accessibility: ['Level Access', 'Wheelchair Access'],
    equipment: ['3D Printers', 'Laser Cutters', 'Oscilloscopes', 'Whiteboards'],
    closures: [],
    status: 'Available',
    bookingRate: 49,
    notes: 'Electronics + fabrication. Induction required.',
  },
];

export const ROOM_TYPES: RoomType[] = [
  'Lecture Theatre', 'Seminar Room', 'Computer Lab', 'Science Lab', 'Studio', 'Workshop',
];

export const ALL_ACCESS_TAGS: AccessTag[] = [
  'Wheelchair Access', 'Hearing Loop', 'Braille Signage', 'Elevator Access', 'Accessible WC Nearby', 'Level Access',
];

export const ALL_EQUIPMENT: EquipmentItem[] = [
  'Projector (4K)', 'Smartboard', 'Document Camera', 'PA System', 'Video Conferencing',
  'Whiteboards', 'PC Workstations', 'Mac Workstations', 'Oscilloscopes', 'Fume Hoods',
  '3D Printers', 'Laser Cutters', 'Recording Studio Gear', 'Microscopes', 'Centrifuges', 'Spectrometers',
];
