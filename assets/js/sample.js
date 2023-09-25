
  // Initialize Firebase with your configuration
  const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    databaseURL: "YOUR_DATABASE_URL",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID",
    measurementId: "YOUR_MEASUREMENT_ID"
  };

  firebase.initializeApp(firebaseConfig);
  const database = firebase.database();

  const addPersonForm = document.getElementById('addPersonForm');
  const addPersonSubmitBtn = document.getElementById('addPersonSubmitBtn');
  const editModal = document.getElementById('editModal');
  const closeEditModal = document.getElementById('closeEditModal');
  const updatePersonBtn = document.getElementById('updatePersonBtn');

  let incrementValue = 1;

  addPersonSubmitBtn.addEventListener('click', () => {
    const personName = document.getElementById('personName').value;
    const regularOrIntent = document.querySelector('input[name="regularOrIntent"]:checked').value;
    const joiningDate = document.getElementById('joiningDate').value;
    const jobRole = document.getElementById('jobRole').value;

    const currentDate = new Date().toLocaleDateString('en-US', {
      year: '2-digit',
      month: '2-digit',
      day: '2-digit'
    }).replace(/\//g, '');

    const userId = `EGSPASC-${currentDate}-${String(incrementValue).padStart(2, '0')}`;

    database.ref('people/' + userId).set({
      personName: personName,
      regularOrIntent: regularOrIntent,
      joiningDate: joiningDate,
      jobRole: jobRole,
      userId: userId
    }).then(() => {
      alert('Data successfully stored.');
      addPersonForm.reset();
      incrementValue++;
      updateTable();
    }).catch((error) => {
      console.error("Error storing data: ", error);
      alert('Error storing data. Please try again later.');
    });
  });

  function updateTable() {
    const personList = document.getElementById('personList');
    personList.innerHTML = '';

    database.ref('people').once('value').then((snapshot) => {
      snapshot.forEach((childSnapshot) => {
        const userData = childSnapshot.val();
        const row = document.createElement('tr');

        const userIDCell = document.createElement('td');
        userIDCell.textContent = userData.userId;

        const nameCell = document.createElement('td');
        nameCell.textContent = userData.personName;

        const regularOrIntentCell = document.createElement('td');
        regularOrIntentCell.textContent = userData.regularOrIntent;

        const joiningDateCell = document.createElement('td');
        joiningDateCell.textContent = userData.joiningDate;

        const jobRoleCell = document.createElement('td');
        jobRoleCell.textContent = userData.jobRole;

        const editButton = document.createElement('td');
        editButton.className = 'edit-button text-blue-500 iconfot';
        const editIcon = document.createElement('i');
        editIcon.className = 'fas fa-edit';
        editButton.appendChild(editIcon);
        editButton.addEventListener('click', () => {
          populateEditForm(userData);
          editModal.style.display = 'block';

          updatePersonBtn.addEventListener('click', () => {
            const updatedData = {
              personName: document.getElementById('editPersonName').value,
              regularOrIntent: document.querySelector('input[name="editRegularOrIntent"]:checked').value,
              joiningDate: document.getElementById('editJoiningDate').value,
              jobRole: document.getElementById('editJobRole').value,
            };
            updateDataInFirebase(userData.userId, updatedData);
            editModal.style.display = 'none';
          });
        });

        const deleteButton = document.createElement('td');
        deleteButton.className = 'delete-button text-red-500 iconfot';
        const deleteIcon = document.createElement('i');
        deleteIcon.className = 'fas fa-trash';
        deleteButton.appendChild(deleteIcon);
        deleteButton.addEventListener('click', () => {
          if (confirm("Are you sure you want to delete this record?")) {
            deleteDataFromFirebase(userData.userId);
          }
        });

        row.appendChild(userIDCell);
        row.appendChild(nameCell);
        row.appendChild(regularOrIntentCell);
        row.appendChild(joiningDateCell);
        row.appendChild(jobRoleCell);
        row.appendChild(editButton);
        row.appendChild(deleteButton);

        personList.appendChild(row);
      });
    });
  }

  function populateEditForm(userData) {
    document.getElementById('editPersonName').value = userData.personName;
    const regularOrIntent = userData.regularOrIntent;
    if (regularOrIntent === 'Regular') {
      document.getElementById('editRegular').checked = true;
    } else if (regularOrIntent === 'Intent') {
      document.getElementById('editIntent').checked = true;
    }
    document.getElementById('editJoiningDate').value = userData.joiningDate;
    document.getElementById('editJobRole').value = userData.jobRole;
  }

  function updateDataInFirebase(userId, updatedData) {
    database.ref('people/' + userId).update(updatedData).then(() => {
      alert('Data successfully updated.');
      updateTable();
    }).catch((error) => {
      console.error("Error updating data: ", error);
      alert('Error updating data. Please try again later.');
    });
  }

  function deleteDataFromFirebase(userId) {
    database.ref('people/' + userId).remove().then(() => {
      alert('Data successfully deleted.');
      updateTable();
    }).catch((error) => {
      console.error("Error deleting data: ", error);
      alert('Error deleting data. Please try again later.');
    });
  }

  closeEditModal.addEventListener('click', () => {
    editModal.style.display = 'none';
    updatePersonBtn.removeEventListener('click');
  });

  // Call the updateTable function to populate the table on page load
  updateTable();

