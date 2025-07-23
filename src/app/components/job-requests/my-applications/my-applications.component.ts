import { Component, OnInit } from "@angular/core"
import { Router } from "@angular/router"
import { MatSnackBar } from "@angular/material/snack-bar"
import { MatDialog } from "@angular/material/dialog"
import { JobApplicationService } from "app/services/job-application.service"
import { KeycloakService } from "app/services/keycloak/keycloak.service"
import { JobApplicationDto, ApplicationStatus } from "../../../models/job-application.model"
import { AIAnalysisDialogComponent } from "app/components/admin/job-applications/ai-analysis-dialog/ai-analysis-dialog.component"
import { EmployeeService } from "app/services/employee.service"

@Component({
  selector: "app-my-applications",
  templateUrl: "./my-applications.component.html",
  styleUrls: ["./my-applications.component.css"],
})
export class MyApplicationsComponent implements OnInit {
  applications: JobApplicationDto[] = []
  loading = false
  currentEmployeeId?: number

  displayedColumns: string[] = ["jobTitle", "appliedAt", "status", "aiScore", "actions"]

  constructor(
    private jobApplicationService: JobApplicationService,
    private keycloakService: KeycloakService,
    private employeeService: EmployeeService,
    private router: Router,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    this.loadCurrentEmployee()
  }

  private loadCurrentEmployee(): void {
    const email = this.keycloakService.keycloak.tokenParsed?.email
    if (!email) {
      this.snackBar.open("Impossible de récupérer l'email depuis Keycloak", "Fermer", { duration: 3000 })
      return
    }

    this.employeeService.getEmployeeByEmail(email).subscribe({
      next: (employee) => {
        this.currentEmployeeId = employee.id
        this.loadMyApplications()
      },
      error: (err) => {
        console.error("Erreur lors de la récupération de l'employé :", err)
        this.snackBar.open("Erreur lors de la récupération des informations employé", "Fermer", { duration: 3000 })
      },
    })
  }

  loadMyApplications(): void {
    if (!this.currentEmployeeId) return

    this.loading = true
    this.jobApplicationService.getApplicationsByEmployee(this.currentEmployeeId).subscribe({
      next: (applications) => {
        this.applications = applications
        this.loading = false
      },
      error: (error) => {
        console.error("Erreur lors du chargement des candidatures:", error)
        this.snackBar.open("Erreur lors du chargement des candidatures", "Fermer", { duration: 3000 })
        this.loading = false
      },
    })
  }

 

  getStatusLabel(status: ApplicationStatus): string {
    const labels: { [key: string]: string } = {
      PENDING: "En attente",
      UNDER_REVIEW: "En cours d'examen",
      ACCEPTED: "Acceptée",
      REJECTED: "Refusée",
    }
    return labels[status] || status
  }

  getStatusColor(status: ApplicationStatus): string {
    switch (status) {
      case ApplicationStatus.PENDING:
        return "primary"
      case ApplicationStatus.UNDER_REVIEW:
        return "accent"
      case ApplicationStatus.ACCEPTED:
        return "primary"
      case ApplicationStatus.REJECTED:
        return "warn"
      default:
        return "primary"
    }
  }

  getStatusIcon(status: ApplicationStatus): string {
    switch (status) {
      case ApplicationStatus.PENDING:
        return "schedule"
      case ApplicationStatus.UNDER_REVIEW:
        return "visibility"
      case ApplicationStatus.ACCEPTED:
        return "check_circle"
      case ApplicationStatus.REJECTED:
        return "cancel"
      default:
        return "help"
    }
  }

  viewJobDetail(jobRequestId: number): void {
    this.router.navigate(["/employee/jobs", jobRequestId])
  }

  hasAIAnalysis(application: JobApplicationDto): boolean {
    return application.aiMatchPercentage !== null && application.aiMatchPercentage !== undefined
  }

  getScoreColor(score: number | undefined): string {
    if (score === undefined || score === null) return ""
    if (score >= 80) return "primary"
    if (score >= 60) return "accent"
    return "warn"
  }

  formatDate(date: Date | undefined): string {
    if (!date) return ""
    return new Date(date).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  viewAIAnalysis(application: JobApplicationDto): void {
    if (application.aiMatchPercentage !== undefined && application.aiMatchPercentage !== null) {
      this.dialog.open(AIAnalysisDialogComponent, {
        width: "600px",
        data: {
          matchPercentage: application.aiMatchPercentage,
          strengths: application.aiStrengths,
          weaknesses: application.aiWeaknesses,
          recommendations: application.aiRecommendations,
        },
      })
    } else {
      this.snackBar.open("Analyse IA non disponible pour cette candidature.", "Fermer", { duration: 3000 })
    }
  }

  downloadCV(application: JobApplicationDto): void {
    if (application.cvFileName) {
      this.jobApplicationService.downloadCv(application.id).subscribe({
        next: (blob) => {
          const url = window.URL.createObjectURL(blob)
          const a = document.createElement("a")
          a.href = url
          a.download = application.cvFileName!
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
          window.URL.revokeObjectURL(url)
          this.snackBar.open("CV téléchargé avec succès !", "Fermer", { duration: 3000 })
        },
        error: (err) => {
          console.error("Erreur lors du téléchargement du CV:", err)
          this.snackBar.open("Erreur lors du téléchargement du CV.", "Fermer", { duration: 3000 })
        },
      })
    } else {
      this.snackBar.open("Aucun CV disponible pour cette candidature.", "Fermer", { duration: 3000 })
    }
  }
}
