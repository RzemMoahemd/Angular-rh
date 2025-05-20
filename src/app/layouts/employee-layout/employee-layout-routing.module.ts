import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { authGuard } from 'app/services/guard/auth.guard';
import { LoginComponent } from 'app/components/login/login.component';
import { EmployeeMyLeavesComponent } from 'app/components/employee-my-leaves/employee-my-leaves.component';
import { EmployeeRequestLeaveComponent } from 'app/components/employee-request-leave/employee-request-leave.component';
import { EmployeeDashboardComponent } from 'app/components/employee-dashboard/employee-dashboard.component';


import { MyEvaluationsComponent } from 'app/components/performance/employee/my-evaluation/my-evaluation.component';
import { MyPerformanceDashboardComponent } from 'app/components/performance/employee/my-performance/my-performance.component';

// const routes: Routes = [
//     { path: 'my-leaves', component: EmployeeMyLeavesComponent, canActivate: [authGuard] },
//     { path: 'request-leave', component: EmployeeRequestLeaveComponent, canActivate: [authGuard] },  
//     { path: 'login', component: LoginComponent },
//     //{ path: '', component: LeaveListComponent, canActivate: [authGuard] }
//     { path: '', redirectTo: 'leaves', pathMatch: 'full', canActivate: [authGuard] }

// ];

const routes: Routes = [
  { path: 'my-leaves', component: EmployeeMyLeavesComponent, canActivate: [authGuard] },
  { path: 'request-leave', component: EmployeeRequestLeaveComponent, canActivate: [authGuard] },
  { path: 'dashboardemp', component: EmployeeDashboardComponent, canActivate: [authGuard] },
  { path: '', redirectTo: 'my-leaves', pathMatch: 'full', canActivate: [authGuard] },



   // Routes Employé
  {
    path: "my-performance",
    component: MyPerformanceDashboardComponent,
    // canActivate: [EmployeeGuard],
  },
  {
    path: "my-evaluations",
    component: MyEvaluationsComponent,
    // canActivate: [EmployeeGuard],
  },

];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EmployeeLayoutRoutingModule { }
