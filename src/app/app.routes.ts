import { Routes } from '@angular/router';
import { SubscribeComponent } from './subscribe/subscribe';

export const routes: Routes = [
    {
      path: '',
      component: SubscribeComponent,
      title: 'Subskrypcja Trail Achi'
    },
    {
      path: '**',
      redirectTo: ''
    }
];
