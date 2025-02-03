'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { ToastContainer, toast } from 'react-toastify';
import Modal from 'react-modal';
import 'react-toastify/dist/ReactToastify.css';

Modal.setAppElement('#root'); // Set the app root element for accessibility

function Page() {
  const [formData, setFormData] = useState({
    name: '',
    password: '', // Add password to the form data

  });

  const [admins, setAdmins] = useState([]);
  const [modalIsOpen, setModalIsOpen] = useState(false); // State to control modal visibility
  const [createdPassword, setCreatedPassword] = useState(''); // State to store the created password
  const [loading, setLoading] = useState(true); // State to manage loading
  const router = useRouter(); // Initialize the useRouter hook

  useEffect(() => {
    // Check if user is authenticated
    const auth = localStorage.getItem('isAuthenticated');
    if (!auth) {
      router.push('/'); // Redirect to login if not authenticated
    } else {
      fetchAdmins(); // Fetch admin data if authenticated
    }
  }, [router]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });
  };

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    return password;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name) {
      toast.error('All fields must be filled', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
      });
      return;
    }

    const randomPassword = generateRandomPassword();
    const formDataWithPassword = { ...formData, password: randomPassword };

    try {
      await axios.post('http://127.0.0.1:8000/api/create/', formDataWithPassword);
      toast.success('User created successfully', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
      });
      setCreatedPassword(randomPassword); // Set the created password
      setModalIsOpen(true); // Show the modal
      fetchAdmins(); // Refresh admin list after submission
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message;
      toast.error(`Error creating user: ${errorMessage}`, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
      });
    }
  };

  const fetchAdmins = async () => {
    setLoading(true); // Start loading
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/admins/');
      setAdmins(response.data);
    } catch (error) {
      console.error('Error fetching admins:', error.message);
    }
    setLoading(false); // End loading
  };

  const handleAdminClick = (password) => {
    router.push(`/${password}/details`);
  };

  const openInNewTab = (url) => {
    const newWindow = window.open(url, '_blank', 'noopener,noreferrer');
    if (newWindow) newWindow.opener = null;
    toast.info('Password opened in new tab', {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "colored",
    });
  };

  const closeModal = () => {
    setModalIsOpen(false);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(`http://localhost:3000/${createdPassword}`).then(() => {
      toast.success('Password URL copied to clipboard', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
      });
    }).catch((err) => {
      toast.error('Failed to copy password URL', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
      });
    });
  };

  return (
    <div id="root" className="min-h-screen bg-slate-800 text-white p-6 flex flex-col sm:flex-row sm:justify-center sm:space-x-6">
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
      <ToastContainer />
      <div className="flex flex-col items-center w-full sm:w-1/2">
        <div className="container p-6 bg-slate-900 text-white rounded-lg shadow-lg w-full">
          <h1 className="text-4xl font-bold mb-6 text-center sm:text-left">Create Admin</h1>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-lg font-medium mb-2" htmlFor="name">Admin Name</label>
              <input 
                type="text" 
                id="name" 
                value={formData.name}
                onChange={handleChange}
                className="w-full p-3 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none" 
                placeholder="Enter Admin name" 
              />
            </div>


          
            <button type="submit" className="w-full p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none">Submit</button>
          </form>
        </div>
      </div>
      <div className="flex flex-col items-center w-full sm:w-1/2 mt-6 sm:mt-0">
        <div className="container p-6 bg-slate-900 text-white rounded-lg shadow-lg w-full">
          <h2 className="text-3xl font-bold mb-4 text-center sm:text-left">Admin Details</h2>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="pulse-loader"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {admins.map((admin, index) => (
                <div key={index} className="p-4 bg-slate-700 text-white rounded-lg border border-slate-600">
                  <p><strong>Name:</strong> {admin.name}</p>
                  <p><strong>UPI:</strong> {admin.UPI}</p>
                  <p><strong>Name on UPI:</strong> {admin.nameonupi}</p>
                  <p><strong>Link:</strong> <a href={`http://localhost:3000/${admin.password}`} target="_blank" rel="noopener noreferrer">http://localhost:3000/{admin.password}</a></p>
                  <button 
                    className="mt-4 p-3 bg-green-500 text-white rounded-lg hover:bg-green-600 focus:outline-none"
                    onClick={() => handleAdminClick(admin.password)}
                  >
                    Admin Details
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Created Password"
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 p-6 bg-slate-900 text-white rounded-lg shadow-lg w-full sm:w-1/2"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50"
      >
        <h2 className="text-3xl font-bold mb-4 text-center sm:text-left">Created Password</h2>
        <div className="relative w-full">
          <input
            type="text"
            value={`http://localhost:3000/${createdPassword}`}
            readOnly
            className="w-full p-3 bg-slate-700 text-white rounded-lg border border-slate-600 focus:outline-none"
          />
          <button
            type="button"
            onClick={() => openInNewTab(createdPassword)}
            className="absolute inset-y-0 right-0 px-3 flex items-center text-sm leading-5 text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            Open
          </button>
        </div>
        <button
          type="button"
          onClick={copyToClipboard}
          className="mt-4 w-full p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none"
        >
          Copy to Clipboard
        </button>
      </Modal>
    </div>
  );
}

export default Page;
