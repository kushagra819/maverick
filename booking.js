function proceedToPayment(turfName, date, time, price) {
  const bookingDetails = {
    turfName,
    date,
    time,
    price
  };

  localStorage.setItem('pendingBooking', JSON.stringify(bookingDetails));
  window.location.href = 'payment.html';
}