"use client";
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import withAuth from '../withAuth';
import { Bar } from 'react-chartjs-2';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { FaFilePdf, FaFileExcel } from 'react-icons/fa';




// import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);


const Dashboard = () => {
    const router = useRouter();
    const [adminDetails, setAdminDetails] = useState([]);
    const [loading, setLoading] = useState(true);
    const [totalOpeningBalance, setTotalOpeningBalance] = useState(0);
    const [totalPoints, setTotalPoints] = useState(0);
    const [companyFilter, setCompanyFilter] = useState('');
    const [balanceFilterMin, setBalanceFilterMin] = useState('');
    const [balanceFilterMax, setBalanceFilterMax] = useState('');
    const [banksFilter, setBanksFilter] = useState('');
    const [idsFilter, setIdsFilter] = useState('');
    const [pointsFilterMin, setPointsFilterMin] = useState('');
    const [pointsFilterMax, setPointsFilterMax] = useState('');
    const [idCompanyFilter, setIdCompanyFilter] = useState('');
// const [idNameFilter, setIdNameFilter] = useState('');
// const [upperBalanceMin, setUpperBalanceMin] = useState('');
// const [upperBalanceMax, setUpperBalanceMax] = useState('');
// const [usedBalanceMin, setUsedBalanceMin] = useState('');
// const [usedBalanceMax, setUsedBalanceMax] = useState('');
// const [bonusMin, setBonusMin] = useState('');
// const [bonusMax, setBonusMax] = useState('');
// const [availableBalanceMin, setAvailableBalanceMin] = useState('');
// const [availableBalanceMax, setAvailableBalanceMax] = useState('');




    
    const filteredAdminDetails = adminDetails.filter((db) => {
        const companyMatch = db.database.toLowerCase().includes(companyFilter.toLowerCase());
        const balanceMatch =
            (balanceFilterMin === '' || db.total_balance >= parseInt(balanceFilterMin)) &&
            (balanceFilterMax === '' || db.total_balance <= parseInt(balanceFilterMax));
        const banksMatch = banksFilter === '' || db.bank_document_count === parseInt(banksFilter);
        const idsMatch = idsFilter === '' || db.id_document_count === parseInt(idsFilter);
        const pointsMatch =
            (pointsFilterMin === '' || db.total_points >= parseInt(pointsFilterMin)) &&
            (pointsFilterMax === '' || db.total_points <= parseInt(pointsFilterMax));
    
        return companyMatch && balanceMatch && banksMatch && idsMatch && pointsMatch;
    });
    

    const pointsChartData = {
        labels: adminDetails.map((db) => db.database),
        datasets: [
            {
                label: 'Total Points in All IDs',
                data: adminDetails.map((db) => db.total_points),
                backgroundColor: [
                    'rgba(75, 192, 192, 0.6)',
                    'rgba(153, 102, 255, 0.6)',
                    'rgba(255, 159, 64, 0.6)',
                    'rgba(255, 99, 132, 0.6)',
                    'rgba(54, 162, 235, 0.6)',
                ],
                borderColor: [
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)',
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                ],
                borderWidth: 1,
            },
        ],
    };
    
    const balanceChartData = {
        labels: adminDetails.map((db) => db.database),
        datasets: [
            {
                label: 'Total Balance of All Banks (₹)',
                data: adminDetails.map((db) => db.total_balance),
                backgroundColor: [
                    'rgba(75, 192, 192, 0.6)',
                    'rgba(153, 102, 255, 0.6)',
                    'rgba(255, 159, 64, 0.6)',
                    'rgba(255, 99, 132, 0.6)',
                    'rgba(54, 162, 235, 0.6)',
                ],
                borderColor: [
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)',
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                ],
                borderWidth: 1,
            },
        ],
    };
    
    
    
    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
            },
        },
    };

    const exportPDF = () => {
        const doc = new jsPDF();
        doc.text("Admin Details", 20, 10);
        autoTable(doc, {
            head: [['Company', 'Total Balance', 'Number of Banks', 'Number of IDs', 'Total Points']],
            body: adminDetails.map((db) => [
                db.database,
                `${db.total_balance.toLocaleString()}`,
                db.bank_document_count,
                db.id_document_count,
                db.total_points,
            ]),
        });
        doc.save('Admin_Details.pdf');
    };
    
    const exportExcel = () => {
        const ws = XLSX.utils.json_to_sheet(
            adminDetails.map((db) => ({
                Company: db.database,
                'Total Balance': db.total_balance,
                'Number of Banks': db.bank_document_count,
                'Number of IDs': db.id_document_count,
                'Total Points': db.total_points,
            }))
        );
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Admin Details');
        XLSX.writeFile(wb, 'Admin_Details.xlsx');
    };
    
    

    const handleLogout = () => {
        localStorage.removeItem('isAuthenticated');
        router.push('/');
    };

    useEffect(() => {
        const fetchAdminDetails = async () => {
            try {
                const response = await axios.get('http://127.0.0.1:8000/api/get_all_details');
                const details = response.data.admin_details;
                console.log(details);
                setAdminDetails(details);
    
                // Calculate totals directly from API response
                const totalBalance = details.reduce((sum, db) => sum + db.total_balance, 0);
                const totalPointsSum = details.reduce((sum, db) => sum + db.total_points, 0);
    
                setTotalOpeningBalance(totalBalance);
                setTotalPoints(totalPointsSum);
            } catch (error) {
                console.error('Error fetching admin details:', error);
            } finally {
                setLoading(false);
            }
        };
    
        fetchAdminDetails(); // Fetch only once on component mount
    }, []); // Empty dependency array ensures this runs only once

    const handleRowClick = (database) => {
        router.push(`/dashboard/${database}`);
    };
    const totalBanks = filteredAdminDetails.reduce(
        (sum, db) => sum + db.bank_document_count,
        0
    );
    
    const totalIDs = filteredAdminDetails.reduce(
        (sum, db) => sum + db.id_document_count,
        0
    );
    
    

    return (
        <>
            <style jsx>{`
    .container {
        width: 100vw;
        padding: 5px;
        background-color: #1e293b;
        border-radius: 10px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        margin: 0;
        color: #edf2f7;
        font-size: 10px; /* Reduce overall font size */

    }
                
                .header {
                    display: flex;
                    
                    justify-content: space-between;
                    align-items: center;
                    padding: 8px;
                    background: #2d3748;
                    border-radius: 4px;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
                    margin-bottom: 10px;
                }

                .header img {
                    height: 32px;
                    width: 32px;
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
                    font-size: 10px;
                    transition: color 0.2s;
                }

                .header a:hover {
                    color: #cbd5e0;
                }

                .logoutButton {
                    background-color: #f44336;
                    color: #ffffff;
                    font-weight: bold;
                    padding: 5px 10px;
                    border: none;
                    border-radius: 2px;
                    cursor: pointer;
                    transition: background-color 0.2s;
                }

                .logoutButton:hover {
                    background-color: #d32f2f;
                }

                .table-container {
                    overflow-x: auto;
                    margin-top: 10px;
                }

                .table {
                    width: 100%;
                    border-collapse: collapse;
                    background: #2d3748;
                    border-radius: 4px;
                    overflow: hidden;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
                }

                .table thead {
                    background-color: #4a5568;
                    color: #edf2f7;
                }

                .table th,
                .table td {
                    padding: 6px 10px;
                    text-align: left;
                }

                .table th {
                    font-weight: bold;
                    font-size: 10px;
                    text-transform: uppercase;
                    border-bottom: 1px solid #374151;
                }

                .table td {
                    background-color: #374151;
                    border-bottom: 1px solid #2d3748;
                    cursor: pointer;
                    transition: background-color 0.2s;
                }

                .table tr:hover td {
                    background-color: #3b4252;
                }

                .table td strong {
                    color: #a0aec0;
                }



                .downloadButton {
    background-color: #4caf50;
    color: #fff;
    font-weight: bold;
    padding: 10px 20px;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: background-color 0.3s ease;
    font-size: 14px;
}

.downloadButton:hover {
    background-color: #388e3c;
}


                .table-footer {
                    font-weight: bold;
                    background-color: #4a5568;
                    color: #edf2f7;
                    text-align: left;
                    
                }




                .iconButton {
    background-color: #4caf50;
    color: #fff;
    padding: 5px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
}

.iconButton:hover {
    background-color: #388e3c;
}


.filterContainer {
    display: flex;
        flex-wrap: nowrap; /* Prevent wrapping to keep all items on a single line */

    gap: 10px;
    margin-top: 10px;
    padding: 5px;
    background-color: #2d3748;
    border-radius: 4px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.filterItem {
    display: flex;
    flex-direction: column;
        width: 100%; /* Make each filter item take up equal space */

}

.filterLabel {
    color: #cbd5e0;
    font-size: 10px;
    margin-bottom: 3px;
    font-weight: bold;
}

.filterInput {
    padding: 4px;
    border: 1px solid #4a5568;
    border-radius: 3px;
    background-color: #374151;
    color: #edf2f7;
    // outline: none;
    transition: border-color 0.2s;
        width: 100%; /* Ensure inputs take full width of each filter item */

}

.filterInput:focus {
    border-color: #4caf50;
}


                
            `}</style>
            
            <div className="container mx-auto p-10 bg-slate-800">
                <header className="header">
                    <div className="flex items-center">
                        <img src='/mansoor.png' alt="Logo" className="h-16 w-16 sm:h-32 sm:w-32" />
                        <ul className="flex space-x-4 ml-4">
                            <li><a href="admin" className="text-white hover:text-gray-400">Companies</a></li>
                            <li><a href="pendinglist" className="text-white hover:text-gray-400">Pending</a></li>
                            <li><a href="internalbanking" className="text-white hover:text-gray-400">Internal Banking</a></li>
                        </ul>
                    </div>
                    <button onClick={handleLogout} className="logoutButton">
                        Logout
                    </button>



                </header>
                <div className="flex space-x-4">
    <button onClick={exportPDF} className="iconButton">
        <FaFilePdf size={24} />
    </button>
    <button onClick={exportExcel} className="iconButton">
        <FaFileExcel size={24} />
    </button>
</div>
<div className="filterContainer">
    <div className="filterItem">
        <label htmlFor="companyFilter" className="filterLabel">Company</label>
        <input
            type="text"
            id="companyFilter"
            className="filterInput"
            placeholder="Search by Company"
            value={companyFilter}
            onChange={(e) => setCompanyFilter(e.target.value)}
        />
    </div>
    <div className="filterItem">
        <label htmlFor="balanceFilter" className="filterLabel">Total Balance (₹)</label>
        <input
            type="number"
            id="balanceFilterMin"
            className="filterInput"
            placeholder="Min"
            value={balanceFilterMin}
            onChange={(e) => setBalanceFilterMin(e.target.value)}
        />
        <input
            type="number"
            id="balanceFilterMax"
            className="filterInput"
            placeholder="Max"
            value={balanceFilterMax}
            onChange={(e) => setBalanceFilterMax(e.target.value)}
        />
    </div>
    <div className="filterItem">
        <label htmlFor="banksFilter" className="filterLabel">Number of Banks</label>
        <input
            type="number"
            id="banksFilter"
            className="filterInput"
            placeholder="Filter by Banks"
            value={banksFilter}
            onChange={(e) => setBanksFilter(e.target.value)}
        />
    </div>
    <div className="filterItem">
        <label htmlFor="idsFilter" className="filterLabel">Number of IDs</label>
        <input
            type="number"
            id="idsFilter"
            className="filterInput"
            placeholder="Filter by IDs"
            value={idsFilter}
            onChange={(e) => setIdsFilter(e.target.value)}
        />
    </div>
    <div className="filterItem">
        <label htmlFor="pointsFilter" className="filterLabel">Total Points</label>
        <input
            type="number"
            id="pointsFilterMin"
            className="filterInput"
            placeholder="Min"
            value={pointsFilterMin}
            onChange={(e) => setPointsFilterMin(e.target.value)}
        />
        <input
            type="number"
            id="pointsFilterMax"
            className="filterInput"
            placeholder="Max"
            value={pointsFilterMax}
            onChange={(e) => setPointsFilterMax(e.target.value)}
        />
    </div>
</div>


                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="pulse-loader"></div>
                    </div>
                ) : (
                    <div className="table-container">
                        {/* <h2 className="text-2xl font-bold text-white mb-4">Admin Details</h2> */}
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Company</th>
                                    <th>Total Balance </th>
                                    <th>Number of Banks</th>
                                    <th>Number of IDs</th>
                                    <th>Total Pozxcints</th>
                                </tr>
                            </thead>
                            <tbody>
    {filteredAdminDetails.map((db, index) => (
        <tr key={index} onClick={() => handleRowClick(db.database)}>
            <td><strong>{db.database}</strong></td>
            <td>₹{db.total_balance.toLocaleString()}</td>
            <td>{db.bank_document_count}</td>
            <td>{db.id_document_count}</td>
            <td>{db.total_points}</td>
        </tr>
    ))}
</tbody>

<tfoot>
    <tr className="table-footer">
        <td style={{ fontWeight: 'bold', color: '#ffffff' }}>Total</td>
        <td style={{ fontWeight: 'bold', color: '#ffffff' }}>
            ₹{totalOpeningBalance.toLocaleString()}
        </td>
        <td style={{ fontWeight: 'bold', color: '#ffffff' }}>
            {totalBanks}
        </td>
        <td style={{ fontWeight: 'bold', color: '#ffffff' }}>
            {totalIDs}
        </td>
        <td style={{ fontWeight: 'bold', color: '#ffffff' }}>
            {totalPoints.toLocaleString()}
        </td>
    </tr>
</tfoot>

                        </table>
                    </div>
                )}
            </div>
            <div className="mt-10 flex justify-around">
    <div className="w-1/4 p-2">
        <h3 className="text-center text-white font-bold mb-2">Total Points Distribution</h3>
        <Pie data={pointsChartData} options={{ ...chartOptions, title: { ...chartOptions.title, text: 'Total Points' } }} />
    </div>
    <div className="w-1/4 p-2">
        <h3 className="text-center text-white font-bold mb-2">Total Balance Distribution</h3>
        <Pie data={balanceChartData} options={{ ...chartOptions, title: { ...chartOptions.title, text: 'Total Balance' } }} />
    </div>
</div>

        </>
    );
};

export default withAuth(Dashboard);
