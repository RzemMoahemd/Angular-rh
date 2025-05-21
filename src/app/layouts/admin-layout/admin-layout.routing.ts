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


export const AdminLayoutRoutes: Routes = [
  { path: 'employees', component: EmployeeListComponent, canActivate: [authGuard, adminGuard] },
  { path: 'employee/new', component: EmployeeFormComponent, canActivate: [authGuard, adminGuard] },
  { path: 'employee/:id/edit', component: EmployeeFormComponent, canActivate: [authGuard, adminGuard] },
  { path: 'leaves', component: LeaveListComponent, canActivate: [authGuard] },
  { path: 'leave/new', component: LeaveFormComponent, canActivate: [authGuard] },
  { path: 'leave/:id/edit', component: LeaveFormComponent, canActivate: [authGuard] },
  { path: 'dahsboard', component: DashboardComponent, canActivate: [authGuard] },
  { path: 'login', component: LoginComponent },
  { path: '', redirectTo: 'employees', pathMatch: 'full', canActivate: [authGuard] },
  // { path: '', component: LeaveListComponent, canActivate: [authGuard] }


  // Routes Admin
  {
    path: "performance",
    component: PerformanceDashboardComponent,
    // canActivate: [AdminGuard],
  }
 


];

