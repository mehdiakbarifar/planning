export function initCharts() {
  const statusCtx = document.getElementById('statusChart').getContext('2d');
  const statusData = {
    labels: ['Completed', 'Repair', 'Pending'],
    datasets: [{
      data: [10, 5, 3],
      backgroundColor: ['#4caf50', '#ff9800', '#f44336']
    }]
  };
  new Chart(statusCtx, {
    type: 'pie',
    data: statusData,
    options: { responsive: true, plugins: { legend: { position: 'right' } } }
  });
  const sowCtx = document.getElementById('sowChart').getContext('2d');
  const sowData = {
    labels: ['Cleaning', 'Inspection', 'Repair', 'Other'],
    datasets: [{
      data: [8, 6, 4, 2],
      backgroundColor: ['#2196f3', '#9c27b0', '#e91e63', '#00bcd4']
    }]
  };
  new Chart(sowCtx, {
    type: 'pie',
    data: sowData,
    options: { responsive: true, plugins: { legend: { position: 'right' } } }
  });
}
