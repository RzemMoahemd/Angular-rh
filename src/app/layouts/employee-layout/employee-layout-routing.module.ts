import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { authGuard } from 'app/services/guard/auth.guard';
import { LoginComponent } from 'app/components/login/login.component';
import { EmployeeMyLeavesComponent } from 'app/components/employee-my-leaves/employee-my-leaves.component';
import { EmployeeRequestLeaveComponent } from 'app/components/employee-request-leave/employee-request-leave.component';
import { EmployeeDashboardComponent } from 'app/components/employee-dashboard/employee-dashboard.component';


import { MyEvaluationsComponent } from 'app/components/performance/employee/my-evaluation/my-evaluation.component';
import { MyPerformanceDashboardComponent } from 'app/components/performance/employee/my-performance/my-performance.component';


import { JobListComponent } from "../../components/job-requests/job-list/job-list.component"
import { JobDetailComponent } from "../../components/job-requests/job-detail/job-detail.component"
import { MyApplicationsComponent } from "../../components/job-requests/my-applications/my-applications.component"


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
  { path: '', redirectTo: 'dashboardemp', pathMatch: 'full', canActivate: [authGuard] },


    { path: "jobs", component: JobListComponent },
  { path: "jobs/:id", component: JobDetailComponent },
  { path: "my-applications", component: MyApplicationsComponent },

   // Routes Employé
  {
    path: "my-performance",
    component: MyPerformanceDashboardComponent,
    // canActivate: [EmployeeGuard],
  },
  

];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EmployeeLayoutRoutingModule { }
