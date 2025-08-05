// Static dummy values (can be made dynamic later)
const metrics = {
  totalFarms: 25,
  totalWarehouses: 10,
  totalShipments: 7,
  totalSpoilage: 2
};

document.getElementById("totalFarms").innerText = metrics.totalFarms;
document.getElementById("totalWarehouses").innerText = metrics.totalWarehouses;
document.getElementById("totalShipments").innerText = metrics.totalShipments;
document.getElementById("totalSpoilage").innerText = metrics.totalSpoilage;

// Shipment Chart
new Chart(document.getElementById('shipmentChart'), {
  type: 'bar',
  data: {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{
      label: 'Shipments',
      data: [12, 19, 8, 5, 9, 14],
      backgroundColor: 'rgba(34,197,94,0.6)'
    }]
  },
  options: {
    responsive: true,
    plugins: { legend: { display: false } }
  }
});

// Warehouse Chart
new Chart(document.getElementById('warehouseChart'), {
  type: 'doughnut',
  data: {
    labels: ['Occupied', 'Available'],
    datasets: [{
      label: 'Capacity',
      data: [70, 30],
      backgroundColor: ['#059669', '#d1fae5']
    }]
  },
  options: {
    responsive: true
  }
});
