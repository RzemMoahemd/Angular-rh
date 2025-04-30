import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { EmployeeLayoutRoutingModule } from './employee-layout-routing.module';
import { EmployeeLayoutComponent } from './employee-layout.component';


import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// ✅ Import du module des composants
import { ComponentsModule } from 'app/components/components.module';

// Angular Material
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatRippleModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSelectModule } from '@angular/material/select';


import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatIconModule } from '@angular/material/icon';



@NgModule({
  declarations: [
    EmployeeLayoutComponent
  ],
  imports: [
    CommonModule,
    EmployeeLayoutRoutingModule,
    
        FormsModule,
        ReactiveFormsModule,
        MatButtonModule,
        MatRippleModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatTooltipModule,
        MatTableModule,
        MatPaginatorModule,
        MatSortModule,
        MatIconModule,
        ComponentsModule
  ]
})
export class EmployeeLayoutModule { }
