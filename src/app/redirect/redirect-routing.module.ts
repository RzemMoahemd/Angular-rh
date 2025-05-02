// src/app/redirect/redirect-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RedirectComponent } from './redirect.component';
import { authGuard } from '../services/guard/auth.guard';

const routes: Routes = [
  {
    path: '',
    component: RedirectComponent,
    canActivate: [authGuard]  // protéger la redirection
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RedirectRoutingModule {}
