import { Routes } from '@angular/router';

import { EmployeeListComponent } from 'app/components/employee-list/employee-list.component';
import { EmployeeFormComponent } from 'app/components/employee-form/employee-form.component';
import { LeaveListComponent } from 'app/components/leave-list/leave-list.component';
import { LeaveFormComponent } from 'app/components/leave-form/leave-form.component';
import { LoginComponent } from 'app/components/login/login.component';
import { authGuard } from 'app/services/guard/auth.guard';
import { adminGuard } from 'app/services/guard/admin.guard';
import { DashboardComponent } from 'app/components/dashboard/dashboard.component';

// Admin Components
import { PerformanceDashboardComponent } from 'app/components/performance/admin/performance-dashboard/performance-dashboard.component';
import { EvaluationListComponent } from 'app/components/performance/admin/evaluation-list/evaluation-list.component';

import { AdminJobListComponent } from "../../components/admin/job-requests/admin-job-list/admin-job-list.component"
import { AdminJobFormComponent } from "../../components/admin/job-requests/admin-job-form/admin-job-form.component"
import { AdminApplicationsComponent } from "../../components/admin/job-applications/admin-applications/admin-applications.component"

export const AdminLayoutRoutes: Routes = [
  { path: 'employees', component: EmployeeListComponent, canActivate: [authGuard, adminGuard] },
  { path: 'employee/new', component: EmployeeFormComponent, canActivate: [authGuard, adminGuard] },
  { path: 'employee/:id/edit', component: EmployeeFormComponent, canActivate: [authGuard, adminGuard] },
  { path: 'leaves', component: LeaveListComponent, canActivate: [authGuard] },
  { path: 'leave/new', component: LeaveFormComponent, canActivate: [authGuard] },
  { path: 'leave/:id/edit', component: LeaveFormComponent, canActivate: [authGuard] },
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
  { path: 'login', component: LoginComponent },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full', canActivate: [authGuard] },
  // { path: '', component: LeaveListComponent, canActivate: [authGuard] }


  // Routes Admin
  {
    path: "performance",
    component: PerformanceDashboardComponent,
    // canActivate: [AdminGuard],
  },
 

  { path: "job-requests", component: AdminJobListComponent },
  { path: "job-requests/new", component: AdminJobFormComponent },
  { path: "job-requests/edit/:id", component: AdminJobFormComponent },
  { path: "applications", component: AdminApplicationsComponent }, // All applications
  { path: "job-requests/:jobRequestId/applications", component: AdminApplicationsComponent }

];

