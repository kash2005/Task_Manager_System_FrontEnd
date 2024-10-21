import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { UserDTO } from '../../core/model/userDTO';
import Swal from 'sweetalert2'; 
import { UserService } from '../../core/service/user-service/user.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.scss']
})
export class SignUpComponent {
  submitted = false;

  constructor(private userService: UserService,
              private router:Router
  ) {}

  SignUpForm = new FormGroup({
    name: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(8)]),
    confirmPassword: new FormControl('', [Validators.required])
  });

  get userName() {
    return this.SignUpForm.get('name');
  }

  get email() {
    return this.SignUpForm.get('email');
  }

  get password() {
    return this.SignUpForm.get('password');
  }

  get confirmPassword() {
    return this.SignUpForm.get('confirmPassword');
  }

  passwordsMatch(): boolean {
    return this.password?.value === this.confirmPassword?.value;
  }

  onSubmit(): void {
    this.submitted = true;

    // Validate form and password matching
    if (this.SignUpForm.invalid || !this.passwordsMatch()) {
      if (!this.passwordsMatch()) {
        this.confirmPassword?.setErrors({ mustMatch: true });
        this.confirmPassword?.updateValueAndValidity();

        // Show error SweetAlert for password mismatch
        Swal.fire({
          icon: 'error',
          title: 'Passwords do not match',
          text: 'Please make sure both passwords are the same!',
          confirmButtonText: 'OK'
        });
      }
      return;
    }

    const userDTO: UserDTO = {
      name: this.SignUpForm.get('name')?.value ?? '',
      email: this.SignUpForm.get('email')?.value ?? '',
      password: this.SignUpForm.get('password')?.value ?? ''
    };

    // Call the signUp function from the UserService
    this.userService.signUp(userDTO).subscribe({
      next: (response) => {
        // Show success SweetAlert
        Swal.fire({
          icon: 'success',
          title: 'Signed up successfully!',
          text: 'You have successfully created your account.',
          confirmButtonText: 'Great!'
        });
        this.router.navigate(['/login']);
        this.SignUpForm.reset();
        this.submitted = false; // Reset the submitted flag
        console.log('Sign-up successful:', response);
      },
      error: (error) => {
        console.error('Sign-up error:', error); // Log error for debugging
    let errorMessage = 'There was an error creating your account. Please try again later.';
    
    // Check if the error is a duplicate key error
    if (error.error?.message && error.error.message.includes('duplicate key error')) {
        errorMessage = 'This email is already registered. Please use a different email.';
    }

    // Show error SweetAlert
    Swal.fire({
        icon: 'error',
        title: 'Sign-up failed',
        text: errorMessage,
        confirmButtonText: 'OK'
    }); 
      }
    });
  }
}
