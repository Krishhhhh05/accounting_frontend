"use client";
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { FaFilePdf, FaFileExcel } from 'react-icons/fa';


const AccountStatement = () => {
    const { slug, accountNumber } = useParams();
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openingBalance, setOpeningBalance] = useState(0); // Track the opening balance
    const [filterFromTo, setFilterFromTo] = useState('');
const [filterMinAmount, setFilterMinAmount] = useState('');
const [filterMaxAmount, setFilterMaxAmount] = useState('');
const [filterType, setFilterType] = useState('');

    

    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                const response = await axios.get(`http://localhost:8000/api/get_client_documents/${accountNumber}`);
                const fetchedDocuments = response.data.documents;
                const fetchedOpeningBalance = response.data.opening_balance || 0;

                // Sort transactions by date in ascending order (oldest to newest)
                const sortedTransactions = fetchedDocuments.sort((a, b) => new Date(a.date) - new Date(b.date));

                // Compute balances
                let runningBalance = fetchedOpeningBalance; // Start with opening balance
                const updatedTransactions = sortedTransactions.map((transaction) => {
                    // Adjust running balance based on transaction type
                    if (transaction.type === 'CREDIT') {
                        runningBalance += Number(transaction.amount) || 0; // Ensure amount is numeric
                    } else if (transaction.type === 'DEBIT') {
                        runningBalance -= Number(transaction.amount) || 0; // Ensure amount is numeric
                    }
                    // Add computed balance to the transaction
                    return { ...transaction, balance: runningBalance };
                });
                

                // Update state
                setOpeningBalance(fetchedOpeningBalance);
                setTransactions(updatedTransactions);
            } catch (error) {
                console.error('Error fetching transaction data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchTransactions();
    }, [accountNumber]);
    const exportPDF = () => {
        const doc = new jsPDF();
        doc.text(`Statement for Account ${accountNumber}`, 20, 10);
        autoTable(doc, {
            head: [['Date', 'From/To', 'Description', 'Debit', 'Credit', 'Balance']],
            body: filteredTransactions.map((transaction) => [
                new Date(transaction.date).toLocaleString(),
                transaction['from/to'] || '',
                transaction.UTR || '',
                transaction.type === 'DEBIT' ? `${transaction.amount}` : '',
                transaction.type === 'CREDIT' ? `${transaction.amount}` : '',
                `${transaction.balance.toFixed(2)}`,
            ]),
        });
        doc.save(`Account_Statement_${accountNumber}.pdf`);
    };
    
    const exportExcel = () => {
        const ws = XLSX.utils.json_to_sheet(
            filteredTransactions.map((transaction) => ({
                Date: new Date(transaction.date).toLocaleString(),
                'From/To': transaction['from/to'] || '',
                Description: transaction.UTR || '',
                Debit: transaction.type === 'DEBIT' ? transaction.amount : '',
                Credit: transaction.type === 'CREDIT' ? transaction.amount : '',
                Balance: transaction.balance.toFixed(2),
            }))
        );
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Account Statement');
        XLSX.writeFile(wb, `Account_Statement_${accountNumber}.xlsx`);
    };
    const filteredTransactions = transactions.filter((transaction) => {
        const matchesFromTo = filterFromTo === '' || transaction['from/to']?.toLowerCase().includes(filterFromTo.toLowerCase());
        const matchesMinAmount = filterMinAmount === '' || Number(transaction.amount) >= Number(filterMinAmount);
        const matchesMaxAmount = filterMaxAmount === '' || Number(transaction.amount) <= Number(filterMaxAmount);
        const matchesType = filterType === '' || transaction.type === filterType;
    
        return matchesFromTo && matchesMinAmount && matchesMaxAmount && matchesType;
    });

    const totalDebit = filteredTransactions
    .filter((transaction) => transaction.type === 'DEBIT')
    .reduce((sum, transaction) => sum + (Number(transaction.amount) || 0), 0);

const totalCredit = filteredTransactions
    .filter((transaction) => transaction.type === 'CREDIT')
    .reduce((sum, transaction) => sum + (Number(transaction.amount) || 0), 0);

