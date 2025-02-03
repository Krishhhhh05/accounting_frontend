"use client";
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import axios from 'axios';

const AllStatements = () => {
    const params = useParams();
    const slug = params?.slug; // Use 'slug' here, not 'slugvalue'
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (slug) { // Ensure slug is defined
            const fetchFilteredDocuments = async () => {
                try {
                    console.log("Slug Value:", slug); // Debugging log
                    const response = await axios.get(`http://127.0.0.1:8000/api/get_filtered_documents/${slug}`);
                    setTransactions(response.data.documents);
                } catch (error) {
                    console.error('Error fetching filtered documents:', error);
                } finally {
                    setLoading(false);
                }
            };
            fetchFilteredDocuments();
        }
    }, [slug]);

    return (
        <div className="container">
            <style jsx>{`
                .container {
                    padding: 20px;
                    background-color: #1e293b;
                    border-radius: 10px;
                    color: #edf2f7;
                }
                .table {
                    width: 100%;
                    border-collapse: collapse;
                    background: #2d3748;
                    border-radius: 8px;
                    overflow: hidden;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
                    margin-top: 20px;
                }
                .table th, .table td {
                    padding: 12px;
                    text-align: left;
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
            `}</style>

            <h2 className="text-2xl font-bold text-white mb-4">Filtered Account Statements</h2>
            {loading ? (
                <p>Loading transactions...</p>
            ) : (
                <table className="table">
                    <thead>
                        <tr>
                            <th>FROM</th>
                            <th>Date</th>
                            <th>TO</th>
                            <th>Description</th>
                            <th>Debit</th>
                            <th>Credit</th>
                            <th>Balance</th>
                        </tr>
                    </thead>
                    <tbody>
    {transactions.length > 0 ? (
        transactions
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .filter((transaction, index, self) =>
                index === self.findIndex((t) => t.UTR === transaction.UTR)
            ) // Filter out duplicate UTRs
            .map((transaction, idx) => (
                <tr key={idx}>
                    {console.log(transaction)}
                    <td>{transaction.collection_name}</td>
                    <td>{new Date(transaction.date).toLocaleString()}</td>
                    <td>{transaction['from/to']}</td>
                    <td>{transaction.UTR}</td>
                    <td style={{ color: transaction.type === 'DEBIT' ? '#ff4c4c' : '' }}>
                        {transaction.type === 'DEBIT' ? `₹${transaction.amount}` : ''}
                    </td>
                    <td style={{ color: transaction.type === 'CREDIT' ? '#4caf50' : '' }}>
                        {transaction.type === 'CREDIT' ? `₹${transaction.amount}` : ''}
                    </td>
                    <td>{transaction.balance ? `₹${transaction.balance.toFixed(2)}` : '-'}</td>
                </tr>
            ))
    ) : (
        <tr>
            <td colSpan="7">No transaction data available</td>
        </tr>
    )}
</tbody>
                </table>
            )}
        </div>
    );
};

export default AllStatements;
