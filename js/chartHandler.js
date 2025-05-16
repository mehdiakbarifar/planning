import { fetchCSV } from './csvHandler.js';

// Helper function to parse dates in "M/D/YYYY" format (e.g., "9/9/2028")
function parseCustomDate(dateStr) {
  const parts = dateStr.split('/');
  if (parts.length !== 3) {
    return new Date(dateStr);
  }
  const month = parseInt(parts[0], 10) - 1; // Month is zero-indexed
  const day = parseInt(parts[1], 10);
  const year = parseInt(parts[2], 10);
  return new Date(year, month, day);
}

export function initCharts() {
  // Initialize Status Chart
  const statusCanvas = document.getElementById('statusChart');
  if (statusCanvas) {
    const statusCtx = statusCanvas.getContext('2d');
    new Chart(statusCtx, {
      type: 'pie',
      data: {
        labels: ['Completed', 'Repair', 'Pending'],
        datasets: [{
          data: [10, 5, 3],
          backgroundColor: ['#4caf50', '#ff9800', '#f44336']
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { position: 'right' } }
      }
    });
  } else {
    console.error("Status Chart canvas not found.");
  }

  // Initialize SOW Chart
  const sowCanvas = document.getElementById('sowChart');
  if (sowCanvas) {
    const sowCtx = sowCanvas.getContext('2d');
    new Chart(sowCtx, {
      type: 'pie',
      data: {
        labels: ['Cleaning', 'Inspection', 'Repair', 'Other'],
        datasets: [{
          data: [8, 6, 4, 2],
          backgroundColor: ['#2196f3', '#9c27b0', '#e91e63', '#00bcd4']
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { position: 'right' } }
      }
    });
  } else {
    console.error("SOW Chart canvas not found.");
  }

  // Initialize Applicant Distribution Chart
  fetchCSV('data/projects_curr.csv', (applicants) => {
    if (!applicants || applicants.length === 0) {
      console.error("Applicant chart cannot load: No data found!");
      return;
    }
    const categories = {
      'Design Office': 0,
      'Engine Shop': 0,
      'QC': 0,
      'Business Department': 0,
      'Equipment Department': 0,
      'GT-21': 0,
      'GT-25': 0,
      'GT-31': 0,
      'GT-22': 0,
      'Other': 0
    };
    const otherApplicants = [];
    applicants.forEach(row => {
      let applicant = row['Applicant'] || row['متقاضی'];
      if (!applicant) return;
      let category = 'Other'; // Default
      if (applicant.toLowerCase().includes("design")) category = "Design Office";
      else if (applicant.toLowerCase().includes("engine shop")) category = "Engine Shop";
      else if (applicant.toLowerCase().includes("qc")) category = "QC";
      else if (applicant.includes("کسب و کار") || applicant.includes("بازرگانی")) category = "Business Department";
      else if (applicant.includes("تجهیزات") || applicant.toLowerCase().includes("equipment")) category = "Equipment Department";
      else if (applicant.includes("21")) category = "GT-21";
      else if (applicant.includes("25")) category = "GT-25";
      else if (applicant.includes("31")) category = "GT-31";
      else if (applicant.includes("22")) category = "GT-22";
      categories[category]++;
      if (category === "Other" && !otherApplicants.includes(applicant)) {
        otherApplicants.push(applicant);
      }
    });
    const applicantCanvas = document.getElementById('applicantChart');
    if (!applicantCanvas) {
      console.error("Applicant Chart canvas not found!");
      return;
    }
    const applicantCtx = applicantCanvas.getContext('2d');
    new Chart(applicantCtx, {
      type: 'pie',
      data: {
        labels: Object.keys(categories),
        datasets: [{
          data: Object.values(categories),
          backgroundColor: [
            '#ff6384', '#36a2eb', '#ffce56', '#8bc34a',
            '#ff7043', '#7e57c2', '#ff9800', '#00acc1',
            '#4db6ac', '#d32f2f'
          ]
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { position: 'right' } }
      }
    });
    const otherBox = document.getElementById('otherApplicantsBox');
    const otherList = document.getElementById('otherApplicantsList');
    if (otherBox && otherList) {
      if (otherApplicants.length > 0) {
        otherBox.style.display = "block";
        otherList.innerHTML = "";
        otherApplicants.forEach(applicant => {
          const listItem = document.createElement("li");
          listItem.textContent = applicant;
          otherList.appendChild(listItem);
        });
      } else {
        otherBox.style.display = "none";
      }
    } else {
      console.warn("Other Applicants container elements not found.");
    }
    console.log("Applicant Chart Rendered Successfully!");
  });

  // Initialize Client Distribution Bar Chart from CSV directly
  initClientChartFromCSV();

  // Initialize Calibration Due Date Distribution Timeline Chart from CSV
  initCalibrationTimelineChart();
}

function initClientChartFromCSV() {
  const clientCanvas = document.getElementById('clientChart');
  if (!clientCanvas) {
    console.error("Client Chart canvas not found!");
    return;
  }
  fetchCSV('data/projects_curr.csv', (data) => {
    if (!data || data.length === 0) {
      console.error("No data found in projects_curr.csv for Client Chart!");
      return;
    }
    const clientCounts = {};
    data.forEach(row => {
      let clientName = row['Client'];
      if (!clientName || clientName.trim() === "") {
        clientName = "Other";
      } else {
        clientName = clientName.trim();
      }
      clientCounts[clientName] = (clientCounts[clientName] || 0) + 1;
    });
    const labels = Object.keys(clientCounts);
    const counts = Object.values(clientCounts);
    const clientCtx = clientCanvas.getContext('2d');
    new Chart(clientCtx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Client Count',
          data: counts,
          backgroundColor: 'rgba(54, 162, 235, 0.7)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
          y: {
            beginAtZero: true,
            title: { display: true, text: 'Count' }
          },
          x: {
            title: { display: true, text: 'Client' }
          }
        }
      }
    });
  });
}

