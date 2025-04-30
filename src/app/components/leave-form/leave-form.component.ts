import { Component, OnInit } from "@angular/core"
import { FormBuilder, FormGroup, Validators } from "@angular/forms"
import { ActivatedRoute, Router } from "@angular/router"
import { MatSnackBar } from "@angular/material/snack-bar"
import { Leave } from "../../models/leave"
import { LeaveService } from "../../services/leave.service"
import { Observable } from "rxjs"

@Component({
  selector: "app-leave-form",
  templateUrl: "./leave-form.component.html",
  styleUrls: ["./leave-form.component.css"]
})
export class LeaveFormComponent implements OnInit {
  leaveForm: FormGroup
  isEditMode = false
  leaveId?: number
  loading = false

  constructor(
    private fb: FormBuilder,
    private leaveService: LeaveService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.leaveForm = this.fb.group({
      employeId: ["", Validators.required],
      dateDebut: ["", Validators.required],
      dateFin: ["", Validators.required],
      motif: ["", Validators.required],
      statut: ["en attente", Validators.required],
      commentaireManager: [""]
    })
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params["id"]) {
        this.isEditMode = true
        this.leaveId = +params["id"]
        this.loadLeave()
      }
    })

    // ✅ Écoute des 2 champs pour vérifier la validité
    this.leaveForm.get("dateDebut")?.valueChanges.subscribe(() => this.validateDates())
    this.leaveForm.get("dateFin")?.valueChanges.subscribe(() => this.validateDates())
  }

  validateDates(): void {
    const debut = new Date(this.leaveForm.get("dateDebut")?.value)
    const fin = new Date(this.leaveForm.get("dateFin")?.value)

    if (debut && fin && fin <= debut) {
      this.leaveForm.get("dateFin")?.setErrors({ dateOrder: true })
    } else {
      this.leaveForm.get("dateFin")?.setErrors(null)
    }
  }

  loadLeave(): void {
    this.leaveService.getLeave(this.leaveId!).subscribe({
      next: leave => this.leaveForm.patchValue(leave),
      error: () => this.showErrorMessage("Erreur lors du chargement du congé")
    })
  }

  onSubmit(): void {
    if (this.leaveForm.invalid) return

    this.loading = true
    const leave: Leave = this.leaveForm.value
    let request$: Observable<any>

    if (this.isEditMode) {
      request$ = this.leaveService.updateLeave(this.leaveId!, leave)
    } else {
      request$ = this.leaveService.createLeave(leave)
    }

    request$.subscribe({
      next: () => {
        const msg = this.isEditMode ? "Congé modifié avec succès" : "Demande de congé créée"
        this.showSuccessMessage(msg)

        setTimeout(() => {
          this.router.navigate(["/leaves"])
        }, 1000)
      },
      error: () => {
        const msg = this.isEditMode ? "Erreur de mise à jour" : "Erreur de création"
        this.showErrorMessage(msg)
        this.loading = false
      }
    })
  }

  getStatusClass(): string {
    const value = this.leaveForm.get("statut")?.value
    switch (value) {
      case "en attente": return "statut-attente"
      case "approuvé": return "statut-approuve"
      case "rejeté": return "statut-rejete"
      default: return ""
    }
  }

  private showSuccessMessage(msg: string): void {
    this.snackBar.open(msg, "Fermer", {
      duration: 3000,
      panelClass: ["success-snackbar"]
    })
  }

  private showErrorMessage(msg: string): void {
    this.snackBar.open(msg, "Fermer", {
      duration: 3000,
      panelClass: ["error-snackbar"]
    })
  }

  goToList(): void {
    this.router.navigate(["/leaves"]);
  }

  
}
