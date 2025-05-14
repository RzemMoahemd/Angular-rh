import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Leave } from 'app/models/leave';

@Component({
  selector: "app-leave-details-dialog",
  templateUrl: "./leave-details-dialog.component.html",
  styleUrls: ["./leave-details-dialog.component.css"],
})
export class LeaveDetailsDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<LeaveDetailsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Leave & { employeeFullName: string }
  ) {}

  formatDate(date: Date | string): string {
    if (!date) return ""

    const dateObj = date instanceof Date ? date : new Date(date)
    return dateObj.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" })
  }

  onApprove(): void {
    this.dialogRef.close({ action: "approve" })
  }

  onReject(): void {
    this.dialogRef.close({ action: "reject" })
  }
}
