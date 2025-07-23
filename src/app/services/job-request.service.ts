import { Injectable } from "@angular/core"
import { HttpClient } from "@angular/common/http"
import { Observable } from "rxjs"
import { JobRequest, JobRequestDto } from "../models/job-request.model"
import { environment } from "../../environments/environment"

@Injectable({
  providedIn: "root",
})
export class JobRequestService {
  private apiUrl = `${environment.apiUrl}/api/job-requests`

  constructor(private http: HttpClient) {}

  getAllJobRequests(): Observable<JobRequestDto[]> {
    return this.http.get<JobRequestDto[]>(this.apiUrl)
  }

  getActiveJobRequests(): Observable<JobRequestDto[]> {
    return this.http.get<JobRequestDto[]>(`${this.apiUrl}/active`)
  }

  getJobRequestById(id: number): Observable<JobRequestDto> {
    return this.http.get<JobRequestDto>(`${this.apiUrl}/${id}`)
  }

  createJobRequest(jobRequest: JobRequest): Observable<JobRequestDto> {
    return this.http.post<JobRequestDto>(this.apiUrl, jobRequest)
  }

  updateJobRequest(id: number, jobRequest: JobRequest): Observable<JobRequestDto> {
    return this.http.put<JobRequestDto>(`${this.apiUrl}/${id}`, jobRequest)
  }

  deleteJobRequest(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`)
  }

  getJobRequestsByDepartment(department: string): Observable<JobRequestDto[]> {
    return this.http.get<JobRequestDto[]>(`${this.apiUrl}/department/${department}`)
  }
}
