/* eslint-disable */

document.addEventListener('DOMContentLoaded', () => {
    const profileDetailButton = document.querySelector('.overview-box__detail.btn');

    if (profileDetailButton) {
        profileDetailButton.addEventListener('click', () => {
            const href = profileDetailButton.getAttribute('href');
            const userId = href.split('/profile/')[1];
            window.location.href = `/profile/${userId}`;
        });
    }
});