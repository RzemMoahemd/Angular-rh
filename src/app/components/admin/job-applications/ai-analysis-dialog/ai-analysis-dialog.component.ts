import { Component, OnInit, Inject } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";

export interface AIAnalysisDialogData {
  matchPercentage: number;
  strengths: string;
  weaknesses: string;
  recommendations: string;
  errorMessage?: string;        // facultatif
}

@Component({
  selector: "app-ai-analysis-dialog",
  templateUrl: "./ai-analysis-dialog.component.html",
  styleUrls: ["./ai-analysis-dialog.component.scss"],
})
export class AIAnalysisDialogComponent implements OnInit {
  constructor(
    private dialogRef: MatDialogRef<AIAnalysisDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: AIAnalysisDialogData
  ) {}

  ngOnInit(): void {}

  onClose(): void {
    this.dialogRef.close();
  }

  getScoreColor(score: number): string {
    if (score >= 80) return "score-high";
    if (score >= 60) return "score-medium";
    return "score-low";
  }
}
