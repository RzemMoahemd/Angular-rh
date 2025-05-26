import { Component, Inject, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, FormArray, Validators, AbstractControl } from "@angular/forms";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { Employee } from "app/models/employee";
import { Evaluation } from "app/models/Evaluation";
import { PerformanceService } from "app/services/performance.service";
import { take } from "rxjs/operators";
import { EmployeeService } from "app/services/employee.service";


@Component({
  selector: "app-evaluation-form",
  templateUrl: "./evaluation-form.component.html",
  styleUrls: ["./evaluation-form.component.scss"]
})
export class EvaluationFormComponent implements OnInit {
  evaluationForm: FormGroup;
  isEditMode = false;
  employees: Employee[] = [];
  currentYear = new Date().getFullYear();
  quarters: { value: string; label: string }[] = [];
  existingPeriods: string[] = [];

  predefinedCriteria = [
    "Ponctualité", "Productivité", "Qualité du travail",
    "Esprit d'équipe", "Communication", "Leadership",
    "Résolution de problèmes", "Innovation", "Organisation", "Adaptabilité"
  ];

  statuses = [
    { value: "EN_ATTENTE", label: "En attente" },
    { value: "EN_COURS", label: "En cours" },
    { value: "COMPLETE", label: "Complété" },
    { value: "ANNULE", label: "Annulé" }
  ];

  priorities = [
    { value: "HAUTE", label: "Haute" },
    { value: "MOYENNE", label: "Moyenne" },
    { value: "BASSE", label: "Basse" }
  ];

