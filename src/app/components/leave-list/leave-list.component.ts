import { Component, OnInit, ViewChild, AfterViewInit } from "@angular/core";
import { MatTableDataSource } from "@angular/material/table";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatSnackBar } from "@angular/material/snack-bar";
import { FormControl } from '@angular/forms';
import { Leave } from "../../models/leave";
import { LeaveService } from "../../services/leave.service";
import { EmployeeService } from "../../services/employee.service";
import { Employee } from "../../models/employee";
import { SearchService } from "../../services/search.service";
import { MatDialog } from '@angular/material/dialog';
import { LeaveFormComponent } from "../leave-form/leave-form.component";
import { LeaveDetailsDialogComponent } from "../dialogs/leave-details-dialog/leave-details-dialog.component";


import { ApprovalDialogComponent } from "../dialogs/approval-dialog/approval-dialog.component";
import { RejectionDialogComponent } from "../dialogs/rejection-dialog/rejection-dialog.component";

@Component({
  selector: 'app-leave-list',
  templateUrl: './leave-list.component.html',
  styleUrls: ['./leave-list.component.css']
})
export class LeaveListComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ["employee", "reason", "period", "duration", "status", "actions"];
  dataSource: MatTableDataSource<Leave & { employeeFullName?: string }> = new MatTableDataSource();
  
  statuses = ['Tous', 'en attente', 'approuvé', 'rejeté'];
  typesConges = ['Tous', 'PAYÉ', 'MALADIE', 'RTT', 'SANS SOLDE'];
  
  statusFilter = new FormControl('Tous');
  typeFilter = new FormControl('Tous');
  searchControl = new FormControl('');

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  employeeMap = new Map<number, string>();

  constructor(
    public dialog: MatDialog,
    private leaveService: LeaveService,
    private employeeService: EmployeeService,
    private snackBar: MatSnackBar,
    private searchService: SearchService
  ) {
    this.dataSource.filterPredicate = this.customFilterPredicate();
  }

  ngOnInit(): void {
    this.loadEmployeesAndLeaves();
    
    this.statusFilter.valueChanges.subscribe(() => this.applyFilters());
    this.typeFilter.valueChanges.subscribe(() => this.applyFilters());
    this.searchControl.valueChanges.subscribe(() => this.applyFilters());

    this.searchService.searchTerm$.subscribe(term => {
      this.searchControl.setValue(term);
      this.applyFilters();
    });
  }

  // openLeaveDialog(): void {
  //   const dialogRef = this.dialog.open(LeaveFormComponent, {
  //     data: { leave: null }
  //   });

  //   dialogRef.afterClosed().subscribe(result => {
  //     if (result === 'success') {
  //       this.loadEmployeesAndLeaves();
  //     }
  //   });
  // }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  private loadEmployeesAndLeaves(): void {
    this.employeeService.getEmployees().subscribe(employees => {
      employees.forEach(emp => {
        this.employeeMap.set(emp.id!, `${emp.firstName} ${emp.lastName}`);
      });
      this.loadLeaves();
    });
  }

  private loadLeaves(): void {
    this.leaveService.getLeaves().subscribe({
      next: (data) => {
        data.forEach(l => {
          l["employeeFullName"] = this.employeeMap.get(l.employeId) ?? "Employé inconnu";
        });
        this.dataSource.data = data;
      },
      error: () => this.showErrorMessage("Erreur lors du chargement des congés")
    });
  }

  private customFilterPredicate() {
    return (data: Leave & { employeeFullName?: string }, filter: string): boolean => {
      const filterObject = JSON.parse(filter);
      const searchMatch = data.employeeFullName?.toLowerCase().includes(filterObject.search) ||
                         data.motif.toLowerCase().includes(filterObject.search) ||
                         data.statut.toLowerCase().includes(filterObject.search);
      
      const statusMatch = filterObject.status === 'Tous' || data.statut === filterObject.status;
      const typeMatch = filterObject.type === 'Tous' || data.motif === filterObject.type;

      return searchMatch && statusMatch && typeMatch;
    };
  }

  applyFilters() {
    const filterValue = {
      search: this.searchControl.value?.trim().toLowerCase() || '',
      status: this.statusFilter.value,
      type: this.typeFilter.value
    };
    
    this.dataSource.filter = JSON.stringify(filterValue);
    
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  updateStatus(leave: Leave, status: string): void {
  if (status === 'approuvé') {
    const dialogRef = this.dialog.open(ApprovalDialogComponent, {
      //width: '500px',
      data: { leave }
    });

    dialogRef.afterClosed().subscribe(confirm => {
      if (confirm) {
        const updatedLeave = { ...leave, statut: status };
        
        this.leaveService.updateLeave(leave.id!, updatedLeave).subscribe({
          next: () => {
            this.loadLeaves();
            this.showSuccessMessage('Congé approuvé avec succès');
          },
          error: () => {
            this.showErrorMessage('Échec de l\'approbation');
          }
        });
      }
    });

  } else if (status === 'rejeté') {
  const dialogRef = this.dialog.open(RejectionDialogComponent, {
    //width: '500px',
    data: { leave }
  });

  dialogRef.afterClosed().subscribe(reason => {
    if (reason) {
      const updatedLeave = { 
        ...leave, 
        statut: status,
        commentaire: reason // <-- Changement ici
      };

      this.leaveService.updateLeave(leave.id!, updatedLeave).subscribe({
        next: () => {
          this.loadLeaves();
          this.showSuccessMessage('Congé rejeté avec succès');
        },
        error: () => {
          this.showErrorMessage('Échec du rejet');
        }
      });
    }
  });
}
}

  private showSuccessMessage(message: string): void {
    this.snackBar.open(message, "Fermer", { duration: 3000, panelClass: ["success-snackbar"] });
  }

  private showErrorMessage(message: string): void {
    this.snackBar.open(message, "Fermer", { duration: 3000, panelClass: ["error-snackbar"] });
  }

  openDetailsDialog(leave: Leave): void {
  this.dialog.open(LeaveDetailsDialogComponent, {
    data: {
      ...leave,
      employeeFullName: this.employeeMap.get(leave.employeId) || 'Non spécifié'
    }
  }).afterClosed().subscribe(result => {
    if (result?.action === 'approve') {
      this.updateStatus(leave, 'approuvé');
    } else if (result?.action === 'reject') {
      this.updateStatus(leave, 'rejeté');
    }
  });
}
}