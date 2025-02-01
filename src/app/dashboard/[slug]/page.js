"use client";
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Pie, Bar, Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, ArcElement, BarElement, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { FaFilePdf, FaFileExcel } from 'react-icons/fa';
import { FaSearch } from 'react-icons/fa'; // Import magnifying glass icon



ChartJS.register(CategoryScale, LinearScale, ArcElement, BarElement, PointElement, LineElement, Title, Tooltip, Legend);

const DatabaseDetails = () => {
    const router = useRouter();
    const { slug } = useParams();
    const [documents, setDocuments] = useState([]);
    const [filteredDocuments, setFilteredDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingFiltered, setLoadingFiltered] = useState(true);
    const [blockedRows, setBlockedRows] = useState(new Set());
    const [filterAdminName, setFilterAdminName] = useState('');
const [filterBankHolderName, setFilterBankHolderName] = useState('');
const [filterIFSC, setFilterIFSC] = useState('');
const [filterAccountNumber, setFilterAccountNumber] = useState('');
const [balanceRange, setBalanceRange] = useState([0, Infinity]); // Array to store min and max balance
const [filterBlocked, setFilterBlocked] = useState(''); // 'blocked', 'unblocked', or '' (empty for no filter)
const [filterAttached, setFilterAttached] = useState(''); // 'attached', 'not-attached', or '' (empty for no filter)

const [filterCompanyName, setFilterCompanyName] = useState('');
const [filterIDName, setFilterIDName] = useState('');
const [filterUpperBalanceRange, setFilterUpperBalanceRange] = useState([0, Infinity]); // Min and max for Upper Balance
const [filterUsedRange, setFilterUsedRange] = useState([0, Infinity]); // Min and max for Used
const [filterBonusRange, setFilterBonusRange] = useState([0, Infinity]); // Min and max for Bonus

const [filterTotalUsedRange, setFilterTotalUsedRange] = useState([0, Infinity]); // Min and max for Total Used
const [filterAvailableBalanceRange, setFilterAvailableBalanceRange] = useState([0, Infinity]); // Min and max for Available Balance







    
        const fetchDocuments = async () => {
            try {
                const response = await axios.get(`http://localhost:8000/api/get_dashboard_documents/${slug}`);
                setDocuments(response.data.documents);
            } catch (error) {
                console.error('Error fetching documents:', error);
            } finally {
                setLoading(false);
            }
        };

        const filteredTableDocuments = documents.filter((doc) => {
            const minBalance = balanceRange[0] || 0; // Default to 0 if empty
            const maxBalance = balanceRange[1] || Infinity; // Default to Infinity if empty
        
            const withinBalanceRange = 
                doc.opening_balance >= minBalance && doc.opening_balance <= maxBalance;
        
            const matchesBlockedStatus = 
                filterBlocked === '' || 
                (filterBlocked === 'blocked' && doc.blocked === 0) || 
                (filterBlocked === 'unblocked' && doc.blocked !== 0);
        
            const matchesAttachedStatus = 
                filterAttached === '' || 
                (filterAttached === 'attached' && doc.attached) || 
                (filterAttached === 'not-attached' && !doc.attached);
        
            return (
                (!filterAdminName || doc.admin_name.toLowerCase().includes(filterAdminName.toLowerCase())) &&
                (!filterBankHolderName || doc.bank_holder_name.toLowerCase().includes(filterBankHolderName.toLowerCase())) &&
                (!filterIFSC || doc.ifsc.toLowerCase().includes(filterIFSC.toLowerCase())) &&
                (!filterAccountNumber || doc.account_number.toLowerCase().includes(filterAccountNumber.toLowerCase())) &&
                withinBalanceRange &&
                matchesBlockedStatus &&
                matchesAttachedStatus
            );
        });
        

            // Calculate the total balance, excluding blocked rows
    const totalBalance = filteredTableDocuments
    .filter((doc) => !blockedRows.has(doc.account_number))
    .reduce((acc, doc) => acc + doc.opening_balance, 0);


    const filteredIDTableDocuments = filteredDocuments.filter((doc) => {
        const upperMin = filterUpperBalanceRange[0] || 0;
        const upperMax = filterUpperBalanceRange[1] || Infinity;
        const usedMin = filterUsedRange[0] || 0;
        const usedMax = filterUsedRange[1] || Infinity;
        const bonusMin = filterBonusRange[0] || 0;
        const bonusMax = filterBonusRange[1] || Infinity;
        const totalUsedMin = filterTotalUsedRange[0] || 0;
        const totalUsedMax = filterTotalUsedRange[1] || Infinity;
        const availableMin = filterAvailableBalanceRange[0] || 0;
        const availableMax = filterAvailableBalanceRange[1] || Infinity;
    
        const totalUsed = doc.points_balance + doc.total_bonus;
        const availableBalance = doc.points - totalUsed;
    
        const withinUpperBalanceRange = doc.points >= upperMin && doc.points <= upperMax;
        const withinUsedRange = doc.points_balance >= usedMin && doc.points_balance <= usedMax;
        const withinBonusRange = doc.total_bonus >= bonusMin && doc.total_bonus <= bonusMax;
        const withinTotalUsedRange = totalUsed >= totalUsedMin && totalUsed <= totalUsedMax;
        const withinAvailableBalanceRange = availableBalance >= availableMin && availableBalance <= availableMax;
    
        return (
            (!filterCompanyName || doc.admin_name.toLowerCase().includes(filterCompanyName.toLowerCase())) &&
            (!filterIDName || doc.id_name.toLowerCase().includes(filterIDName.toLowerCase())) &&
            withinUpperBalanceRange &&
            withinUsedRange &&
            withinBonusRange &&
            withinTotalUsedRange &&
            withinAvailableBalanceRange
        );
    });
    
    

        

    useEffect(() => {


        const fetchFilteredDocuments = async () => {
            try {
                const response = await axios.get(`http://localhost:8000/api/get_dashboard_id_details/${slug}`);
                setFilteredDocuments(response.data.documents);
            } catch (error) {
                console.error('Error fetching filtered documents:', error);
            } finally {
                setLoadingFiltered(false);
            }
        };

        fetchDocuments();
        fetchFilteredDocuments();
    }, [slug]);

    const exportPDF = () => {
        const doc = new jsPDF();
    doc.text("Filtered Bank Info Documents", 20, 10); // Title for filtered data
    autoTable(doc, {
        head: [['Company', 'Accounts', 'IFSC', 'Account Number', 'Balance', 'UPI', 'Attached']],
        body: filteredTableDocuments.map((doc) => [
            doc.admin_name,
            doc.bank_holder_name,
            doc.ifsc,
            doc.account_number,
            doc.opening_balance.toLocaleString(),
            doc.UPI,
            doc.attached ? 'Yes' : 'No',
        ]),
        });
    
        doc.addPage();
        doc.text("ID Documents", 20, 10);
        autoTable(doc, {
            head: [['Company', 'ID Name', 'Upper Balance', 'Used', 'Bonus', 'Total Used', 'Available Balance']],
            body: filteredDocuments.map((doc) => {
                const totalSum = doc.points_balance + doc.total_bonus;
                const pointsDifference = doc.points - totalSum;
                return [
                    doc.admin_name,
                    doc.id_name,
                    doc.points,
                    doc.points_balance,
                    doc.total_bonus.toLocaleString(),
                    totalSum,
                    pointsDifference,
                ];
            }),
        });
    
        doc.save('Bank_Info_Documents.pdf');
    };
    
    const exportExcel = () => {
        const ws1 = XLSX.utils.json_to_sheet(
            filteredTableDocuments.map((doc) => ({
                Company: doc.admin_name,
                Accounts: doc.bank_holder_name,
                IFSC: doc.ifsc,
                'Account Number': doc.account_number,
                Balance: doc.opening_balance,
                UPI: doc.UPI,
                Attached: doc.attached ? 'Yes' : 'No',
            }))
        );
        const ws2 = XLSX.utils.json_to_sheet(
            filteredDocuments.map((doc) => {
                const totalSum = doc.points_balance + doc.total_bonus;
                const pointsDifference = doc.points - totalSum;
                return {
                    Company: doc.admin_name,
                    'ID Name': doc.id_name,
                    'Upper Balance': doc.points,
                    Used: doc.points_balance,
                    Bonus: doc.total_bonus,
                    'Total Used': totalSum,
                    'Available Balance': pointsDifference,
                };
            })
        );
    
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws1, 'Bank Info Documents');
        XLSX.utils.book_append_sheet(wb, ws2, 'ID Documents');
        XLSX.writeFile(wb, 'Bank_Info_Documents.xlsx');
    };
    

    const handleRowClick = (accountNumber) => {
        router.push(`/dashboard/${slug}/statement/${accountNumber}`);
    };
    const handleSecondaryRowClick = (idName) => {
        if (!idName) {
            console.error("idName is undefined. Cannot navigate to details page.");
            return;
        }
        console.log("Navigating with idName:", idName);
        router.push(`/dashboard/${slug}/details/${idName}`);
    };

    const exportIDPDF = () => {
        const doc = new jsPDF();
        doc.text("ID Documents", 20, 10);
        autoTable(doc, {
            head: [['Company', 'ID Name', 'Upper Balance', 'Used', 'Bonus', 'Total Used', 'Balance']],
            body: filteredIDTableDocuments.map((doc) => {
                const totalSum = doc.points_balance + doc.total_bonus;
                const pointsDifference = doc.points - totalSum;
                return [
                    doc.admin_name,
                    doc.id_name,
                    doc.points,
                    doc.points_balance,
                    doc.total_bonus.toLocaleString(),
                    totalSum,
                    pointsDifference,
                ];
            }),
        });
        doc.save('ID_Documents.pdf');
    };
    
    const exportIDExcel = () => {
        const ws = XLSX.utils.json_to_sheet(
            filteredIDTableDocuments.map((doc) => {
                const totalSum = doc.points_balance + doc.total_bonus;
                const pointsDifference = doc.points - totalSum;
                return {
                    Company: doc.admin_name,
                    'ID Name': doc.id_name,
                    'Upper Balance': doc.points,
                    Used: doc.points_balance,
                    Bonus: doc.total_bonus,
                    'Total Used': totalSum,
                    'Available Balance': pointsDifference,
                };
            })
        );
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'ID Documents');
        XLSX.writeFile(wb, 'ID_Documents.xlsx');
    };
    

    // Prepare data for Pie Chart for `type` distribution in documents
    const typeCounts = documents.reduce((acc, doc) => {
        acc[doc.type] = (acc[doc.type] || 0) + 1;
        return acc;
    }, {});
    const pieChartData = {
        labels: Object.keys(typeCounts),
        datasets: [
            {
                data: Object.values(typeCounts),
                backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'],
            },
        ],
    };

    // Prepare data for Bar Chart for points and bonus
    const barChartData = {
        labels: filteredDocuments.map((doc) => doc.id_name),
        datasets: [
            {
                label: 'Points',
                data: filteredDocuments.map((doc) => doc.points),
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
            },
            {
                label: 'Total Bonus',
                data: filteredDocuments.map((doc) => doc.total_bonus),
                backgroundColor: 'rgba(153, 102, 255, 0.6)',
            },
        ],
    };

    // Prepare data for Line Chart for opening balance trends
    const lineChartData = {
        labels: documents.map((doc) => doc.bank_holder_name),
        datasets: [
            {
                label: 'Opening Balance',
                data: documents.map((doc) => doc.opening_balance),
                fill: false,
                borderColor: 'rgba(54, 162, 235, 1)',
                tension: 0.1,
            },
        ],
    };
        // Function to handle blocking and unblocking a row
        const handleBlockToggle = async (accountNumber, currentBlockedStatus) => {
            try {
                // Make an API call to toggle the `blocked` status in the backend
                await axios.post(`http://localhost:8000/api/update_block_status/`, {
                    account_number: accountNumber,
                    new_blocked_status: currentBlockedStatus === 0 ? 1 : 0
                });
        
                // Update the frontend state to reflect the new blocked status
                setBlockedRows((prevBlockedRows) => {
                    const newBlockedRows = new Set(prevBlockedRows);
                    if (newBlockedRows.has(accountNumber)) {
                        newBlockedRows.delete(accountNumber); // Unblock if already blocked
                    } else {
                        newBlockedRows.add(accountNumber); // Block if not already blocked
                    }
                    fetchDocuments();
    
                    return newBlockedRows;
                });
            } catch (error) {
                console.error("Failed to update block status:", error);
            }
        };

    return (
        <>
<style jsx>{
`.filters-container {
    display: flex;
    flex-wrap: wrap;
    gap: 5px; /* Reduced gap between filters */
    margin-bottom: 10px; /* Reduced bottom margin */
}

.filter-input {
    padding: 4px; /* Reduced padding */
    border: 1px solid #4a5568;
    border-radius: 3px;
    background-color: #374151;
    color: #edf2f7;
    font-size: 10px; /* Smaller font size */
    width: 100px; /* Reduced width for inputs */
    transition: border-color 0.3s ease, background-color 0.3s ease;
}

.filter-input:focus {
    border-color: #66bb6a;
    background-color: #3b4252;
    outline: none;
}

.filter-input select {
    appearance: none;
    padding: 4px; /* Reduced padding */
    background-color: #374151;
    color: #edf2f7;
    border: 1px solid #4a5568;
    border-radius: 3px;
    font-size: 10px; /* Smaller font size */
    width: 120px; /* Adjusted width for dropdowns */
    cursor: pointer;
}

.balance-range-filter {
    display: flex;
    align-items: center;
    gap: 5px; /* Reduced gap between Min, 'to', and Max */
}

.range-separator {
    color: #edf2f7;
    font-size: 10px; /* Smaller font size */
}


.table-header {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 1px; /* Reduced margin */
        margin-top: 1px; /* Reduced margin */

}

.viewAllIcon {
    background: linear-gradient(45deg, #ff6b6b, #f94d6a, #42a5f5, #66bb6a);
    border-radius: 50%;
    padding: 8px; /* Reduced padding */
    cursor: pointer;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        margin-top: 1px; /* Reduced margin */

}

.viewAllIcon:hover {
    transform: scale(1.1);
    box-shadow: 0 0 15px 5px rgba(255, 107, 107, 0.5);
}

.highlighted-row {
    background-color: #ffcccc !important;
}

        .totalRow {
            background-color: #4a5568;
            color: #edf2f7;
            font-weight: bold;
        }
        .glowingBlockButton {
            padding: 4px 8px;
            border: none;
            border-radius: 3px;
            background-color: #ff1a1a;
            color: #fff;
            font-weight: normal;
            cursor: pointer;
            font-size: 10px;
            transition: box-shadow 0.3s ease, background-color 0.3s ease;
        }
        .glowingBlockButton:hover {
            box-shadow: 0 0 15px 4px #ff4d4d;
            background-color: #ff3333;
        }
        .glowingUnblockButton {
             padding: 4px 8px;
            border: none;
            border-radius: 3px;
            color: #fff;
            font-weight: normal;
            cursor: pointer;
            font-size: 10px;
            transition: box-shadow 0.3s ease, background-color 0.3s ease;
            background-color: #4caf50;

        }
        .glowingUnblockButton:hover {
            box-shadow: 0 0 15px 4px #66bb6a;
            background-color: #45a049;
        }
        .header {
            background-color: #1f2937;
            color: #fff;
    padding: 10px; /* Reduced padding */
            text-align: center;
            border-radius: 10px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            margin-bottom: 20px;
        }
        .header h1 {
    font-size: 1.5rem; /* Reduced font size */
            font-weight: bold;
            margin: 0;
        }
        .header p {
            font-size: 1rem;
            color: #cbd5e0;
        }
        .container {
    padding: 10px; /* Reduced padding */
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
            margin-top: 10px;
            font-size: 12px; /* Reduced font size */

        }
        .table th, .table td {
    padding: 6px; /* Reduced padding */
            text-align: left;
        }
        .table th {
            background-color: #4a5568;
            color: #edf2f7;
            text-transform: uppercase;
                font-size: 10px; /* Reduced font size */

        }
        .table td {
            background-color: #374151;
            color: #a0aec0;
            border-bottom: 1px solid #2d3748;
            cursor: pointer;
            transition: background-color 0.2s ease;
        }
        .table tr:hover td {
            background-color: #3b4252;
        }
        .charts-container {
            display: flex;
            flex-wrap: wrap;
    gap: 10px; /* Reduced gap */
    margin-top: 20px;
        }
        .chart-wrapper {
    flex: 1 1 200px; /* Reduced minimum size */
            background: #2d3748;
    padding: 10px; /* Reduced padding */
            border-radius: 8px;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
        }
        .iconButton {
            background-color: #4caf50;
            color: #fff;
    padding: 4px; /* Reduced padding */
            border: none;
    border-radius: 3px;
                font-size: 12px; /* Reduced font size */

            cursor: pointer;
            transition: background-color 0.3s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
        }
        .iconButton:hover {
            background-color: #388e3c;
        }
    `}</style>



<div className="header">
        <h1>{slug}</h1>
    </div>

            <div className="container">
                <h2 className="text-base font-bold text-white mb-0">Bank : {slug}</h2>
                <div className="flex items-center space-x-4 my-4">
                <button onClick={exportPDF} className="iconButton">
        <FaFilePdf size={12} style={{ color: "#fff" }} />
    </button>
    <button onClick={exportExcel} className="iconButton">
        <FaFileExcel size={12} style={{ color: "#fff" }} />
    </button>
    <div className="viewAllIcon" onClick={() => router.push(`/dashboard/${slug}/all`)}>
    <FaSearch size={12} style={{ color: "#fff" }} />
    </div>
</div>
<div className="table-header">
    {/* <div className="viewAllIcon" onClick={() => router.push(`/dashboard/${slug}/all`)}>
        <FaSearch size={24} style={{ color: "#fff" }} />
    </div> */}
</div>
<div className="filters-container">
    {/* <input
        type="text"
        placeholder="Filter by Admin Name"
        value={filterAdminName}
        onChange={(e) => setFilterAdminName(e.target.value)}
        className="filter-input"
    /> */}
    <input
        type="text"
        placeholder="Filter by Bank Holder Name"
        value={filterBankHolderName}
        onChange={(e) => setFilterBankHolderName(e.target.value)}
        className="filter-input"
    />
    <input
        type="text"
        placeholder="Filter by IFSC"
        value={filterIFSC}
        onChange={(e) => setFilterIFSC(e.target.value)}
        className="filter-input"
    />
    <input
        type="text"
        placeholder="Filter by Account Number"
        value={filterAccountNumber}
        onChange={(e) => setFilterAccountNumber(e.target.value)}
        className="filter-input"
    />
<div className="balance-range-filter">
    <label className="text-white">Balance Range:</label>
    <input
        type="number"
        placeholder="Min"
        onChange={(e) => setBalanceRange([Number(e.target.value), balanceRange[1]])}
        className="filter-input"
    />
    <span className="range-separator">to</span>
    <input
        type="number"
        placeholder="Max"
        onChange={(e) => setBalanceRange([balanceRange[0], Number(e.target.value)])}
        className="filter-input"
    />
</div>

    <div>
        <label className="text-white">Blocked Status:</label>
        <select
            value={filterBlocked}
            onChange={(e) => setFilterBlocked(e.target.value)}
            className="filter-input"
        >
            <option value="">All</option>
            <option value="blocked">Blocked</option>
            <option value="unblocked">Unblocked</option>
        </select>
    </div>
    <div>
        <label className="text-white">Attachment Status:</label>
        <select
            value={filterAttached}
            onChange={(e) => setFilterAttached(e.target.value)}
            className="filter-input"
        >
            <option value="">All</option>
            <option value="attached">Attached</option>
            <option value="not-attached">Not Attached</option>
        </select>
    </div>
</div>



                {loading ? (
                    <p>Loading documents...</p>
                ) : (
                    <table className="table">
                        <thead>
                            <tr>
                                {/* <th>Company </th> */}
                                <th>ACCOUNTS</th>
                                <th>IFSC</th>
                                <th>Account Number</th>
                                <th>Balance</th>
                                {/* <th>UPI</th> */}
                                <th>UPI</th>
                                <th>Attached</th>
                                <th>Status</th> {/* New column for status buttons */}
                                {/* <th>Blocked</th> New column for status buttons */}


                                {/* <th>Type</th> */}
                            </tr>
                        </thead>
                        <tbody>
    {filteredTableDocuments.map((doc, index) => (
        <tr
            key={index}
            style={{
                backgroundColor: doc.blocked === 0 ? '#ffcccc' : 'transparent',
            }}
            onClick={() => handleRowClick(doc.account_number)}
        >
            {/* <td>{doc.admin_name}</td> */}
            <td>{doc.bank_holder_name}</td>
            <td>{doc.ifsc}</td>
            <td>{doc.account_number}</td>
            <td>₹{doc.opening_balance.toLocaleString()}</td>
            <td>{doc.UPI}</td>
            <td>{doc.attached ? 'Yes' : 'No'}</td>
            <td>
                <button
                    className={
                        doc.blocked === 0
                            ? 'glowingBlockButton'
                            : 'glowingUnblockButton'
                    }
                    onClick={(e) => {
                        e.stopPropagation();
                        handleBlockToggle(doc.account_number, doc.blocked);
                    }}
                >
                    {doc.blocked === 0 ? 'Block' : 'Unblock'}
                </button>
            </td>
        </tr>
    ))}
</tbody>

<tfoot>
    <tr className="totalRow">
        <td colSpan="3">Total Balance</td>
        <td>₹{totalBalance.toLocaleString()}</td>
        <td colSpan="3"></td>
    </tr>
</tfoot>


                    </table>
                )}

                <h2 className="text-base font-bold text-white my-4">IDs</h2>
                {/* Export Buttons for ID Table */}
<div className="flex space-x-4 my-4 ml-4">
    <button onClick={exportIDPDF} className="iconButton">
        <FaFilePdf size={12} style={{ color: "#fff" }} />
    </button>
    <button onClick={exportIDExcel} className="iconButton">
        <FaFileExcel size={12} style={{ color: "#fff" }} />
    </button>
</div>
<div className="filters-container">
    {/* <input
        type="text"
        placeholder="Filter by Company Name"
        value={filterCompanyName}
        onChange={(e) => setFilterCompanyName(e.target.value)}
        className="filter-input"
    /> */}
    <input
        type="text"
        placeholder="Filter by ID Name"
        value={filterIDName}
        onChange={(e) => setFilterIDName(e.target.value)}
        className="filter-input"
    />
    <div className="range-filter">
        <label className="text-white">Upper Balance:</label>
        <input
            type="number"
            placeholder="Min"
            onChange={(e) => setFilterUpperBalanceRange([Number(e.target.value), filterUpperBalanceRange[1]])}
            className="filter-input"
        />
        <span className="range-separator">to</span>
        <input
            type="number"
            placeholder="Max"
            onChange={(e) => setFilterUpperBalanceRange([filterUpperBalanceRange[0], Number(e.target.value)])}
            className="filter-input"
        />
    </div>
    <div className="range-filter">
        <label className="text-white">Used:</label>
        <input
            type="number"
            placeholder="Min"
            onChange={(e) => setFilterUsedRange([Number(e.target.value), filterUsedRange[1]])}
            className="filter-input"
        />
        <span className="range-separator">to</span>
        <input
            type="number"
            placeholder="Max"
            onChange={(e) => setFilterUsedRange([filterUsedRange[0], Number(e.target.value)])}
            className="filter-input"
        />
    </div>
    <div className="range-filter">
        <label className="text-white">Bonus:</label>
        <input
            type="number"
            placeholder="Min"
            onChange={(e) => setFilterBonusRange([Number(e.target.value), filterBonusRange[1]])}
            className="filter-input"
        />
        <span className="range-separator">to</span>
        <input
            type="number"
            placeholder="Max"
            onChange={(e) => setFilterBonusRange([filterBonusRange[0], Number(e.target.value)])}
            className="filter-input"
        />
        <label className="text-white">Total Used:</label>
        <input
            type="number"
            placeholder="Min"
            onChange={(e) => setFilterTotalUsedRange([Number(e.target.value) || 0, filterTotalUsedRange[1]])}
            className="filter-input"
        />
        <span className="range-separator">to</span>
        <input
            type="number"
            placeholder="Max"
            onChange={(e) => setFilterTotalUsedRange([filterTotalUsedRange[0], Number(e.target.value) || Infinity])}
            className="filter-input"
        />
    </div>
    <div className="range-filter">
        <label className="text-white">Balance:</label>
        <input
            type="number"
            placeholder="Min"
            onChange={(e) => setFilterAvailableBalanceRange([Number(e.target.value) || 0, filterAvailableBalanceRange[1]])}
            className="filter-input"
        />
        <span className="range-separator">to</span>
        <input
            type="number"
            placeholder="Max"
            onChange={(e) => setFilterAvailableBalanceRange([filterAvailableBalanceRange[0], Number(e.target.value) || Infinity])}
            className="filter-input"
        />
    </div>
</div>

                {loadingFiltered ? (
                    <p>Loading filtered documents...</p>
                ) : (
                    <table className="table">
                        <thead>
                            <tr>
                                {/* <th>Company</th> */}
                                <th>ID Name</th>
                                <th>UPPER BALANCE</th>
                                <th>USED</th>
                                {/* <th>TYPE</th> */}
                                <th>BONUS</th>
                                <th>TOTAL USED</th>
                                <th>AVAILABLE BALANCE</th>
                            </tr>
                        </thead>
                        <tbody>
                        {filteredIDTableDocuments.map((doc, index) => {
                                const totalSum = doc.points_balance + doc.total_bonus;
                                const pointsDifference = doc.points - totalSum;
                                
                                return (
                                    <tr key={index} onClick={() => handleSecondaryRowClick(doc.id_name)}>
                                        {/* <td>{doc.admin_name}</td> */}
                                        <td>{doc.id_name}</td>
                                        <td>{doc.points}</td>
                                        <td>{doc.points_balance}</td>
                                        {/* <td>{doc.type}</td> */}
                                        <td>{doc.total_bonus.toLocaleString()}</td>
                                        <td>{totalSum}</td>
                                        <td>{pointsDifference}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                        <tfoot>
    <tr className="totalRow">
        <td colSpan="1">Totals</td>
        <td>{filteredIDTableDocuments.reduce((acc, doc) => acc + doc.points, 0).toLocaleString()}</td>
        <td>{filteredIDTableDocuments.reduce((acc, doc) => acc + doc.points_balance, 0).toLocaleString()}</td>
        <td>{filteredIDTableDocuments.reduce((acc, doc) => acc + doc.total_bonus, 0).toLocaleString()}</td>
        <td>{filteredIDTableDocuments.reduce((acc, doc) => acc + doc.points_balance + doc.total_bonus, 0).toLocaleString()}</td>
        <td>{filteredIDTableDocuments.reduce((acc, doc) => acc + (doc.points - (doc.points_balance + doc.total_bonus)), 0).toLocaleString()}</td>
    </tr>
</tfoot>
                    </table>
                )}

                <div className="charts-container">
                    {/* <div className="chart-wrapper">
                        <h3 className="text-white text-center">Type Distribution</h3>
                        <Pie data={pieChartData} />
                    </div> */}
                    <div className="chart-wrapper">
                        <h3 className="text-white text-center">Points and Bonus</h3>
                        <Bar data={barChartData} options={{ responsive: true, plugins: { legend: { position: 'top' } } }} />
                    </div>
                    <div className="chart-wrapper">
                        <h3 className="text-white text-center">Opening Balance Trend</h3>
                        <Line data={lineChartData} options={{ responsive: true, plugins: { legend: { position: 'top' } } }} />
                    </div>
                </div>
            </div>
        </>
    );
};

export default DatabaseDetails;
