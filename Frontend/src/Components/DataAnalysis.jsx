import React, { useState, useEffect, useRef, useContext } from 'react';
import './DataAnalysis.css';
import Chart from 'chart.js/auto';
import Papa from 'papaparse';

const DataAnalysisPage = () => {
    const [isDataUploaded, setIsDataUploaded] = useState(false);
    const [selectedVariable, setSelectedVariable] = useState('');
    // const [selectedVariable, setSelectedVariable] = useState([]);
    const [selectedGraphType, setSelectedGraphType] = useState('');
    const [filterVariableOptions, setFilterVariableOptions] = useState([]);
    const [chartInstance, setChartInstance] = useState(null);
    const [selectedData, setSelectedData] = useState([]);
    const [filterDataOptions, setFilterDataOptions] = useState([]);
    const [selectedColor, setSelectedColor] = useState('#000000');

    // Function to send file content to backend
    const sendDataToBackend = async (formData) => {
        try {
            const response = await fetch('http://127.0.0.1:8000/upload', {
                method: 'POST',
                // headers: {
                //     'Content-Type': 'application/json', 
                // },
                body: formData,
                // mode: 'cors'
            });

            if (response.ok) {
                const responseData = await response.json();
                console.log('Backend response:', responseData);

                // setFilterVariableOptions(responseData.responseData.columnNames);
                // console.log('filterVariableOptions in sendDataToBackend:', filterVariableOptions);

                // setSelectedData(responseData.responseData.data);
                // console.log("selectedData in sendDataToBackend:", selectedData);
                return responseData;
            } else {
                console.error('Failed to receive responseData:', response.statusText);
            }
        } catch (error) {
            console.error('Failed to upload data:', error);
        }
    };

    // Function to upload data
    const importedData = [];
    const handleUpload = (event) => {
        const file = event.target.files[0];
        console.log("File:", file);
        const reader = new FileReader();

        reader.onload = async (e) => {
            const content = e.target.result;

            const csvResults = Papa.parse(content);
            console.log("CSV Results:", csvResults);

            const columnNames = csvResults.data[0];
            console.log("columnNames in handleUpload:", columnNames);

            const data = csvResults.data.slice(1);
            console.log("Column values in handleUpload:", data);

            setIsDataUploaded(true);
            columnNames.forEach((columnName, index) => {
                const columnData = data.map(row => row[index]);
                importedData.push({
                    variable: columnName,
                    data: columnData
                });
            });

            setFilterVariableOptions(columnNames);
            setFilterDataOptions(importedData.map(entry => entry.data));

            const formData = new FormData();
            formData.append('file', file);
            console.log("Data to be sent:", formData);

            await sendDataToBackend(formData);
        };
        reader.readAsText(file);
    };
    console.log("FilterVariableOptions after handleUpload:", filterVariableOptions);
    console.log("FilterDataOptions after handleUpload:", filterDataOptions);

    // Function to select variable
    const handleVariableChange = (event) => {
        console.log("event in handleVariableChange", event);

        const selectedVariable = event.target.value;
        setSelectedVariable(selectedVariable);
        console.log("SelectedVariable in handleVariableChange:", selectedVariable);

        const selectedColumnIndex = filterVariableOptions.indexOf(selectedVariable);
        console.log("selectedColumnIndex in handleVariableChange:", selectedColumnIndex);
        if (selectedColumnIndex !== -1) {
            setSelectedData(filterDataOptions[selectedColumnIndex]);
        } else {
            console.error('Selected variable not found in handleVariableChange:', selectedVariable);
        }
    };
    console.log("SelectedData in handleVariableChange:", selectedData);

    // Function to select graph type
    function handleGraphTypeChange(event) {
        setSelectedGraphType(event.target.value);
    }
    console.log("SelectedGraphType in handleGraphChange:", selectedGraphType);

    // Function to select color
    const handleColorChange = (event) => {
        setSelectedColor(event.target.value);
    };
    console.log("SelectedColor in handleColorChange:", selectedColor);

    // Function to create graph
    const handleCreateGraph = () => {
        if (!selectedVariable.length || !selectedGraphType) {
            console.error('Please select variable and a graph type');
            return;
        }

        if (chartInstance) {
            chartInstance.destroy();
        }

        const newChartInstance = createGraph(selectedVariable, selectedData, selectedGraphType, selectedColor);
        setChartInstance(newChartInstance);
    };

    // Function to create graph based on selected options
    const createGraph = (selectedVariable, selectedData, selectedGraphType, selectedColor) => {
        // const canvas = document.createElement('canvas');
        const canvas = document.getElementById('canvas');
        const ctx = canvas.getContext("2d");

        const data = {
            labels: selectedData,
            datasets: [{
                label: selectedVariable,
                data: selectedData,
                backgroundColor: selectedColor,
                borderColor: selectedColor,
                borderWidth: 1
            }]
        };

        function calculateAverage(data) {
            const sum = data.reduce((acc, val) => acc + val, 0);
            return sum / data.length;
        }
        const customPlugin = {
            afterDraw: function (chart) {
                console.log('Custom plugin is executed');
                const ctx = chartInstance.ctx;
                const xAxis = chart.scales['x'];
                const yAxis = chart.scales['y'];
                const minIndex = selectedData.indexOf(Math.min(...selectedData));
                const maxIndex = selectedData.indexOf(Math.max(...selectedData));
                const avgValue = calculateAverage(selectedData);
        
                ctx.beginPath();
                ctx.fillStyle = 'yellow';
                ctx.arc(xAxis.getPixelForValue(minIndex), yAxis.getPixelForValue(selectedData[minIndex]), 8, 0, 2 * Math.PI);
                ctx.arc(xAxis.getPixelForValue(maxIndex), yAxis.getPixelForValue(selectedData[maxIndex]), 8, 0, 2 * Math.PI);
                ctx.fill();
        
                ctx.beginPath();
                ctx.strokeStyle = 'red';
                ctx.lineWidth = 2;
                ctx.moveTo(xAxis.left, yAxis.getPixelForValue(calculateAverage));
                ctx.lineTo(xAxis.right, yAxis.getPixelForValue(calculateAverage));
                ctx.stroke();
            }
        };

        const options = {
            scales: {
                y: {
                    type: 'logarithmic',
                    beginAtZero: false, 
                    min: Math.min(...selectedData), 
                    max: Math.max(...selectedData), 
                }
            },
            plugins: {
                customPlugin,
            }
        };

        let chartInstance;
        switch (selectedGraphType) {
            case 'Line':
                chartInstance = new Chart(ctx, {
                    type: 'line',
                    data: data,
                    // options: {
                    //     scales: {
                    //         y: {
                    //             c
                    //             beginAtZero: false,
                    //         }
                    //     }
                    // }
                    options: options,
                });
                break;
            case 'Bar':
                chartInstance = new Chart(ctx, {
                    type: 'bar',
                    data: data,
                    options: {
                        scales: {
                            y: {
                                type: 'logarithmic',
                                beginAtZero: false
                            }
                        }
                    }
                });
                break;
            case 'Pie':
                chartInstance = new Chart(ctx, {
                    type: 'pie',
                    data: data
                });
                break;
            case 'Scatter':
                chartInstance = new Chart(ctx, {
                    type: 'scatter',
                    data: data,
                    options: {
                        scales: {
                            x: {
                                type: 'linear',
                                position: 'bottom'
                            },
                            y: {
                                beginAtZero: false
                            }
                        }
                    }
                });
                break;
            default:
                console.error('Invalid chart type selected');
                break;
        }

        return chartInstance;
    };

    const handleClearGraph = () => {
        if (chartInstance) {
            chartInstance.destroy();
        }
        setChartInstance(null);
        setSelectedGraphType('');
        setSelectedColor('');
    };
    

    return (
        <div className="container">
            <div className="nav-bar">
                <div className='import-data'>
                    <h4 className="import-data-title">Import Data <span className="required">*</span></h4>
                    <input className='choose-file' id='choose-file' type="file" onChange={handleUpload} />
                    {isDataUploaded && <p>File uploaded successfully</p>}
                </div>
                <div className='select-variable'>
                    <h4 className="select-variable-title">Select Variable <span className="required">*</span></h4>
                    <select value={selectedVariable} onChange={handleVariableChange}>
                        {/* <select multiple={true} className='select-variable-box' value={selectedVariable} onChange={handleVariableChange}> */}
                        <option value="">Select Variable</option>
                        {filterVariableOptions && filterVariableOptions.map(variable => (
                            <option key={variable} value={variable}>{variable}</option>
                        ))}
                    </select>
                </div>
                <div className='selected-data'>
                    <h4 className="selected-data-title">Selected Data</h4>
                    {/* <p style={{ whiteSpace: 'pre-line' }}>{selectedVariable ? selectedData.slice(0, 5).join('\n') + (selectedData.length > 5 ? '\n...' : '') : 'No variable selected'}</p> */}
                    <textarea readOnly rows={10} cols={18} style={{ resize: 'none' }} value={selectedVariable ? selectedData.join('\n') : 'No variable selected'} />
                </div>
                <div className="select-type">
                    <h4 className="select-type-title">Select Graph Type <span className="required">*</span></h4>
                    <select value={selectedGraphType} onChange={handleGraphTypeChange}>
                        <option value="">Select Type</option>
                        <option value="Line">Line</option>
                        <option value="Bar">Bar</option>
                        <option value="Pie">Pie</option>
                        <option value="Scatter">Scatter</option>
                    </select>
                </div>
                <div className="select-color">
                    <h4 className="select-color-title">Select Color <span className="required">*</span></h4>
                    <select value={selectedColor} onChange={handleColorChange}>
                        <option value="">Select Color</option>
                        <option value="Red">Red</option>
                        <option value="Yellow">Yellow</option>
                        <option value="Green">Green</option>
                        <option value="Blue">Blue</option>
                        <option value="Purple">Purple</option>
                        <option value="Black">Black</option>
                        <option value="Orange">Orange</option>
                    </select>
                </div>
                <button onClick={handleCreateGraph}>Create Graph</button>
                <button onClick={handleClearGraph}>Clear Graph</button>
            </div>

            <div className="graph">
                <h2 className="graph-title">Graph</h2>
                <canvas id="canvas"></canvas>
            </div>

        </div>
    );
};
export default DataAnalysisPage;

