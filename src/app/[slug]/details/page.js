'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function DynamicPage({ params }) {
  const { slug } = params;
  const [adminDetails, setAdminDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bankDetailsList, setBankDetailsList] = useState([]); // State to store bank details
  const [idDetailsList, setIdDetailsList] = useState([]); // State to store ID details
  const [showBankForm, setShowBankForm] = useState(false);
  const [showIdForm, setShowIdForm] = useState(false);
  const [bankDetails, setBankDetails] = useState({
    holderName: '',
    ifsc: '',
    accountNumber: '',
    openingBalance: '', // New field for Opening Balance
    nameonupi: '', // New field for Opening Balance
    upi: '', // New field for Opening Balance
    



  });
  const [idDetails, setIdDetails] = useState({
    idName: '',
    points: ''
  });
  const router = useRouter(); // Initialize the useRouter hook

  useEffect(() => {
    // Check if user is authenticated
    const auth = localStorage.getItem('isAuthenticated');
    if (!auth) {
      router.push('/'); // Redirect to login if not authenticated
    } else {
      fetchAdminDetails(); // Fetch admin data if authenticated
    }
  }, [router]);

  const attachBankDetailsToCompany = async (bank) => {
    const payload = {
      admin_name: adminDetails.name,  // Use correct field
      bno: bank.account_number,  // Correctly map fields from bank object
      bname: bank.bank_holder_name,
      ifsc: bank.ifsc,
      nameonupi: bank.nameonupi,
      upi: bank.UPI,

    };
  
    try {
      const response = await fetch('http://127.0.0.1:8000/api/update_company_bank/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
  
      if (!response.ok) throw new Error('Failed to update company bank details');
      const result = await response.json();
      toast.success(result.message);
      // window.location.reload();
      fetchBankDetails(adminDetails.name);  // Refresh the bank table data




    } catch (error) {
      toast.error('Error: ' + error.message);
    }
  };
  

  const fetchAdminDetails = async () => {
    try {
      const response = await axios.get(`http://127.0.0.1:8000/api/check/${slug}`);
      setAdminDetails(response.data);
      fetchBankDetails(response.data.name); // Fetch bank details using admin name
      fetchIdDetails(response.data.name); // Fetch ID details using admin name
    } catch (error) {
      console.error('Error fetching admin details:', error.message);
      toast.error('Error fetching admin details');
    } finally {
      setLoading(false);
    }
  };

  // Fetch Bank details using adminDetails.name
  const fetchBankDetails = async (adminName) => {
    try {
      const response = await axios.get(`http://127.0.0.1:8000/api/get_bank_details/${adminName}`);
      setBankDetailsList(response.data.banks || []);  // Set the bank details
      console.log(response.data)
    } catch (error) {
      console.error('Error fetching bank details:', error.message);
      toast.error('Error fetching bank details');
    }
  };

  // Fetch ID details using adminDetails.name
  const fetchIdDetails = async (adminName) => {
    try {
      const response = await axios.get(`http://127.0.0.1:8000/api/get_id_details/${adminName}`);
      setIdDetailsList(response.data.ids || []);  // Set the ID details
    } catch (error) {
      console.error('Error fetching ID details:', error.message);
      toast.error('Error fetching ID details');
    }
  };

  const handleAddBankClick = () => {
    setShowBankForm(true); // Show the bank form when Add Bank button is clicked
  };

  const handleAddIdClick = () => {
    setShowIdForm(true); // Show the ID form when Add ID button is clicked
  };

  const handleBankFormClose = () => {
    setShowBankForm(false); // Close the bank form
  };

  const handleIdFormClose = () => {
    setShowIdForm(false); // Close the ID form
  };

  const handleBankDetailsChange = (e) => {
    const { name, value } = e.target;
    console.log(name);
    console.log(value)
    setBankDetails({ ...bankDetails, [name]: value });
  };

  const handleIdDetailsChange = (e) => {
    const { name, value } = e.target;
    setIdDetails({ ...idDetails, [name]: value });
  };

  // Submit Bank Details
  const handleBankDetailsSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      admin_name: adminDetails.name,
      holderName: bankDetails.holderName,
      ifsc: bankDetails.ifsc,
      accountNumber: bankDetails.accountNumber,
      openingBalance: parseFloat(bankDetails.openingBalance), // Add opening balance and convert to float
      nameonupi: bankDetails.nameonupi, // Include UPI in the payload
      upi: bankDetails.upi, // Include UPI in the payload



    };

    try {
      console.log("heris")
      const response = await fetch('http://127.0.0.1:8000/api/submit_bank_details/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Failed to submit bank details');
      }

      const result = await response.json();
      toast.success(result.message);
      setShowBankForm(false); // Close form after success
      fetchBankDetails(adminDetails.name); // Refresh the bank details list after submission
    } catch (error) {
      toast.error('Error: ' + error.message);
    }
  };

  // Submit ID Details
  const handleIdDetailsSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      admin_name: adminDetails.name,
      idName: idDetails.idName,
      points: parseInt(idDetails.points, 10), // Parse points to integer
    };

    try {
      const response = await fetch('http://127.0.0.1:8000/api/submit_id_details/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Failed to submit ID details');
      }

      const result = await response.json();
      toast.success(result.message);
      setShowIdForm(false); // Close form after success
      fetchIdDetails(adminDetails.name); // Refresh the ID details list after submission
    } catch (error) {
      toast.error('Error: ' + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-800 text-white p-6 flex flex-col items-center">
      <style jsx>{`
        .pulse-loader {
          width: 40px;
          height: 40px;
          margin: 100px auto;
          border-radius: 50%;
          background: linear-gradient(90deg, rgba(34, 193, 195, 1) 0%, rgba(253, 187, 45, 1) 100%);
          animation: pulse 1.5s infinite;
        }

        .cards-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 20px;
          width: 100%;
        }

        @media(min-width: 768px) {
          .cards-container {
            flex-direction: row;
            justify-content: center;
          }
        }

        .card {
          background: linear-gradient(135deg, #FF69B4 0%, #4169E1 100%);
          border-radius: 15px;
          padding: 20px;
          width: 100%;
          max-width: 400px;
          margin: 20px;
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
          text-align: center;
        }

        .card-title {
          font-size: 1.5rem;
          font-weight: bold;
          margin-bottom: 10px;
        }

        .add-button {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          background-color: #007bff;
          color: white;
          font-size: 1.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-top: 15px;
          cursor: pointer;
          transition: transform 0.2s;
        }

        .add-button:hover {
          transform: scale(1.1);
        }

        table {
          width: 100%;
          margin-top: 20px;
          border-collapse: collapse;
        }

        table, th, td {
          border: 1px solid #ddd;
        }

        th, td {
          padding: 8px;
          text-align: left;
        }

        th {
          background-color: #4CAF50;
          color: white;
        }
            .tables-container {
    display: flex;
    flex-direction: column;
    width: 100%;
  }
      .table-wrapper {
    flex: 1;
    margin: 10px;
  }
      @media(min-width: 768px) {
    .tables-container {
      flex-direction: row;
      justify-content: space-between;
    }
  }

  table {
    width: 100%;
    margin-top: 20px;
    border-collapse: collapse;
  }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(0, 0, 0, 0.5); 
          backdrop-filter: blur(10px); 
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }

        .modal-content {
    background-color: #2D3A50;
    padding: 40px;
    border-radius: 15px;
    max-width: 400px; /* Set a maximum width */
    width: 100%; /* Ensure full width responsiveness */
    height: auto; /* Adjust height based on content */
    color: #E0E0E0;
    text-align: center;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.37);
  }

        .modal-header {
          font-size: 1.5rem;
          margin-bottom: 20px;
          color: #F0F0F0;
        }

        .modal-close {
          position: absolute;
          top: 10px;
          right: 10px;
          font-size: 1.5rem;
          cursor: pointer;
          color: #FFD700;
        }

        .form-input {
          width: 100%;
          padding: 10px;
          margin-bottom: 15px;
          border-radius: 5px;
          border: 1px solid #ccc;
          background-color: rgba(59, 59, 59, 0.8);
          color: #E0E0E0;
        }

        .form-submit {
          background-color: #007bff;
          color: white;
          padding: 10px 20px;
          border: none;
          border-radius: 5px;
          cursor: pointer;
        }

        .form-submit:hover {
          background-color: #0056b3;
        }
      `}</style>

      <ToastContainer />
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="pulse-loader"></div>
        </div>
      ) : adminDetails ? (
        <>
<header className="w-full flex justify-center items-center p-4 bg-slate-900">
  <img src="/mansoor.png" alt="Mansoor Logo" className="h-32" />
</header>

{adminDetails && (
  <h1 className="text-3xl font-bold text-white mt-4">
    {adminDetails.name} {/* Display admin name below the header */}
  </h1>
)}



          <div className="cards-container">
            <div className="card">
              <div className="card-title">Add Bank</div>
              <div className="add-button" onClick={handleAddBankClick}>+</div>
            </div>

            <div className="card">
              <div className="card-title">Add ID</div>
              <div className="add-button" onClick={handleAddIdClick}>+</div>
            </div>
          </div>

{/* Container for both tables */}
<div className="tables-container">
  {/* Bank Details Table */}
  <div className="table-wrapper">
    <h2 className="text-center mt-8 mb-4 text-2xl">Bank Details</h2>
    <table>
      <thead>
        <tr>
          <th>Holder Name</th>
          <th>IFSC</th>
          <th>Account Number</th>
          <th>Opening Balance</th> {/* New column for opening balance */}
          <th>Name On UPI</th> {/* New column for the attach button */}

          <th>UPI</th> {/* New column for the attach button */}


          <th>Action</th> {/* New column for the attach button */}
        </tr>
      </thead>
      <tbody>
  {bankDetailsList.length > 0 ? (
    bankDetailsList.map((bank, index) => (
      <tr key={index}>
        <td>{bank.bank_holder_name}</td>
        <td>{bank.ifsc}</td>
        <td>{bank.account_number}</td>
        <td>{bank.opening_balance}</td>
        <td>{bank.nameonupi}</td>
        <td>{bank.UPI}</td>

        <td>
          {console.log(bank.attached)}
          {bank.attached === 1 ? (



            <div className="flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-green-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {console.log("bice one biradar")}
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c.83 0 1.5.67 1.5 1.5S12.83 11 12 11s-1.5-.67-1.5-1.5S11.17 8 12 8zm-1 3h2v5h-2v-5z"
                />
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                <path d="M12 16l-4-4h8z" fill="currentColor" />
              </svg>
              <span className="ml-2 text-green-500 font-semibold">Attached</span>
            </div>
          ) : (
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded"
              onClick={() => attachBankDetailsToCompany(bank)}
            >
              Attach
            </button>
          )}
        </td>
      </tr>
    ))
  ) : (
    <tr>
      <td colSpan="4">No bank details available</td>
    </tr>
  )}
</tbody>

    </table>
  </div>

  {/* ID Details Table */}
  <div className="table-wrapper">
    <h2 className="text-center mt-8 mb-4 text-2xl">ID Details</h2>
    <table>
      <thead>
        <tr>
          <th>ID Name</th>
          <th>Points</th>
        </tr>
      </thead>
      <tbody>
        {idDetailsList.length > 0 ? (
          idDetailsList.map((id, index) => (
            <tr key={index}>
              <td>{id.id_name}</td>
              <td>{id.points}</td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan="2">No ID details available</td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
</div>

          {/* Add Bank Form Modal */}
          {showBankForm && (
            <div className="modal-overlay">
              <div className="modal-content">
                <div className="modal-header">Add Bank Details</div>
                <span className="modal-close" onClick={handleBankFormClose}>×</span>
                <form onSubmit={handleBankDetailsSubmit}>
                  <input
                    type="text"
                    name="holderName"
                    placeholder="Bank Holder Name"
                    className="form-input"
                    value={bankDetails.holderName}
                    onChange={handleBankDetailsChange}
                  />
                  <input
                    type="text"
                    name="ifsc"
                    placeholder="IFSC Code"
                    className="form-input"
                    value={bankDetails.ifsc}
                    onChange={handleBankDetailsChange}
                  />
                  <input
                    type="text"
                    name="accountNumber"
                    placeholder="Account Number"
                    className="form-input"
                    value={bankDetails.accountNumber}
                    onChange={handleBankDetailsChange}
                  />
                  <input
                    type="text"
                    name="nameonupi"
                    placeholder="Name On UPI"
                    className="form-input"
                    value={bankDetails.nameonupi}
                    onChange={handleBankDetailsChange}
                  />
                  <input
                    type="text"
                    name="upi"
                    placeholder="UPI"
                    className="form-input"
                    value={bankDetails.upi}
                    onChange={handleBankDetailsChange}
                  />

<input
  type="number"
  name="openingBalance"
  placeholder="Opening Balance"
  className="form-input"
  value={bankDetails.openingBalance}
  onChange={handleBankDetailsChange}
/>

                  <button type="submit" className="form-submit">Submit</button>
                </form>
              </div>
            </div>
          )}

          {/* Add ID Form Modal */}
          {showIdForm && (
            <div className="modal-overlay">
              <div className="modal-content">
                <div className="modal-header">Add ID Details</div>
                <span className="modal-close" onClick={handleIdFormClose}>×</span>
                <form onSubmit={handleIdDetailsSubmit}>
                  <input
                    type="text"
                    name="idName"
                    placeholder="ID Name"
                    className="form-input"
                    value={idDetails.idName}
                    onChange={handleIdDetailsChange}
                  />
                  <input
                    type="number"
                    name="points"
                    placeholder="Points (Integer Only)"
                    className="form-input"
                    value={idDetails.points}
                    onChange={handleIdDetailsChange}
                  />
                  <button type="submit" className="form-submit">Submit</button>
                </form>
              </div>
            </div>
          )}
        </>
      ) : (
        <div>No user found</div>
      )}
    </div>
  );
}

export default DynamicPage;
