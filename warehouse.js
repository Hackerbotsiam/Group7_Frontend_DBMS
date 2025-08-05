// warehouse.js

let warehouses = [
  { name: "Central Depot", location: "Dhaka", capacity: 10000 },
  { name: "North Storage", location: "Sylhet", capacity: 8000 },
];

function renderWarehouseTable(data) {
  const tableBody = document.getElementById("warehouseTableBody");
  tableBody.innerHTML = "";
  data.forEach((w, index) => {
    tableBody.innerHTML += `
      <tr>
        <td class="px-4 py-2">${w.name}</td>
        <td class="px-4 py-2">${w.location}</td>
        <td class="px-4 py-2">${w.capacity} kg</td>
        <td class="px-4 py-2">
          <button class="btn-action btn-edit" onclick="editWarehouse(${index})">Edit</button>
          <button class="btn-action btn-delete" onclick="deleteWarehouse(${index})">Delete</button>
        </td>
      </tr>`;
  });
  document.getElementById("warehouseCount").textContent = data.length;
}

function filterWarehouses() {
  const query = document.getElementById("warehouseSearch").value.toLowerCase();
  const filtered = warehouses.filter(w => w.name.toLowerCase().includes(query));
  renderWarehouseTable(filtered);
}

function addWarehouse(e) {
  e.preventDefault();
  const name = document.getElementById("wName").value;
  const location = document.getElementById("wLocation").value;
  const capacity = parseInt(document.getElementById("wCapacity").value);

  if (name && location && capacity) {
    warehouses.push({ name, location, capacity });
    renderWarehouseTable(warehouses);
    e.target.reset();
  }
}

function editWarehouse(index) {
  const warehouse = warehouses[index];
  document.getElementById("wName").value = warehouse.name;
  document.getElementById("wLocation").value = warehouse.location;
  document.getElementById("wCapacity").value = warehouse.capacity;

  deleteWarehouse(index);
}

function deleteWarehouse(index) {
  warehouses.splice(index, 1);
  renderWarehouseTable(warehouses);
}

document.getElementById("warehouseForm").addEventListener("submit", addWarehouse);
document.getElementById("warehouseSearch").addEventListener("input", filterWarehouses);

renderWarehouseTable(warehouses);
