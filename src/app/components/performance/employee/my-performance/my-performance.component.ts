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

import { ChartConfiguration, ChartType } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { Goal } from "app/models/Goal"

@Component({
  selector: "app-my-performance-dashboard",
  templateUrl: "./my-performance.component.html",
  styleUrls: ["./my-performance.component.scss"],
})
export class MyPerformanceDashboardComponent implements OnInit {
  currentEmployee: Employee | null = null;
  performanceTrends: PerformanceTrend[] = [];
  skillScores: CriterionAverage[] = [];
  latestEvaluation: Evaluation | null = null;
  nextEvaluation: { period: string; date: string } | null = null;
  loading = true;
  error: string | null = null;
  activeSection: string = 'evaluations';
  evaluationsHistory: Evaluation[] = [];

  // Options des graphiques
  trendChartOptions: any;
  skillsChartOptions: any;


  // Nouveaux champs pour le graphique
  public trendChartData!: ChartConfiguration['data'];
  public trendChartType: ChartType = 'line';

  constructor(
    private performanceService: PerformanceService,
    private employeeService: EmployeeService,
    private departmentService: DepartmentService,
  ) {}

  ngOnInit(): void {
    this.initChartOptions();
    this.loadCurrentEmployee();
  }

  private loadCurrentEmployee(): void {
    this.employeeService.getCurrentEmployee().subscribe({
      next: (employee) => {
        this.currentEmployee = employee;
        if (employee?.id) this.loadDashboardData(employee.id);
      },
      error: (err) => this.handleError(err, "Erreur de chargement des données employé")
    });
  }

  // private loadDashboardData(employeeId: number): void {
  //   forkJoin({
  //     trends: this.performanceService.getMyPerformanceEvolution(employeeId),
  //     skills: this.performanceService.getMySkillScores(employeeId),
  //     evaluations: this.performanceService.getMyEvaluations(employeeId),
  //     nextEvaluation: this.performanceService.getNextEvaluation(employeeId)
  //   }).pipe(finalize(() => this.loading = false))
  //   .subscribe({
  //     next: (results) => this.handleDataResults(results),
  //     error: (err) => this.handleError(err, "Erreur de chargement des données")
  //   });
  // }

  private loadDashboardData(employeeId: number): void {
  forkJoin({
    trends: this.performanceService.getMyPerformanceEvolution(employeeId),
    evaluations: this.performanceService.getMyEvaluations(employeeId), // Supprimer 'skills'
    nextEvaluation: this.performanceService.getNextEvaluation(employeeId)
  }).pipe(finalize(() => this.loading = false))
  .subscribe({
    next: (results) => this.handleDataResults(results),
    error: (err) => this.handleError(err, "Erreur de chargement des données")
  });
}

//   private handleDataResults(results: any): void {
//   this.performanceTrends = results.trends;
//   this.skillScores = results.skills;
//   this.nextEvaluation = results.nextEvaluation;
  
//   // Ajoutez cette conversion de date
//   this.evaluationsHistory = this.sortEvaluations(results.evaluations).map(evaluation => ({
//     ...evaluation,
//     evaluationDate: this.parseDate(evaluation.evaluationDate) // Conversion ici
//   }));
  
//   this.latestEvaluation = this.evaluationsHistory[0] || null;
  
//   if (this.latestEvaluation) {
//     console.log('Dernière évaluation:', this.latestEvaluation);
//   }
  
//   this.updateCharts();
//   this.calculateNextEvaluation();
//   this.updateTrendChart();
// }

private handleDataResults(results: any): void {
  this.performanceTrends = results.trends;
  this.nextEvaluation = results.nextEvaluation;
  
  this.evaluationsHistory = this.sortEvaluations(results.evaluations).map(evaluation => ({
    ...evaluation,
    evaluationDate: this.parseDate(evaluation.evaluationDate)
  }));
  
  this.latestEvaluation = this.evaluationsHistory[0] || null;

  // Nouveau: Récupérer les compétences de la dernière évaluation
  if (this.latestEvaluation) {
    this.skillScores = this.latestEvaluation.criteria.map(criterion => ({
      name: criterion.name,
      score: criterion.score
    }));
  } else {
    this.skillScores = [];
  }

  this.updateCharts();
  this.calculateNextEvaluation();
  this.updateTrendChart();
}

  private sortEvaluations(evaluations: Evaluation[]): Evaluation[] {
  return [...evaluations].sort((a, b) => {
    // Extraire l'année et le trimestre de la période
    const [aQuarter, aYear] = this.parsePeriod(a.period);
    const [bQuarter, bYear] = this.parsePeriod(b.period);

    // Comparaison par année d'abord
    if (bYear !== aYear) {
      return bYear - aYear; // Année décroissante
    }
    
    // Même année : comparer par trimestre
    return bQuarter - aQuarter; // Trimestre décroissant
  });
}

private parsePeriod(period: string): [number, number] {
  const matches = period.match(/Q(\d)\s+(\d{4})/i);
  if (!matches || matches.length < 3) {
    console.error('Format de période invalide:', period);
    return [0, 0];
  }
  
  const quarter = parseInt(matches[1], 10);
  const year = parseInt(matches[2], 10);
  return [quarter, year];
}

  private parseDate(date: string | Date): Date {
    if (typeof date === 'string') {
      // Supporter les dates au format ISO et 'dd/MM/yyyy'
      const parts = date.split(/[-T]/);
      if (parts.length === 3) return new Date(date); // Format ISO
      return new Date(date.split('/').reverse().join('-'));
    }
    return date;
  }


  

