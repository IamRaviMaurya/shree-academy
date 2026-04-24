export interface FixedBookOption {
  id: string;
  title: string;
  price: number;
  supplier: string;
}

export const fixedBookOptionsByClass: Record<string, FixedBookOption[]> = {
  '10th': [
    { id: 'english-kumarbharati-text', title: 'English Kumarbharati - Text book', price: 99, supplier: 'Govt.' },
    { id: 'english-kumarbharati-workbook', title: 'English Kumarbharati - Workbook', price: 250, supplier: 'Navneet' },
    { id: 'english-hl-grammar', title: 'English HL Grammer', price: 150, supplier: 'Navneet' },
    { id: 'english-writing-skill', title: 'English Writing Skill', price: 120, supplier: 'Navneet' },
    { id: 'maths-part1-text', title: 'Maths Part I - Textbook', price: 113, supplier: 'Govt.' },
    { id: 'maths-part1-workbook', title: 'Maths Part I - Workbook', price: 90, supplier: 'Navneet' },
    { id: 'maths-part2-text', title: 'Maths Part II - Textbook', price: 108, supplier: 'Govt.' },
    { id: 'maths-part2-workbook', title: 'Maths Part II - Workbook', price: 115, supplier: 'Navneet' },
    { id: 'maths-practical', title: 'Maths 1 and 2 Practical Book', price: 85, supplier: 'Vikas' },
    { id: 'history-textbook', title: 'History and Political Science Textbook', price: 76, supplier: 'Govt.' },
    { id: 'history-workbook', title: 'History and Political Science Workbook', price: 150, supplier: 'Navneet' },
    { id: 'geography-textbook', title: 'Geography Textbook', price: 58, supplier: 'Govt.' },
    { id: 'geography-workbook', title: 'Geography Workbook', price: 125, supplier: 'Navneet' },
    { id: 'geography-mapbook', title: 'Geography MAPBOOK & Activity Book (Vikas Finding Locations)', price: 75, supplier: 'Navneet' },
    { id: 'hindi-textbook', title: 'Hindi Lokbharati Textbook', price: 78, supplier: 'Govt.' },
    { id: 'hindi-workbook', title: 'Hindi Lokbharati Workbook', price: 220, supplier: 'Navneet' },
    { id: 'hindi-grammar', title: 'Hindi Grammer', price: 75, supplier: 'Vikas' },
    { id: 'marathi-textbook', title: 'Marathi Akshar Bharati Textbook', price: 64, supplier: 'Govt.' },
    { id: 'marathi-workbook', title: 'Marathi Akshar Bharati Workbook', price: 170, supplier: 'Navneet' },
    { id: 'marathi-grammar', title: 'Marathi Grammer', price: 60, supplier: 'Navneet' },
    { id: 'science-part1', title: 'Science & Technology Part - 1 Textbook', price: 103, supplier: 'Govt.' },
    { id: 'science-part2', title: 'Science & Technology Part - 2 Textbook', price: 88, supplier: 'Govt.' },
    { id: 'defence-studies', title: 'Defence Studies', price: 75, supplier: 'Navneet' },
    { id: 'water-security', title: 'Water Security', price: 140, supplier: 'Navneet' },
    { id: 'health-pe', title: 'Health and Physical Education', price: 90, supplier: 'Navneet' },
    { id: 'notebook-long', title: 'Single line 200 pg Long notebook - 14 (long book)', price: 1120, supplier: 'Navneet' },
    { id: 'diary-id-card', title: 'Diary & I Card', price: 170, supplier: 'Navneet' },
  ],
};

export const classOptions = [
  { value: '', label: 'Select class' },
  { value: '10th', label: 'Class 10' },
];

export const getFixedBookOptionsForClass = (cls: string): FixedBookOption[] => {
  return fixedBookOptionsByClass[cls] || [];
};
