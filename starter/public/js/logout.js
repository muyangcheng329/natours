const logOutBtn = document.querySelector('.nav__el--logout');
if (logOutBtn) {
  logOutBtn.addEventListener('click', async () => {
    try {
      const res = await axios({
        method: 'GET',
        url: '/api/v1/users/logout'
      });

      if ((res.data.status = 'success')) location.reload(true);
    } catch {
      showAlert('error', 'Error Logging out! Try again');
    }
  });
}
