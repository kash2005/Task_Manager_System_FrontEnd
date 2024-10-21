import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { StorageService } from '../../core/service/storage-service/storage.service';
import { UserService } from '../../core/service/user-service/user.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  submitted = false;

  constructor(private router:Router,
    private userService: UserService, 
    private storageService: StorageService){}

  // //sign in inputs validators sign in form
  signInForm = new FormGroup({
    email: new FormControl('',[Validators.required, Validators.email]),
    password: new FormControl('',[Validators.required, Validators.minLength(8)]),
  });

  get email(){
    return this.signInForm.get('email');
  }

  get password(){
    return this.signInForm.get('password');
  }

   // Handle form submission
   onSubmit(): void {
    this.submitted = true;

    if (this.signInForm.invalid) {
      return;  // Stop if form is invalid
    }

    // Call the login method from UserService
    this.userService.signIn(this.signInForm.get('email')?.value ?? '', this.signInForm.get('password')?.value ?? '').subscribe({
      next: (response) => {
        // Save the token and other details in sessionStorage using StorageService
        this.storageService.saveLoggedUserDetails({
          token: response.token,
          email: this.email?.value,
        }).then(() => {
          // Show a success message
          Swal.fire({
            icon: 'success',
            title: 'Login Successful',
            text: 'Welcome back!',
            confirmButtonText: 'OK'
          });

          console.log('Login successful', response);
          // Navigate to the home or dashboard page after login
          this.router.navigate(['/home']);
        });
      },
      error: (error) => {
        // Show error message if login fails
        Swal.fire({
          icon: 'error',
          title: 'Login Failed',
          text: error.error?.message || 'Invalid email or password. Please try again.',
          confirmButtonText: 'OK'
        });
      }
    });
  }
}
