import { Component, OnInit } from "@angular/core"
import { FormBuilder, FormGroup, Validators } from "@angular/forms"
import { ActivatedRoute, Router } from "@angular/router"
import { MatSnackBar } from "@angular/material/snack-bar"
import { Employee } from "../../models/employee"
import { EmployeeService } from "../../services/employee.service"
import { Observable } from "rxjs"

@Component({
  selector: "app-employee-form",
  templateUrl: "./employee-form.component.html",
  styleUrls: ["./employee-form.component.css"]
})
export class EmployeeFormComponent implements OnInit {
  employeeForm: FormGroup
  isEditMode = false
  employeeId?: number
  loading = false // ✅ nécessaire pour gérer l'état du spinner

  constructor(
    private fb: FormBuilder,
    private employeeService: EmployeeService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.employeeForm = this.fb.group({
      firstName: ["", Validators.required],
      lastName: ["", Validators.required],
      email: ["", [Validators.required, Validators.email]],
      phoneNumber: ["", Validators.required],
      hireDate: ["", Validators.required],
      position: ["", Validators.required],
      departmentId: ["", Validators.required],
      userId: ["", Validators.required]
    })
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params["id"]) {
        this.isEditMode = true
        this.employeeId = +params["id"]
        this.loadEmployee()
      }
    })
  }

  loadEmployee(): void {
    this.employeeService.getEmployee(this.employeeId!).subscribe({
      next: emp => this.employeeForm.patchValue(emp),
      error: () => this.showErrorMessage("Erreur lors du chargement de l'employé")
    })
  }

  onSubmit(): void {
    if (this.employeeForm.invalid) return

    this.loading = true
    const employee: Employee = this.employeeForm.value
    let request$: Observable<any>

    if (this.isEditMode) {
      request$ = this.employeeService.updateEmployee(this.employeeId!, employee)
    } else {
      request$ = this.employeeService.createEmployee(employee)
    }

    request$.subscribe({
      next: () => {
        const msg = this.isEditMode ? "Employé modifié avec succès" : "Employé ajouté"
        this.showSuccessMessage(msg)

        // ✅ attendre 1s pour voir le spinner avant navigation
        setTimeout(() => {
          this.router.navigate(["/employees"])
        }, 1000)
      },
      error: () => {
        const msg = this.isEditMode ? "Erreur de modification" : "Erreur de création"
        this.showErrorMessage(msg)
        this.loading = false
      }
    })
  }

  private showSuccessMessage(message: string): void {
    this.snackBar.open(message, "Fermer", {
      duration: 3000,
      panelClass: ["success-snackbar"]
    })
  }

  private showErrorMessage(message: string): void {
    this.snackBar.open(message, "Fermer", {
      duration: 3000,
      panelClass: ["error-snackbar"]
    })
  }

  goBack(): void {
    this.router.navigate(['/employees']);
  }
  
}
