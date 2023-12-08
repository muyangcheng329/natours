/* eslint-disable */

import { showAlert } from './alert.js';
// const axios = require('axios/dist/browser/axios.cjs');
// import axios from 'axios';

const signup = async (username, email, password,confirmPassword) => {
  try {
    const res = await axios({
      // withCredentials:true,
      method: 'POST',
      url: 'http://127.0.0.1:3000/api/v1/users/signup',
      data: {
        username,
        email,
        password,
        confirmPassword
      },
    });

    if (res.data.status === 'success') {
      showAlert('success', 'Congratulations! Welcome!');
      document.cookie = 'jwt='+res.data.token
      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
    }
  } catch (err) {
    console.log(err);
    showAlert('error', err.response.data.message);
  }
};

const SignupForm = document.querySelector('.form--signup');

if (SignupForm) {
  SignupForm.addEventListener('submit', e => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmpassword').value;
    const email = document.getElementById('email').value;
    signup(username,email, password,confirmPassword);
  });
}

// import axios from 'axios';

// export const login = async (email, password) => {
//   try {
//     const res = await axios({
//       method: 'POST',
//       url: 'http://127.0.0.1:3000/api/v1/users/login',
//       data: {
//         email,
//         password
//       } //向api发送一个post请求
//     });
//     if (res.data.status === 'success') {
//       alert('logged in successfully');
//       window.setTimeout(() => {
//         location.assign('/');
//       }, 1500); //1.5s以后自动跳转首页
//     }
//   } catch (err) {
//     alert(err.response.data.message);
//   }
// };

// const hideAlert = () => {
//   const el = document.querySelector('.alert');
//   if (el) {
//     el.parentElement.removeChild(el);
//   }
// };

// const showAlert = (type, msg) => {
//   const markup = `<div class="alert alert--${type}">${msg}</div>`;
//   document.querySelector('body').insertAdjacentHTML('afterbegin', markup);
//   window.setTimeout(hideAlert, 5000);
// };

