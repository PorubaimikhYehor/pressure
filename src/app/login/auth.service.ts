import { Injectable, inject } from '@angular/core';
import { Auth, signInWithPopup, GoogleAuthProvider, signOut, authState } from '@angular/fire/auth';
import { computed, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private auth = inject(Auth);
  user = signal(authState(this.auth));

  loginWithGoogle() {
    return signInWithPopup(this.auth, new GoogleAuthProvider());
  }

  logout() {
    return signOut(this.auth);
  }
}