  setActive(section: string): void {
    this.activeSection = section;
  }

  private initChartOptions(): void {
  this.trendChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: false,
        min: 70,
        max: 100,
        title: {
          display: true,
          text: 'Score (%)'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Périodes d\'évaluation'
        }
      }
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: (context) => `Score: ${context.parsed.y}%`
        }
      }
    }
  };
}


   private handleError(error: any, message: string): void {
    this.error = message;
    this.loading = false;
    console.error(error);
  }

  updateCharts(): void {
    // Cette méthode serait implémentée pour mettre à jour les graphiques
    // avec les données réelles une fois qu'elles sont chargées
    this.updateTrendChart()
    this.updateSkillsChart()
  }

  private updateTrendChart(): void {
    if (!this.performanceTrends?.length) return;

  const sortedTrends = this.sortPerformanceTrends([...this.performanceTrends]);
    
    this.trendChartData = {
    labels: sortedTrends.map(t => t.period),
    datasets: [{
        label: 'Score de performance',
        data: sortedTrends.map(t => t.score),
        borderColor: '#4299e1',
        backgroundColor: 'rgba(66, 153, 225, 0.2)',
        tension: 0.4,
        pointRadius: 5,
        pointBackgroundColor: '#4299e1'
      }]
    };
  }


  private calculateNextEvaluation(): void {
    if (!this.latestEvaluation) return;

    // Calcul de la prochaine période
    const [currentQuarter, year] = this.parsePeriod(this.latestEvaluation.period);
    let nextQuarter = currentQuarter + 1;
    let nextYear = year;

    if (nextQuarter > 4) {
      nextQuarter = 1;
      nextYear++;
    }

    // Calcul de la date (15 jours avant fin trimestre)
    const quarterEndMonth = nextQuarter * 3; // Mars, Juin, Septembre, Décembre
    const evaluationDate = new Date(nextYear, quarterEndMonth - 1, 15); // 15 du mois de fin de trimestre
    
    this.nextEvaluation = {
      period: `Q${nextQuarter} ${nextYear}`,
      date: evaluationDate.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      })
    };
  }

  updateSkillsChart(): void {
    // Mise à jour des données du graphique des compétences
      this.skillScores = this.skillScores.sort((a, b) => b.score - a.score);
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


  getPerformanceEvolution(): string {
  if (this.evaluationsHistory.length < 2) return '0%';
  
  const current = this.evaluationsHistory[0];
  const previous = this.evaluationsHistory[1];
  
  const evolution = current.overallScore - previous.overallScore;
  return `${evolution > 0 ? '+' : ''}${evolution.toFixed(0)}% (${previous.period} → ${current.period})`;
}

private sortPerformanceTrends(trends: PerformanceTrend[]): PerformanceTrend[] {
  return trends.sort((a, b) => {
    const dateA = this.parsePeriodToDate(a.period);
    const dateB = this.parsePeriodToDate(b.period);
    return dateA.getTime() - dateB.getTime(); // Tri croissant
  });
}

private parsePeriodToDate(period: string): Date {
  const [q, year] = period.toLowerCase().split(' ');
  const quarter = parseInt(q.replace('q', ''), 10);
  return new Date(
    parseInt(year), 
    (quarter - 1) * 3 // Janvier (Q1), Avril (Q2), Juillet (Q3), Octobre (Q4)
  );
}

getFormattedEvaluationDate(date: Date | string | undefined): string {
  if (!date) return 'Date non disponible';
  
  // Conversion sécurisée
  const parsedDate = typeof date === 'string' ? this.parseDate(date) : date;
  
  // Vérification finale
  return parsedDate instanceof Date && !isNaN(parsedDate.getTime()) 
    ? parsedDate.toLocaleDateString('fr-FR') 
    : 'Date invalide';
}


// Ajouter dans le composant
getGoalStatusIcon(status: string): string {
  switch(status?.toUpperCase()) {
    case 'COMPLETE': return 'check_circle';
    case 'EN_COURS': return 'autorenew';
    default: return 'radio_button_unchecked';
  }
}

getGoalStatusLabel(status: string): string {
  switch(status?.toUpperCase()) {
    case 'NON_COMMENCE': return 'Non commencé';
    case 'EN_COURS': return 'En cours';
    case 'COMPLETE': return 'Complété';
    default: return 'Non défini';
  }
}

getFormattedDate(date: Date | string): string {
  if (!date) return '';
  const parsedDate = typeof date === 'string' ? new Date(date) : date;
  return parsedDate.toLocaleDateString('fr-FR', { 
    day: '2-digit', 
    month: 'long', 
    year: 'numeric' 
  });
}

// Ajoutez cette méthode dans la classe MyPerformanceDashboardComponent
onGoalStatusChange(goal: Goal, newStatus: string) {
  if (!goal.id) {
    console.error('ID d\'objectif manquant');
    return;
  }

  const previousStatus = goal.status;
  goal.status = newStatus as typeof goal.status;

  this.performanceService.updateGoalStatus(goal.id, newStatus).subscribe({
    error: (error) => {
      goal.status = previousStatus;
      console.error('Échec de la mise à jour:', error);
      this.error = 'Erreur lors de la mise à jour du statut';
      setTimeout(() => this.error = null, 3000);
    }
  });
}
  
}
