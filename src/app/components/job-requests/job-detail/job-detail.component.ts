import { Component, OnInit } from "@angular/core"
import { ActivatedRoute, Router } from "@angular/router"
import { MatDialog } from "@angular/material/dialog"
import { MatSnackBar } from "@angular/material/snack-bar"
import { JobRequestService } from "app/services/job-request.service"
import { JobApplicationService } from "app/services/job-application.service"
import { KeycloakService } from "app/services/keycloak/keycloak.service"
import { JobRequestDto } from "../../../models/job-request.model"
import { ApplicationDialogComponent } from "../application-dialog/application-dialog.component"
import { EmployeeService } from "app/services/employee.service"


@Component({
  selector: "app-job-detail",
  templateUrl: "./job-detail.component.html",
  styleUrls: ["./job-detail.component.css"],
})
export class JobDetailComponent implements OnInit {
  jobRequest: JobRequestDto | null = null
  loading = false
  hasApplied = false
  currentEmployeeId?: number

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private jobRequestService: JobRequestService,
    private jobApplicationService: JobApplicationService,
    private keycloakService: KeycloakService,
    private employeeService: EmployeeService

  ) {}

  ngOnInit(): void {
    this.loadCurrentEmployee()
  }

  private loadCurrentEmployee(): void {
    const email = this.keycloakService.keycloak.tokenParsed?.email
    if (!email) {
      this.snackBar.open("Impossible de récupérer l'email depuis Keycloak", "Fermer", { duration: 3000 })
      this.router.navigate(["/employee/jobs"])
      return
    }

    this.employeeService.getEmployeeByEmail(email).subscribe({
      next: (employee) => {
        this.currentEmployeeId = employee.id
        this.loadJobDetail()
      },
      error: (err) => {
        console.error("Erreur lors de la récupération de l'employé :", err)
        this.snackBar.open("Erreur lors de la récupération des informations employé", "Fermer", { duration: 3000 })
        this.router.navigate(["/employee/jobs"])
      },
    })
  }


  loadJobDetail(): void {
    const jobId = Number(this.route.snapshot.paramMap.get("id"))
    if (!jobId) {
      this.router.navigate(["/employee/jobs"])
      return
    }

    this.loading = true
    this.jobRequestService.getJobRequestById(jobId).subscribe({
      next: (job) => {
        this.jobRequest = job
        if (this.currentEmployeeId) {
          this.checkIfAlreadyApplied(jobId)
        }
        this.loading = false
      },
      error: (error) => {
        console.error("Erreur lors du chargement de l'offre:", error)
        this.snackBar.open("Erreur lors du chargement de l'offre", "Fermer", { duration: 3000 })
        this.router.navigate(["/employee/jobs"])
        this.loading = false
      },
    })
  }

  checkIfAlreadyApplied(jobId: number): void {
    this.jobApplicationService.checkIfEmployeeApplied(jobId, this.currentEmployeeId).subscribe({
      next: (result) => {
        this.hasApplied = result.hasApplied
      },
      error: (error) => {
        console.error("Erreur lors de la vérification de candidature:", error)
      },
    })
  }

  openApplicationDialog(): void {
    if (!this.jobRequest) return

    const dialogRef = this.dialog.open(ApplicationDialogComponent, {
      width: "600px",
      data: {
        jobRequest: this.jobRequest,
        employeeId: this.currentEmployeeId,
      },
    })

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.hasApplied = true
        this.snackBar.open("Candidature soumise avec succès!", "Fermer", {
          duration: 3000,
          panelClass: ["success-snackbar"],
        })
      }
    })
  }

  goBack(): void {
    this.router.navigate(["/employee/jobs"])
  }

  getExperienceLevelLabel(level: string): string {
    const labels: { [key: string]: string } = {
      JUNIOR: "Junior",
      INTERMEDIATE: "Intermédiaire",
      SENIOR: "Senior",
      EXPERT: "Expert",
    }
    return labels[level] || level
  }

  isDeadlineSoon(): boolean {
    if (!this.jobRequest?.deadline) return false
    const deadlineDate = new Date(this.jobRequest.deadline)
    const today = new Date()
    const diffTime = deadlineDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays <= 7 && diffDays > 0
  }

  isDeadlinePassed(): boolean {
    if (!this.jobRequest?.deadline) return false
    const deadlineDate = new Date(this.jobRequest.deadline)
    const today = new Date()
    return deadlineDate < today
  }

  canApply(): boolean {
    return !this.hasApplied && !this.isDeadlinePassed() && this.jobRequest?.status === "ACTIVE"
  }
}
