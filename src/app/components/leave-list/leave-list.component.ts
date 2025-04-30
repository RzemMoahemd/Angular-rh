import { Component, OnInit, ViewChild } from "@angular/core"
import { MatTableDataSource } from "@angular/material/table"
import { MatPaginator } from "@angular/material/paginator"
import { MatSort } from "@angular/material/sort"
import { MatSnackBar } from "@angular/material/snack-bar"
import { Leave } from "../../models/leave"
import { LeaveService } from "../../services/leave.service"
import {
  trigger,
  transition,
  style,
  animate
} from '@angular/animations'
import { SearchService } from "../../services/search.service"

@Component({
  selector: 'app-leave-list',
  templateUrl: './leave-list.component.html',
  styleUrls: ['./leave-list.component.css'],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('0.4s ease-out', style({ opacity: 1, transform: 'translateY(0)' })),
      ])
    ])
  ]
})
export class LeaveListComponent implements OnInit {
  displayedColumns: string[] = ["employeId", "dateDebut", "dateFin", "motif", "statut", "actions"]
  dataSource: MatTableDataSource<Leave> = new MatTableDataSource<Leave>()

  @ViewChild(MatPaginator) paginator!: MatPaginator
  @ViewChild(MatSort) sort!: MatSort

  constructor(
    private leaveService: LeaveService,
    private snackBar: MatSnackBar,
    private searchService: SearchService
  ) {}

  ngOnInit(): void {
    this.loadLeaves()
    this.searchService.searchTerm$.subscribe(search => {
      this.applyGlobalFilter(search)
    })
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator
    this.dataSource.sort = this.sort
  }

  loadLeaves(): void {
    this.leaveService.getLeaves().subscribe({
      next: (data) => this.dataSource.data = data,
      error: (err) => {
        console.error("Error fetching leaves", err)
        this.showErrorMessage("Erreur lors du chargement des congés")
      }
    })
  }

  deleteLeave(id: number): void {
    this.leaveService.deleteLeave(id).subscribe({
      next: () => {
        this.dataSource.data = this.dataSource.data.filter((leave) => leave.id !== id)
        this.showSuccessMessage("Congé supprimé avec succès")
      },
      error: (err) => {
        console.error("Error deleting leave", err)
        this.showErrorMessage("Erreur lors de la suppression du congé")
      }
    })
  }

  applyGlobalFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase()
    if (this.dataSource.paginator) this.dataSource.paginator.firstPage()
  }

  private showSuccessMessage(message: string): void {
    this.snackBar.open(message, "Fermer", {
      duration: 3000,
      panelClass: ["success-snackbar"],
    })
  }

  private showErrorMessage(message: string): void {
    this.snackBar.open(message, "Fermer", {
      duration: 3000,
      panelClass: ["error-snackbar"],
    })
  }
}
