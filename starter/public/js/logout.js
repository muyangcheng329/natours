const logOutBtn = document.querySelector('.nav__el--logout');
if (logOutBtn) {
  logOutBtn.addEventListener('click', async () => {
    try {
      const res = await axios({
        method: 'GET',
        url: 'http://127.0.0.1:3000/api/v1/users/logout'
      });

      if ((res.data.status = 'success')) location.reload(true);
    } catch {
      showAlert('error', 'Error Logging out! Try again');
    }
  });
}
