"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { PulseLoader } from 'react-spinners';

export default function Home() {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState("All Pending Transactions List");
  const [pendingTransactions, setPendingTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter(); // Initialize the useRouter hook

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    // Check if user is authenticated
    const auth = localStorage.getItem('isAuthenticated');
    if (!auth) {
      router.push('/'); // Redirect to login if not authenticated
    } else {
      fetchPendingTransactions(); // Fetch pending transactions if authenticated
    }
  }, [router]);

  useEffect(() => {
    if (selected === "All Pending Transactions List") {
      fetchPendingTransactions();
    }
  }, [selected]);

  const fetchPendingTransactions = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:8000/api/pending_transactions/');
      console.log(response.data);
      setPendingTransactions(response.data);
    } catch (error) {
      console.error('Error fetching pending transactions:', error.message);
      toast.error('Error fetching pending transactions');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (database, collection, transactionId, amount, status,bno,utr) => {
    try {
      const formData = new FormData();
      formData.append('database', database);
      formData.append('collection', collection);
      formData.append('transactionId', transactionId);
      formData.append('status', status);
      formData.append('amount', amount);
      formData.append('bno', bno);
      formData.append('utr', utr);



      await axios.post('http://localhost:8000/api/update_status/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      toast.success(`Transaction ${status} successfully`, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
      });
      fetchPendingTransactions(); // Refresh the transaction list
    } catch (error) {
      console.error(`Error updating transaction to ${status}:`, error.message);
      toast.error(`Error updating transaction to ${status}`);
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-900 text-white">
      <aside className={`fixed top-0 left-0 h-full bg-gray-800 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out z-50 w-64`}>
        <div className="p-4 space-y-4">
          <button
            onClick={toggleMenu}
            className="text-right w-full text-white focus:outline-none"
          >
            ✕
          </button>
          <h1 className="text-3xl font-bold mb-6 text-center">Navigation</h1>
          <nav className="flex flex-col space-y-2">
            <button 
              onClick={() => setSelected("All Pending Transactions List")}
              className={`p-3 rounded-lg ${selected === "All Pending Transactions List" ? 'bg-blue-500' : 'bg-gray-700'} hover:bg-blue-600`}
            >
              All Pending Transactions List
            </button>
            <button 
              onClick={() => setSelected("Admin Wise Transactions List")}
              className={`p-3 rounded-lg ${selected === "Admin Wise Transactions List" ? 'bg-blue-500' : 'bg-gray-700'} hover:bg-blue-600`}
            >
              Admin Wise Transactions List
            </button>
            <button 
              onClick={() => setSelected("__blank")}
              className={`p-3 rounded-lg ${selected === "__blank" ? 'bg-blue-500' : 'bg-gray-700'} hover:bg-blue-600`}
            >
              __blank
            </button>
          </nav>
        </div>
      </aside>
      <main className="flex-grow p-8">
        <header className="flex justify-between items-center p-4 bg-gray-800 mb-8">
          <button
            onClick={toggleMenu}
            className="text-white focus:outline-none"
          >
            ☰
          </button>
          <img src="/mansoor.png" alt="Mansoor Logo" className="h-32" />
        </header>
        <div>
          <h2 className="text-4xl font-bold mb-4">{selected}</h2>
          {loading ? (
            <>
              <p>Loading...</p>
              <div className="flex justify-center items-center">
                <PulseLoader size={15} color={"#4fa94d"} loading={loading} />
              </div>
            </>
          ) : (
            <div className="space-y-4">
              {selected === "All Pending Transactions List" && pendingTransactions.map((item, index) => (
                
                <div key={index} className="p-4 bg-gray-700 rounded-lg shadow-lg">
                  {console.log('Funnrepublic')}

                  {/* {console.log(pendingTransactions.transactions)} */}
                  <h3 className="text-2xl font-bold">{item.database} - {item.collection}</h3>
                  <div className="space-y-2">
                    {item.transactions.map((transaction, tIndex) => (
                      <div key={tIndex} className="p-2 bg-gray-600 rounded-md">
                        {Object.entries(transaction).map(([key, value]) => (
                          <p key={key}><strong>{key}:</strong> {value}</p>
                        ))}
                        <div className="flex justify-end space-x-2">
                          {console.log(transaction)}
                          <button 
                            onClick={() => handleUpdateStatus(item.database, item.collection, transaction._id, transaction.amount, 'submit',transaction.bno,transaction.utr)}
                            className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 focus:outline-none"
                          >
                            Submit
                          </button>
                          <button 
                            onClick={() => handleUpdateStatus(item.database, item.collection, transaction._id, transaction.amount, 'failed')}
                            className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 focus:outline-none"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <ToastContainer />
    </div>
  );
}
