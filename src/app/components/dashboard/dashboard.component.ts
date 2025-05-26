import { Component, OnInit } from '@angular/core';
import { EmployeeService } from '../../services/employee.service';
import { LeaveService } from '../../services/leave.service';
import { Employee } from '../../models/employee';
import { Leave } from '../../models/leave';
import Chart from 'chart.js/auto';
import { PerformanceService } from '../../services/performance.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  totalEmployees = 0;
  newEmployeesThisMonth = 0;
  totalLeaves = 0;
  leavesPending = 0;
  leavesApproved = 0;
  leavesRejected = 0;
  employeesOnLeave = 0;

  lastEmployees: Employee[] = [];
  lastLeaves: Leave[] = [];
  employees: Employee[] = [];
  leavesToApprove: Leave[] = [];

  thisWeekLeaves: Leave[] = [];
  nextWeekLeaves: Leave[] = [];
  selectedLeaves: Leave[] = [];
  showNextWeek = false;

  statCards = [];

  averageScore = 0;
currentPeriod: string;

    recentLeaves: (Leave & { employeeFullName?: string })[] = [];



  currentAbsences = 0;
absencePercentage = 0;
paidLeaves = 0;
sicknessLeaves = 0;

  constructor(
    private employeeService: EmployeeService,
    private leaveService: LeaveService,
    private performanceService: PerformanceService
  ) {}

  ngOnInit(): void {
    this.loadStats();
  }

  private getCurrentPeriod(): string {
  const now = new Date();
  const quarter = Math.floor(now.getMonth() / 3) + 1;
  const year = now.getFullYear();
  return `Q${quarter} ${year}`;
}

  loadStats(): void {
  this.currentPeriod = this.getCurrentPeriod();
  
  forkJoin({
    employees: this.employeeService.getEmployees(),
    leaves: this.leaveService.getLeaves(),
    evaluations: this.performanceService.getAllEvaluations()
  }).subscribe(({ employees, leaves, evaluations }) => {
    // Traitement des employés
    this.employees = employees;
    this.totalEmployees = employees.length;
    const currentMonth = new Date().getMonth();
    this.newEmployeesThisMonth = employees.filter(emp => 
      new Date(emp.hireDate).getMonth() === currentMonth
    ).length;
    this.lastEmployees = employees
  .sort((a, b) => new Date(b.hireDate).getTime() - new Date(a.hireDate).getTime())
  .slice(0, 3);

    // Traitement des congés
    this.totalLeaves = leaves.length;
    this.leavesPending = leaves.filter(l => l.statut === "en attente").length;
    this.leavesApproved = leaves.filter(l => l.statut === "approuvé").length;
    this.leavesRejected = leaves.filter(l => l.statut === "rejeté").length;
    this.leavesToApprove = leaves.filter(l => l.statut === "en attente");
    this.employeesOnLeave = new Set(leaves.map(l => l.employeId)).size;
    this.lastLeaves = leaves.slice(-5).reverse();

     const employeeMap = new Map<number, string>();
      employees.forEach(emp => {
        employeeMap.set(emp.id!, `${emp.firstName} ${emp.lastName}`);
      });

      this.recentLeaves = leaves
        .sort((a, b) => new Date(b.dateSoumission).getTime() - new Date(a.dateSoumission).getTime())
        .slice(0, 4)
        .map(leave => ({
          ...leave,
          employeeFullName: employeeMap.get(leave.employeId) || 'Inconnu'
        }));

    // Calcul des absences
    const today = new Date();
    const currentApprovedLeaves = leaves.filter(l => 
      l.statut === "approuvé" && 
      new Date(l.dateDebut) <= today && 
      new Date(l.dateFin) >= today
    );
    this.currentAbsences = new Set(currentApprovedLeaves.map(l => l.employeId)).size;
    this.absencePercentage = this.totalEmployees > 0 ? 
      Math.round((this.currentAbsences / this.totalEmployees) * 100) : 0;
    
    // Statistiques des types de congés
    this.paidLeaves = currentApprovedLeaves.filter(l => l.type === 'PAYÉ').length;
    this.sicknessLeaves = currentApprovedLeaves.filter(l => l.type === 'MALADIE').length;

    // Calcul du score moyen
    const currentEvaluations = evaluations.filter(e => e.period === this.currentPeriod);
    this.averageScore = currentEvaluations.length > 0 ? 
      Math.round(currentEvaluations.reduce((sum, e) => sum + e.overallScore, 0) / currentEvaluations.length) : 
      0;

    // Mise à jour des cartes statistiques
    this.statCards = [
      { 
        label: 'Score moyen', 
        icon: 'star', 
        color: 'purple', 
        value: this.averageScore,
        suffix: '%',
        period: this.currentPeriod
      },
      { 
        label: 'Total Employés', 
        icon: 'group', 
        color: 'blue', 
        value: this.totalEmployees,
        delta: `+${this.newEmployeesThisMonth} ce mois`
      },
      { 
        label: 'Absences', 
        icon: 'warning', 
        color: 'orange', 
        value: this.currentAbsences,
        percentage: `${this.absencePercentage}%`
      },
      { 
        label: 'Congés', 
        icon: 'calendar_month', 
        color: 'green', 
        value: this.totalLeaves,
        status: `${this.leavesPending} en attente`
      }
    ];

    // Configuration des périodes pour les congés
    const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 7);
    const startNextWeek = new Date(endOfWeek);
    const endNextWeek = new Date(startNextWeek);
    endNextWeek.setDate(startNextWeek.getDate() + 7);

    this.thisWeekLeaves = leaves.filter(l => 
      l.statut === "approuvé" && 
      new Date(l.dateDebut) >= startOfWeek && 
      new Date(l.dateDebut) < endOfWeek
    );
    
    this.nextWeekLeaves = leaves.filter(l => 
      l.statut === "approuvé" && 
      new Date(l.dateDebut) >= startNextWeek && 
      new Date(l.dateDebut) < endNextWeek
    );

    // Génération des graphiques
    this.generateCongeStatChart();
    this.generateMonthlyChart();
  });
}

  toggleWeek(showNext: boolean): void {
    this.showNextWeek = showNext;
  }

  getEmployeeName(id: number): string {
    const emp = this.employees.find(e => e.id === id);
    return emp ? `${emp.firstName} ${emp.lastName}` : 'Inconnu';
  }

  // approveLeave(leave: Leave, statut: string): void {
  //   this.leaveService.updateLeaveStatus(leave.id!, statut).subscribe(() => {
  //     this.leavesToApprove = this.leavesToApprove.filter(l => l.id !== leave.id);
  //     this.loadStats();
  //   });
  // }

  approveLeave(leave: Leave, statut: string): void {
  
  const updatedLeave = { ...leave, statut: statut };
  this.leaveService.updateLeave(leave.id!, updatedLeave).subscribe(() => {
    this.leavesToApprove = this.leavesToApprove.filter(l => l.id !== leave.id);
    this.loadStats();
  });
}
  onDateSelected(date: Date): void {
    this.leaveService.getLeaves().subscribe(leaves => {
      this.selectedLeaves = leaves.filter(l => {
        const debut = new Date(l.dateDebut);
        const fin = new Date(l.dateFin);
        return l.statut === "approuvé" && date >= debut && date <= fin;
      });
    });
  }

  generateCongeStatChart(): void {
    new Chart("leaveStatusChart", {
      type: 'pie',
      data: {
        labels: ['En attente', 'Approuvé', 'Rejeté'],
        datasets: [{ data: [this.leavesPending, this.leavesApproved, this.leavesRejected], backgroundColor: ['#FF9800', '#4CAF50', '#F44336'] }]
      },
      options: { plugins: { legend: { position: 'bottom' } } }
    });
  }

  generateMonthlyChart(): void {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyCounts = Array(12).fill(0);
    this.leaveService.getLeaves().subscribe(leaves => {
      leaves.forEach(l => monthlyCounts[new Date(l.dateDebut).getMonth()]++);
      new Chart("leavesPerMonthChart", {
        type: 'bar',
        data: { labels: months, datasets: [{ label: 'Congés', data: monthlyCounts, backgroundColor: '#2196F3' }] },
        options: { scales: { y: { beginAtZero: true } } }
      });
    });
  }

  highlightLeaves = (date: Date) => {
    const day = date.getDate();
    const month = date.getMonth();
    const year = date.getFullYear();
  
    return this.lastLeaves.some(leave => {
      const debut = new Date(leave.dateDebut);
      const fin = new Date(leave.dateFin);
      return leave.statut === "approuvé" &&
        date >= debut && date <= fin;
    }) ? 'leave-day' : '';
  };




  getStatusLabel(status: string): string {
  const statusLabels: { [key: string]: string } = {
    'en attente': 'En attente',
    'approuvé': 'Approuvé',
    'rejeté': 'Rejeté'
  };
  return statusLabels[status.toLowerCase()] || status;
}

getStatusClass(status: string): string {
  const statusClasses: { [key: string]: string } = {
    'en attente': 'status-pending',
    'approuvé': 'status-approved',
    'rejeté': 'status-rejected'
  };
  return statusClasses[status.toLowerCase()] || '';
}



  
}
