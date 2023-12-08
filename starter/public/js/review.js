/* eslint-disable */
import { showAlert } from './alert.js';

const deleteReview = async (reviewId) => {
    try {
        const res = await axios({
            method: 'DELETE',
            url: `http://127.0.0.1:3000/api/v1/reviews/${reviewId}`,
        });

        if (res.data.status === 'success') {
            showAlert('success', 'Review deleted successfully');
            // Optionally, you can update the UI to remove the deleted review here
        }
    } catch (err) {
        console.log(err);
        showAlert('error', 'Failed to delete review');
    }
};
document.addEventListener('click', async (e) => {
    if (e.target.classList.contains('delete-btn')) {
        e.preventDefault();
        const reviewId = e.target.dataset.reviewId;
        console.log(reviewId);
        await deleteReview(reviewId);
    }
});

