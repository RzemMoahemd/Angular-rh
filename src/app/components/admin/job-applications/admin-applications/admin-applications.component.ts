import { Component, OnInit, ViewChild } from "@angular/core"
import { MatTableDataSource } from "@angular/material/table"
import { MatPaginator } from "@angular/material/paginator"
import { MatSort } from "@angular/material/sort"
import { MatDialog } from "@angular/material/dialog"
import { MatSnackBar } from "@angular/material/snack-bar"
import { ActivatedRoute } from "@angular/router"
import { JobApplicationDto, ApplicationStatus } from "../../../../models/job-application.model"
import { JobApplicationService } from "app/services/job-application.service"
import { JobRequestService } from "app/services/job-request.service"
import { ApplicationDetailDialogComponent } from "../application-detail-dialog/application-detail-dialog.component"
import { AIAnalysisDialogComponent } from "../ai-analysis-dialog/ai-analysis-dialog.component"

@Component({
  selector: "app-admin-applications",
  templateUrl: "./admin-applications.component.html",
  styleUrls: ["./admin-applications.component.scss"],
})
export class AdminApplicationsComponent implements OnInit {
  displayedColumns: string[] = ["employeeName", "jobTitle", "appliedAt", "status", "aiMatchPercentage", "actions"]
  dataSource!: MatTableDataSource<JobApplicationDto>
  isLoading = true
  jobRequestId: number | null = null
  jobRequestTitle = "Toutes les offres"
  applicationStatuses = Object.values(ApplicationStatus)
  selectedStatusFilter: ApplicationStatus | "" = ""
  searchFilter: string = ""


  @ViewChild(MatPaginator) paginator!: MatPaginator
  @ViewChild(MatSort) sort!: MatSort

  constructor(
    private jobApplicationService: JobApplicationService,
    private jobRequestService: JobRequestService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.jobRequestId = this.route.snapshot.params["jobRequestId"]
    if (this.jobRequestId) {
      this.jobRequestService.getJobRequestById(this.jobRequestId).subscribe((job) => {
        this.jobRequestTitle = job.title
      })
      this.loadApplicationsForJob(this.jobRequestId)
    } else {
      this.loadAllApplications()
    }
  }

  loadAllApplications(): void {
    this.isLoading = true
    this.jobApplicationService.getAllApplications().subscribe({
      next: (data) => {
        this.dataSource = new MatTableDataSource(data)
        this.dataSource.paginator = this.paginator
        this.dataSource.sort = this.sort
        this.isLoading = false
        this.applyStatusFilter() // Apply filter after data load
      },
      error: (err) => {
        console.error("Erreur lors du chargement des candidatures:", err)
        this.snackBar.open("Erreur lors du chargement des candidatures.", "Fermer", { duration: 3000 })
        this.isLoading = false
      },
    })
  }

  loadApplicationsForJob(jobId: number): void {
    this.isLoading = true
    this.jobApplicationService.getApplicationsByJobRequest(jobId).subscribe({
      next: (data) => {
        this.dataSource = new MatTableDataSource(data)
        this.dataSource.paginator = this.paginator
        this.dataSource.sort = this.sort
        this.isLoading = false
        this.applyStatusFilter() // Apply filter after data load
      },
      error: (err) => {
        console.error("Erreur lors du chargement des candidatures pour l'offre:", err)
        this.snackBar.open("Erreur lors du chargement des candidatures pour cette offre.", "Fermer", {
          duration: 3000,
        })
        this.isLoading = false
      },
    })
  }

  applyFilter(event: Event): void {
  this.searchFilter = (event.target as HTMLInputElement).value.trim().toLowerCase()
  this.applyStatusFilter() // On relance le filtre combiné
}


