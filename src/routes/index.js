import { createRouter, createWebHistory } from "vue-router";

const Login = () => import("../views/Login.vue");
import UpdatePassword from "../components/UpdatePassword.vue";
const AdminLayout = () => import("../layouts/AdminLayout.vue");

const Home = () => import("../views/Admin/Home.vue");
const Teacher = () => import("../views/Admin/Teacher.vue");
const Student = () => import("../views/Admin/Student.vue");
const Account = () => import("../views/Admin/Account.vue");
const Department = () => import("../views/Admin/Department.vue");
const Position = () => import("../views/Admin/Position.vue");
const ClassRoom = () => import("../views/Admin/ClassRoom.vue");
const Device = () => import("../views/Admin/Device.vue");
const Modeling = () => import("../views/Admin/Modeling.vue");
const Holidays = () => import("../views/Admin/Holidays.vue");
const Behavior = () => import("../views/Admin/Behavior.vue");
const Conduct = () => import("../views/Admin/Conduct.vue");
const AcademicCalendar = () => import("../views/Admin/Academiccalendar.vue");
const CheckName = () => import("../views/Admin/CheckName.vue");
const Leave = () => import("../views/Admin/Leave.vue");
const UniformInspection = () => import("../views/Admin/UniformInspection.vue");

const LeaveReport = () => import("../views/Admin/report/LeaveReq.vue");
const AtRisk = () => import("../views/Admin/report/AtRisk.vue");
const TableReport = () => import("../views/Admin/report/Attendance.vue");
const LateReport = () => import("../views/Admin/report/Late.vue");
const MissedReport = () => import("../views/Admin/report/Missed.vue");
const StrangerReport = () => import("../views/Admin/report/Stranger.vue");
const StatsView = () => import("../views/Admin/report/StatsView.vue");
const Activity = () => import("../views/Admin/report/Activity.vue");
const UniformInspectionReport = () => import("../views/Admin/report/UniformInspectionReport.vue");

const routes = [
  { path: "/", name: "login", component: Login },
  {
    path: "/home",
    name: "AdminHome",
    component: AdminLayout,
    redirect: "/home/dashboard",
    children: [
      {
        path: "dashboard",
        name: "Dashboard",
        component: Home,
      },
      {
        path: "teacher",
        name: "Teacher",
        component: Teacher,
      },
      {
        path: "student",
        name: "Student",
        component: Student,
      },
      {
        path: "account",
        name: "Account",
        component: Account,
      },
      {
        path: "department",
        name: "Department",
        component: Department,
      },
      {
        path: "position",
        name: "Position",
        component: Position,
      },
      {
        path: "device",
        name: "Device",
        component: Device,
      },
      {
        path: "model",
        name: "Modeling",
        component: Modeling,
      },
      {
        path: "classroom",
        name: "ClassRoom",
        component: ClassRoom,
      },
      {
        path: "report",
        name: "TableReport",
        component: TableReport,
      },
      {
        path: "report/late",
        name: "LateReport",
        component: LateReport,
      },
      {
        path: "report/missed",
        name: "MissedReport",
        component: MissedReport,
      },
      {
        path: "report/stranger",
        name: "StrangerReport",
        component: StrangerReport,
      },
      {
        path: "report/stats",
        name: "StatsView",
        component: StatsView,
      },
      {
        path: "/update-password",
        name: "UpdatePassword",
        component: UpdatePassword,
      },
      {
        path: "holidays",
        name: "Holidays",
        component: Holidays,
      },
      {
        path: "behavior",
        name: "Behavior",
        component: Behavior,
      },
      {
        path: "conduct",
        name: "Conduct",
        component: Conduct,
      },
      {
        path: "report/at-risk",
        name: "AtRisk",
        component: AtRisk,
      },
      {
        path: "academiccalendar",
        name: "AcademicCalendar",
        component: AcademicCalendar,
      },
      {
        path: "checkname",
        name: "CheckName",
        component: CheckName,
      },
      {
        path: "leave",
        name: "Leave",
        component: Leave,
      },
      {
        path: "report/leave",
        name: "LeaveReport",
        component: LeaveReport,
      },
      {
        path: "uniform-inspection",
        name: "UniformInspection",
        component: UniformInspection,
      },
      {
        path: "report/activity",
        name: "Activity",
        component: Activity,
      },
      {
        path: "report/uniform-inspection",
        name: "UniformInspectionReport",
        component: UniformInspectionReport,
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
