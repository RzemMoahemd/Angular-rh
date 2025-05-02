import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule, Routes } from '@angular/router';

import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout.component';
import { EmployeeLayoutComponent } from './layouts/employee-layout/employee-layout.component';

import { authGuard } from './services/guard/auth.guard';
import { adminGuard } from './services/guard/admin.guard';
import { employeeGuard } from './services/guard/employee.guard';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'redirect',
    pathMatch: 'full'
  },
  {
    path: 'redirect',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./redirect/redirect.module').then(m => m.RedirectModule)
  },
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [authGuard, adminGuard],
    children: [
      {
        path: '',
        loadChildren: () =>
          import('./layouts/admin-layout/admin-layout.module').then(
            m => m.AdminLayoutModule
          )
      }
    ]
  },
  {
    path: 'employee',
    component: EmployeeLayoutComponent,
    canActivate: [authGuard, employeeGuard],
    children: [
      {
        path: '',
        loadChildren: () =>
          import('./layouts/employee-layout/employee-layout.module').then(
            m => m.EmployeeLayoutModule
          )
      }
    ]
  },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [
    CommonModule,
    BrowserModule,
    RouterModule.forRoot(routes, { useHash: true })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
