import { Component, OnInit } from "@angular/core"
import { Router } from "@angular/router"
import { MatSnackBar } from "@angular/material/snack-bar"
import { JobRequestService } from "app/services/job-request.service"
import { JobApplicationService } from "app/services/job-application.service"
import { KeycloakService } from "app/services/keycloak/keycloak.service"
import { JobRequestDto } from "../../../models/job-request.model"
import { EmployeeService } from "app/services/employee.service"


@Component({
  selector: "app-job-list",
  templateUrl: "./job-list.component.html",
  styleUrls: ["./job-list.component.css"],
})
export class JobListComponent implements OnInit {
  jobRequests: JobRequestDto[] = []
  filteredJobs: JobRequestDto[] = []
  loading = false
  searchTerm = ""
  selectedDepartment = ""
  departments: string[] = []
  currentEmployeeId?: number

  constructor(
    private jobRequestService: JobRequestService,
    private jobApplicationService: JobApplicationService,
    private keycloakService: KeycloakService,
    private employeeService: EmployeeService,
    private router: Router,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    this.loading = true
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
        this.loadActiveJobs()
      },
      error: (err) => {
        console.error("Erreur lors de la récupération de l'employé :", err)
        this.snackBar.open("Erreur lors de la récupération des informations employé", "Fermer", { duration: 3000 })
      },
    })
  }

  loadActiveJobs(): void {
    this.loading = true
    this.jobRequestService.getActiveJobRequests().subscribe({
      next: (jobs) => {
        this.jobRequests = jobs
        this.filteredJobs = jobs
        this.extractDepartments()
        this.loading = false
      },
      error: (error) => {
        console.error("Erreur lors du chargement des offres:", error)
        this.snackBar.open("Erreur lors du chargement des offres", "Fermer", { duration: 3000 })
        this.loading = false
      },
    })
  }



  

  extractDepartments(): void {
    this.departments = [...new Set(this.jobRequests.map((job) => job.department))]
  }

  applyFilters(): void {
    this.filteredJobs = this.jobRequests.filter((job) => {
      const matchesSearch =
        job.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        job.description.toLowerCase().includes(this.searchTerm.toLowerCase())
      const matchesDepartment = !this.selectedDepartment || job.department === this.selectedDepartment

      return matchesSearch && matchesDepartment
    })
  }

  onSearchChange(): void {
    this.applyFilters()
  }

  onDepartmentChange(): void {
    this.applyFilters()
  }

  viewJobDetail(jobId: number): void {
    this.router.navigate(["/employee/jobs", jobId])
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

  getStatusColor(status: string): string {
    switch (status) {
      case "ACTIVE":
        return "primary"
      case "CLOSED":
        return "warn"
      case "DRAFT":
        return "accent"
      default:
        return "primary"
    }
  }

  isDeadlineSoon(deadline: Date): boolean {
    const deadlineDate = new Date(deadline)
    const today = new Date()
    const diffTime = deadlineDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays <= 7 && diffDays > 0
  }

  isDeadlinePassed(deadline: Date): boolean {
    const deadlineDate = new Date(deadline)
    const today = new Date()
    return deadlineDate < today
  }
}
