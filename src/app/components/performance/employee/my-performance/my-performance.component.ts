import { Component,  OnInit } from "@angular/core"
import  { PerformanceService } from "app/services/performance.service"
import  { EmployeeService } from "app/services/employee.service"
import  { DepartmentService } from "app/services/department.service"
import  { Employee } from "app/models/employee"
import  { Department } from "app/models/department"
import  { PerformanceTrend } from "app/models/PerformanceTrend"
import  { CriterionAverage } from "app/models/CriterionAverage"
import  { Evaluation } from "app/models/Evaluation"
import { finalize, forkJoin } from "rxjs"

@Component({
  selector: "app-my-performance-dashboard",
  templateUrl: "./my-performance.component.html",
  styleUrls: ["./my-performance.component.scss"],
})
export class MyPerformanceDashboardComponent implements OnInit {
  currentEmployee: Employee | null = null
  department: Department | null = null
  performanceTrends: PerformanceTrend[] = []
  skillScores: CriterionAverage[] = []
  latestEvaluation: Evaluation | null = null
  nextEvaluation: { period: string; date: string } | null = null
  loading = true
  error: string | null = null

  // Options pour les graphiques
  trendChartOptions: any
  skillsChartOptions: any

  constructor(
    private performanceService: PerformanceService,
    private employeeService: EmployeeService,
    private departmentService: DepartmentService,
  ) {}

  ngOnInit(): void {
    this.initChartOptions()
    this.loadCurrentEmployee()
  }

  loadCurrentEmployee(): void {
    this.loading = true
    this.error = null

    this.employeeService.getCurrentEmployee().subscribe({
      next: (employee) => {
        this.currentEmployee = employee
        if (employee && employee.id) {
          this.loadDashboardData(employee.id)

          // Charger les informations du département
          if (employee.departmentId) {
            this.departmentService.getDepartmentById(employee.departmentId).subscribe({
              next: (department) => {
                this.department = department
              },
              error: (err) => {
                console.error("Erreur lors du chargement du département", err)
              },
            })
          }
        } else {
          this.error = "Impossible de récupérer les informations de l'employé actuel"
          this.loading = false
        }
      },
      error: (err) => {
        this.error = "Erreur lors du chargement des informations de l'employé"
        console.error(err)
        this.loading = false
      },
    })
  }

  loadDashboardData(employeeId: number): void {
    forkJoin({
      trends: this.performanceService.getMyPerformanceEvolution(employeeId),
      skills: this.performanceService.getMySkillScores(employeeId),
      evaluations: this.performanceService.getMyEvaluations(employeeId),
      nextEvaluation: this.performanceService.getNextEvaluation(employeeId),
    })
      .pipe(
        finalize(() => {
          this.loading = false
        }),
      )
      .subscribe({
        next: (results) => {
          this.performanceTrends = results.trends
          this.skillScores = results.skills
          this.nextEvaluation = results.nextEvaluation

          // Trouver la dernière évaluation
          if (results.evaluations.length > 0) {
            // Trier par date décroissante
            const sortedEvaluations = [...results.evaluations].sort((a, b) => {
              if (typeof a.evaluationDate === "string" && typeof b.evaluationDate === "string") {
                return new Date(b.evaluationDate).getTime() - new Date(a.evaluationDate).getTime()
              }
              return 0
            })
            this.latestEvaluation = sortedEvaluations[0]
          }

          this.updateCharts()
        },
        error: (err) => {
          this.error = "Erreur lors du chargement des données du tableau de bord"
          console.error(err)
        },
      })
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

    // Options pour le graphique des compétences
    this.skillsChartOptions = {
      responsive: true,
      indexAxis: "y",
      scales: {
        x: {
          beginAtZero: true,
          max: 100,
        },
      },
    }
  }

  updateCharts(): void {
    // Cette méthode serait implémentée pour mettre à jour les graphiques
    // avec les données réelles une fois qu'elles sont chargées
    this.updateTrendChart()
    this.updateSkillsChart()
  }

  updateTrendChart(): void {
    // Mise à jour des données du graphique des tendances
    // Cette méthode serait implémentée selon la bibliothèque de graphiques utilisée
    console.log("Mise à jour du graphique des tendances avec", this.performanceTrends)
  }

  updateSkillsChart(): void {
    // Mise à jour des données du graphique des compétences
    console.log("Mise à jour du graphique des compétences avec", this.skillScores)
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case "EN_ATTENTE":
        return "En attente"
      case "EN_COURS":
        return "En cours"
      case "COMPLETE":
        return "Complété"
      case "ANNULE":
        return "Annulé"
      default:
        return status
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case "EN_ATTENTE":
        return "status-pending"
      case "EN_COURS":
        return "status-in-progress"
      case "COMPLETE":
        return "status-completed"
      case "ANNULE":
        return "status-cancelled"
      default:
        return ""
    }
  }


  // Dans la classe MyPerformanceDashboardComponent
getPerformanceEvolution(): string {
  if (!this.performanceTrends || this.performanceTrends.length < 2) {
    return '0%';
  }

  // Trier les trends par date avant calcul
  const sortedTrends = this.sortPerformanceTrends([...this.performanceTrends]);
  
  const currentScore = this.latestEvaluation?.overallScore || 0;
  const previousScore = sortedTrends[1].score; // [0]=dernière, [1]=précédente
  const evolution = currentScore - previousScore;

  return `${evolution > 0 ? '+' : ''}${evolution.toFixed(0)}%`;
}

private sortPerformanceTrends(trends: PerformanceTrend[]): PerformanceTrend[] {
  return trends.sort((a, b) => {
    // Convertir les périodes en dates comparables
    const dateA = this.parsePeriodToDate(a.period);
    const dateB = this.parsePeriodToDate(b.period);
    return dateB.getTime() - dateA.getTime(); // Tri décroissant
  });
}

private parsePeriodToDate(period: string): Date {
  // Gérer les formats 'QX YYYY' et 'qX YYYY'
  const [q, year] = period.toLowerCase().split(' ');
  const quarter = parseInt(q.replace('q', ''));
  return new Date(parseInt(year), (quarter - 1) * 3); // Ex: Q1 2024 → 1er janvier 2024
}

getFormattedEvaluationDate(dateString: string | Date): string {
  if (!dateString) return 'Non disponible';
  
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}
  
}
