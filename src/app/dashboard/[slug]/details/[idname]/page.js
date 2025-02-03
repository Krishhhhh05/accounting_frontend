"use client";
import { useEffect, useState } from 'react';
import axios from 'axios';

const DetailsPage = ({ params }) => {
    const { slug, idName } = params;
    console.log("Params:", params); // Logs the params object

    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                console.log("Fetching data with", { slug, idName });
                console.log(params.idname);
                const response = await axios.get(`https://backend-accounting-d1352e11cad3.herokuapp.com/api/get_type_details/${slug}/${params.idname}`);
                console.log("Data fetched:", response.data);
                setData(response.data.documents);
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };
    
        fetchData();
    }, [slug, idName]);

    return (
        <div className="container mx-auto p-8">
            <h2 className="text-2xl font-bold text-white mb-6">Details for ID Name: {idName}</h2>
            {loading ? (
                <p className="text-white">Loading data...</p>
            ) : (
                <table className="styled-table">
                    <thead>
                        <tr>
                        <th>ID NAME</th>

                            <th>Amount</th>
                            <th>Date/Time</th>
                            <th>Status</th>
                            <th>Bonus</th>
                            <th>Points</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((doc, index) => (
                            <tr key={index}>
                                <td>{doc.collection_name}</td>

                                <td>{doc.amount}</td>
                                <td>{doc.date_time}</td>
                                <td>{doc.status}</td>
                                <td>{doc.bonus}</td>
                                <td>{doc.points}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
            <style jsx>{`
                .container {
width: 100vw; /* Use the full viewport width */
        height: 100vh; /* Use the full viewport height, if needed */
        margin: 0;
        padding: 0;
        background-color: #1e293b;
        display: flex;
        flex-direction: column;
                }
                .styled-table {
                    width: 100%;
                    border-collapse: collapse;
                    font-size: 1em;
                    background-color: #2d3748;
                    border-radius: 8px;
                    overflow: hidden;
                    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
                }
                .styled-table th,
                .styled-table td {
                    padding: 15px;
                    text-align: left;
                    color: #a0aec0;
                }
                .styled-table th {
                    background-color: #4a5568;
                    color: #edf2f7;
                    text-transform: uppercase;
                    font-weight: bold;
                    font-size: 0.9em;
                }
                .styled-table tbody tr {
                    transition: background-color 0.2s ease;
                }
                .styled-table tbody tr:hover {
                    background-color: #3b4252;
                }
                .styled-table tbody tr:nth-child(even) {
                    background-color: #374151;
                }
                .styled-table tbody tr:nth-child(odd) {
                    background-color: #2d3748;
                }
                .styled-table td {
                    font-size: 1em;
                    border-bottom: 1px solid #2d3748;
                }
                .styled-table th:first-child,
                .styled-table td:first-child {
                    border-top-left-radius: 8px;
                    border-bottom-left-radius: 8px;
                }
                .styled-table th:last-child,
                .styled-table td:last-child {
                    border-top-right-radius: 8px;
                    border-bottom-right-radius: 8px;
                }
            `}</style>
        </div>
    );
};

export default DetailsPage;
