import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RedirectComponent } from './redirect.component';
import { RedirectRoutingModule } from './redirect-routing.module';

@NgModule({
  declarations: [RedirectComponent],
  imports: [
    CommonModule,
    RedirectRoutingModule
  ]
})
export class RedirectModule {}
