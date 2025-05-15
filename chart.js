import { fetchCSV } from './csvHandler.js';

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
      options: { responsive: true, plugins: { legend: { position: 'right' } } }
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
      options: { responsive: true, plugins: { legend: { position: 'right' } } }
    });
  } else {
    console.error("SOW Chart canvas not found.");
  }

  // **NEW APPLICANT DISTRIBUTION CHART**
  fetchCSV('data/projects_curr.csv', applicants => {
    if (!applicants || applicants.length === 0) {
      console.error("Applicant chart cannot load: No data found!");
      return;
    }

    // Define applicant categories
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

      let category = 'Other'; // Default category
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
    
    // Render the Applicant Distribution Pie Chart
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
          backgroundColor: ['#ff6384', '#36a2eb', '#ffce56', '#8bc34a', '#ff7043', '#7e57c2', '#ff9800', '#00acc1', '#4db6ac', '#d32f2f']
        }]
      },
      options: { responsive: true, plugins: { legend: { position: 'right' } } }
    });

    // Populate "Other" applicants box, if it exists in the DOM
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
        otherBox.style.display = "none"; // Hide if no "Other" applicants exist
      }
    } else {
      console.warn("Other Applicants container elements not found.");
    }

    console.log("Applicant Chart Rendered Successfully!");
  });
}
