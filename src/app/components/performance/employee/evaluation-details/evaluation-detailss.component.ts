import { Component, Inject,  OnInit } from "@angular/core"
import {  FormBuilder,  FormGroup, Validators } from "@angular/forms"
import { MAT_DIALOG_DATA,  MatDialogRef } from "@angular/material/dialog"
import  { MatSnackBar } from "@angular/material/snack-bar"
import  { PerformanceService } from "app/services/performance.service"
import  { DepartmentService } from "app/services/department.service"
import  { Evaluation } from "app/models/Evaluation"
import  { Department } from "app/models/department"

@Component({
  selector: "app-evaluation-details",
  templateUrl: "./evaluation-details.component.html",
  styleUrls: ["./evaluation-details.component.scss"],
})
export class EvaluationDetailssComponent implements OnInit {
  evaluation: Evaluation
  isEmployee: boolean
  commentForm: FormGroup
  showCommentForm = false
  department: Department | null = null
  loading = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { evaluation: Evaluation; isEmployee: boolean; department?: Department },
    private dialogRef: MatDialogRef<EvaluationDetailssComponent>,
    private fb: FormBuilder,
    private performanceService: PerformanceService,
    private departmentService: DepartmentService,
    private snackBar: MatSnackBar
  ) {
    this.evaluation = this.data.evaluation;
    this.isEmployee = data.isEmployee || false;
    this.department = data.department || null;

    this.commentForm = this.fb.group({
      comment: ["", [Validators.required, Validators.minLength(10)]],
    });
  }

  ngOnInit(): void {
    // Charger les informations du département si nécessaire
    if (!this.department && this.evaluation && this.evaluation.employee && this.evaluation.employee.departmentId) {
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

  toggleCommentForm(): void {
    this.showCommentForm = !this.showCommentForm
  }

  submitComment(): void {
    if (this.commentForm.invalid) {
      return
    }

    const comment = this.commentForm.get("comment")?.value
    this.loading = true

    this.performanceService.addEmployeeComment(this.evaluation.id!, comment).subscribe({
      next: (updatedEvaluation) => {
        this.evaluation = updatedEvaluation
        this.showCommentForm = false
        this.snackBar.open("Commentaire ajouté avec succès", "Fermer", { duration: 3000 })
        this.loading = false
      },
      error: (err) => {
        this.snackBar.open("Erreur lors de l'ajout du commentaire", "Fermer", { duration: 3000 })
        console.error(err)
        this.loading = false
      },
    })
  }

  acknowledgeEvaluation(): void {
    this.loading = true

    this.performanceService.acknowledgeEvaluation(this.evaluation.id!).subscribe({
      next: (updatedEvaluation) => {
        this.evaluation = updatedEvaluation
        this.snackBar.open("Évaluation accusée de réception avec succès", "Fermer", { duration: 3000 })
        this.loading = false
      },
      error: (err) => {
        this.snackBar.open("Erreur lors de l'accusé de réception", "Fermer", { duration: 3000 })
        console.error(err)
        this.loading = false
      },
    })
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

  canAcknowledge(): boolean {
    return this.isEmployee && this.evaluation.status === "COMPLETE" && !this.evaluation.acknowledgementDate
  }

  canAddComment(): boolean {
    return this.isEmployee && this.evaluation.status === "COMPLETE"
  }
}
