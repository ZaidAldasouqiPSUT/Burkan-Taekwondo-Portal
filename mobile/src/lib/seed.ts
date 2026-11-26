import { collection, doc, getDocs, limit, query, writeBatch } from 'firebase/firestore';
import { db } from './firebase';
import { generateCode } from './data';

/**
 * Starter content ported from the web portal's sample data, so a brand-new
 * Firebase project isn't empty. Safe to run once; it refuses if students exist.
 */
export async function seedStarterData(coachName: string) {
  const existing = await getDocs(query(collection(db, 'students'), limit(1)));
  if (!existing.empty) throw new Error('Starter data was not loaded because students already exist.');

  const batch = writeBatch(db);
  const add = (name: string, data: object, id?: string) => {
    const ref = id ? doc(db, name, id) : doc(collection(db, name));
    batch.set(ref, data);
    return ref.id;
  };

  const students = [
    { id: 'student-sara', fullName: 'Sara Abu Jaish', belt: 'Black Belt · 1st Dan', beltColor: '#111111', membership: 'National Team Program' },
    { id: 'student-islam', fullName: 'Islam Al Natsheh', belt: 'Black Belt · 2nd Dan', beltColor: '#111111', membership: 'Elite Competition' },
    { id: 'student-rama', fullName: 'Rama Abu El-Rob', belt: 'Red Belt', beltColor: '#B91C1C', membership: 'Competition Program' },
  ];
  const codes: Record<string, string> = {};
  for (const s of students) {
    const code = generateCode();
    codes[s.fullName] = code;
    add('students', { fullName: s.fullName, belt: s.belt, beltColor: s.beltColor, membership: s.membership, status: 'Active', joinCode: code }, s.id);
    add('joinCodes', { kind: 'family', studentId: s.id, studentName: s.fullName }, code);
  }

  const locations = [
    {
      name: 'Tabarbour Branch',
      address: 'Tabarbour, Amman, Jordan',
      phone: '0795693034',
      mapsUrl: 'https://www.google.com/maps/place//data=!4m2!3m1!19sChIJy4PCUEFgGxURwt6ZCxks3RU',
      hours: 'Saturday–Thursday · 4:00 PM–10:00 PM',
    },
    {
      name: 'North Marka Branch',
      address: 'North Marka, Amman, Jordan',
      phone: '0795693034',
      mapsUrl: 'https://www.google.com/maps/place//data=!4m2!3m1!19sChIJ_ZuhUwBhGxURjyP7uSpIL7w',
      hours: 'Saturday–Thursday · 4:00 PM–10:00 PM',
    },
  ];
  locations.forEach((l) => add('locations', l));

  const schedule = [
    { day: 'Saturday', startTime: '17:00', endTime: '18:15', className: 'Children Fundamentals', location: 'Tabarbour' },
    { day: 'Sunday', startTime: '18:30', endTime: '20:00', className: 'Competition Team', location: 'North Marka' },
    { day: 'Monday', startTime: '19:00', endTime: '20:30', className: 'Elite Sparring', location: 'Tabarbour' },
    { day: 'Tuesday', startTime: '18:30', endTime: '20:00', className: 'Competition Team', location: 'North Marka' },
  ];
  schedule.forEach((c) => add('schedule', { ...c, coachName: 'Coach Mahmoud' }));

  const year = new Date().getFullYear();
  const future = (monthsAhead: number, day: number) => {
    const d = new Date();
    d.setMonth(d.getMonth() + monthsAhead, day);
    return d.toISOString().slice(0, 10);
  };
  add('beltTests', { date: future(1, 17), label: 'Color Belt Promotion Test', location: 'Tabarbour Branch', cost: 35, registrationStatus: 'Registration open' });
  add('beltTests', { date: future(2, 21), label: 'Black Belt Pre-Test', location: 'North Marka Branch', cost: 65, registrationStatus: 'Upcoming' });

  add('news', {
    title: 'Islam represents Jordan at the World Championship',
    excerpt: "Burkan athlete Islam Al Natsheh joins Jordan's national team delegation in Uzbekistan.",
    body: "Burkan athlete Islam Al Natsheh joins Jordan's national team delegation in Uzbekistan. The whole Burkan family is behind him — train hard, fight with honor.",
    category: 'National Team',
    publishedAt: `${year}-09-03`,
    author: 'Burkan Taekwondo Center',
    image: 'islam',
  });
  add('news', {
    title: 'Color belt testing registration is open',
    excerpt: 'Students testing next month can now confirm attendance with their coach.',
    body: 'Registration for the next color belt promotion test is open. Register in the Belt Tests screen and pay the testing fee at the front desk.',
    category: 'Belt Testing',
    publishedAt: `${year}-08-31`,
    author: 'Administration',
    image: 'logo2',
  });

  const today = new Date().toISOString().slice(0, 10);
  add('attendance', { studentId: 'student-sara', studentName: 'Sara Abu Jaish', date: today, status: 'Present', className: 'Elite Sparring', markedBy: coachName });
  add('attendance', { studentId: 'student-islam', studentName: 'Islam Al Natsheh', date: today, status: 'Present', className: 'Competition Team', markedBy: coachName });
  add('attendance', { studentId: 'student-rama', studentName: 'Rama Abu El-Rob', date: today, status: 'Excused', className: 'Competition Team', markedBy: coachName });

  add('feedback', {
    studentId: 'student-sara',
    studentName: 'Sara Abu Jaish',
    coachName: 'Grand Master Mahmoud Sqoor',
    date: today,
    category: 'Technical',
    title: 'Excellent distance control',
    message: 'Sara showed strong composure and excellent distance control in sparring. Next focus: quicker recovery after the turning kick.',
    read: false,
  });
  add('feedback', {
    studentId: 'student-rama',
    studentName: 'Rama Abu El-Rob',
    coachName: 'Grand Master Mahmoud Sqoor',
    date: today,
    category: 'General',
    title: 'Ready for the next preparation phase',
    message: 'Rama has been consistent with patterns and conditioning. Please continue the flexibility routine at home.',
    read: true,
  });

  const now = Date.now();
  add('finances', { studentId: 'student-sara', studentName: 'Sara Abu Jaish', type: 'Membership', description: 'Elite Program — monthly', amount: 55, status: 'Paid', timestamp: now, dueDate: null });
  add('finances', { studentId: 'student-rama', studentName: 'Rama Abu El-Rob', type: 'Membership', description: 'Competition Program — monthly', amount: 45, status: 'Due', timestamp: now, dueDate: today });
  add('finances', { studentId: 'student-islam', studentName: 'Islam Al Natsheh', type: 'Product', description: 'National Team Dobok', amount: 70, status: 'Paid', timestamp: now, dueDate: null });

  await batch.commit();
  return codes;
}
