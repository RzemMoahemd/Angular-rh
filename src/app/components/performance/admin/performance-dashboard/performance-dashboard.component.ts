import { Component,  OnInit } from "@angular/core"
import  { PerformanceService } from "app/services/performance.service"
import  { DepartmentService } from "app/services/department.service"
import  { PerformanceTrend } from "app/models/PerformanceTrend"
import  { DepartmentPerformance } from "app/models/DepartmentPerformance"
import  { CriterionAverage } from "app/models/CriterionAverage"
import  { Evaluation } from "app/models/Evaluation"
import  { Department } from "app/models/department"
import { finalize, forkJoin } from "rxjs"

@Component({
  selector: "app-performance-dashboard",
  templateUrl: "./performance-dashboard.component.html",
  styleUrls: ["./performance-dashboard.component.scss"],
})
export class PerformanceDashboardComponent implements OnInit {
  performanceTrends: PerformanceTrend[] = []
  departmentPerformances: DepartmentPerformance[] = []
  criteriaAverages: CriterionAverage[] = []
  topPerformers: Evaluation[] = []
  departments: Department[] = []
  averageScore = 0
  highestScore = 0
  lowestScore = 0
  completedEvaluations = 0
  loading = true
  error: string | null = null

  // Options pour les graphiques
  trendChartOptions: any
  departmentChartOptions: any
  criteriaChartOptions: any

  constructor(
    private performanceService: PerformanceService,
    private departmentService: DepartmentService,
  ) {}

  ngOnInit(): void {
    this.initChartOptions()
    this.loadDashboardData()
  }

  loadDashboardData(): void {
    this.loading = true
    this.error = null

    forkJoin({
      trends: this.performanceService.getPerformanceTrends(),
      departments: this.departmentService.getAllDepartments(),
      departmentPerformances: this.performanceService.getDepartmentPerformances(),
      criteriaAverages: this.performanceService.getCriteriaAverages(),
      topPerformers: this.performanceService.getTopPerformers(5),
    })
      .pipe(
        finalize(() => {
          this.loading = false
        }),
      )
      .subscribe({
        next: (results) => {
          this.performanceTrends = results.trends
          this.departments = results.departments
          this.departmentPerformances = results.departmentPerformances
          this.criteriaAverages = results.criteriaAverages
          this.topPerformers = results.topPerformers

          // Enrichir les top performers avec les noms de département
          this.enrichTopPerformersWithDepartments()

          // Calculer les statistiques
          this.calculateStatistics()

          // Mettre à jour les graphiques
          this.updateCharts()
        },
        error: (err) => {
          this.error = "Erreur lors du chargement des données du tableau de bord"
          console.error(err)
        },
      })
  }

  enrichTopPerformersWithDepartments(): void {
    this.topPerformers.forEach((performer) => {
      if (performer.employee && performer.employee.departmentId) {
        const department = this.departments.find((d) => d.id === performer.employee.departmentId)
        if (department) {
          // Ajouter le nom du département à l'objet employé pour l'affichage
          ;(performer.employee as any).departmentName = department.name
        }
      }
    })
  }

  calculateStatistics(): void {
    if (this.topPerformers.length > 0) {
      this.averageScore =
        this.topPerformers.reduce((sum, evaluation) => sum + evaluation.overallScore, 0) / this.topPerformers.length
      this.highestScore = Math.max(...this.topPerformers.map((evaluation) => evaluation.overallScore))
      this.lowestScore = Math.min(...this.topPerformers.map((evaluation) => evaluation.overallScore))
      this.completedEvaluations = this.topPerformers.length
    }
  }

  initChartOptions(): void {
    // Options pour le graphique des tendances
    this.trendChartOptions = {
      responsive: true,
      scales: {
        y: {
          beginAtZero: false,
          min: 70,
          max: 100,
        },
      },
    }

    // Options pour le graphique des départements
    this.departmentChartOptions = {
      responsive: true,
    }

    // Options pour le graphique des critères
    this.criteriaChartOptions = {
      responsive: true,
      indexAxis: "y",
    }
  }

  updateCharts(): void {
    // Cette méthode serait implémentée pour mettre à jour les graphiques
    // avec les données réelles une fois qu'elles sont chargées
    this.updateTrendChart()
    this.updateDepartmentChart()
    this.updateCriteriaChart()
  }

  updateTrendChart(): void {
    // Mise à jour des données du graphique des tendances
    console.log("Mise à jour du graphique des tendances avec", this.performanceTrends)
  }

  updateDepartmentChart(): void {
    // Mise à jour des données du graphique des départements
    console.log("Mise à jour du graphique des départements avec", this.departmentPerformances)
  }

  updateCriteriaChart(): void {
    // Mise à jour des données du graphique des critères
    console.log("Mise à jour du graphique des critères avec", this.criteriaAverages)
  }

  getDepartmentName(departmentId: number): string {
    const department = this.departments.find((d) => d.id === departmentId)
    return department ? department.name : "Département non spécifié"
  }
}
