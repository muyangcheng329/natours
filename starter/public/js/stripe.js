import { showAlert } from './alert.js';
const stripe = Stripe(
  'pk_test_51NUhxwH9YPrhn5kBe2AJZiAs8inCdT4c7AAxhmJK0DNzByfUbyE26iKgHmcq0y1hMpgW47e9LSvVhSiFdqfZt0iR00mFLjbjmU'
);

const bookTour = async tourId => {
  try {
    const session = await axios(
      `http://127.0.0.1:3000/api/v1/bookings/checkout-session/${tourId}`
    );
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id
    });
  } catch (err) {
    console.log(err);
    showAlert('error', err);
  }
};

const bookBtn = document.getElementById('book-tour');

if (bookBtn) {
  bookBtn.addEventListener('click', e => {
    e.target.textContent = 'Processing...';
    const tourId = e.target.dataset.tourId; //105行的data-tour-id自动被js改成驼峰名
    bookTour(tourId);
  });
}
