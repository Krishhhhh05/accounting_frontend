"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function AdminDashPage() {
    const [documents, setDocuments] = useState([]);
    const [filteredDocuments, setFilteredDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [balance, setBalance] = useState(0);
    const [totalAmount, setTotalAmount] = useState(0);
    const [username, setUsername] = useState("");
    const [phoneFilter, setPhoneFilter] = useState('');
    const [amountFilter, setAmountFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [amountRangeFilter, setAmountRangeFilter] = useState([0, 100000]);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const router = useRouter();

    useEffect(() => {
        if (typeof window !== "undefined") {
            const storedUsername = localStorage.getItem("username");
            if (storedUsername) {
                setUsername(storedUsername);
            }
        }
    }, []);

    useEffect(() => {
        if (username) {
            const auth = localStorage.getItem("isAdminAuthenticated");
            if (!auth) {
                router.push("/adl");
            } else {
                fetchDocuments();
                fetchBalance();
            }
        }
    }, [username, router]);

    useEffect(() => {
        applyFilters();
    }, [phoneFilter, amountFilter, statusFilter, amountRangeFilter, startDate, endDate]);

    const fetchDocuments = async () => {
        setLoading(true);
        try {
            const response = await axios.get(
                `http://127.0.0.1:8000/api/documents/${username}`
            );
            const groupedDocuments = response.data.documents.reduce((acc, doc) => {
                acc.push(doc);
                return acc;
            }, []);

            groupedDocuments.sort((a, b) => new Date(b.date_time) - new Date(a.date_time));

            setDocuments(groupedDocuments);
            setFilteredDocuments(groupedDocuments);
            calculateTotalAmount(groupedDocuments); // Calculate total for all transactions on load
        } catch (error) {
            console.error("Error fetching documents:", error.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchBalance = async () => {
        try {
            const response = await axios.get(
                `http://127.0.0.1:8000/api/balance/${username}`
            );
            setBalance(response.data.balance);
        } catch (error) {
            console.error("Error fetching balance:", error.message);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("isAdminAuthenticated");
        localStorage.removeItem("username");
        router.push("/adl");
    };
    const handleCheckboxToggle = async (doc) => {
        try {
          // Ensure bonus value is not empty
          if (doc.bonus === undefined || doc.bonus === '') {
            alert('Bonus value cannot be empty.');
            return;
          }
      
          // Determine the new id value (toggle between 0 and 1)
          const newIdValue = doc.id === 1 ? 0 : 1;
      
          // Prepare the data to send to the backend, including the bonus value
          const payload = {
            database: username, // Assuming the database name is the username
            collection: doc.collection_name, // The collection name is the phone number
            document_id: doc._id,
            id: newIdValue,
            bonus: doc.bonus, // Include the current bonus value
          };
      
          // Make the POST request to update_id_field endpoint
          const response = await axios.post(
            'http://127.0.0.1:8000/api/update_id_field/',
            payload
          );
      
          // Update the state only if the API call was successful
          if (response.status === 200) {
            // Update the documents state
            const updatedDocuments = documents.map((document) => {
              if (document._id === doc._id) {
                return {
                  ...document,
                  id: newIdValue, // Update the id value
                };
              }
              return document;
            });
      
            setDocuments(updatedDocuments);
            setFilteredDocuments(updatedDocuments);
          } else {
            console.error('Failed to update id and bonus fields:', response.data.error);
            alert(`Error: ${response.data.error}`);
          }
        } catch (error) {
          console.error('Error updating id and bonus fields:', error.message);
          alert(`Error: ${error.message}`);
        }
      };
      
    
    

    const getStatusClass = (status) => {
        switch (status) {
            case "submit":
                return "document-submit";
            case "failed":
                return "document-failed";
            case "pending":
                return "document-pending";
            default:
                return "";
        }
    };

    const handleBonusChange = (doc, newBonusValue) => {
        // Update the documents state
        const updatedDocuments = documents.map((document) => {
            if (document._id === doc._id) {
                return {
                    ...document,
                    bonus: newBonusValue,
                };
            }
            return document;
        });
        setDocuments(updatedDocuments);
        setFilteredDocuments(updatedDocuments);
    };
    

    const applyFilters = () => {
        let filtered = documents;

        if (phoneFilter) {
            filtered = filtered.filter((doc) =>
                doc.collection_name.includes(phoneFilter)
            );
        }

        if (amountFilter) {
            filtered = filtered.filter(
                (doc) => parseFloat(doc.amount) === parseFloat(amountFilter)
            );
        }

        if (statusFilter) {
            filtered = filtered.filter((doc) => doc.status === statusFilter);
        }

        filtered = filtered.filter(
            (doc) =>
                parseFloat(doc.amount) >= amountRangeFilter[0] &&
                parseFloat(doc.amount) <= amountRangeFilter[1]
        );

        if (startDate && endDate) {
            const start = new Date(startDate).setHours(0, 0, 0, 0);
            const end = new Date(endDate).setHours(23, 59, 59, 999);
            filtered = filtered.filter((doc) => {
                const docDate = new Date(doc.date_time).getTime();
                return docDate >= start && docDate <= end;
            });
        }

        setFilteredDocuments(filtered);
        calculateTotalAmount(filtered); // Recalculate the total amount for filtered documents
    };

    const calculateTotalAmount = (docs) => {
        const total = docs.reduce((sum, doc) => sum + (parseFloat(doc.amount) || 0), 0);
        setTotalAmount(total);
    };

    return (
        <>
            <style jsx>{`
                .header {
                    background: #2d3748;
                    padding: 10px;
                    border-radius: 8px;
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .header img {
                    height: 48px;
                    width: 48px;
                    object-fit: contain;
                }
                .header ul {
                    display: flex;
                    list-style: none;
                    padding: 0;
                    margin: 0;
                }
                .header li {
                    margin-left: 10px;
                }
                .header a {
                    color: #ffffff;
                    text-decoration: none;
                    font-size: 14px;
                }
                .balance-block {
                    background: linear-gradient(45deg, #3b4371, #1e293b);
                    padding: 5px 10px;
                    border-radius: 8px;
                    color: #ffffff;
                    font-size: 14px;
                }
                .container {
                   width: 100%;
                    padding: 0;
                    background-color: #1e293b;
                    border-radius: 8px;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                }
                .main-content {
                    padding: 10px;
                    background: #2d3748;
                    border-radius: 8px;
                    color: #e2e8f0;
                }
                .logout-button {
                    background: linear-gradient(45deg, #ff6b6b, #f94d6a);
                    color: white;
                    padding: 8px 16px;
                    border: none;
                    border-radius: 50px;
                    font-size: 14px;
                    cursor: pointer;
                    box-shadow: 0 4px 15px rgba(255, 107, 107, 0.4);
                }
                .logout-button:hover {
                    background: linear-gradient(45deg, #f94d6a, #ff6b6b);
                }
                .documents-table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 10px;
                    color: #e2e8f0;
                }
                .documents-table th, .documents-table td {
                    padding: 10px;
                    text-align: left;
                    border-bottom: 1px solid #cbd5e0;
                }
                .documents-table th {
                    background-color: #3b4371;
                    color: #ffffff;
                    font-size: 14px;
                }
                .documents-table tr:nth-child(even) {
                    background-color: #2d3748;
                }
                .documents-table tr:nth-child(odd) {
                    background-color: #3b4371;
                }
                .document-submit {
                    background: linear-gradient(135deg, #4caf50, #66bb6a);
                    color: white;
                }
                .document-failed {
                    background: linear-gradient(135deg, #e53935, #ef5350);
                    color: white;
                }
                .document-pending {
                    background: linear-gradient(135deg, #ab47bc, #ba68c8);
                    color: white;
                }
                .checkbox-container input {
                    width: 16px;
                    height: 16px;
                    background-color: transparent;
                    border: 2px solid #ffffff;
                    border-radius: 50%;
                    cursor: pointer;
                }
                .checkbox-container input:checked {
                    background-color: #ffffff;
                }
                .filter-container {
                    display: flex;
                    flex-direction: column;
                    margin-bottom: 20px;
                }
                .filter-label {
                    margin-right: 10px;
                    font-size: 14px;
                    color: #cbd5e0;
                }
                .filter-input,
                .filter-dropdown {
                    padding: 8px;
                    margin: 5px 0;
                    border-radius: 5px;
                    border: 1px solid #cbd5e0;
                    background-color: #1e293b;
                    color: #cbd5e0;
                }
                .filter-range {
                    display: flex;
                    gap: 10px;
                }
                .filter-section {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 20px;
                    justify-content: space-between;
                }
                .total-amount {
                    margin-top: 20px;
                    font-size: 16px;
                    font-weight: bold;
                    color: #ffffff;
                }
            `}</style>
            <div className="container">
                <header className="header">
                    <img src="/mansoor.png" alt="Mansoor Logo" />
                    {/* <ul>
                        <li><a href="#home">Home</a></li>
                        <li><a href="#about">About</a></li>
                        <li><a href="#contact">Contact</a></li>
                    </ul> */}
                    {/* <div className="balance-block">
                        Balance: ₹{balance}
                    </div> */}
                    <button className="logout-button" onClick={handleLogout}>Logout</button>
                </header>
                <div className="main-content">
                    <h2>Admin Dashboard</h2>
                    <div className="filter-section">
                        <div className="filter-container">
                            <label className="filter-label">Phone Number</label>
                            <input
                                className="filter-input"
                                type="text"
                                value={phoneFilter}
                                onChange={(e) => setPhoneFilter(e.target.value)}
                            />
                        </div>
                        <div className="filter-container">
                            <label className="filter-label">Amount</label>
                            <input
                                className="filter-input"
                                type="number"
                                value={amountFilter}
                                onChange={(e) => setAmountFilter(e.target.value)}
                            />
                        </div>
                        <div className="filter-container">
                            <label className="filter-label">Status</label>
                            <select
                                className="filter-dropdown"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option value="">All</option>
                                <option value="submit">Submit</option>
                                <option value="pending">Pending</option>
                                <option value="failed">Failed</option>
                            </select>
                        </div>
                        <div className="filter-container">
                            <label className="filter-label">Amount Range</label>
                            <div className="filter-range">
                                <input
                                    className="filter-input"
                                    type="number"
                                    value={amountRangeFilter[0]}
                                    onChange={(e) =>
                                        setAmountRangeFilter([parseFloat(e.target.value), amountRangeFilter[1]])
                                    }
                                />
                                <input
                                    className="filter-input"
                                    type="number"
                                    value={amountRangeFilter[1]}
                                    onChange={(e) =>
                                        setAmountRangeFilter([amountRangeFilter[0], parseFloat(e.target.value)])
                                    }
                                />
                            </div>
                        </div>
                        <div className="filter-container">
                            <label className="filter-label">Start Date</label>
                            <input
                                className="filter-input"
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                            />
                        </div>
                        <div className="filter-container">
                            <label className="filter-label">End Date</label>
                            <input
                                className="filter-input"
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                            />
                        </div>
                    </div>

                    {loading ? (
                        <p>Loading documents...</p>
                    ) : (
                        <>
                            <table className="documents-table">
                            <thead>
    <tr>
        <th>Date</th>
        <th>Phone Number</th>
        <th>UTR</th>
        <th>Amount</th>
        <th>Status</th>
        <th>Bonus</th>
        <th>Points</th>
        <th>ID</th>
        <th>Points Given</th>
    </tr>
</thead>
<tbody>
    {filteredDocuments.map((doc, index) => (
        <tr key={index}>
            <td>{new Date(doc.date_time).toLocaleDateString()}</td>
            <td>{doc.collection_name}</td>
            <td>{doc.utr || "N/A"}</td>
            <td>₹{doc.amount || "N/A"}</td>
            <td className={getStatusClass(doc.status)}>
                {doc.status}
            </td>
            <td>
                <textarea
                    value={doc.bonus}
                    onChange={(e) => handleBonusChange(doc, e.target.value)}
                    rows={1}
                    style={{ resize: 'vertical', width: '100px', maxHeight: '100px', color: 'black' }}
                />
            </td>
            <td>{doc.points || "N/A"}</td>
            <td>{doc.type || "N/A"}</td>
            <td>
                <div className="checkbox-container">
                    <input
                        type="checkbox"
                        checked={doc.id === 1}
                        onChange={() => handleCheckboxToggle(doc)}
                    />
                </div>
            </td>
        </tr>
    ))}
</tbody>


                            </table>
                            <div className="total-amount">
                                Total Amount: ₹{totalAmount.toFixed(2)}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </>
    );
}
