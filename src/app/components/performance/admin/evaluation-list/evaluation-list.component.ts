import { Component,  OnInit } from "@angular/core"
import  { MatDialog } from "@angular/material/dialog"
import  { PageEvent } from "@angular/material/paginator"
import  { MatSnackBar } from "@angular/material/snack-bar"
import  { PerformanceService } from "app/services/performance.service"
import  { EmployeeService } from "app/services/employee.service"
import  { DepartmentService } from "app/services/department.service"
import  { Evaluation } from "app/models/Evaluation"
import  { Employee } from "app/models/employee"
import  { Department } from "app/models/department"
import { EvaluationFormComponent } from "../evaluation-form/evaluation-form.component"
import { EvaluationDetailsComponent } from "../evaluation-details/evaluation-details.component"
import { ConfirmDialogComponent } from "../../confirm-dialog/confirm-dialog.component"
import { finalize, forkJoin } from "rxjs"

@Component({
  selector: "app-evaluation-list",
  templateUrl: "./evaluation-list.component.html",
  styleUrls: ["./evaluation-list.component.scss"],
})
export class EvaluationListComponent implements OnInit {
  evaluations: Evaluation[] = []
  filteredEvaluations: Evaluation[] = []
  employees: Employee[] = []
  departments: Department[] = []
  loading = true
  error: string | null = null

  // Filtres
  searchTerm = ""
  selectedEmployee: number | null = null
  selectedPeriod: string | null = null
  selectedStatus: string | null = null

  // Pagination
  pageSize = 10
  pageIndex = 0
  totalItems = 0

  // Colonnes à afficher
  displayedColumns: string[] = ["employee", "period", "date", "score", "status", "actions"]

  constructor(
    private performanceService: PerformanceService,
    private employeeService: EmployeeService,
    private departmentService: DepartmentService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    this.loadData()
  }

  loadData(): void {
    this.loading = true
    this.error = null

    // Charger les données en parallèle
    forkJoin({
      evaluations: this.performanceService.getAllEvaluations(),
      employees: this.employeeService.getEmployees(),
      departments: this.departmentService.getAllDepartments(),
    })
      .pipe(
        finalize(() => {
          this.loading = false
        }),
      )
      .subscribe({
        next: (results) => {
          this.evaluations = results.evaluations
          this.employees = results.employees
          this.departments = results.departments

          // Enrichir les évaluations avec les informations de département
          this.enrichEvaluationsWithDepartments()

          this.applyFilters()
        },
        error: (err) => {
          this.error = "Erreur lors du chargement des données"
          console.error(err)
        },
      })
  }

  enrichEvaluationsWithDepartments(): void {
    this.evaluations.forEach((evaluation) => {
      if (evaluation.employee && evaluation.employee.departmentId) {
        const department = this.departments.find((d) => d.id === evaluation.employee.departmentId)
        if (department) {
          // Ajouter le nom du département à l'objet employé pour l'affichage
          ;(evaluation.employee as any).departmentName = department.name
        }
      }
    })
  }

  applyFilters(): void {
    let filtered = [...this.evaluations]

    // Filtre par terme de recherche
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase()
      filtered = filtered.filter(
        (evaluation) =>
          evaluation.employee.firstName?.toLowerCase().includes(term) ||
          evaluation.employee.lastName?.toLowerCase().includes(term) ||
          evaluation.employee.position?.toLowerCase().includes(term) ||
          (evaluation.employee as any)?.departmentName?.toLowerCase().includes(term),
      )
    }

    // Filtre par employé
    if (this.selectedEmployee) {
      filtered = filtered.filter((evaluation) => evaluation.employee.id === this.selectedEmployee)
    }

    // Filtre par période
    if (this.selectedPeriod) {
      filtered = filtered.filter((evaluation) => evaluation.period === this.selectedPeriod)
    }

    // Filtre par statut
    if (this.selectedStatus) {
      filtered = filtered.filter((evaluation) => evaluation.status === this.selectedStatus)
    }

    this.totalItems = filtered.length

    // Appliquer la pagination
    this.filteredEvaluations = filtered.slice(this.pageIndex * this.pageSize, (this.pageIndex + 1) * this.pageSize)
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex
    this.pageSize = event.pageSize
    this.applyFilters()
  }

  resetFilters(): void {
    this.searchTerm = ""
    this.selectedEmployee = null
    this.selectedPeriod = null
    this.selectedStatus = null
    this.pageIndex = 0
    this.applyFilters()
  }

  openNewEvaluationDialog(): void {
    const dialogRef = this.dialog.open(EvaluationFormComponent, {
      width: "800px",
      data: { employees: this.employees, departments: this.departments },
    })

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.performanceService.createEvaluation(result).subscribe({
          next: () => {
            this.snackBar.open("Évaluation créée avec succès", "Fermer", { duration: 3000 })
            this.loadData()
          },
          error: (err) => {
            this.snackBar.open("Erreur lors de la création de l'évaluation", "Fermer", { duration: 3000 })
            console.error(err)
          },
        })
      }
    })
  }

  openEditEvaluationDialog(evaluation: Evaluation): void {
    const dialogRef = this.dialog.open(EvaluationFormComponent, {
      width: "800px",
      data: { evaluation, employees: this.employees, departments: this.departments },
    })

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.performanceService.updateEvaluation(evaluation.id!, result).subscribe({
          next: () => {
            this.snackBar.open("Évaluation mise à jour avec succès", "Fermer", { duration: 3000 })
            this.loadData()
          },
          error: (err) => {
            this.snackBar.open("Erreur lors de la mise à jour de l'évaluation", "Fermer", { duration: 3000 })
            console.error(err)
          },
        })
      }
    })
  }

  openDetailsDialog(evaluation: Evaluation): void {
    this.dialog.open(EvaluationDetailsComponent, {
      width: "800px",
      data: { evaluation },
    })
  }

  deleteEvaluation(evaluation: Evaluation): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: "400px",
      data: {
        title: "Confirmer la suppression",
        message: `Êtes-vous sûr de vouloir supprimer l'évaluation de ${evaluation.employee.firstName} ${evaluation.employee.lastName} pour la période ${evaluation.period} ?`,
        confirmText: "Supprimer",
        cancelText: "Annuler",
      },
    })

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.performanceService.deleteEvaluation(evaluation.id!).subscribe({
          next: () => {
            this.snackBar.open("Évaluation supprimée avec succès", "Fermer", { duration: 3000 })
            this.loadData()
          },
          error: (err) => {
            this.snackBar.open("Erreur lors de la suppression de l'évaluation", "Fermer", { duration: 3000 })
            console.error(err)
          },
        })
      }
    })
  }

  getUniquePeriodsFromEvaluations(): string[] {
    const periods = new Set<string>()
    this.evaluations.forEach((evaluation) => periods.add(evaluation.period))
    return Array.from(periods).sort()
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

  getDepartmentName(departmentId: number): string {
    const department = this.departments.find((d) => d.id === departmentId)
    return department ? department.name : "Département non spécifié"
  }
}
