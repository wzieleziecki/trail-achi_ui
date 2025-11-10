import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../auth.service';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-subscribe',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterOutlet],
  templateUrl: './subscribe.html',
  styleUrls: ['./subscribe.css']
})
export class SubscribeComponent implements OnInit {

  registrationForm!: FormGroup;
  loading: boolean = false;
  successMessage: string | null = null;
  errorMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.registrationForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit(): void {
    this.successMessage = null;
    this.errorMessage = null;

    if (this.registrationForm.invalid) {
      this.errorMessage = 'Proszę podać poprawny adres e-mail.';
      return;
    }

    this.loading = true;
    const email = this.registrationForm.value.email;

    this.authService.registerUser(email)
      .subscribe({
        next: (response) => {
          this.loading = false;
          this.successMessage = response.message || 'Link aktywacyjny wysłany. Sprawdź maila!';
          this.registrationForm.disable();
        },
        error: (err) => {
          this.loading = false;
          this.errorMessage = err.error?.error || 'Wystąpił błąd serwera. Spróbuj ponownie.';
        }
      });
  }
}
