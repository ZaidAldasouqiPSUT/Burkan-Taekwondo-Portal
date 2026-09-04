import { Router, type IRouter } from "express";
import {
  CreateAttendanceBody,
  CreateAttendanceResponse,
  CreateFeedbackBody,
  CreateFeedbackResponse,
  CreateFinancialRecordBody,
  CreateFinancialRecordResponse,
  GetAttendanceQueryParams,
  GetAttendanceResponse,
  GetBeltTestsResponse,
  GetDashboardSummaryResponse,
  GetFeedbackResponse,
  GetFinancialRecordsResponse,
  GetLocationsResponse,
  GetNewsResponse,
  GetScheduleResponse,
  GetStudentsResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

const students = [
  {
    id: "student-sarah",
    fullName: "Sara Abu Jaish",
    belt: "Black Belt · 1st Dan",
    beltColor: "#111111",
    status: "Active",
    membership: "National Team Program",
    paymentStatus: "Paid",
    attendanceRate: 96,
    nextTestDate: "2026-11-21",
    avatar: "/assets/sarah.jpg",
  },
  {
    id: "student-islam",
    fullName: "Islam Al Natsheh",
    belt: "Black Belt · 2nd Dan",
    beltColor: "#111111",
    status: "Active",
    membership: "Elite Competition",
    paymentStatus: "Paid",
    attendanceRate: 98,
    nextTestDate: "2026-12-12",
    avatar: "/assets/islam.jpg",
  },
  {
    id: "student-rama",
    fullName: "Rama Abu El-Rob",
    belt: "Red Belt",
    beltColor: "#b91c1c",
    status: "Active",
    membership: "Competition Program",
    paymentStatus: "Due soon",
    attendanceRate: 92,
    nextTestDate: "2026-10-17",
    avatar: "/assets/rama.jpg",
  },
];

const attendance = [
  {
    id: "attendance-1",
    studentId: "student-sarah",
    studentName: "Sara Abu Jaish",
    date: "2026-09-03",
    status: "Present",
    className: "Elite Sparring",
    markedBy: "Coach Mahmoud",
  },
  {
    id: "attendance-2",
    studentId: "student-islam",
    studentName: "Islam Al Natsheh",
    date: "2026-09-03",
    status: "Present",
    className: "National Team",
    markedBy: "Coach Mahmoud",
  },
  {
    id: "attendance-3",
    studentId: "student-rama",
    studentName: "Rama Abu El-Rob",
    date: "2026-09-02",
    status: "Excused",
    className: "Competition Team",
    markedBy: "Coach Mahmoud",
  },
];

const beltTests = [
  {
    id: "belt-test-1",
    date: "2026-10-17",
    label: "Color Belt Promotion Test",
    location: "Tabarbour Branch",
    cost: 35,
    registrationStatus: "Registration open",
    daysRemaining: 42,
  },
  {
    id: "belt-test-2",
    date: "2026-11-21",
    label: "Black Belt Pre-Test",
    location: "North Marka Branch",
    cost: 65,
    registrationStatus: "Upcoming",
    daysRemaining: 77,
  },
];

const feedback = [
  {
    id: "feedback-1",
    studentId: "student-sarah",
    studentName: "Sara Abu Jaish",
    coachName: "Grand Master Mahmoud Sqoor",
    date: "2026-09-04",
    category: "Performance",
    title: "Excellent distance control",
    message:
      "Sara showed strong composure and excellent distance control in sparring. Next focus: quicker recovery after the turning kick.",
    read: false,
  },
  {
    id: "feedback-2",
    studentId: "student-rama",
    studentName: "Rama Abu El-Rob",
    coachName: "Grand Master Mahmoud Sqoor",
    date: "2026-09-01",
    category: "Progress",
    title: "Ready for the next preparation phase",
    message:
      "Rama has been consistent with patterns and conditioning. Please continue the flexibility routine at home.",
    read: true,
  },
];

const financialRecords = [
  {
    id: "finance-1",
    studentId: "student-sarah",
    studentName: "Sara Abu Jaish",
    type: "Membership",
    description: "September Elite Program",
    amount: 55,
    status: "Paid",
    timestamp: "2026-09-01T09:14:00+03:00",
    dueDate: null,
  },
  {
    id: "finance-2",
    studentId: "student-rama",
    studentName: "Rama Abu El-Rob",
    type: "Membership",
    description: "September Competition Program",
    amount: 45,
    status: "Due",
    timestamp: "2026-09-01T08:00:00+03:00",
    dueDate: "2026-09-10",
  },
  {
    id: "finance-3",
    studentId: "student-islam",
    studentName: "Islam Al Natsheh",
    type: "Product",
    description: "National Team Dobok",
    amount: 70,
    status: "Paid",
    timestamp: "2026-08-28T18:32:00+03:00",
    dueDate: null,
  },
];

const schedule = [
  {
    id: "schedule-1",
    day: "Saturday",
    date: "2026-09-05",
    startTime: "17:00",
    endTime: "18:15",
    className: "Children Fundamentals",
    location: "Tabarbour",
    coachName: "Coach Mahmoud",
  },
  {
    id: "schedule-2",
    day: "Sunday",
    date: "2026-09-06",
    startTime: "18:30",
    endTime: "20:00",
    className: "Competition Team",
    location: "North Marka",
    coachName: "Coach Mahmoud",
  },
  {
    id: "schedule-3",
    day: "Monday",
    date: "2026-09-07",
    startTime: "19:00",
    endTime: "20:30",
    className: "Elite Sparring",
    location: "Tabarbour",
    coachName: "Coach Mahmoud",
  },
  {
    id: "schedule-4",
    day: "Tuesday",
    date: "2026-09-08",
    startTime: "18:30",
    endTime: "20:00",
    className: "Competition Team",
    location: "North Marka",
    coachName: "Coach Mahmoud",
  },
];

const news = [
  {
    id: "news-1",
    title: "Islam represents Jordan at the World Championship",
    excerpt:
      "Burkan athlete Islam Al Natsheh joins Jordan's national team delegation in Uzbekistan.",
    category: "National Team",
    publishedAt: "2026-09-03",
    author: "Burkan Taekwondo Center",
    image: "/assets/islam-world.jpg",
  },
  {
    id: "news-2",
    title: "Color belt testing registration is open",
    excerpt:
      "Students testing in October can now confirm attendance with their coach.",
    category: "Belt Testing",
    publishedAt: "2026-08-31",
    author: "Administration",
    image: "/assets/burkan-team.jpg",
  },
];

const locations = [
  {
    id: "tabarbour",
    name: "Tabarbour Branch",
    address: "Tabarbour, Amman, Jordan",
    phone: "+962 7 9000 0001",
    mapsUrl:
      "https://www.google.com/maps/search/?api=1&query=Tabarbour%20Amman%20Jordan",
    hours: "Saturday–Thursday · 4:00 PM–10:00 PM",
  },
  {
    id: "north-marka",
    name: "North Marka Branch",
    address: "North Marka, Amman, Jordan",
    phone: "+962 7 9000 0002",
    mapsUrl:
      "https://www.google.com/maps/search/?api=1&query=North%20Marka%20Amman%20Jordan",
    hours: "Saturday–Thursday · 4:00 PM–10:00 PM",
  },
];

router.get("/dashboard/summary", (_req, res) => {
  res.json(
    GetDashboardSummaryResponse.parse({
      role: "parent",
      displayName: "Burkan Family",
      activeStudents: 3,
      attendanceRate: 95,
      nextTestDate: "2026-10-17",
      outstandingBalance: 45,
      unreadFeedback: 1,
      upcomingClasses: 4,
    }),
  );
});

router.get("/students", (_req, res) => {
  res.json(GetStudentsResponse.parse(students));
});

router.get("/attendance", (req, res) => {
  const parsed = GetAttendanceQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const records = parsed.data.studentId
    ? attendance.filter((record) => record.studentId === parsed.data.studentId)
    : attendance;
  res.json(GetAttendanceResponse.parse(records));
});

router.post("/attendance", (req, res) => {
  const parsed = CreateAttendanceBody.safeParse(req.body);
  if (!parsed.success) {
    req.log.warn({ errors: parsed.error.message }, "Invalid attendance body");
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const student = students.find(({ id }) => id === parsed.data.studentId);
  const record = {
    id: `attendance-${attendance.length + 1}`,
    ...parsed.data,
    studentName: student?.fullName ?? "Student",
    markedBy: "Current coach",
  };
  attendance.unshift(record);
  res.status(201).json(CreateAttendanceResponse.parse(record));
});

router.get("/belt-tests", (_req, res) => {
  res.json(GetBeltTestsResponse.parse(beltTests));
});

router.get("/feedback", (_req, res) => {
  res.json(GetFeedbackResponse.parse(feedback));
});

router.post("/feedback", (req, res) => {
  const parsed = CreateFeedbackBody.safeParse(req.body);
  if (!parsed.success) {
    req.log.warn({ errors: parsed.error.message }, "Invalid feedback body");
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const student = students.find(({ id }) => id === parsed.data.studentId);
  const record = {
    id: `feedback-${feedback.length + 1}`,
    ...parsed.data,
    studentName: student?.fullName ?? "Student",
    coachName: "Current coach",
    date: new Date().toISOString().slice(0, 10),
    read: false,
  };
  feedback.unshift(record);
  res.status(201).json(CreateFeedbackResponse.parse(record));
});

router.get("/financial-records", (_req, res) => {
  res.json(GetFinancialRecordsResponse.parse(financialRecords));
});

router.post("/financial-records", (req, res) => {
  const parsed = CreateFinancialRecordBody.safeParse(req.body);
  if (!parsed.success) {
    req.log.warn({ errors: parsed.error.message }, "Invalid financial body");
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const student = students.find(({ id }) => id === parsed.data.studentId);
  const record = {
    id: `finance-${financialRecords.length + 1}`,
    ...parsed.data,
    studentName: student?.fullName ?? "Student",
    timestamp: new Date().toISOString(),
    dueDate: parsed.data.status === "Due" ? new Date().toISOString().slice(0, 10) : null,
  };
  financialRecords.unshift(record);
  res.status(201).json(CreateFinancialRecordResponse.parse(record));
});

router.get("/schedule", (_req, res) => {
  res.json(GetScheduleResponse.parse(schedule));
});

router.get("/news", (_req, res) => {
  res.json(GetNewsResponse.parse(news));
});

router.get("/locations", (_req, res) => {
  res.json(GetLocationsResponse.parse(locations));
});

export default router;