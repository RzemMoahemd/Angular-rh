import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Employee } from '../../models/employee';
import { EmployeeService } from '../../services/employee.service';
import { DepartmentService } from '../../services/department.service';
import { Department } from '../../models/department';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Observable } from 'rxjs';



@Component({
  selector: 'app-employee-form',
  templateUrl: './employee-form.component.html',
  styleUrls: ['./employee-form.component.css']
})
export class EmployeeFormComponent {
  employeeForm: FormGroup;
  loading = false;
  departments: Department[] = [];
  statuses = ['Actif', 'Inactif'];
  isEditMode = false;
  employeeId?: number;

  constructor(
    private fb: FormBuilder,
    private employeeService: EmployeeService,
    private departmentService: DepartmentService,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<EmployeeFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { employee?: Employee }
  ) {
    this.employeeForm = this.fb.group({
      firstName: ["", Validators.required],
      lastName: ["", Validators.required],
      email: ["", [Validators.required, Validators.email]],
      phoneNumber: ["", Validators.required],
      hireDate: ["", Validators.required],
      position: ["", Validators.required],
      departmentId: ["", Validators.required],
      status: [this.statuses[0], Validators.required]
    });

    if (this.data?.employee) {
      this.isEditMode = true;
      this.employeeId = this.data.employee.id;
      this.employeeForm.patchValue(this.data.employee);
    }
  }

  ngOnInit(): void {
    this.loadDepartments();
  }

  loadDepartments(): void {
    this.departmentService.getAllDepartments().subscribe({
      next: (departments) => this.departments = departments,
      error: () => this.showErrorMessage("Erreur de chargement des départements")
    });
  }

  onSubmit(): void {
    if (this.employeeForm.invalid) return;

    this.loading = true;
    const employee: Employee = this.employeeForm.value;
    
    // Correction avec type assertion
    const operation$ = (this.isEditMode 
      ? this.employeeService.updateEmployee(this.employeeId!, employee)
      : this.employeeService.createEmployee(employee)) as Observable<unknown>;

    operation$.subscribe({
      next: () => {
        this.dialogRef.close('success');
        this.showSuccessMessage(this.isEditMode ? "Employé modifié" : "Employé créé");
        this.loading = false;
      },
      error: () => {
        this.showErrorMessage("Erreur lors de l'opération");
        this.loading = false;
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  private showSuccessMessage(message: string): void {
    this.snackBar.open(message, "Fermer", {
      duration: 3000,
      panelClass: ["success-snackbar"]
    });
  }

  private showErrorMessage(message: string): void {
    this.snackBar.open(message, "Fermer", {
      duration: 3000,
      panelClass: ["error-snackbar"]
    });
  }
}