const totalBalance = filteredTransactions.length > 0
    ? filteredTransactions[filteredTransactions.length - 1].balance
    : openingBalance;

    
    

    return (
        <div className="container">
            <style jsx>{`
.filterContainer {

    display: flex;
    flex-wrap: wrap; /* Allow filters to wrap on smaller screens */
    gap: 6px; /* Slightly more space between filters */
    margin-bottom: 10px;
    padding: 6px;
    background-color: #2d3748;
    border-radius: 4px;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
}

.filterItem {
    width: auto; /* Adjust width based on content */
    min-width: 60px; /* Ensure usability */
    max-width: 25%; /* Set a reasonable maximum size */
}


.filterLabel {
    color: #cbd5e0;
    font-size: 10px; /* Small but readable font size */
    font-weight: bold;
}

.filterInput {
    padding: 4px; /* Slightly more padding */
    font-size: 10px; /* Small but readable text */
    border: 1px solid #4a5568;
    border-radius: 4px;
    background-color: #374151;
    color: #edf2f7;
    width: 100%;
}

.filterInput:focus {
    border-color: #4caf50;
}


            .iconButton {
    background-color: #4caf50;
    color: #fff;
    padding: 10px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
}

.iconButton:hover {
    background-color: #388e3c;
}


            .credit {
    color: #4caf50 !important; /* Green */
}

.debit {
    color: #ff4c4c !important; /* Red */
}

                .container {
                    padding: 10px;
                    background-color: #1e293b;
                    border-radius: 8px;
                    color: #edf2f7;
                }
                .table {
                    width: 100%;
                    border-collapse: collapse;
                    background: #2d3748;
                    border-radius: 6px;
                    overflow: hidden;
                    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
                    margin-top: 10px;
                }
                .table th,
                .table td {
                    padding: 6px;
                    text-align: left;
                    font-size: 10px;
                }
                .table th {
                    background-color: #4a5568;
                    color: #edf2f7;
                    text-transform: uppercase;
                }
                .table td {
                    background-color: #374151;
                    color: #a0aec0;
                    border-bottom: 1px solid #2d3748;
                }
                .table tr:hover td {
                    background-color: #3b4252;
                }
                .credit {
                    color: #4caf50;
                }
                .debit {
                    color: #ff4c4c;
                }
            `}</style>
            <div className="flex space-x-4 mb-4">
    <button onClick={exportPDF} className="iconButton">
        <FaFilePdf size={20} />
    </button>
    <button onClick={exportExcel} className="iconButton">
        <FaFileExcel size={20} />
    </button>
</div>
<div className="flex flex-wrap gap-4 mb-1 mt-1  bg-slate-700 p-4 rounded">
    <div className="filterItem">
        <label htmlFor="filterFromTo" className="filterLabel">From/To</label>
        <input
            type="text"
            id="filterFromTo"
            className="filterInput"
            placeholder="Filter by From/To"
            value={filterFromTo}
            onChange={(e) => setFilterFromTo(e.target.value)}
        />
    </div>
    <div className="filterItem">
        <label htmlFor="filterMinAmount" className="filterLabel">Min Amount</label>
        <input
            type="number"
            id="filterMinAmount"
            className="filterInput"
            placeholder="Min Amount"
            value={filterMinAmount}
            onChange={(e) => setFilterMinAmount(e.target.value)}
        />
    </div>
    <div className="filterItem">
        <label htmlFor="filterMaxAmount" className="filterLabel">Max Amount</label>
        <input
            type="number"
            id="filterMaxAmount"
            className="filterInput"
            placeholder="Max Amount"
            value={filterMaxAmount}
            onChange={(e) => setFilterMaxAmount(e.target.value)}
        />
    </div>
    <div className="filterItem">
        <label htmlFor="filterType" className="filterLabel">Transaction Type</label>
        <select
            id="filterType"
            className="filterInput"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
        >
            <option value="">All</option>
            <option value="CREDIT">Credit</option>
            <option value="DEBIT">Debit</option>
        </select>
    </div>
</div>



            <h2 className="text-base font-bold text-white mb-2">
                Statement for Account {accountNumber}
            </h2>
            {loading ? (
                <p>Loading transactions...</p>
            ) : (
                <table className="table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>From/To</th>
                            <th>Description</th>
                            <th>Debit</th>
                            <th>Credit</th>
                            <th>Balance</th>
                        </tr>
                    </thead>
                    <tbody>
    {filteredTransactions.length > 0 ? (
        filteredTransactions
            .sort((a, b) => new Date(b.date) - new Date(a.date)) // Sort descending (newest to oldest)
            .map((transaction, idx) => (
                <tr key={idx}>
                    <td>{new Date(transaction.date).toLocaleString()}</td>
                    <td>{transaction['from/to']}</td>
                    <td>{transaction.UTR}</td>
                    <td className="debit">
                        {transaction.type === 'DEBIT' ? `₹${transaction.amount}` : ''}
                    </td>
                    <td className="credit">
                        {transaction.type === 'CREDIT' ? `₹${transaction.amount}` : ''}
                    </td>
                    <td>
                        {transaction.balance !== undefined && !isNaN(transaction.balance)
                            ? `₹${transaction.balance.toFixed(2)}`
                            : '-'}
                    </td>
                </tr>
            ))
    ) : (
        <tr>
            <td colSpan="6">No transaction data available</td>
        </tr>
    )}
    <tr>
        <td colSpan="5" style={{ fontWeight: 'bold', color: '#ffffff' }}>Opening Balance</td>
        <td>{`₹${openingBalance.toFixed(2)}`}</td>
    </tr>
</tbody>
<tfoot>
    <tr className="table-footer">
        <td colSpan="3" style={{ fontWeight: 'bold', color: '#ffffff' }}>Total</td>
        <td style={{ fontWeight: 'bold', color: '#ff4c4c' }}>
            ₹{totalDebit.toLocaleString()}
        </td>
        <td style={{ fontWeight: 'bold', color: '#4caf50' }}>
            ₹{totalCredit.toLocaleString()}
        </td>
        <td style={{ fontWeight: 'bold', color: '#ffffff' }}>
            ₹{totalBalance.toLocaleString()}
        </td>
    </tr>
</tfoot>
    

                </table>
            )}
        </div>
    );
};

export default AccountStatement;
