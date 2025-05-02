import { Component, OnInit, ViewChild } from "@angular/core"
import { MatTableDataSource } from "@angular/material/table"
import { MatPaginator } from "@angular/material/paginator"
import { MatSort } from "@angular/material/sort"
import { MatSnackBar } from "@angular/material/snack-bar"
import { Leave } from "../../models/leave"
import { LeaveService } from "../../services/leave.service"
import { EmployeeService } from "../../services/employee.service"
import { Employee } from "../../models/employee"
import { trigger, transition, style, animate } from '@angular/animations'
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
  displayedColumns: string[] = ["employeFullName", "dateDebut", "dateFin", "motif", "statut", "actions"]
  dataSource: MatTableDataSource<Leave & { employeFullName?: string }> = new MatTableDataSource()

  @ViewChild(MatPaginator) paginator!: MatPaginator
  @ViewChild(MatSort) sort!: MatSort

  employeeMap = new Map<number, string>()

  constructor(
    private leaveService: LeaveService,
    private employeeService: EmployeeService,
    private snackBar: MatSnackBar,
    private searchService: SearchService
  ) {}

  ngOnInit(): void {
    this.loadEmployeesAndLeaves()
    this.searchService.searchTerm$.subscribe(search => {
      this.applyGlobalFilter(search)
    })
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator
    this.dataSource.sort = this.sort
  }

  // 🔥 Charger employés + congés
  loadEmployeesAndLeaves(): void {
    this.employeeService.getEmployees().subscribe(employees => {
      employees.forEach(emp => {
        this.employeeMap.set(emp.id!, `${emp.firstName} ${emp.lastName}`)
      })

      this.loadLeaves()
    })
  }

  loadLeaves(): void {
    this.leaveService.getLeaves().subscribe({
      next: (data) => {
        // ➡️ Ajouter full name
        data.forEach(l => {
          l["employeFullName"] = this.employeeMap.get(l.employeId) ?? "Employé inconnu"
        })
        this.dataSource.data = data
      },
      error: () => this.showErrorMessage("Erreur lors du chargement des congés")
    })
  }

  deleteLeave(id: number): void {
    this.leaveService.deleteLeave(id).subscribe({
      next: () => {
        this.dataSource.data = this.dataSource.data.filter((leave) => leave.id !== id)
        this.showSuccessMessage("Congé supprimé avec succès")
      },
      error: () => this.showErrorMessage("Erreur lors de la suppression du congé")
    })
  }

  applyGlobalFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase()
    if (this.dataSource.paginator) this.dataSource.paginator.firstPage()
  }

  private showSuccessMessage(message: string): void {
    this.snackBar.open(message, "Fermer", { duration: 3000, panelClass: ["success-snackbar"] })
  }

  private showErrorMessage(message: string): void {
    this.snackBar.open(message, "Fermer", { duration: 3000, panelClass: ["error-snackbar"] })
  }

  updateStatus(leave: Leave, status: string): void {
    const updatedLeave = { ...leave, statut: status };
  
    this.leaveService.updateLeave(leave.id!, updatedLeave).subscribe({
      next: () => {
        leave.statut = status;
        this.showSuccessMessage(`Congé ${status}`);
      },
      error: () => {
        this.showErrorMessage("Erreur lors de la mise à jour du statut");
      }
    });
  }
  
}
