'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { ToastContainer, toast } from 'react-toastify';
import QRCode from 'qrcode.react';
import 'react-toastify/dist/ReactToastify.css';

function DynamicPage({ params }) {
  const { slug } = params;
  const [adminDetails, setAdminDetails] = useState(null);
  const [idDetailsList, setIdDetailsList] = useState([]); // State for storing ID names
  const [selectedId, setSelectedId] = useState(''); // State for the selected ID
  const [loading, setLoading] = useState(true);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [qrGenerated, setQrGenerated] = useState(false);
  const [paymentScreenshot, setPaymentScreenshot] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState('pending');
  const [documentId, setDocumentId] = useState(null);
  const [dbName, setDbName] = useState(null);
  const [collectionName, setCollectionName] = useState(null);
  const router = useRouter(); // Initialize the useRouter hook
  const [typeOptions, setTypeOptions] = useState([]); // New state for the dropdown options

  useEffect(() => {
    // Check if user is authenticated
    const auth = localStorage.getItem('isAuthenticated');
    if (!auth) {
      router.push('/'); // Redirect to login if not authenticated
    } else {
      fetchAdminDetails(); // Fetch admin data if authenticated
    }
  }, [router, slug]);

  useEffect(() => {
    fetchTypeOptions();  // Fetch the options on component load
  }, []);

  const fetchTypeOptions = async () => {
    try {
      const response = await axios.get(`http://127.0.0.1:8000/api/get_type_options/${slug}`);
      setTypeOptions(response.data.types);  // Update state with the fetched options
    } catch (error) {
      console.error('Error fetching type options:', error);
      toast.error('Error loading type options');
    }
  };

  const fetchAdminDetails = async () => {
    try {
      const response = await axios.get(`http://127.0.0.1:8000/api/check/${slug}`);
      setAdminDetails(response.data);
    } catch (error) {
      console.error('Error fetching admin details:', error.message);
      toast.error('Error fetching admin details');
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneNumberChange = (e) => {
    setPhoneNumber(e.target.value);
  };

  const handleAmountChange = (e) => {
    setAmount(e.target.value);
  };

  const handlePayNow = () => {
    if (phoneNumber && amount && selectedId) {
      setQrGenerated(true); // Generate QR only if all fields are filled
    } else {
      toast.error('Please fill in all fields');
    }
  };

  const handleScreenshotChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPaymentScreenshot(file);
  };

  const handleSubmitNow = async () => {
    if (!paymentScreenshot) {
      toast.error('Please upload a payment screenshot');
      return;
    }

    setSubmitting(true);

    const toBase64 = (file) => new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });

    const base64Screenshot = await toBase64(paymentScreenshot);

    const formData = new FormData();
    formData.append('phone_number', phoneNumber);
    formData.append('amount', amount);
    formData.append('type', selectedId); // Include the selected type
    formData.append('screenshot', base64Screenshot);
    formData.append('db_name', adminDetails.name);
    formData.append('bno', adminDetails.bno);


    try {
      const response = await axios.post('http://127.0.0.1:8000/api/submit_payment/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      toast.success('Payment submitted successfully');
      setDocumentId(response.data.document_id);
      setDbName(response.data.db_name);
      setCollectionName(response.data.collection_name);
      checkPaymentStatus(response.data.db_name, response.data.collection_name, response.data.document_id); // Start polling for payment status
    } catch (error) {
      toast.error('Error submitting payment: ' + error.message);
      setSubmitting(false);
    }
  };

  const checkPaymentStatus = async (dbName, collectionName, docId) => {
    try {
      const response = await axios.get(`http://127.0.0.1:8000/api/check_payment_status/${dbName}/${collectionName}/${docId}`);
      const status = response.data.status;
      if (status === 'submit') {
        setPaymentStatus('submit');
        setSubmitting(false);
      } else if (status === 'failed') {
        setPaymentStatus('failed');
        setSubmitting(false);
      } else {
        setTimeout(() => checkPaymentStatus(dbName, collectionName, docId), 3000); // Poll every 3 seconds
      }
    } catch (error) {
      toast.error('Error checking payment status: ' + error.message);
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <style jsx>{`
          @keyframes pulse {
            0% {
              transform: scale(0.95);
              box-shadow: 0 0 0 0 rgba(34, 193, 195, 0.7);
            }
            70% {
              transform: scale(1);
              box-shadow: 0 0 0 10px rgba(34, 193, 195, 0);
            }
            100% {
              transform: scale(0.95);
              box-shadow: 0 0 0 0 rgba(34, 193, 195, 0);
            }
          }

          .pulse-loader {
            width: 40px;
            height: 40px;
            margin: 100px auto;
            border-radius: 50%;
            background: linear-gradient(90deg, rgba(34, 193, 195, 1) 0%, rgba(253, 187, 45, 1) 100%);
            animation: pulse 1.5s infinite;
          }
        `}</style>
        <div className="pulse-loader"></div>
      </div>
    );
  }

  if (!adminDetails) {
    return <div>No user found</div>;
  }

  const upiLink = `upi://pay?pa=${adminDetails.UPI}&pn=${adminDetails.nameonupi}&am=${amount}`;

  if (paymentStatus === 'submit') {
    return (
      <div className="min-h-screen bg-slate-800 text-white p-6 flex flex-col items-center">
        <ToastContainer />
        <header className="w-full flex justify-center items-center p-4 bg-slate-900">
          <img src="/mansoor.png" alt="Mansoor Logo" className="h-32" />
        </header>
        <div className="container p-6 bg-slate-900 text-white rounded-lg shadow-lg w-full mt-6">
          <h2 className="text-3xl font-bold mb-4 text-center">Payment Successful</h2>
          <p className="text-xl text-center">Thank you for your payment!</p>
        </div>
      </div>
    );
  }

  if (paymentStatus === 'failed') {
    return (
      <div className="min-h-screen bg-slate-800 text-white p-6 flex flex-col items-center">
        <ToastContainer />
        <header className="w-full flex justify-center items-center p-4 bg-slate-900">
          <img src="/mansoor.png" alt="Mansoor Logo" className="h-32" />
        </header>
        <div className="container p-6 bg-slate-900 text-white rounded-lg shadow-lg w-full mt-6">
          <h2 className="text-3xl font-bold mb-4 text-center">Payment Failed</h2>
          <p className="text-xl text-center">There was an issue with your payment. Please try again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-800 text-white p-6 flex flex-col items-center relative">
      <ToastContainer />
      <header className="w-full flex justify-center items-center p-4 bg-slate-900">
        <img src="/mansoor.png" alt="Mansoor Logo" className="h-32" />
      </header>
      <div className={`container p-6 bg-slate-900 text-white rounded-lg shadow-lg w-full mt-6 ${submitting ? 'blur' : ''}`}>
        <h2 className="text-3xl font-bold mb-4 text-center">Enter Details</h2>
        <form className="space-y-6">
          <div>
            <label className="block text-lg font-medium mb-2" htmlFor="phoneNumber">Phone Number</label>
            <input 
              type="text" 
              id="phoneNumber" 
              value={phoneNumber}
              onChange={handlePhoneNumberChange}
              disabled={qrGenerated}  // Disable when QR is generated
              className="w-full p-3 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none" 
              placeholder="Enter Phone Number" 
            />
          </div>
          <div>
            <label className="block text-lg font-medium mb-2" htmlFor="amount">Amount</label>
            <input 
              type="text" 
              id="amount" 
              value={amount}
              onChange={handleAmountChange}
              disabled={qrGenerated}  // Disable when QR is generated
              className="w-full p-3 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none" 
              placeholder="Enter Amount" 
            />
          </div>
          <div className="container p-6 bg-slate-900 text-white rounded-lg shadow-lg w-full mt-6">
            <label className="block text-lg font-medium mb-2" htmlFor="type">Type</label>
            <select
              id="typeDropdown"
              onChange={(e) => setSelectedId(e.target.value)}
              value={selectedId}
              disabled={qrGenerated}  // Disable when QR is generated
              className="w-full mt-3 p-3 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none"
            >
              <option value="">Select Type</option>
              {typeOptions.map((option, index) => (
                <option key={index} value={option}>
                  {option.toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          {!qrGenerated && (
            <button type="button" onClick={handlePayNow} className="w-full p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none">Pay Now</button>
          )}
        </form>
        {qrGenerated && (
          <div className="mt-6 flex flex-col items-center">
            <QRCode value={upiLink} size={256} bgColor={"#111827"} fgColor={"#ffffff"} />
            <div className="mt-6 text-center">
              <p className="text-lg font-medium text-white">Account Number: {adminDetails.bno}</p>
              <p className="text-lg font-medium text-white">IFSC: {adminDetails.ifsc}</p>
              <p className="text-lg font-medium text-white">Bank Holder Name: {adminDetails.bname}</p>
            </div>
            <div className="mt-6 w-full">
              <label className="block text-lg font-medium mb-2 text-center" htmlFor="paymentScreenshot">Upload Payment Screenshot</label>
              <input 
                type="file" 
                id="paymentScreenshot" 
                onChange={handleScreenshotChange}
                className="w-full p-3 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <button 
              onClick={handleSubmitNow} 
              className={`mt-6 p-3 ${submitting ? 'bg-gray-500' : 'bg-green-500'} text-white rounded-lg hover:bg-green-600 focus:outline-none`}
              disabled={submitting}
            >
              {submitting ? 'Submitting...' : 'Submit Now'}
            </button>
          </div>
        )}
      </div>
      {submitting && (
        <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50">
          <div className="loader"></div>
        </div>
      )}
      <style jsx>{`
        .blur {
          filter: blur(4px);
        }
        .loader {
          border: 16px solid #f3f3f3;
          border-radius: 50%;
          border-top: 16px solid #3498db;
          width: 120px;
          height: 120px;
          animation: spin 2s linear infinite;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default DynamicPage;
