import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// Composants
import { FooterComponent } from './footer/footer.component';
import { NavbarComponent } from './navbar/navbar.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { EmployeeFormComponent } from './employee-form/employee-form.component';
import { EmployeeListComponent } from './employee-list/employee-list.component';
import { LeaveFormComponent } from './leave-form/leave-form.component';
import { LeaveListComponent } from './leave-list/leave-list.component';
import { DashboardComponent } from './dashboard/dashboard.component';

// Modules Angular Material
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatOptionModule } from '@angular/material/core';
import { MatGridListModule } from '@angular/material/grid-list';

import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCardModule } from '@angular/material/card';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { EmployeeMyLeavesComponent } from './employee-my-leaves/employee-my-leaves.component';
import { EmployeeRequestLeaveComponent } from './employee-request-leave/employee-request-leave.component';
import { EmployeeDashboardComponent } from './employee-dashboard/employee-dashboard.component';
import { MatDialogModule } from '@angular/material/dialog';
import { LeaveDetailsDialogComponent } from './dialogs/leave-details-dialog/leave-details-dialog.component';
import { LeaveDetailsDialogEmpComponent } from './dialogs/leave-details-dialog-emp/leave-details-dialog-emp.component';
import { MatDividerModule } from '@angular/material/divider';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ApprovalDialogComponent } from './dialogs/approval-dialog/approval-dialog.component';
import { RejectionDialogComponent } from './dialogs/rejection-dialog/rejection-dialog.component';



import { MatChipsModule } from "@angular/material/chips"
import { MatListModule } from "@angular/material/list"
import { MatMenuModule } from "@angular/material/menu"
import { MatProgressBarModule } from "@angular/material/progress-bar"
import { MatSnackBarModule } from "@angular/material/snack-bar"


import { MyPerformanceDashboardComponent } from './performance/employee/my-performance/my-performance.component';
import { MyEvaluationsComponent } from './performance/employee/my-evaluation/my-evaluation.component';
import { EvaluationDetailssComponent } from './performance/employee/evaluation-details/evaluation-detailss.component';
import { ConfirmDialogComponent } from './performance/confirm-dialog/confirm-dialog.component';
import { EvaluationListComponent } from './performance/admin/evaluation-list/evaluation-list.component';
import { PerformanceDashboardComponent } from './performance/admin/performance-dashboard/performance-dashboard.component';
import { EvaluationFormComponent } from './performance/admin/evaluation-form/evaluation-form.component';
import { EvaluationDetailsComponent } from './performance/admin/evaluation-details/evaluation-details.component';

import { NgChartsModule } from 'ng2-charts';
import { JobListComponent } from './job-requests/job-list/job-list.component';
import { JobDetailComponent } from './job-requests/job-detail/job-detail.component';
import { ApplicationDialogComponent } from './job-requests/application-dialog/application-dialog.component';
import { MyApplicationsComponent } from './job-requests/my-applications/my-applications.component';
import { AIAnalysisDialogComponent } from './admin/job-applications/ai-analysis-dialog/ai-analysis-dialog.component';
import { AdminApplicationsComponent } from './admin/job-applications/admin-applications/admin-applications.component';
import { ApplicationDetailDialogComponent } from './admin/job-applications/application-detail-dialog/application-detail-dialog.component';
import { AdminJobFormComponent } from './admin/job-requests/admin-job-form/admin-job-form.component';
import { AdminJobListComponent } from './admin/job-requests/admin-job-list/admin-job-list.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatOptionModule,
    MatGridListModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatCardModule,
    MatButtonToggleModule,
    MatDialogModule,
    MatDividerModule,
    MatCheckboxModule,
    MatChipsModule,
    MatListModule,
    MatMenuModule,
    MatProgressBarModule,
    MatSnackBarModule,
    NgChartsModule




  ],
  declarations: [
    FooterComponent,
    NavbarComponent,
    SidebarComponent,
    EmployeeFormComponent,
    EmployeeListComponent,
    LeaveFormComponent,
    LeaveListComponent,
    DashboardComponent,
    EmployeeMyLeavesComponent,
    EmployeeRequestLeaveComponent,
    EmployeeDashboardComponent,
    LeaveDetailsDialogComponent,
    LeaveDetailsDialogEmpComponent,
    ApprovalDialogComponent,
    RejectionDialogComponent,
    MyPerformanceDashboardComponent,
    MyEvaluationsComponent,
    EvaluationDetailssComponent,
    ConfirmDialogComponent,
    EvaluationDetailsComponent,
    EvaluationFormComponent,
    PerformanceDashboardComponent,
    EvaluationListComponent,
    JobListComponent,
    JobDetailComponent,
    ApplicationDialogComponent,
    MyApplicationsComponent,
    AIAnalysisDialogComponent,
    AdminApplicationsComponent,
    ApplicationDetailDialogComponent,
    AdminJobFormComponent,
    AdminJobListComponent,
    



  ],
  exports: [
    FooterComponent,
    NavbarComponent,
    SidebarComponent,
    EmployeeFormComponent,
    EmployeeListComponent,
    LeaveFormComponent,
    LeaveListComponent,
    DashboardComponent
  ]
})
export class ComponentsModule { }