  goalStatuses = [
    { value: "NON_COMMENCE", label: "Non commencé" },
    { value: "EN_COURS", label: "En cours" },
    { value: "COMPLETE", label: "Complété" }
  ];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<EvaluationFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { evaluation?: Evaluation; employees: Employee[] },
    private performanceService: PerformanceService,
    private employeeService: EmployeeService
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.criteriaArray.valueChanges.subscribe(() => this.updateOverallScore());
    this.setupEmployeeChangeListener();
  }

  // Gestion des FormArray
  get criteriaArray(): FormArray { return this.evaluationForm.get("criteria") as FormArray; }
  get strengthsArray(): FormArray { return this.evaluationForm.get("strengths") as FormArray; }
  get areasForImprovementArray(): FormArray { return this.evaluationForm.get("areasForImprovement") as FormArray; }
  get goalsArray(): FormArray { return this.evaluationForm.get("goals") as FormArray; }

  private generateQuarters(): void {
    const allQuarters = Array.from({ length: 4 }, (_, i) => {
      const quarter = i + 1;
      const startMonth = (quarter - 1) * 3;
      const startDate = new Date(this.currentYear, startMonth, 1);
      const endDate = new Date(this.currentYear, startMonth + 3, 0);
      return {
        value: `Q${quarter} ${this.currentYear}`,
        label: `Q${quarter} ${this.currentYear} (${startDate.toLocaleDateString('fr-FR', { month: 'short' })} - ${endDate.toLocaleDateString('fr-FR', { month: 'short' })})`
      };
    });

    // Filtrer les périodes existantes
    this.quarters = allQuarters.filter(q => 
      !this.existingPeriods.includes(q.value) || 
      (this.isEditMode && q.value === this.data.evaluation?.period)
    );
  }

  private initializeForm(): void {
    this.employees = this.data.employees;
    this.isEditMode = !!this.data.evaluation;

    this.evaluationForm = this.fb.group({
      employee: [this.data.evaluation?.employee.id || '', Validators.required],
      period: [this.data.evaluation?.period || '', [
        Validators.required,
        (control: AbstractControl) => this.periodValidator(control)
      ]],
      status: [this.data.evaluation?.status || 'EN_ATTENTE', Validators.required],
      overallScore: [this.data.evaluation?.overallScore || 80, [
        Validators.required, Validators.min(0), Validators.max(100)
      ]],
      comments: [this.data.evaluation?.comments || ''],
      criteria: this.fb.array([]),
      strengths: this.fb.array([]),
      areasForImprovement: this.fb.array([]),
      goals: this.fb.array([])
    });

    this.initializeFormArrays();
  }

  private setupEmployeeChangeListener(): void {
    this.evaluationForm.get('employee')?.valueChanges.subscribe(employeeId => {
      if (employeeId) {
        this.performanceService.getEvaluationsByEmployeeId(employeeId).pipe(take(1)).subscribe(evaluations => {
          this.existingPeriods = evaluations.map(e => e.period);
          this.generateQuarters();
          this.checkExistingEvaluation();
        });
      }
    });

    // Initial load if in edit mode
    if (this.isEditMode && this.data.evaluation?.employee.id) {
      this.performanceService.getEvaluationsByEmployeeId(this.data.evaluation.employee.id)
        .pipe(take(1))
        .subscribe(evaluations => {
          this.existingPeriods = evaluations
            .filter(e => e.id !== this.data.evaluation?.id)
            .map(e => e.period);
          this.generateQuarters();
        });
    } else {
      this.generateQuarters();
    }
  }

  private periodValidator(control: AbstractControl): { [key: string]: any } | null {
    const pattern = /^Q[1-4] \d{4}$/;
    return pattern.test(control.value) ? null : { invalidFormat: true };
  }

  private setupPeriodValidation(): void {
    this.evaluationForm.get('employee')?.valueChanges.subscribe(() => this.checkExistingEvaluation());
    this.evaluationForm.get('period')?.valueChanges.subscribe(() => this.checkExistingEvaluation());
  }

  private checkExistingEvaluation(): void {
    const employeeId = this.evaluationForm.get('employee')?.value;
    const period = this.evaluationForm.get('period')?.value;

    if (employeeId && period) {
      this.performanceService.getEvaluationsByEmployeeId(employeeId).pipe(
        take(1)
      ).subscribe(evaluations => {
        const exists = evaluations.some(e => 
          e.period === period && 
          (!this.isEditMode || e.id !== this.data.evaluation?.id)
        );
        exists ? this.evaluationForm.setErrors({ duplicate: true }) : this.evaluationForm.setErrors(null);
      });
    }
  }

  private initializeFormArrays(): void {
    // Initialisation des critères
    if (this.data.evaluation?.criteria) {
      this.data.evaluation.criteria.forEach(c => 
        this.addCriterion(c.name, c.description, c.score, c.weight, c.comments)
      );
    } else {
      this.addCriterion('Ponctualité');
      this.addCriterion('Productivité');
      this.addCriterion('Qualité du travail');
    }

    // Initialisation des forces
    this.data.evaluation?.strengths?.forEach(s => this.addStrength(s));
    
    // Initialisation des axes d'amélioration
    this.data.evaluation?.areasForImprovement?.forEach(a => this.addAreaForImprovement(a));
    
    // Initialisation des objectifs
    this.data.evaluation?.goals?.forEach(g => 
      this.addGoal(g.description, g.targetDate, g.priority, g.measurableOutcome, g.status)
    );
  }

  // Méthodes d'ajout/suppression
  addCriterion(name = "", description = "", score = 80, weight = 1, comments = ""): void {
    this.criteriaArray.push(this.fb.group({
      name: [name, Validators.required],
      description: [description],
      score: [score, [Validators.required, Validators.min(0), Validators.max(100)]],
      weight: [weight, [Validators.required, Validators.min(1)]],
      comments: [comments]
    }));
  }

  removeCriterion(index: number): void { this.criteriaArray.removeAt(index); }

  addStrength(strength = ""): void { 
    this.strengthsArray.push(this.fb.control(strength, Validators.required)); 
  }

  removeStrength(index: number): void { this.strengthsArray.removeAt(index); }

  addAreaForImprovement(area = ""): void { 
    this.areasForImprovementArray.push(this.fb.control(area, Validators.required)); 
  }

  removeAreaForImprovement(index: number): void { this.areasForImprovementArray.removeAt(index); }

  addGoal(description = "", targetDate = null, priority = "MOYENNE", measurableOutcome = "", status = "NON_COMMENCE"): void {
    this.goalsArray.push(this.fb.group({
      description: [description, Validators.required],
      targetDate: [targetDate],
      priority: [priority],
      measurableOutcome: [measurableOutcome],
      status: [status]
    }));
  }

  removeGoal(index: number): void { this.goalsArray.removeAt(index); }

  updateOverallScore(): void {
    if (this.criteriaArray.length === 0) return;

    const total = this.criteriaArray.controls.reduce((acc, control) => {
      return acc + (control.get('score')?.value || 0) * (control.get('weight')?.value || 1);
    }, 0);

    const totalWeight = this.criteriaArray.controls.reduce((acc, control) => 
      acc + (control.get('weight')?.value || 1), 0);

    this.evaluationForm.patchValue({
      overallScore: totalWeight > 0 ? Math.round(total / totalWeight) : 0
    });
  }

  // onSubmit(): void {
  //   if (this.evaluationForm.invalid) return;

  //   const formValue = this.evaluationForm.value;
  //   const [quarter, year] = formValue.period.replace('Q', '').split(' ');

  //   const evaluation: Evaluation = {
  //     ...this.data.evaluation,
  //     ...formValue,
  //     employee: this.employees.find(e => e.id === formValue.employee)!,
  //     startDate: new Date(parseInt(year), (parseInt(quarter) - 1) * 3, 1),
  //     endDate: new Date(parseInt(year), parseInt(quarter) * 3, 0)
  //   };

  //   this.dialogRef.close(evaluation);
  // }

  onSubmit(): void {
  if (this.evaluationForm.invalid) return;

  this.employeeService.getCurrentEmployee().pipe(take(1)).subscribe(currentEmployee => {
    const formValue = this.evaluationForm.value;
    const [quarter, year] = formValue.period.replace('Q', '').split(' ');

    const evaluation: Evaluation = {
      ...this.data.evaluation,
      ...formValue,
      employee: this.employees.find(e => e.id === formValue.employee)!,
      evaluatorId: currentEmployee.id, // ID de l'évaluateur
      startDate: new Date(parseInt(year), (parseInt(quarter) - 1) * 3, 1),
      endDate: new Date(parseInt(year), parseInt(quarter) * 3, 0)
    };

    this.dialogRef.close(evaluation);
  });
}

  cancel(): void { this.dialogRef.close(); }

  addPredefinedCriterion(name: string): void {
    if (!this.criteriaArray.controls.some(c => c.get('name')?.value === name)) {
      this.addCriterion(name);
    }
  }
}