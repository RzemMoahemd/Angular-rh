import { Component, OnInit } from '@angular/core';
import { EmployeeService } from '../../services/employee.service';
import { LeaveService } from '../../services/leave.service';
import { Employee } from '../../models/employee';
import { Leave } from '../../models/leave';
import Chart from 'chart.js/auto';

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

  constructor(
    private employeeService: EmployeeService,
    private leaveService: LeaveService
  ) {}

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats(): void {
    this.employeeService.getEmployees().subscribe(employees => {
      this.employees = employees;
      this.totalEmployees = employees.length;
      const currentMonth = new Date().getMonth();
      this.newEmployeesThisMonth = employees.filter(emp => new Date(emp.hireDate).getMonth() === currentMonth).length;
      this.lastEmployees = employees.slice(-5).reverse();
    });

    this.leaveService.getLeaves().subscribe(leaves => {
      this.totalLeaves = leaves.length;
      this.leavesPending = leaves.filter(l => l.statut === "en attente").length;
      this.leavesApproved = leaves.filter(l => l.statut === "approuvé").length;
      this.leavesRejected = leaves.filter(l => l.statut === "rejeté").length;
      this.leavesToApprove = leaves.filter(l => l.statut === "en attente");
      this.employeesOnLeave = new Set(leaves.map(l => l.employeId)).size;
      this.lastLeaves = leaves.slice(-5).reverse();

      const today = new Date();
      const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(endOfWeek.getDate() + 7);
      const startNextWeek = new Date(endOfWeek);
      const endNextWeek = new Date(startNextWeek);
      endNextWeek.setDate(startNextWeek.getDate() + 7);

      this.thisWeekLeaves = leaves.filter(l => l.statut === "approuvé" && new Date(l.dateDebut) >= startOfWeek && new Date(l.dateDebut) < endOfWeek);
      this.nextWeekLeaves = leaves.filter(l => l.statut === "approuvé" && new Date(l.dateDebut) >= startNextWeek && new Date(l.dateDebut) < endNextWeek);

      this.generateCongeStatChart();
      this.generateMonthlyChart();

      this.statCards = [
        { label: 'Employés', icon: 'group', color: 'purple', value: this.totalEmployees },
        { label: 'Nouveaux', icon: 'person_add', color: 'green', value: this.newEmployeesThisMonth },
        { label: 'Congés', icon: 'calendar_month', color: 'blue', value: this.totalLeaves },
        { label: 'En attente', icon: 'hourglass_top', color: 'red', value: this.leavesPending }
      ];
    });
  }

  toggleWeek(showNext: boolean): void {
    this.showNextWeek = showNext;
  }

  getEmployeeName(id: number): string {
    const emp = this.employees.find(e => e.id === id);
    return emp ? `${emp.firstName} ${emp.lastName}` : 'Inconnu';
  }

  approveLeave(leave: Leave, statut: string): void {
    this.leaveService.updateLeaveStatus(leave.id!, statut).subscribe(() => {
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
  
}
