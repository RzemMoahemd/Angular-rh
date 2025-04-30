import { Component, type OnInit, ViewChild } from "@angular/core"
import { MatTableDataSource } from "@angular/material/table"
import { MatPaginator } from "@angular/material/paginator"
import { MatSort } from "@angular/material/sort"
import { MatSnackBar } from "@angular/material/snack-bar"
import type { Employee } from "../../models/employee"
import { EmployeeService } from "../../services/employee.service"
import { SearchService } from '../../services/search.service';


@Component({
  selector: "app-employee-list",
  templateUrl: "./employee-list.component.html",
  styleUrls: ["./employee-list.component.css"],
})
export class EmployeeListComponent implements OnInit {
  displayedColumns: string[] = ["lastName", "firstName", "email", "position", "actions"]
  dataSource: MatTableDataSource<Employee>

  @ViewChild(MatPaginator) paginator!: MatPaginator
  @ViewChild(MatSort) sort!: MatSort

  constructor(
    private employeeService: EmployeeService,
    private snackBar: MatSnackBar,
    private searchService: SearchService
  ) {
    this.dataSource = new MatTableDataSource<Employee>([])
  }

  ngOnInit(): void {
    console.log("EmployeeListComponent chargé"); 
    this.loadEmployees()

    this.searchService.searchTerm$.subscribe(term => {
      this.applySearchFilterFromNavbar(term);
    });
  }

  

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator
    this.dataSource.sort = this.sort
  }

  loadEmployees(): void {
    this.employeeService.getEmployees().subscribe(
      (data) => {
        this.dataSource.data = data
      },
      (error) => {
        console.error("Error fetching employees", error)
        this.showErrorMessage("Erreur lors du chargement des employés")
      },
    )
  }

  deleteEmployee(id: number): void {
    this.employeeService.deleteEmployee(id).subscribe(
      () => {
        this.dataSource.data = this.dataSource.data.filter((employee) => employee.id !== id)
        this.showSuccessMessage("Employé supprimé avec succès")
      },
      (error) => {
        console.error("Error deleting employee", error)
        this.showErrorMessage("Erreur lors de la suppression de l'employé")
      },
    )
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value
    this.dataSource.filter = filterValue.trim().toLowerCase()

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage()
    }
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

  applySearchFilterFromNavbar(value: string) {
    this.dataSource.filter = value.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
  
}

