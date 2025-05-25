import { Component,  OnInit } from "@angular/core"
import  { PerformanceService } from "app/services/performance.service"
import  { DepartmentService } from "app/services/department.service"
import  { PerformanceTrend } from "app/models/PerformanceTrend"
import  { DepartmentPerformance } from "app/models/DepartmentPerformance"
import  { CriterionAverage } from "app/models/CriterionAverage"
import  { Evaluation } from "app/models/Evaluation"
import  { Department } from "app/models/department"
import { finalize, forkJoin } from "rxjs"
import { EmployeeService } from "app/services/employee.service"
import { MatDialog } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { PageEvent } from "@angular/material/paginator";
import { Employee } from "app/models/employee";


import { EvaluationFormComponent } from "../evaluation-form/evaluation-form.component";
import { EvaluationDetailsComponent } from "../evaluation-details/evaluation-details.component";
import { ConfirmDialogComponent } from "../../confirm-dialog/confirm-dialog.component";





@Component({
  selector: "app-performance-dashboard",
  templateUrl: "./performance-dashboard.component.html",
  styleUrls: ["./performance-dashboard.component.scss"],
})
export class PerformanceDashboardComponent implements OnInit {
  // Data Sources
  performanceTrends: PerformanceTrend[] = [];
  departmentPerformances: DepartmentPerformance[] = [];
  criteriaAverages: CriterionAverage[] = [];
  topPerformers: Evaluation[] = [];
  departments: Department[] = [];
  evaluations: Evaluation[] = [];
  filteredEvaluations: Evaluation[] = [];
  employees: Employee[] = [];

  departmentTrendsData: any;
chartOptions: any;
colorPalette = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'];

  // Statistics
  averageScore = 0;
  highestScore = 0;
  lowestScore = 0;
  completedEvaluations = 0;
  totalEmployees = 0;
  evaluatedPercentage = 0;
  currentPeriod: string;

  // UI States
  loading = true;
  error: string | null = null;
  selectedTab: 'list' | 'trends' = 'list';

  // Filters
  searchTerm = "";
  selectedEmployee: number | null = null;
  selectedPeriodFilter: string | null = null;
  selectedStatus: string | null = null;

  // Pagination
  pageSize = 10;
  pageIndex = 0;
  totalItems = 0;
  displayedColumns: string[] = ["employee", "period", "date", "score", "status", "actions"];

  // Chart Options
  trendChartOptions: any;
  departmentChartOptions: any;
  criteriaChartOptions: any;

  constructor(
    private performanceService: PerformanceService,
    private departmentService: DepartmentService,
    private employeeService: EmployeeService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.currentPeriod = this.getCurrentPeriod();
    this.initChartOptions();
    this.loadDashboardData();
  }

  private getCurrentPeriod(): string {
    const now = new Date();
    const quarter = Math.floor(now.getMonth() / 3) + 1;
    const year = now.getFullYear();
    return `Q${quarter} ${year}`;
  }

  loadDashboardData(): void {
    this.loading = true;
    this.error = null;

    forkJoin({
      trends: this.performanceService.getPerformanceTrends(),
      departments: this.departmentService.getAllDepartments(),
      departmentPerformances: this.performanceService.getDepartmentPerformances(),
      criteriaAverages: this.performanceService.getCriteriaAverages(),
      topPerformers: this.performanceService.getTopPerformers(5),
      employees: this.employeeService.getEmployees(),
      evaluations: this.performanceService.getAllEvaluations()
    }).pipe(
      finalize(() => {
        this.loading = false;
      })
    ).subscribe({
      next: (results) => {
        this.processDashboardData(results);
      },
      error: (err) => {
        this.handleDataError(err);
      }
    });
  }

  private processDashboardData(results: any): void {
    this.performanceTrends = results.trends;
    this.departments = results.departments;
    this.departmentPerformances = results.departmentPerformances;
    this.criteriaAverages = results.criteriaAverages;
    this.topPerformers = results.topPerformers;
    this.employees = results.employees;
    this.evaluations = results.evaluations;
    this.totalEmployees = results.employees.length;
    this.prepareDepartmentTrendsChart(results.departmentPerformances);


    this.enrichDataWithDepartments();
    this.calculateStatistics();
    this.applyFilters();
    this.updateCharts();
  }


