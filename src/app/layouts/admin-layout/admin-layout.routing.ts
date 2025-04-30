import { Routes } from '@angular/router';

import { EmployeeListComponent } from 'app/components/employee-list/employee-list.component';
import { EmployeeFormComponent } from 'app/components/employee-form/employee-form.component';
import { LeaveListComponent } from 'app/components/leave-list/leave-list.component';
import { LeaveFormComponent } from 'app/components/leave-form/leave-form.component';
import { LoginComponent } from 'app/components/login/login.component';
import { authGuard } from 'app/services/guard/auth.guard';
import { adminGuard } from 'app/services/guard/admin.guard';


export const AdminLayoutRoutes: Routes = [
  { path: 'employees', component: EmployeeListComponent, canActivate: [authGuard] },
  { path: 'employee/new', component: EmployeeFormComponent, canActivate: [authGuard] },
  { path: 'employee/:id/edit', component: EmployeeFormComponent, canActivate: [authGuard] },
  { path: 'leaves', component: LeaveListComponent, canActivate: [authGuard] },
  { path: 'leave/new', component: LeaveFormComponent, canActivate: [authGuard] },
  { path: 'leave/:id/edit', component: LeaveFormComponent, canActivate: [authGuard] },
  { path: 'login', component: LoginComponent },
  { path: '', redirectTo: 'employees', pathMatch: 'full' }
];

