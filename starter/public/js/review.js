/* eslint-disable */
import { showAlert } from './alert.js';

const deleteReview = async (reviewId) => {
    try {

        const res = await axios({
            method: 'DELETE',
            url: `http://127.0.0.1:3000/api/v1/reviews/${reviewId}`,
        });
        if (res.status === 204) {
            showAlert('success', 'Review deleted successfully');
            window.setTimeout(() => {
                location.reload();
            }, 500);
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
        console.log("js cookie:"+document.cookie);
        await deleteReview(reviewId);
    }
});

