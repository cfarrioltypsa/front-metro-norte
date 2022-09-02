import { Router } from '@angular/router';
import { RegisterServiceService } from './../../../services/register-service.service';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, NgForm } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-register-page',
  templateUrl: './register-page.component.html',
  styleUrls: ['./register-page.component.scss']
})
export class RegisterPageComponent implements OnInit {

  confirmedEmail: string = ""
  verified: any;
  unverified: any;
  verifying: any;

  constructor(private registerService: RegisterServiceService, public router: Router ) { }

  ngOnInit(): void {
  }



  captureEmail (event: any) {

    this.verified = false;
    this.unverified = false;


    if (event.target.value.length > 5){
      this.verifying = true;

      var sendMailToCompare = new XMLHttpRequest();
      sendMailToCompare.open(
            "POST",
            "https://prod-220.westeurope.logic.azure.com:443/workflows/5903bc00eb884698b77d3fff79895ba1/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=X0oVVRcNuRqeiAz2X9Oa09lzXvPY1eb4O2ofFotHauA",
            true
          );

          sendMailToCompare.send(
            JSON.stringify({
              mailContacto: event.target.value
            })
          )

      setTimeout(() => {
        this.registerService.verifyEmail().subscribe(data => {
          data.find((elem: any) => {
                if (event.target.value === elem.mailContacto) {

                  this.verified = true
                  this.unverified = false;
                   this.confirmedEmail = elem.mailContacto
                   this.verifying = false;

                   return this.confirmedEmail
                } else {
                  this.verified = false;
                  this.unverified = true;
                  this.verifying = false;
                  return
                }

          })

        })

      }, 4000);
    } else {

    }

      }

  checkPass(event?: any) {
    const regexp = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*_=+-]).{8,12}$/;
    if (!regexp.test(event.target.value)) {
      console.log("error")
    }

  }

  sendRegisterForm(formulario: NgForm) {

const regexp = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*_=+-]).{8,12}$/;

    if (Object.values(formulario.value).includes("")){
      return Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: '¡Quedan campos por rellenar, asegurate de haberlos completado a todos!',
      });
    }



    if (formulario.value.password !== formulario.value.passwordRepeated) {
        return Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: '¡Los passwords no coinciden!',
        });
    }

    if (formulario.value.password.length < 8 && formulario.value.passwordRepeated.length < 8) {
      return Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: '¡El password es demasiado corto!',
      });
    }

    if(!regexp.test(formulario.value.password)){
      return Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: '¡El password no cumple con los requisitos minimos de seguridad!. Recuerda que debe tener de 8 a 12 caracteres y que debe incluir minimo: Un caracter en mayúscula, uno en minúscula, un número y un carácter especial',
      });

    }

    const parametro = document.location.href.slice(0 , -8)


    const user = {
      name: formulario.value.name,
      surname: formulario.value.surname,
      email: this.confirmedEmail,
      password: formulario.value.password,
      parametro
    }




   this.registerService.registerPost(user).subscribe((data:any):any =>
    {

      if(!this.confirmedEmail){
        return Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: '¡El correo que haz ingresado no tiene permiso para registrarse en dLab!'
        })

      }
      if(data.msg){
        return Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: `${data.msg}`,
        });
      }




      var sendMailToConfirm = new XMLHttpRequest();
      sendMailToConfirm.open(
            "POST",
            "https://prod-79.westeurope.logic.azure.com:443/workflows/1c1d3de8d8a44f189fe618b3aef974b3/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=1CXYhuCjntTIVlB-mymhnXR4jfgCfs-vy-uaB8YX4uI",
            true
          );

          sendMailToConfirm.send(
            JSON.stringify({
              name: data.name,
              surname: data.surname,
              email: data.email,
              token: data.token,
              parametro
            })
          )

    })



   if(this.verified) {
    Swal.fire('Completado!'
    , 'Su formulario de registro se ha completado de manera exitosa. En breve le enviaremos un correo electronico para terminar de confirmar tu registro.'
    , 'success'
    ).then(result => {
      if (result.isConfirmed) {
        formulario.reset()
        this.router.navigate(['login'])
      }
    })
   }
   else {
    return Swal.fire({
      icon: 'error',
      title: 'Oops...',
      text: '¡El correo que haz ingresado no tiene permiso para registrarse en dLab!',
    });
   }

   return true;

}

}
