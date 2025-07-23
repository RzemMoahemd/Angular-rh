import { Component, OnInit } from "@angular/core"
import { FormBuilder, FormGroup, Validators } from "@angular/forms"
import { ActivatedRoute, Router } from "@angular/router"
import { MatSnackBar } from "@angular/material/snack-bar"
import { JobRequest, ExperienceLevel, JobStatus } from "../../../../models/job-request.model"
import { JobRequestService } from "app/services/job-request.service"

@Component({
  selector: "app-admin-job-form",
  templateUrl: "./admin-job-form.component.html",
  styleUrls: ["./admin-job-form.component.scss"],
})
export class AdminJobFormComponent implements OnInit {
  jobForm!: FormGroup
  isEditMode = false
  jobRequestId: number | null = null
  experienceLevels = Object.values(ExperienceLevel)
  jobStatuses = Object.values(JobStatus)
  isLoading = false

  constructor(
    private fb: FormBuilder,
    private jobRequestService: JobRequestService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    this.jobForm = this.fb.group({
      title: ["", Validators.required],
      description: ["", Validators.required],
      department: ["", Validators.required],
      experienceLevel: [ExperienceLevel.JUNIOR, Validators.required],
      requiredSkills: ["", Validators.required], // Will be split by comma
      deadline: ["", Validators.required],
      status: [JobStatus.DRAFT, Validators.required],
    })

    this.jobRequestId = this.route.snapshot.params["id"]
    if (this.jobRequestId) {
      this.isEditMode = true
      this.loadJobRequest(this.jobRequestId)
    }
  }

  loadJobRequest(id: number): void {
    this.isLoading = true
    this.jobRequestService.getJobRequestById(id).subscribe({
      next: (job) => {
        this.jobForm.patchValue({
          ...job,
          requiredSkills: job.requiredSkills.join(", "), // Convert array to string
          deadline: job.deadline ? new Date(job.deadline) : null, // Ensure Date object for date picker
        })
        this.isLoading = false
      },
      error: (err) => {
        console.error("Erreur lors du chargement de l'offre d'emploi:", err)
        this.snackBar.open("Erreur lors du chargement de l'offre d'emploi.", "Fermer", { duration: 3000 })
        this.isLoading = false
        this.router.navigate(["/admin/job-requests"])
      },
    })
  }

  onSubmit(): void {
    if (this.jobForm.invalid) {
      this.jobForm.markAllAsTouched()
      this.snackBar.open("Veuillez remplir tous les champs requis.", "Fermer", { duration: 3000 })
      return
    }

    this.isLoading = true
    const jobRequest: JobRequest = {
      ...this.jobForm.value,
      requiredSkills: (this.jobForm.value.requiredSkills as string)
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s.length > 0),
        deadline: this.jobForm.value.deadline
    ? new Date(this.jobForm.value.deadline).toISOString().slice(0, 19)  // <-- supprime le Z
    : null,
    };

    if (this.isEditMode && this.jobRequestId) {
      this.jobRequestService.updateJobRequest(this.jobRequestId, jobRequest).subscribe({
        next: () => {
          this.snackBar.open("Offre d'emploi mise à jour avec succès !", "Fermer", { duration: 3000 })
          this.router.navigate(["/admin/job-requests"])
          this.isLoading = false
        },
        error: (err) => {
          console.error("Erreur lors de la mise à jour:", err)
          this.snackBar.open("Erreur lors de la mise à jour de l'offre d'emploi.", "Fermer", { duration: 3000 })
          this.isLoading = false
        },
      })
    } else {
      this.jobRequestService.createJobRequest(jobRequest).subscribe({
        next: () => {
          this.snackBar.open("Offre d'emploi créée avec succès !", "Fermer", { duration: 3000 })
          this.router.navigate(["/admin/job-requests"])
          this.isLoading = false
        },
        error: (err) => {
          console.error("Erreur lors de la création:", err)
          this.snackBar.open("Erreur lors de la création de l'offre d'emploi.", "Fermer", { duration: 3000 })
          this.isLoading = false
        },
      })
    }
  }

  onCancel(): void {
    this.router.navigate(["/admin/job-requests"])
  }
}
