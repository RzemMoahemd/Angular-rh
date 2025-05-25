import { Component, OnInit } from "@angular/core"
import  { MatDialog } from "@angular/material/dialog"
import  { PerformanceService } from "app/services/performance.service"
import  { EmployeeService } from "app/services/employee.service"
import  { DepartmentService } from "app/services/department.service"
import  { Evaluation } from "app/models/Evaluation"
import  { Employee } from "app/models/employee"
import  { Department } from "app/models/department"
import { EvaluationDetailssComponent } from "../evaluation-details/evaluation-detailss.component"
import { finalize, forkJoin } from "rxjs"

@Component({
  selector: "app-my-evaluations",
  templateUrl: "./my-evaluation.component.html",
  styleUrls: ["./my-evaluation.component.scss"],
})
export class MyEvaluationsComponent implements OnInit {
  evaluations: Evaluation[] = []
  currentEmployee: Employee | null = null
  department: Department | null = null
  loading = true
  error: string | null = null
 

  // Colonnes à afficher
  displayedColumns: string[] = ["period", "date", "evaluator", "score", "status", "actions"]

  constructor(
    private performanceService: PerformanceService,
    private employeeService: EmployeeService,
    private departmentService: DepartmentService,
    private dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    this.loadCurrentEmployee()
  }

  loadCurrentEmployee(): void {
    this.loading = true
    this.error = null

    this.employeeService.getCurrentEmployee().subscribe({
      next: (employee) => {
        this.currentEmployee = employee
        if (employee && employee.id) {
          this.loadEmployeeData(employee.id)

          // Charger les informations du département
          if (employee.departmentId) {
            this.departmentService.getDepartmentById(employee.departmentId).subscribe({
              next: (department) => {
                this.department = department
              },
              error: (err) => {
                console.error("Erreur lors du chargement du département", err)
              },
            })
          }
        } else {
          this.error = "Impossible de récupérer les informations de l'employé actuel"
          this.loading = false
        }
      },
      error: (err) => {
        this.error = "Erreur lors du chargement des informations de l'employé"
        console.error(err)
        this.loading = false
      },
    })
  }

  loadEmployeeData(employeeId: number): void {
    this.performanceService.getMyEvaluations(employeeId)
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (evaluations) => {
          this.evaluations = evaluations;
        },
        error: (err) => {
          this.error = "Erreur lors du chargement des données";
          console.error(err);
        },
      });
  }

  openEvaluationDetails(evaluation: Evaluation): void {
    this.dialog.open(EvaluationDetailssComponent, {
      width: "800px",
      data: {
        evaluation,
        isEmployee: true,
        department: this.department,
      },
    })
  }

  acknowledgeEvaluation(evaluation: Evaluation): void {
    this.performanceService.acknowledgeEvaluation(evaluation.id!).subscribe({
      next: (updatedEvaluation) => {
        // Mettre à jour l'évaluation dans la liste
        const index = this.evaluations.findIndex((e) => e.id === evaluation.id)
        if (index !== -1) {
          this.evaluations[index] = updatedEvaluation
        }
      },
      error: (err) => {
        console.error("Erreur lors de l'accusé de réception de l'évaluation", err)
      },
    })
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case "EN_ATTENTE":
        return "En attente"
      case "EN_COURS":
        return "En cours"
      case "COMPLETE":
        return "Complété"
      case "ANNULE":
        return "Annulé"
      default:
        return status
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case "EN_ATTENTE":
        return "status-pending"
      case "EN_COURS":
        return "status-in-progress"
      case "COMPLETE":
        return "status-completed"
      case "ANNULE":
        return "status-cancelled"
      default:
        return ""
    }
  }

  canAcknowledge(evaluation: Evaluation): boolean {
    return evaluation.status === "COMPLETE" && !evaluation.acknowledgementDate
  }
}
