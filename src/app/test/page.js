"use client";

import React, { useState } from 'react';

function Page() {
  const [showPopup, setShowPopup] = useState(false);
  const [idName, setIdName] = useState("");
  const [message, setMessage] = useState("");

  const handleButtonClick = () => {
    setShowPopup(true);
  };

  const handleClosePopup = () => {
    setShowPopup(false);
    setMessage("");
  };

  const handleSubmit = async () => {
    try {
      const response = await fetch("https://backend-accounting-d1352e11cad3.herokuapp.com/api/create_id_details/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id_name: idName }),
      });

      const data = await response.json();
      if (response.status === 201) {
        setMessage("Data inserted successfully!");
      } else {
        setMessage(data.error || "Failed to insert data");
      }
    } catch (error) {
      setMessage("An error occurred: " + error.message);
    }
  };

  return (
    <div className="card">
      <button className="circle-button" onClick={handleButtonClick}>+</button>

      {showPopup && (
        <div className="popup-overlay" onClick={handleClosePopup}>
          <div className="popup" onClick={(e) => e.stopPropagation()}>
            <h2>Enter Details</h2>
            <label htmlFor="idName">ID NAME</label>
            <input
              type="text"
              id="idName"
              name="idName"
              value={idName}
              onChange={(e) => setIdName(e.target.value)}
            />
            <button className="submit-button" onClick={handleSubmit}>Submit</button>
            <button className="close-button" onClick={handleClosePopup}>Close</button>
            {message && <p className="message">{message}</p>}
          </div>
        </div>
      )}

      <style jsx>{`
        /* Card Styles */
        .card {
          width: 300px;
          height: 200px;
          margin: 50px auto;
          background: linear-gradient(135deg, #1e3c72, #2a5298); /* Royal blue gradient */
          border-radius: 15px;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .circle-button {
          width: 60px;
          height: 60px;
          background-color: #ffffff;
          border: none;
          border-radius: 50%;
          font-size: 36px;
          color: #1e3c72; /* Match the gradient start color */
          cursor: pointer;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          outline: none;
          transition: background-color 0.3s ease, transform 0.2s ease;
        }

        .circle-button:hover {
          background-color: #d9e1f2; /* Lighter blue on hover */
          transform: scale(1.05);
        }

        /* Popup Overlay */
        .popup-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }

        /* Popup Window */
        .popup {
          background: linear-gradient(135deg, #1e3c72, #2a5298); /* Royal blue gradient */
          padding: 30px;
          border-radius: 15px;
          position: relative;
          width: 90%;
          max-width: 400px;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
          color: #ffffff;
        }

        .popup h2 {
          margin-top: 0;
          color: #ffffff;
        }

        .popup label {
          display: block;
          margin-bottom: 8px;
          font-weight: bold;
          color: #ffffff;
        }

        .popup input {
          width: 100%;
          padding: 10px;
          margin-bottom: 20px;
          border: none;
          border-radius: 5px;
          background-color: rgba(255, 255, 255, 0.2);
          color: #ffffff;
        }

        .popup input::placeholder {
          color: #f0f0f0;
        }

        .submit-button {
          background-color: #4caf50;
          color: #ffffff;
          padding: 10px 20px;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          font-weight: bold;
          margin-right: 10px;
          transition: background-color 0.3s ease;
        }

        .submit-button:hover {
          background-color: #45a049;
        }

        .close-button {
          background-color: #ffffff;
          color: #1e3c72; /* Match the gradient start color */
          padding: 10px 20px;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          font-weight: bold;
          transition: background-color 0.3s ease;
        }

        .close-button:hover {
          background-color: #d9e1f2; /* Lighter blue on hover */
        }

        .message {
          margin-top: 15px;
          font-weight: bold;
        }
      `}</style>
    </div>
  );
}

export default Page;