  // Modifier la structure des données du graphique
private prepareDepartmentTrendsChart(performances: DepartmentPerformance[]): void {
  const departments = [...new Set(performances.map(p => p.departmentName.trim()))];
  const quarters = this.getSortedQuarters(performances);

  // Nouvelle structure de données conforme à Chart.js
  this.departmentTrendsData = {
    labels: quarters,
    datasets: departments.map((department, index) => ({
      label: department,
      data: this.getDepartmentScores(department, quarters, performances),
      borderColor: this.colorPalette[index % this.colorPalette.length],
      backgroundColor: 'transparent',
      tension: 0.4,
      pointRadius: 5,
      pointHoverRadius: 7
    }))
  };

  // Options du graphique mises à jour
  this.chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        grid: { display: false }
      },
      y: {
        min: 0,
        max: 100,
        ticks: {
          stepSize: 20,
          callback: (value: string | number) => `${value}%`
        }
      }
    },
    plugins: {
      legend: {
        position: 'bottom',
        labels: { boxWidth: 20 }
      }
    }
  };
}


private getSortedQuarters(performances: DepartmentPerformance[]): string[] {
  return [...new Set(performances.map(p => p.quarter))]
    .sort((a, b) => {
      const [qA, yA] = a.split(' ');
      const [qB, yB] = b.split(' ');
      return parseInt(yA) - parseInt(yB) || qA.localeCompare(qB);
    });
}

