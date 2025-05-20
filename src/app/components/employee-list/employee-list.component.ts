import { Component, OnInit, ViewChild, AfterViewInit } from "@angular/core";
import { MatTableDataSource } from "@angular/material/table";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatSnackBar } from "@angular/material/snack-bar";
import { FormControl } from '@angular/forms';
import { Employee } from "../../models/employee";
import { EmployeeService } from "../../services/employee.service";
import { SearchService } from '../../services/search.service';
import { DepartmentService } from '../../services/department.service';
import { Department } from '../../models/department';
import { forkJoin } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { EmployeeFormComponent } from "../employee-form/employee-form.component";


@Component({
  selector: "app-employee-list",
  templateUrl: "./employee-list.component.html",
  styleUrls: ["./employee-list.component.css"],
})
export class EmployeeListComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ["employee", "phoneNumber", "position", "department", "hireDate", "status", "actions"];
  dataSource: MatTableDataSource<Employee>;
  departments: Department[] = [];
  statuses = ['Tous', 'Actif', 'Inactif'];
  
  departmentFilter = new FormControl('Tous');
  statusFilter = new FormControl('Tous');
  searchControl = new FormControl('');

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    public dialog: MatDialog,
    public employeeService: EmployeeService,
    private departmentService: DepartmentService,
    private snackBar: MatSnackBar,
    public searchService: SearchService
  ) {
    this.dataSource = new MatTableDataSource<Employee>([]);
    this.dataSource.filterPredicate = this.customFilterPredicate();
  }

  ngOnInit(): void {
    this.loadData();
    
    this.departmentFilter.valueChanges.subscribe(() => this.applyFilters());
    this.statusFilter.valueChanges.subscribe(() => this.applyFilters());
    this.searchControl.valueChanges.subscribe(() => this.applyFilters());

    this.searchService.searchTerm$.subscribe(term => {
      this.searchControl.setValue(term);
      this.applyFilters();
    });
  }

  openEmployeeDialog(employee?: Employee): void {
  const dialogRef = this.dialog.open(EmployeeFormComponent, {
    data: { employee }
  });

  dialogRef.afterClosed().subscribe(result => {
    if (result === 'success') {
      this.loadData();
    }
  });
}

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  private loadData(): void {
    forkJoin([
      this.employeeService.getEmployees(),
      this.departmentService.getAllDepartments()
    ]).subscribe({
      next: ([employees, departments]) => {
        this.departments = departments;
        this.dataSource.data = employees.map(employee => ({
          ...employee,
          departmentName: this.getDepartmentName(employee.departmentId)
        }));
        this.dataSource.paginator = this.paginator;
      },
      error: (error) => {
        console.error("Error loading data", error);
        this.showErrorMessage("Erreur lors du chargement des données");
      }
    });
  }

  getDepartmentName(departmentId: number): string {
    const department = this.departments.find(d => d.id === departmentId);
    return department?.name || 'Non assigné';
  }

  private customFilterPredicate() {
  return (data: Employee, filter: string): boolean => {
    const filterObject = JSON.parse(filter);
    const searchMatch = data.firstName.toLowerCase().includes(filterObject.search) ||
                       data.lastName.toLowerCase().includes(filterObject.search) ||
                       data.email.toLowerCase().includes(filterObject.search) ||
                       data.phoneNumber.toString().includes(filterObject.search);
    
    // Le reste reste inchangé...
    const departmentMatch = filterObject.department === 'Tous' || 
                          this.getDepartmentName(data.departmentId) === filterObject.department;
    
    const statusMatch = filterObject.status === 'Tous' || 
                      data.status === filterObject.status;

    return searchMatch && departmentMatch && statusMatch;
  };
}

  applyFilters() {
    const filterValue = {
      search: this.searchControl.value?.trim().toLowerCase() || '',
      department: this.departmentFilter.value,
      status: this.statusFilter.value
    };
    
    this.dataSource.filter = JSON.stringify(filterValue);
    
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
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