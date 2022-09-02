import { RegisterServiceService } from './../../../services/register-service.service';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.scss']
})
export class LoginPageComponent implements OnInit {

  email: any = ""

  constructor(private loginService: RegisterServiceService, private router: Router) {



  }

  ngOnInit(): void {
  }

  handleLoginForm(loginForm: NgForm) {



    if(loginForm.value.user === "" || loginForm.value.pass === ""){
       Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: `¡Uno o los dos campos están vacios!`,
      });
      return
    }

    const userData = {
      email: loginForm.value.user,
      password: loginForm.value.pass
    }
    if (Object.values(userData).length) {
      this.loginService.loginPost(userData).subscribe((data):any => {
        if (data.msg){
          return Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: `${data.msg}`,
          });

        }



        if (data.email){
          this.email = data.email;
          localStorage.setItem("email", this.email);
          localStorage.setItem("token", data.token)
          if(localStorage.getItem("linkdLab")?.length){
            const enlace = document.createElement("a")
            enlace.href = localStorage.getItem("linkdLab")!.toString()
            enlace.click()
            return;
          } else {
            const enlace = document.createElement("a")
            enlace.href = "https://dlab.typsa.net/"
            enlace.click()
            return
          }

        }


      });




    }




  }

}
