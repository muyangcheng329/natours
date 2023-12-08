/* eslint-disable */

import { showAlert } from './alert.js';
// const axios = require('axios/dist/browser/axios.cjs');
// import axios from 'axios';

const login = async (email, password) => {
  try {
     // browser
    // const instance = axios.create({
    //   withCredentials: true,
    // })
    // const res = await instance.post("http://127.0.0.1:3000/api/v1/users/login", {email, password});
    // console.log(res);
    const res = await axios({
      method: 'POST',
      url: 'http://127.0.0.1:3000/api/v1/users/login',
      data: {
        email,
        password
      }, //向api发送一个post请求
      withCredentials:true
    });

    if (res.data.status === 'success') {
      showAlert('success', 'logged in successfully');
      console.log("login.js:")
      console.log(res.data);
      // window.setTimeout(() => {
      //   location.assign('/');
      // }, 1500); //1.5s以后自动跳转首页
    }
  } catch (err) {
    console.log(err);
    showAlert('error', err.response.data.message);
  }
};

const loginForm = document.querySelector('.form--login');

if (loginForm) {
  loginForm.addEventListener('submit', e => {
    e.preventDefault();
    const password = document.getElementById('password').value;
    const email = document.getElementById('email').value;
    login(email, password);
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

