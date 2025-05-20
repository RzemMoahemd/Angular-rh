import { Component, Inject } from "@angular/core"
import { MAT_DIALOG_DATA,  MatDialogRef } from "@angular/material/dialog"
import  { Evaluation } from "app/models/Evaluation"
import  { DepartmentService } from "app/services/department.service"
import  { Department } from "app/models/department"

@Component({
  selector: "app-evaluation-details",
  templateUrl: "./evaluation-details.component.html",
  styleUrls: ["./evaluation-details.component.scss"],
})
export class EvaluationDetailsComponent {
  evaluation: Evaluation
  department: Department | null = null
  loading = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<EvaluationDetailsComponent>,
    private readonly departmentService: DepartmentService
  ) {
    this.evaluation = this.data.evaluation;
    this.loadDepartmentInfo();
  }

  loadDepartmentInfo(): void {
    if (this.evaluation && this.evaluation.employee && this.evaluation.employee.departmentId) {
      this.loading = true
      this.departmentService.getDepartmentById(this.evaluation.employee.departmentId).subscribe({
        next: (department) => {
          this.department = department
          this.loading = false
        },
        error: (err) => {
          console.error("Erreur lors de la récupération du département", err)
          this.loading = false
        },
      })
    }
  }

  close(): void {
    this.dialogRef.close()
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

  getPriorityLabel(priority: string): string {
    switch (priority) {
      case "HAUTE":
        return "Haute"
      case "MOYENNE":
        return "Moyenne"
      case "BASSE":
        return "Basse"
      default:
        return priority
    }
  }

  getPriorityClass(priority: string): string {
    switch (priority) {
      case "HAUTE":
        return "priority-high"
      case "MOYENNE":
        return "priority-medium"
      case "BASSE":
        return "priority-low"
      default:
        return ""
    }
  }

  getGoalStatusLabel(status: string): string {
    switch (status) {
      case "NON_COMMENCE":
        return "Non commencé"
      case "EN_COURS":
        return "En cours"
      case "COMPLETE":
        return "Complété"
      default:
        return status
    }
  }

  getGoalStatusClass(status: string): string {
    switch (status) {
      case "NON_COMMENCE":
        return "goal-not-started"
      case "EN_COURS":
        return "goal-in-progress"
      case "COMPLETE":
        return "goal-completed"
      default:
        return ""
    }
  }
}
