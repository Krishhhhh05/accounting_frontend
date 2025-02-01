"use client";
import React, { useState, useEffect } from 'react';

function Page() {
  // Existing state declarations (no changes here)
  const [formData, setFormData] = useState({
    accountHolderName: '',
    accountNumber: '',
    ifscCode: '',
    openingBalance: '',
    upiName: '',
    upiId: '',
  });
  const [transactionCategory, setTransactionCategory] = useState('');

  const openModal = (type, accountNumber) => {
    setTransactionType(type); // Set transaction type to Debit or Credit
    setSelectedAccountNumber(accountNumber); // Set the selected account number
    setModalVisible(true); // Show the modal
    fetchInternalBanks(); // Fetch the list of internal banks
  };
  const handleModalSubmit = async (e) => {
    e.preventDefault();
  
    try {
      const formData = new FormData();
      formData.append('accountNumber', selectedAccountNumber); // Pass the account number
      formData.append('transactionType', transactionType);     // Debit or Credit
      formData.append('amount', modalFormData.amount);         // Transaction amount
      formData.append('bankName', modalFormData.bankName);     // Bank name
      if (modalFormData.screenshot) {
        formData.append('screenshot', modalFormData.screenshot); // Screenshot file
      }
  
      const response = await fetch('http://localhost:8000/api/submit_bank_transaction/', {
        method: 'POST',
        body: formData,
      });
  
      const result = await response.json();
      if (response.ok) {
        alert('Transaction submitted successfully!');
        setModalVisible(false);
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      console.error('Error submitting transaction:', error);
      alert('Failed to submit transaction');
    }
  };

  const handleAddBankSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission behavior
  
    try {
      // Send the form data to the backend API
      const response = await fetch('http://localhost:8000/api/submit_bank_outside_details/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),  // Send the formData in the request body
      });
  
      const result = await response.json();
      
      if (response.ok) {
        alert('Bank details submitted successfully!');
        setFormVisible(false);  // Hide the form after submission
        fetchBankDocuments();    // Refresh the list of bank documents
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      console.error('Error submitting bank details:', error);
      alert('Failed to submit bank details');
    }
  };

    // Handle input changes for the main form
    const handleChange = (e) => {
      const { name, value } = e.target;
  
      // Ensure everything is capital case except opening balance
      if (name === 'openingBalance') {
        const numbersOnly = value.replace(/[^0-9]/g, '');
        setFormData((prevData) => ({
          ...prevData,
          [name]: numbersOnly,
        }));
      } else {
        setFormData((prevData) => ({
          ...prevData,
          [name]: value.toUpperCase(),
        }));
      }
    };
  
  
  const [formVisible, setFormVisible] = useState(false);
  const [bankDocuments, setBankDocuments] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [transactionType, setTransactionType] = useState('');
  const [modalFormData, setModalFormData] = useState({
    bankName: '',
    amount: '',
    screenshot: null,
  });
  const [selectedAccountNumber, setSelectedAccountNumber] = useState('');

  const [internalBanks, setInternalBanks] = useState([]);
  const [banksLoading, setBanksLoading] = useState(false);
  const [banksError, setBanksError] = useState(null);

  // New state for expandable row tracking
  const [expandedRow, setExpandedRow] = useState(null); // Stores the currently expanded row's account number
  const [expandedRowData, setExpandedRowData] = useState({}); // Stores the expanded row data

  // Fetch bank documents (move this out of useEffect so it can be reused)
  const fetchBankDocuments = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/get_bank_documents/');
      const data = await response.json();
      if (response.ok) {
        setBankDocuments(data.banks);
      } else {
        alert('Failed to fetch bank documents');
      }
    } catch (error) {
      console.error('Error fetching bank documents:', error);
    }
  };

  // Call fetchBankDocuments inside useEffect to load the data on page load
  useEffect(() => {
    fetchBankDocuments();
  }, []);

  // Function to fetch internal banks
  const fetchInternalBanks = async () => {
    setBanksLoading(true);
    setBanksError(null);
    try {
      const response = await fetch('http://localhost:8000/api/get_internal_banks/');
      const data = await response.json();
      if (response.ok) {
        setInternalBanks(data.internal_banks_collections);
      } else {
        setBanksError('Failed to fetch internal banks');
      }
    } catch (error) {
      console.error('Error fetching internal banks:', error);
      setBanksError('An error occurred while fetching internal banks');
    } finally {
      setBanksLoading(false);
    }
  };

  // New function to fetch data for a specific account number (collection)
  const fetchCollectionData = async (accountNumber) => {
    try {
      console.log("capturer")
      const response = await fetch(`http://localhost:8000/api/get_client_documents/${accountNumber}`);
      const data = await response.json();
      if (response.ok) {
        setExpandedRowData((prevData) => ({
          ...prevData,
          [accountNumber]: data.documents, // Store the fetched data for the expanded row
        }));
      } else {
        alert('Failed to fetch collection data');
      }
    } catch (error) {
      console.error('Error fetching collection data:', error);
    }
  };

  // Function to handle expanding/collapsing rows
  const toggleRow = (accountNumber) => {
    if (expandedRow === accountNumber) {
      // If the row is already expanded, collapse it
      setExpandedRow(null);
    } else {
      // Otherwise, expand the row and fetch data
      setExpandedRow(accountNumber);
      if (!expandedRowData[accountNumber]) {
        fetchCollectionData(accountNumber); // Fetch the collection data if not already fetched
      }
    }
  };

  return (
    <div>
      {/* Header Section */}
      <header style={styles.header}>
        <div style={styles.logoContainer}>
          <img src="/mansoor.png" alt="Mansoor Logo" style={styles.logo} />
        </div>
        <div style={styles.titleContainer}>
          <h1 style={styles.title}>ACCOUNT INFORMATION</h1>
        </div>
      </header>

      {/* Card with Circular Button */}
      <div style={styles.card}>
        {/* Circular button */}
        <button style={styles.circularButton} onClick={() => setFormVisible(!formVisible)}>
          +
        </button>
        <span style={styles.addBankText}>ADD BANK</span>

        {/* Conditionally render the form based on formVisible */}
        {formVisible && (
          <div style={styles.formContainer}>
            <form style={styles.form} onSubmit={handleAddBankSubmit}>
              {/* Existing form fields */}
              <div style={styles.formGroup}>
                <label style={styles.label}>ACCOUNT HOLDER NAME</label>
                <input
                  type="text"
                  name="accountHolderName"
                  value={formData.accountHolderName}
                  onChange={handleChange}
                  style={styles.input}
                  required
                />
              </div>
              <div style={styles.formGroup}>
    <label style={styles.label}>ACCOUNT NUMBER</label>
    <input
      type="text"
      name="accountNumber"
      value={formData.accountNumber}
      onChange={handleChange}
      style={styles.input}
      required
    />
  </div>
  <div style={styles.formGroup}>
    <label style={styles.label}>IFSC CODE</label>
    <input
      type="text"
      name="ifscCode"
      value={formData.ifscCode}
      onChange={handleChange}
      style={styles.input}
      required
    />
  </div>
  <div style={styles.formGroup}>
    <label style={styles.label}>OPENING BALANCE</label>
    <input
      type="text"
      name="openingBalance"
      value={formData.openingBalance}
      onChange={handleChange}
      style={styles.input}
      required
    />
  </div>
  <div style={styles.formGroup}>
    <label style={styles.label}>UPI NAME</label>
    <input
      type="text"
      name="upiName"
      value={formData.upiName}
      onChange={handleChange}
      style={styles.input}
      required
    />
  </div>
  <div style={styles.formGroup}>
    <label style={styles.label}>UPI ID</label>
    <input
      type="text"
      name="upiId"
      value={formData.upiId}
      onChange={handleChange}
      style={styles.input}
      required
    />
  </div>
              {/* Other input fields */}
              <button type="submit" style={styles.submitButton}>
                SUBMIT
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Display Bank Documents in Tabular Form */}
      <div style={styles.tableContainer}>
        <h2 style={styles.gridTitle}>Bank Documents</h2>
        <table style={styles.table}>
          <thead>
            <tr style={styles.tableHeaderRow}>
              <th style={styles.tableHeader}>Account Holder</th>
              <th style={styles.tableHeader}>Account Number</th>
              <th style={styles.tableHeader}>IFSC Code</th>
              <th style={styles.tableHeader}>Opening Balance</th>
              <th style={styles.tableHeader}>UPI Name</th>
              <th style={styles.tableHeader}>UPI ID</th>
              <th style={styles.tableHeader}>DB/CR</th>
              <th style={styles.tableHeader}>Upload Statement</th>
            </tr>
          </thead>
          <tbody>
            {bankDocuments.map((doc, index) => (
              <React.Fragment key={index}>
                <tr
                  style={index % 2 === 0 ? { ...styles.tableRow, ...styles.alternateRow } : styles.tableRow}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')} // Enlarge row on hover
                  onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')} // Reset back to normal
                  onClick={() => toggleRow(doc.account_number)} // Handle row click
                >
                  <td style={styles.tableCell}>{doc.bank_holder_name}</td>
                  <td style={styles.tableCell}>{doc.account_number}</td>
                  <td style={styles.tableCell}>{doc.ifsc}</td>
                  <td style={styles.tableCell}>₹{doc.opening_balance}</td>
                  <td style={styles.tableCell}>{doc.nameonupi}</td>
                  <td style={styles.tableCell}>{doc.UPI}</td>
                  <td style={styles.tableCell}>
                    <div style={styles.buttonContainer}>
                      <button style={styles.debitButton} onClick={() => openModal('Debit', doc.account_number)}>
                        Debit
                      </button>
                      <button style={styles.creditButton} onClick={() => openModal('Credit', doc.account_number)}>
                        Credit
                      </button>
                    </div>
                  </td>
                  <td style={styles.tableCell}>
                    <input
                      type="file"
                      accept="application/pdf"
                      onChange={(e) => handlePDFUpload(e, doc.account_number)}
                      style={styles.pdfUpload}
                    />
                  </td>
                </tr>

                {/* Expanded row content */}
                {expandedRow === doc.account_number && (
                  <tr>
  <td colSpan="8" style={styles.expandedRow}>
    <div style={styles.expandedContent}>
      <table style={styles.transactionTable}>
        <thead>
          <tr>
          <th style={styles.transactionHeader}>Balance</th> {/* New Balance column */}

            <th style={styles.transactionHeader}>Debit</th>
            <th style={styles.transactionHeader}>Credit</th>
            <th style={styles.transactionHeader}>From/To</th>
            <th style={styles.transactionHeader}>UTR</th>
            <th style={styles.transactionHeader}>Date</th>
          </tr>
        </thead>
        <tbody>
  {expandedRowData[doc.account_number] ? (
    expandedRowData[doc.account_number]
      .sort((a, b) => new Date(b.date) - new Date(a.date)) // Sort by date, latest first
      .reduce((acc, item, idx) => {
        // Initialize the balance for the first row (topmost row), which should be ₹5000
        let previousBalance = idx === 0 ? doc.opening_balance : acc[idx - 1].balance; // Start with 5000 as the initial balance
                // Add the updated balance along with the transaction data
        



        

        // Update balance based on debit or credit
        if (item.type === 'DEBIT') {
          previousBalance += parseFloat(item.amount); // Add back debit amount
        } else if (item.type === 'CREDIT') {
          previousBalance -= parseFloat(item.amount); // Subtract the credit amount
        }

        acc.push({
          ...item,
          balance: previousBalance,
        });

        return acc;
      }, [])
      // .reverse() // Reverse the array to display the oldest transaction at the bottom
      .map((item, idx) => (
        <tr key={idx}>
          {/* Display the balance for each transaction */}
          <td style={styles.transactionCell}>
            ₹{item.balance.toFixed(2)} {/* Balance column */}
          </td>
          <td
            style={{
              ...styles.transactionCell,
              border: item.type === 'DEBIT' ? '2px solid #ff9999' : '2px solid transparent', // Red border for debit
            }}
          >
            {item.type === 'DEBIT' ? `₹${item.amount}` : ''}
          </td>
          <td
            style={{
              ...styles.transactionCell,
              border: item.type === 'CREDIT' ? '2px solid #90ee90' : '2px solid transparent', // Green border for credit
            }}
          >
            {item.type === 'CREDIT' ? `₹${item.amount}` : ''}
          </td>
          <td style={styles.transactionCell}>{item['from/to']}</td>
          <td style={styles.transactionCell}>{item.UTR}</td>
          <td style={styles.transactionCell}>{new Date(item.date).toLocaleString()}</td>
        </tr>
      ))
  ) : (
    <tr>
      <td colSpan="6" style={styles.transactionCell}>Loading...</td>
    </tr>
  )}
</tbody>





      </table>
    </div>
  </td>
</tr>


)}

              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal for Debit/Credit Transaction */}
      {modalVisible && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h2>{transactionType} Transaction</h2>
            <p>Account Number: {selectedAccountNumber}</p>
            <form onSubmit={handleModalSubmit}>
              <div style={styles.formGroup}>
                <label style={styles.label}>FROM/TO BANK</label>
                <select
                  name="bankName"
                  value={modalFormData.bankName}
                  onChange={(e) => setModalFormData({ ...modalFormData, bankName: e.target.value })}
                  style={styles.select}
                  required
                >
                  <option value="">Select Bank</option>
                  {internalBanks.map((bank, idx) => (
                    <option key={idx} value={bank}>
                      {bank.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>




              {/* New dropdown for selecting transaction category */}
          <div style={styles.formGroup}>
            <label style={styles.label}>TRANSACTION CATEGORY</label>
            <select
              name="transactionCategory"
              value={transactionCategory}
              onChange={(e) => setTransactionCategory(e.target.value)}
              style={styles.select}
              required
            >
              <option value="">Select Category</option>
              <option value="Business">Business</option>
              <option value="Personal">Personal</option>
              <option value="Investment">Investment</option>
              {/* Add other options as necessary */}
            </select>
          </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>AMOUNT</label>
                <input
                  type="text"
                  name="amount"
                  value={modalFormData.amount}
                  onChange={(e) => setModalFormData({ ...modalFormData, amount: e.target.value })}
                  style={styles.input}
                  required
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>UPLOAD SCREENSHOT</label>
                <input
                  type="file"
                  name="screenshot"
                  accept="image/*,application/pdf"
                  onChange={(e) => setModalFormData({ ...modalFormData, screenshot: e.target.files[0] })}
                  style={styles.input}
                />
              </div>
              <div style={styles.modalActions}>
                <button type="submit" style={styles.submitButton}>
                  SUBMIT
                </button>
                <button type="button" style={styles.cancelButton} onClick={() => setModalVisible(false)}>
                  CANCEL
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Inline styles for the new expanded row functionality (add this to your styles object)
const styles = {
  balanceCell: {
    padding: '4px',
    color: '#ffffff',
    backgroundColor: '#293d56',
    textAlign: 'left',
    border: '1px solid #4c5c77',
    boxSizing: 'border-box',
    width: '80px',
  },
  creditRow: {
    backgroundColor: '#4caf50',
  },
  debitRow: {
    backgroundColor: '#ff4c4c',
  },
  transactionTable: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  transactionHeader: {
    color: '#fff',
    backgroundColor: '#4c5c77',
    padding: '6px',
    textAlign: 'left',
    fontWeight: 'bold',
    border: '1px solid #4c5c77',
    fontSize: '12px',
  },
  transactionCell: {
    padding: '4px',
    color: '#ffffff',
    backgroundColor: '#293d56',
    textAlign: 'left',
    border: '1px solid #4c5c77',
    boxSizing: 'border-box',
    width: '80px',
    whiteSpace: 'nowrap',
  },
  buttonContainer: {
    display: 'flex',
    gap: '5px',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  addBankText: {
    fontSize: '14px',
    fontWeight: 'bold',
    marginLeft: '5px',
    color: '#ffffff',
    textTransform: 'uppercase',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0e1726',
    color: '#fff',
    padding: '10px',
    borderRadius: '5px',
  },
  logoContainer: {
    display: 'flex',
    alignItems: 'center',
  },
  logo: {
    width: '50px',
    height: 'auto',
  },
  titleContainer: {
    flexGrow: 1,
    textAlign: 'center',
  },
  title: {
    fontSize: '18px',
    fontWeight: 'bold',
    margin: 0,
    textTransform: 'uppercase',
  },
  card: {
    margin: '10px',
    padding: '10px',
    width: '100%',
    background: 'linear-gradient(135deg, #89f7fe, #66a6ff)',
    borderRadius: '5px',
    boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.2)',
    textAlign: 'center',
    color: '#ffffff',
  },
  circularButton: {
    padding: '8px 12px',
    background: 'linear-gradient(135deg, #66a6ff, #fbc2eb)',
    color: '#fff',
    fontSize: '12px',
    fontWeight: 'bold',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  formContainer: {
    marginTop: '10px',
    padding: '10px',
    backgroundColor: '#1b2538',
    borderRadius: '5px',
    boxShadow: '0px 3px 8px rgba(0, 0, 0, 0.2)',
  },
  form: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '10px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
  },
  label: {
    fontSize: '12px',
    marginBottom: '5px',
    color: '#fff',
    textTransform: 'uppercase',
  },
  input: {
    padding: '6px 8px',
    borderRadius: '5px',
    border: '1px solid #4c5c77',
    backgroundColor: '#2a3b55',
    color: '#ffffff',
    fontSize: '12px',
    boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.2)',
    textTransform: 'uppercase',
  },
  select: {
    padding: '6px 8px',
    borderRadius: '5px',
    border: '1px solid #4c5c77',
    backgroundColor: '#2a3b55',
    color: '#ffffff',
    fontSize: '12px',
  },
  submitButton: {
    padding: '8px 12px',
    fontSize: '12px',
    color: '#fff',
    backgroundColor: '#ff6600',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    textTransform: 'uppercase',
  },
  tableContainer: {
    margin: '20px 10px',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    backgroundColor: '#1b2538',
  },
  tableHeaderRow: {
    backgroundColor: '#2a3b55',
  },
  tableHeader: {
    padding: '6px 8px',
    color: '#fff',
    fontSize: '12px',
    textAlign: 'left',
    borderBottom: '1px solid #4c5c77',
  },
  tableRow: {
    borderBottom: '1px solid #4c5c77',
  },
  alternateRow: {
    backgroundColor: '#293d56',
  },
  tableCell: {
    padding: '6px 8px',
    color: '#ffffff',
    fontSize: '12px',
    textAlign: 'center',
  },
  debitButton: {
    padding: '4px 8px',
    backgroundColor: '#ff4c4c',
    color: '#fff',
    borderRadius: '5px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '10px',
  },
  creditButton: {
    padding: '4px 8px',
    backgroundColor: '#4caf50',
    color: '#fff',
    borderRadius: '5px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '10px',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  modalContent: {
    backgroundColor: '#1b2538',
    padding: '10px',
    borderRadius: '5px',
    boxShadow: '0px 3px 8px rgba(0, 0, 0, 0.2)',
    width: '300px',
  },
  modalActions: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '10px',
  },
  cancelButton: {
    padding: '6px 8px',
    fontSize: '10px',
    color: '#fff',
    backgroundColor: '#f44336',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    textTransform: 'uppercase',
  },
  pdfUpload: {
    color: '#fff',
    border: 'none',
    cursor: 'pointer',
    fontSize: '10px',
  },
  expandedRow: {
    backgroundColor: '#1b2538',
    padding: '5px',
    borderBottom: '1px solid #4c5c77',
    color: '#ffffff',
    fontSize: '10px',
  },
  expandedContent: {
    maxHeight: '150px',
    overflowY: 'auto',
    padding: '5px',
    backgroundColor: '#2a3b55',
    borderRadius: '5px',
  },
  rowDetail: {
    marginBottom: '5px',
    padding: '5px',
    backgroundColor: '#293d56',
    borderRadius: '5px',
  },
};


export default Page;