function initCalibrationTimelineChart() {
  const timelineCanvas = document.getElementById('calibrationTimelineChart');
  if (!timelineCanvas) {
    console.error("Calibration Timeline Chart canvas not found!");
    return;
  }
  // Ensure the canvas has a visible height
  timelineCanvas.style.height = "300px";
  
  // Use the "date" column from the calibration CSV.
  fetchCSV('data/calib_equipments.csv', (data) => {
    if (!data || data.length === 0) {
      console.error("No data found in calib_equipments.csv for Calibration Timeline Chart!");
      return;
    }
    // Aggregate calibration dates from the "date" column.
    const dateCounts = {};
    data.forEach(row => {
      let calDate = row['date'];
      if (calDate && calDate.trim() !== "") {
        dateCounts[calDate] = (dateCounts[calDate] || 0) + 1;
      }
    });
    // Sort dates in ascending order using our custom parser.
    const sortedDates = Object.keys(dateCounts).sort((a, b) => parseCustomDate(a) - parseCustomDate(b));
    const counts = sortedDates.map(date => dateCounts[date]);

    const timelineCtx = timelineCanvas.getContext('2d');
    new Chart(timelineCtx, {
      type: 'bar',
      data: {
        labels: sortedDates,
        datasets: [{
          label: 'Scheduled Calibrations',
          data: counts,
          backgroundColor: 'rgba(255, 99, 132, 0.7)',
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
          x: {
            type: 'time',
            time: {
              parser: 'M/d/yyyy', // parser string matching M/D/YYYY format
              tooltipFormat: 'MMM d, yyyy',
              unit: 'month'
            },
            title: { display: true, text: 'Calibration Due Date' }
          },
          y: {
            beginAtZero: true,
            title: { display: true, text: 'Count' }
          }
        }
      }
    });
  });
}
