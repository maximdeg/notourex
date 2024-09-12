/*eslint-disable*/
import axios from 'axios';
import { showAlert } from './alerts';

export const login = async (email, password) => {
   try {
      const res = await axios({
         method: 'POST',
         url: '/api/v2/users/login',
         data: {
            email,
            password,
         },
      });

      if (res.data.status === 'success') {
         showAlert('success', 'Logged In Successfuly');
         window.setTimeout(() => {
            location.assign('/');
         }, 1500);
      }
   } catch (err) {
      showAlert('error', err.response.data.message);
   }
};

export const logout = async () => {
   try {
      const res = await axios({
         method: 'GET',
         url: '/api/v2/users/logout',
      });
      if (res.data.status === 'success') location.reload(true);
   } catch (err) {
      showAlert('error', 'Error logging out! Try again.');
   }
};

export const signup = async (name, email, password, passwordConfirm) => {
   try {
      console.log('SIGNUP', name, email, password, passwordConfirm);
      const res = await axios({
         method: 'POST',
         url: '/api/v2/users/signup',
         data: {
            name,
            email,
            password,
            passwordConfirm,
         },
      });
      if (res.data.status === 'success') {
         showAlert('success', 'Signed Up Successfuly');
         window.setTimeout(() => {
            location.assign('/');
         }, 1500);
      }
   } catch (err) {
      showAlert('error', err.response.data.message);
   }
};
