import { Component, OnInit } from '@angular/core';
import { LeaveService } from '../../services/leave.service';
import { EmployeeService } from '../../services/employee.service';
import { KeycloakService } from '../../services/keycloak/keycloak.service';
import { LeaveBalanceService } from '../../services/leave-balance.service';
import { PerformanceService } from '../../services/performance.service';
import { forkJoin, lastValueFrom } from 'rxjs';
import { LEAVE_TYPES } from 'app/models/leave-balance';
import { Goal } from 'app/models/Goal';
import { CriterionAverage } from 'app/models/CriterionAverage';
import { Employee } from 'app/models/employee';

interface GoalProgress extends Goal {
  progress: number;
  status: "NON_COMMENCE" | "EN_COURS" | "COMPLETE"
}

interface CalendarEvent {
  date: Date;
  title: string;
  type: 'evaluation' | 'leave';
  period: string; // Ajouté
  formattedDate: string; // Ajouté
}


@Component({
  selector: 'app-employee-dashboard',
  templateUrl: './employee-dashboard.component.html',
  styleUrls: ['./employee-dashboard.component.css']
})
export class EmployeeDashboardComponent implements OnInit {
  goals: GoalProgress[] = [];
  leaveBalances: any[] = [];
  calendarEvents: CalendarEvent[] = [];
  isLoading = true;
  errorMessage: string | null = null;
  recentComments: Array<{evaluator: string; comment: string; date: Date}> = [];
  skills: CriterionAverage[] = [];
  employee?: Employee;

  constructor(
    private leaveService: LeaveService,
    private employeeService: EmployeeService,
    private leaveBalanceService: LeaveBalanceService,
    private performanceService: PerformanceService,
    private keycloakService: KeycloakService
  ) {}

  ngOnInit(): void {
    this.loadEmployeeData();
  }

  private loadEmployeeData(): void {
    const email = this.keycloakService.keycloak.tokenParsed?.email;
    if (!email) {
      this.errorMessage = 'Email non trouvé dans le token';
      this.isLoading = false;
      return;
    }

    this.employeeService.getEmployeeByEmail(email).subscribe({
      next: employee => {
        this.employee = employee; 
        forkJoin({
          leaves: this.leaveService.getLeavesByEmployee(employee.id),
          balances: this.leaveBalanceService.getCurrentYearBalances(employee.id),
          performance: this.performanceService.getMyEvaluations(employee.id),
          goals: this.performanceService.getEvaluationsByEmployeeId(employee.id),
          skills: this.performanceService.getMySkillScores(employee.id)
        }).subscribe({
          next: ({ leaves, balances, performance, goals, skills }) => {
            this.skills = skills.slice(0, 5);
            this.processGoals(goals);
            this.processPerformance(performance);
            this.processLeaveData(leaves, balances);
            this.processCalendarEvents(leaves, performance);
            this.isLoading = false;
          },
          error: err => this.handleError(err)
        });
      },
      error: err => this.handleError(err)
    });
  }

  private processGoals(evaluations: any[]): void {
    this.goals = evaluations.flatMap(e => 
      e.goals?.map((g: any) => ({
        ...g,
        progress: this.calculateGoalProgress(g),
        status: this.mapGoalStatus(g.status),
        targetDate: new Date(g.targetDate)
      })) || []
    ).slice(0, 3);
  }

  private processPerformance(evaluations: any[]): void {
    this.recentComments = evaluations
      .filter(e => e.comments)
      .map(e => ({
        evaluator: e.evaluator,
        comment: e.comments,
        date: new Date(e.evaluationDate)
      }))
      .slice(-3)
      .reverse();
  }

  private processLeaveData(leaves: any[], balances: any[]): void {
    this.leaveBalances = LEAVE_TYPES.map(typeConfig => {
      const balance = balances.find(b => b.typeConge === typeConfig.type);
      return {
        type: typeConfig.label,
        icon: this.getLeaveTypeIcon(typeConfig.type),
        used: balance?.nombreJoursRestants || 0,
        total: typeConfig.total,
        color: this.getLeaveTypeColor(typeConfig.type)
      };
    });
  }

  private processCalendarEvents(leaves: any[], evaluations: any[]): void {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Trouver la dernière évaluation
  const latestEvaluation = this.sortEvaluations([...evaluations])[0];
  
  // Calculer la prochaine évaluation
  let nextEvaluation: CalendarEvent | null = null;
  if (latestEvaluation) {
    const [currentQuarter, year] = this.parsePeriod(latestEvaluation.period);
    let nextQuarter = currentQuarter + 1;
    let nextYear = year;

    if (nextQuarter > 4) {
      nextQuarter = 1;
      nextYear++;
    }

    const quarterEndMonth = nextQuarter * 3;
    const evaluationDate = new Date(nextYear, quarterEndMonth - 1, 15);
    
    nextEvaluation = {
      date: evaluationDate,
      title: 'Évaluation à venir',
      type: 'evaluation',
      period: `Q${nextQuarter} ${nextYear}`,
      formattedDate: evaluationDate.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      })
    };
  }

  const approvedLeaves = leaves
    .filter(l => l.statut === 'approuvé' && new Date(l.dateDebut) >= today);

  this.calendarEvents = [
    ...approvedLeaves.map(l => ({
      date: new Date(l.dateDebut),
      title: 'Congé approuvé',
      type: 'leave' as const,
      period: '',
      formattedDate: ''
    })),
    ...(nextEvaluation ? [nextEvaluation] : [])
  ].sort((a, b) => a.date.getTime() - b.date.getTime())
   .slice(0, 5);
}

private sortEvaluations(evaluations: any[]): any[] {
  return [...evaluations].sort((a, b) => {
    const [aQuarter, aYear] = this.parsePeriod(a.period);
    const [bQuarter, bYear] = this.parsePeriod(b.period);
    return bYear - aYear || bQuarter - aQuarter;
  });
}

private parsePeriod(period: string): [number, number] {
  const matches = period.match(/Q(\d)\s+(\d{4})/i);
  return matches ? [parseInt(matches[1], 10), parseInt(matches[2], 10)] : [0, 0];
}


  private getLeaveTypeIcon(type: string): string {
    const icons: {[key: string]: string} = {
      'PAYÉ': 'beach_access',
      'RTT': 'self_improvement',
      'MALADIE': 'healing',
      'SANS SOLDE': 'money_off'
    };
    return icons[type] || 'event';
  }

  private getLeaveTypeColor(type: string): string {
    const colors: {[key: string]: string} = {
      'PAYÉ': '#4CAF50',
      'RTT': '#2196F3',
      'MALADIE': '#FF9800',
      'SANS SOLDE': '#9E9E9E'
    };
    return colors[type] || '#000';
  }

  private calculateGoalProgress(goal: any): number {
    return goal.status === 'COMPLETE' ? 100 : 30;
  }

  private mapGoalStatus(status: string): GoalProgress['status'] {
    switch (status?.toUpperCase()) {
      case 'COMPLETE': return 'COMPLETE';
      case 'EN_COURS': return 'EN_COURS';
      default: return 'NON_COMMENCE';
    }
  }

  private handleError(error: any): void {
    console.error(error);
    this.errorMessage = 'Erreur de chargement des données';
    this.isLoading = false;
  }

  async updateGoalStatus(goal: GoalProgress): Promise<void> {
    try {
      await lastValueFrom(this.performanceService.updateGoalStatus(goal.id!, goal.status.toUpperCase()));
      this.loadEmployeeData();
    } catch (err) {
      this.handleError(err);
    }
  }
}