private getDepartmentScores(department: string, quarters: string[], data: DepartmentPerformance[]): number[] {
  return quarters.map(quarter => {
    const entry = data.find(d => 
      d.departmentName.trim() === department.trim() && d.quarter === quarter // Comparaison avec .trim()
    );
    return entry ? Math.round(entry.averageScore) : 0;
  });
}

  private enrichDataWithDepartments(): void {
    this.enrichEvaluationsWithDepartments();
    this.enrichTopPerformersWithDepartments();
  }

  private enrichEvaluationsWithDepartments(): void {
    this.evaluations.forEach(evaluation => {
      if (evaluation.employee?.departmentId) {
        const department = this.departments.find(d => d.id === evaluation.employee.departmentId);
        if (department) {
          (evaluation.employee as any).departmentName = department.name;
        }
      }
    });
  }

  private enrichTopPerformersWithDepartments(): void {
    this.topPerformers.forEach(performer => {
      if (performer.employee?.departmentId) {
        const department = this.departments.find(d => d.id === performer.employee.departmentId);
        if (department) {
          (performer.employee as any).departmentName = department.name;
        }
      }
    });
  }

  calculateStatistics(): void {
    const currentPeriodEvaluations = this.evaluations.filter(e => e.period === this.currentPeriod);
    
    if (currentPeriodEvaluations.length > 0) {
      const evaluatedEmployeeIds = new Set(currentPeriodEvaluations.map(e => e.employee?.id));
      const evaluatedCount = evaluatedEmployeeIds.size;

      this.averageScore = this.calculateAverageScore(currentPeriodEvaluations);
      this.highestScore = Math.max(...currentPeriodEvaluations.map(e => e.overallScore));
      this.lowestScore = Math.min(...currentPeriodEvaluations.map(e => e.overallScore));
      this.completedEvaluations = evaluatedCount;
      this.evaluatedPercentage = this.totalEmployees > 0 
        ? Math.round((evaluatedCount / this.totalEmployees) * 100)
        : 0;
    } else {
      this.resetStatistics();
    }
  }

  private calculateAverageScore(evaluations: Evaluation[]): number {
    return evaluations.reduce((sum, e) => sum + e.overallScore, 0) / evaluations.length;
  }

  private resetStatistics(): void {
    this.averageScore = 0;
    this.highestScore = 0;
    this.lowestScore = 0;
    this.completedEvaluations = 0;
    this.evaluatedPercentage = 0;
  }

  applyFilters(): void {
    let filtered = [...this.evaluations];

    filtered = this.applySearchFilter(filtered);
    filtered = this.applyEmployeeFilter(filtered);
    filtered = this.applyPeriodFilter(filtered);
    filtered = this.applyStatusFilter(filtered);

    this.totalItems = filtered.length;
    this.filteredEvaluations = this.paginateData(filtered);
  }

  private applySearchFilter(data: Evaluation[]): Evaluation[] {
    if (!this.searchTerm) return data;
    const term = this.searchTerm.toLowerCase();
    return data.filter(e =>
      e.employee.firstName.toLowerCase().includes(term) ||
      e.employee.lastName.toLowerCase().includes(term) ||
      e.employee.position.toLowerCase().includes(term) ||
      (e.employee as any).departmentName?.toLowerCase().includes(term)
    );
  }

  private applyEmployeeFilter(data: Evaluation[]): Evaluation[] {
    return this.selectedEmployee 
      ? data.filter(e => e.employee.id === this.selectedEmployee)
      : data;
  }

  private applyPeriodFilter(data: Evaluation[]): Evaluation[] {
    return this.selectedPeriodFilter
      ? data.filter(e => e.period === this.selectedPeriodFilter)
      : data;
  }

  private applyStatusFilter(data: Evaluation[]): Evaluation[] {
    return this.selectedStatus
      ? data.filter(e => e.status === this.selectedStatus)
      : data;
  }

  private paginateData(data: Evaluation[]): Evaluation[] {
    const start = this.pageIndex * this.pageSize;
    const end = start + this.pageSize;
    return data.slice(start, end);
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.applyFilters();
  }

  resetFilters(): void {
    this.searchTerm = "";
    this.selectedEmployee = null;
    this.selectedPeriodFilter = null;
    this.selectedStatus = null;
    this.pageIndex = 0;
    this.applyFilters();
  }

  // CRUD Operations
  openNewEvaluationDialog(): void {
    const dialogRef = this.dialog.open(EvaluationFormComponent, {
      width: "800px",
      data: { employees: this.employees, departments: this.departments }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.handleEvaluationCreation(result);
      }
    });
  }

  private handleEvaluationCreation(evaluation: Evaluation): void {
    this.performanceService.createEvaluation(evaluation).subscribe({
      next: () => this.handleSuccess("Évaluation créée avec succès"),
      error: (err) => this.handleError("Erreur lors de la création", err)
    });
  }

  openEditEvaluationDialog(evaluation: Evaluation): void {
    const dialogRef = this.dialog.open(EvaluationFormComponent, {
      width: "800px",
      data: { evaluation, employees: this.employees, departments: this.departments }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.handleEvaluationUpdate(evaluation.id!, result);
      }
    });
  }

  private handleEvaluationUpdate(id: number, evaluation: Evaluation): void {
    this.performanceService.updateEvaluation(id, evaluation).subscribe({
      next: () => this.handleSuccess("Évaluation mise à jour avec succès"),
      error: (err) => this.handleError("Erreur lors de la mise à jour", err)
    });
  }

  deleteEvaluation(evaluation: Evaluation): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: "400px",
      data: {
        title: "Confirmer la suppression",
        message: `Êtes-vous sûr de vouloir supprimer l'évaluation de ${evaluation.employee.firstName} ${evaluation.employee.lastName} pour la période ${evaluation.period} ?`,
        confirmText: "Supprimer",
        cancelText: "Annuler",
      },
    })

    dialogRef.afterClosed().subscribe(confirmed => {
    if (confirmed) {
      this.handleEvaluationDeletion(evaluation.id!);
    }
  });
  }

  private handleEvaluationDeletion(id: number): void {
    this.performanceService.deleteEvaluation(id).subscribe({
      next: () => this.handleSuccess("Évaluation supprimée avec succès"),
      error: (err) => this.handleError("Erreur lors de la suppression", err)
    });
  }

  private handleSuccess(message: string): void {
    this.snackBar.open(message, "Fermer", { duration: 3000 });
    this.loadDashboardData();
  }

  private handleError(context: string, error: any): void {
    console.error(`${context}:`, error);
    this.snackBar.open(`${context} de l'évaluation`, "Fermer", { duration: 3000 });
  }

  // Chart Methods
  initChartOptions(): void {
    this.trendChartOptions = {
      responsive: true,
      scales: { y: { beginAtZero: false, min: 70, max: 100 } }
    };

    this.departmentChartOptions = { responsive: true };
    this.criteriaChartOptions = { responsive: true, indexAxis: "y" };
  }

  updateCharts(): void {
    // Implémentez la logique de mise à jour des graphiques ici
  }

  // Helpers
  getUniquePeriodsFromEvaluations(): string[] {
    return [...new Set(this.evaluations.map(e => e.period))].sort();
  }

  getStatusLabel(status: string): string {
    const statusLabels: { [key: string]: string } = {
      'EN_ATTENTE': 'En attente',
      'EN_COURS': 'En cours',
      'COMPLETE': 'Complété',
      'ANNULE': 'Annulé'
    };
    return statusLabels[status] || status;
  }

  getStatusClass(status: string): string {
    const statusClasses: { [key: string]: string } = {
      'EN_ATTENTE': 'status-pending',
      'EN_COURS': 'status-in-progress',
      'COMPLETE': 'status-completed',
      'ANNULE': 'status-cancelled'
    };
    return statusClasses[status] || '';
  }

  getDepartmentName(departmentId: number): string {
    const department = this.departments.find(d => d.id === departmentId);
    return department?.name || "Département non spécifié";
  }

  private handleDataError(error: any): void {
    this.error = "Erreur lors du chargement des données";
    console.error("Erreur:", error);
  }

  openDetailsDialog(evaluation: Evaluation): void {
  this.dialog.open(EvaluationDetailsComponent, {
    width: "800px",
    data: { evaluation },
  });
}
}