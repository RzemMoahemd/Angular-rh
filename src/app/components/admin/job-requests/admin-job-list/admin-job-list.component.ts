import { Component, OnInit, ViewChild } from "@angular/core"
import { MatTableDataSource } from "@angular/material/table"
import { MatPaginator } from "@angular/material/paginator"
import { MatSort } from "@angular/material/sort"
import { MatDialog } from "@angular/material/dialog"
import { MatSnackBar } from "@angular/material/snack-bar"
import { Router } from "@angular/router"
import { JobRequestDto, JobStatus } from "../../../../models/job-request.model"
import { JobRequestService } from "app/services/job-request.service"

@Component({
  selector: "app-admin-job-list",
  templateUrl: "./admin-job-list.component.html",
  styleUrls: ["./admin-job-list.component.scss"],
})
export class AdminJobListComponent implements OnInit {
  displayedColumns: string[] = [
    "title",
    "department",
    "experienceLevel",
    "status",
    "applicationsCount",
    "deadline",
    "actions",
  ]
  dataSource!: MatTableDataSource<JobRequestDto>
  isLoading = true

  @ViewChild(MatPaginator) paginator!: MatPaginator
  @ViewChild(MatSort) sort!: MatSort

  constructor(
    private jobRequestService: JobRequestService,
    private dialog: MatDialog, // MatDialog is imported but not used in this component. It's kept for consistency if future dialogs are added.
    private snackBar: MatSnackBar,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.loadJobRequests()
  }

  loadJobRequests(): void {
    this.isLoading = true
    this.jobRequestService.getAllJobRequests().subscribe({
      next: (data) => {
        this.dataSource = new MatTableDataSource(data)
        this.dataSource.paginator = this.paginator
        this.dataSource.sort = this.sort
        this.isLoading = false
      },
      error: (err) => {
        console.error("Erreur lors du chargement des offres d'emploi:", err)
        this.snackBar.open("Erreur lors du chargement des offres d'emploi.", "Fermer", { duration: 3000 })
        this.isLoading = false
      },
    })
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value
    this.dataSource.filter = filterValue.trim().toLowerCase()

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage()
    }
  }

  editJobRequest(id: number): void {
    this.router.navigate([`/admin/job-requests/edit/${id}`])
  }

  deleteJobRequest(id: number): void {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette offre d'emploi ?")) {
      this.jobRequestService.deleteJobRequest(id).subscribe({
        next: () => {
          this.snackBar.open("Offre d'emploi supprimée avec succès.", "Fermer", { duration: 3000 })
          this.loadJobRequests() // Recharger la liste
        },
        error: (err) => {
          console.error("Erreur lors de la suppression de l'offre d'emploi:", err)
          this.snackBar.open("Erreur lors de la suppression de l'offre d'emploi.", "Fermer", { duration: 3000 })
        },
      })
    }
  }

  viewApplications(jobRequestId: number): void {
    this.router.navigate([`/admin/job-requests/${jobRequestId}/applications`])
  }

  getJobStatusClass(status: JobStatus): string {
    switch (status) {
      case JobStatus.ACTIVE:
        return "status-active"
      case JobStatus.CLOSED:
        return "status-closed"
      case JobStatus.DRAFT:
        return "status-draft"
      default:
        return ""
    }
  }
}
