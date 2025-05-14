import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Leave } from 'app/models/leave';

@Component({
  selector: 'app-leave-details-dialog-emp',
  templateUrl: './leave-details-dialog-emp.component.html',
  styleUrls: ['./leave-details-dialog-emp.component.css']
})
export class LeaveDetailsDialogEmpComponent {
  parsedData: any;

  constructor(
    public dialogRef: MatDialogRef<LeaveDetailsDialogEmpComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Leave
  ) {
    console.log(data);
    this.parsedData = {
      ...data,
      dateSoumission: new Date(data.dateSoumission),
      dateReponse: data.dateRepance ? new Date(data.dateRepance) : null,
      dateDebut: new Date(data.dateDebut),
      dateFin: new Date(data.dateFin)
    };
  }

  // Fonction pour déterminer la classe de badge en fonction du statut
  getBadgeClass(statut: string): string {
    switch (statut) {
      case 'approuvé':
        return 'badge-outline';
      case 'rejeté':
        return 'badge-destructive';
      default:
        return 'badge-secondary';
    }
  }
}