  applyStatusFilter(): void {
  this.dataSource.filterPredicate = (data: JobApplicationDto, filter: string) => {
    // Vérifie le statut
    const matchesStatus = !this.selectedStatusFilter || data.status === this.selectedStatusFilter

    // Vérifie la recherche texte
    const search = this.searchFilter
    const matchesSearch =
      !search ||
      data.employeeFirstName?.toLowerCase().includes(search) ||
      data.employeeLastName?.toLowerCase().includes(search) ||
      data.employeeEmail?.toLowerCase().includes(search) ||
      data.motivationText?.toLowerCase().includes(search) ||
      data.jobTitle?.toLowerCase().includes(search)

    return matchesStatus && matchesSearch
  }

  // Déclenche le filtre (valeur arbitraire, juste pour forcer le recalcul)
  this.dataSource.filter = Math.random().toString()

  if (this.dataSource.paginator) {
    this.dataSource.paginator.firstPage()
  }
}


  viewApplicationDetails(application: JobApplicationDto): void {
    this.dialog.open(ApplicationDetailDialogComponent, {
      width: "800px",
      data: application,
    })
  }

  updateApplicationStatus(id: number, status: ApplicationStatus): void {
    this.jobApplicationService.updateApplicationStatus(id, status).subscribe({
      next: (updatedApplication) => {
        this.snackBar.open(`Statut de la candidature mis à jour à ${status}.`, "Fermer", { duration: 3000 })
        // Update the specific application in the dataSource
        const index = this.dataSource.data.findIndex((app) => app.id === updatedApplication.id)
        if (index > -1) {
          this.dataSource.data[index] = updatedApplication
          this.dataSource._updateChangeSubscription() // Refresh table
        }
      },
      error: (err) => {
        console.error("Erreur lors de la mise à jour du statut:", err)
        this.snackBar.open("Erreur lors de la mise à jour du statut.", "Fermer", { duration: 3000 })
      },
    })
  }

  runAIAnalysis(application: JobApplicationDto): void {
    if (!application.id) {
      this.snackBar.open("ID de candidature manquant pour l'analyse IA.", "Fermer", { duration: 3000 })
      return
    }
    this.snackBar.open("Lancement de l'analyse IA...", "Fermer", { duration: 5000 })
    this.jobApplicationService.analyzeApplication(application.id).subscribe({
      next: (updatedApplication) => {
        this.snackBar.open("Analyse IA terminée avec succès !", "Fermer", { duration: 3000 })
        // Update the specific application in the dataSource
        const index = this.dataSource.data.findIndex((app) => app.id === updatedApplication.id)
        if (index > -1) {
          this.dataSource.data[index] = updatedApplication
          this.dataSource._updateChangeSubscription() // Refresh table
        }
        this.viewAIAnalysis(updatedApplication) // Show results
      },
      error: (err) => {
        console.error("Erreur lors de l'analyse IA:", err)
        this.snackBar.open("Erreur lors de l'analyse IA.", "Fermer", { duration: 3000 })
      },
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

  getJobApplicationStatusClass(status: ApplicationStatus): string {
    switch (status) {
      case ApplicationStatus.PENDING:
        return "status-pending"
      case ApplicationStatus.UNDER_REVIEW:
        return "status-under-review"
      case ApplicationStatus.ACCEPTED:
        return "status-accepted"
      case ApplicationStatus.REJECTED:
        return "status-rejected"
      default:
        return ""
    }
  }

  getScoreColor(score: number | undefined): string {
    if (score === undefined || score === null) return ""
    if (score >= 80) return "score-high"
    if (score >= 60) return "score-medium"
    return "score-low"
  }

  runAIAnalysisForAll(): void {
  if (!this.jobRequestId) {
    this.snackBar.open("Aucune offre d'emploi sélectionnée.", "Fermer", { duration: 3000 });
    return;
  }

  this.snackBar.open("Lancement de l'analyse IA pour toutes les candidatures...", "Fermer", { duration: 5000 });
  this.jobApplicationService.analyzeAllApplicationsForJob(this.jobRequestId).subscribe({
    next: (updatedApplications) => {
      this.snackBar.open("Analyse IA terminée pour toutes les candidatures !", "Fermer", { duration: 3000 });
      this.dataSource.data = updatedApplications;
      this.dataSource._updateChangeSubscription(); // Refresh table
    },
    error: (err) => {
      console.error("Erreur lors de l'analyse IA pour toutes les candidatures:", err);
      this.snackBar.open("Erreur lors de l'analyse IA pour toutes les candidatures.", "Fermer", { duration: 3000 });
    },
  });
}

}
