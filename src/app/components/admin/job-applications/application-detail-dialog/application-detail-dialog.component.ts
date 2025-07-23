import { Component, OnInit, Inject } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { JobApplicationDto, ApplicationStatus } from "../../../../models/job-application.model";
import { JobApplicationService } from "app/services/job-application.service";
import { AIAnalysisDialogComponent } from "../ai-analysis-dialog/ai-analysis-dialog.component";
import { MatDialog } from "@angular/material/dialog";

@Component({
  selector: "app-application-detail-dialog",
  templateUrl: "./application-detail-dialog.component.html",
  styleUrls: ["./application-detail-dialog.component.scss"],
})
export class ApplicationDetailDialogComponent implements OnInit {
  applicationStatuses = Object.values(ApplicationStatus);

  constructor(
    public dialogRef: MatDialogRef<ApplicationDetailDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: JobApplicationDto,
    private jobApplicationService: JobApplicationService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {}

  onClose(): void {
    this.dialogRef.close();
  }

  updateStatus(newStatus: ApplicationStatus): void {
    if (!this.data.id) return;

    this.jobApplicationService.updateApplicationStatus(this.data.id, newStatus).subscribe({
      next: (updatedApp) => {
        this.data.status = updatedApp.status;
        this.snackBar.open(`Statut mis à jour à ${newStatus}`, "Fermer", { duration: 3000 });
      },
      error: (err) => {
        console.error("Erreur lors de la mise à jour du statut:", err);
        this.snackBar.open("Erreur lors de la mise à jour du statut.", "Fermer", { duration: 3000 });
      },
    });
  }

  runAIAnalysis(): void {
    if (!this.data.id) {
      this.snackBar.open("ID de candidature manquant pour l'analyse IA.", "Fermer", { duration: 3000 });
      return;
    }
    this.snackBar.open("Lancement de l'analyse IA...", "Fermer", { duration: 5000 });
    this.jobApplicationService.analyzeApplication(this.data.id).subscribe({
      next: (updatedApplication) => {
        this.data.aiMatchPercentage = updatedApplication.aiMatchPercentage;
        this.data.aiStrengths = updatedApplication.aiStrengths;
        this.data.aiWeaknesses = updatedApplication.aiWeaknesses;
        this.data.aiRecommendations = updatedApplication.aiRecommendations;
        this.data.aiAnalyzedAt = updatedApplication.aiAnalyzedAt;
        this.snackBar.open("Analyse IA terminée avec succès !", "Fermer", { duration: 3000 });
        this.viewAIAnalysis();
      },
      error: (err) => {
        console.error("Erreur lors de l'analyse IA:", err);
        this.snackBar.open("Erreur lors de l'analyse IA.", "Fermer", { duration: 3000 });
      },
    });
  }

  viewAIAnalysis(): void {
    if (this.data.aiMatchPercentage !== undefined && this.data.aiMatchPercentage !== null) {
      this.dialog.open(AIAnalysisDialogComponent, {
        width: "600px",
        data: {
          matchPercentage: this.data.aiMatchPercentage,
          strengths: this.data.aiStrengths,
          weaknesses: this.data.aiWeaknesses,
          recommendations: this.data.aiRecommendations,
        },
      });
    } else {
      this.snackBar.open("Analyse IA non disponible pour cette candidature.", "Fermer", { duration: 3000 });
    }
  }

  downloadCv(): void {
    if (this.data.cvFileName) {
      this.jobApplicationService.downloadCv(this.data.id).subscribe({
        next: (blob) => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = this.data.cvFileName!;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
          this.snackBar.open("CV téléchargé avec succès !", "Fermer", { duration: 3000 });
        },
        error: (err) => {
          console.error("Erreur lors du téléchargement du CV:", err);
          this.snackBar.open("Erreur lors du téléchargement du CV.", "Fermer", { duration: 3000 });
        },
      });
    } else {
      this.snackBar.open("Aucun CV disponible pour cette candidature.", "Fermer", { duration: 3000 });
    }
  }

  getScoreColor(score: number | undefined): string {
    if (score === undefined || score === null) return "";
    if (score >= 80) return "score-high";
    if (score >= 60) return "score-medium";
    return "score-low";
  }
}
