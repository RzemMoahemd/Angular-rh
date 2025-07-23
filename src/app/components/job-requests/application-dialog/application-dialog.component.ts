import { Component, OnInit, ViewChild, ElementRef, Inject } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { JobApplicationService } from "app/services/job-application.service";
import { JobRequestDto } from "../../../models/job-request.model";

export interface ApplicationDialogData {
  jobRequest: JobRequestDto;
  employeeId: number;
}

@Component({
  selector: "app-application-dialog",
  templateUrl: "./application-dialog.component.html",
  styleUrls: ["./application-dialog.component.css"],
})
export class ApplicationDialogComponent implements OnInit {
  applicationForm: FormGroup;
  selectedFile: File | null = null;
  isSubmitting = false;
  readonly maxFileSize = 5 * 1024 * 1024; // 5MB

  @ViewChild("fileInput") fileInput!: ElementRef<HTMLInputElement>;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<ApplicationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ApplicationDialogData,
    private jobApplicationService: JobApplicationService,
    private snackBar: MatSnackBar,
  ) {
    this.applicationForm = this.fb.group({
      motivationText: ["", [Validators.required, Validators.minLength(50), Validators.maxLength(1000)]],
      cvFile: [null, Validators.required],
    });
  }

  ngOnInit(): void {}

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input || !input.files || input.files.length === 0) {
      return;
    }
    const file = input.files[0];

    if (file.type !== "application/pdf") {
      this.snackBar.open("Seuls les fichiers PDF sont acceptés", "Fermer", { duration: 3000 });
      input.value = ""; // Clear the input
      return;
    }

    if (file.size > this.maxFileSize) {
      this.snackBar.open("Le fichier ne doit pas dépasser 5MB", "Fermer", { duration: 3000 });
      input.value = ""; // Clear the input
      return;
    }

    this.selectedFile = file;
    this.applicationForm.patchValue({ cvFile: file });
    this.applicationForm.get("cvFile")?.markAsDirty();
    this.applicationForm.get("cvFile")?.updateValueAndValidity();
  }

  removeFile(): void {
    this.selectedFile = null;
    this.applicationForm.patchValue({ cvFile: null });
    this.applicationForm.get("cvFile")?.markAsTouched();
    this.applicationForm.get("cvFile")?.updateValueAndValidity();
    if (this.fileInput) {
      this.fileInput.nativeElement.value = ""; // Clear the actual file input
    }
  }

  getFileSize(bytes: number): string {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }

  onSubmit(): void {
    if (this.applicationForm.invalid || this.isSubmitting) {
      this.applicationForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    const formData = this.applicationForm.value;

    this.jobApplicationService
      .applyForJob(
        this.data.jobRequest.id!, // Assure-toi que `id` est bien défini côté backend avant d’ouvrir le dialog.
        this.data.employeeId,
        formData.motivationText,
        this.selectedFile || undefined,
      )
      .subscribe({
        next: (result) => {
          this.isSubmitting = false;
          this.dialogRef.close(result);
        },
        error: (error) => {
          this.isSubmitting = false;
          console.error("Erreur lors de la candidature:", error);

          let errorMessage = "Erreur lors de la soumission de la candidature";
          if (error.error?.error) {
            errorMessage = error.error.error;
          }

          this.snackBar.open(errorMessage, "Fermer", {
            duration: 5000,
            panelClass: ["error-snackbar"],
          });
        },
      });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  get motivationText() {
    return this.applicationForm.get("motivationText");
  }

  getCharacterCount(): number {
    return this.motivationText?.value?.length || 0;
  }

  getCharacterCountColor(): "primary" | "warn" {
    const count = this.getCharacterCount();
    if (count < 50 || count > 900) return "warn";
    return "primary";
  }
}
