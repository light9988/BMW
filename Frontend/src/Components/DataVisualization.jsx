import React, { useState } from 'react';
import './DataVisualization.css';
import Chart from 'chart.js/auto';


const DataVisualizationPage = () => {
    const [isDataUploaded, setIsDataUploaded] = useState(false);
    // const [selectedVariable, setSelectedVariable] = useState('');
    const [selectedVariable, setSelectedVariable] = useState([]);
    const [selectedVisualization, setSelectedVisualization] = useState('');
    const [filterVariableOptions, setFilterVariableOptions] = useState([]);
    const [chartInstance, setChartInstance] = useState(null);
    const [selectedData, setSelectedData] = useState([]);

    // Function to send file content to backend
    const sendDataToBackend = async (data) => {
        try {
            const response = await fetch('/upload', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ data })
            });

            if (response.ok) {
                const responseData = await response.json();
                console.log('Backend response:', responseData);
                setFilterVariableOptions(responseData.columnNames);
                setSelectedData(responseData.data); 
                handleCreateGraph();
                // console.log(responseData.message);
            } else {
                console.error('Failed to upload data:', response.statusText);
            }
        } catch (error) {
            console.error('Failed to upload data:', error);
        }
    };

    const handleUpload = async (event) => {
        const file = event.target.files[0];
        const reader = new FileReader();

        reader.onload = async (e) => {
            const content = e.target.result;
            const rows = content.split('\n');

            // Extract column names from the first row
            const columnNames = rows[0].split(',');

            // Set the extracted column names as options for filter variable
            setFilterVariableOptions(columnNames);

            // Send file content to backend
            await sendDataToBackend(content);

            setIsDataUploaded(true);
        };

        reader.readAsText(file);
    };

    // const handleVariableChange = (event) => {
    //     setSelectedVariable(event.target.value);
    // };
    const handleVariableChange = (event) => {
        const options = event.target.options;
        const selectedValues = [];
        for (let i = 0; i < options.length; i++) {
            if (options[i].selected) {
                selectedValues.push(options[i].value);
            }
        }

          const selectedRowIndices = [ ]; 
          const extractedData = responseData.data.filter((_, index) => selectedRowIndices.includes(index));
        setSelectedVariable(selectedValues);
        setSelectedData(extractedData);
        handleCreateGraph();
    };


    const handleVisualizationChange = (event) => {
        setSelectedVisualization(event.target.value);
    };
    // const handleVisualizationChange = (event) => {
    //     const selectedType = event.target.value;

    //     switch (selectedType) {
    //         case 'Line':
    //             createLineChart();
    //             break;
    //         case 'Bar':
    //             createBarChart();
    //             break;
    //         case 'Pie':
    //             createPieChart();
    //             break;
    //         case 'Scatter':
    //             createScatterChart();
    //             break;
    //         default:
    //             console.error('Invalid chart type selected');
    //             break;
    //     }
    // };

// Function to create graph based on selected options
const createGraph = (selectedType, selectedVariable,selectedData, filterVariableOptions) => {
    const canvas = document.createElement('canvas');

    document.body.appendChild(canvas);

    const data = {
        labels: filterVariableOptions,
        datasets: [{
            label: selectedVariable,
            data: selectedData,
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            borderColor: 'rgba(255, 99, 132, 1)',
            borderWidth: 1
        }]
    };

    let chart;
    switch (selectedType) {
        case 'Line':
            chart = new Chart(canvas, {
                type: 'line',
                data: data,
                options: {
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
            break;
        case 'Bar':
            chart = new Chart(canvas, {
                type: 'bar',
                data: data,
                options: {
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
            break;
        case 'Pie':
            chart = new Chart(canvas, {
                type: 'pie',
                data: data
            });
            break;
        case 'Scatter':
            chart = new Chart(canvas, {
                type: 'scatter',
                data: data,
                options: {
                    scales: {
                        x: {
                            type: 'linear',
                            position: 'bottom'
                        },
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
            break;
        default:
            console.error('Invalid chart type selected');
            break;
    }

    return chart;
};
    
    const handleCreateGraph = () => {
        if (!selectedVisualization || !selectedVariable.length) {
            console.error('Please select a graph type and variable(s)');
            return;
        }

        if (chartInstance) {
            chartInstance.destroy();
        }

        const newChartInstance = createGraph(selectedVisualization, selectedVariable, filterVariableOptions);
        setChartInstance(newChartInstance);
    };

    return (
        <div className="container">
            <div className="nav-bar">
                <div className='import-data'>
                    <h4 className="import-data-title">Import Data <span className="required">*</span></h4>
                    <input className='choose-file' type="file" onChange={handleUpload} />
                    {isDataUploaded && <p>Data successfully uploaded</p>}
                </div>
                <div className='select-variable'>
                    <h4 className="select-variable-title">Select Variable <span className="required">*</span></h4>
                    {/* <select value={selectedVariable} onChange={handleVariableChange}> */}
                    <select multiple={true} className='select-variable-box' value={selectedVariable} onChange={handleVariableChange}>
                        <option value="">Select variable</option>
                        {filterVariableOptions.map(variable => (
                            <option key={variable} value={variable}>{variable}</option>
                        ))}
                    </select>
                </div>
                <div className="select-type">
                    <h4 className="select-type-title">Select Graph Type <span className="required">*</span></h4>
                    <select value={selectedVisualization} onChange={handleVisualizationChange}>
                        <option value="">Select Type</option>
                        <option value="Line">Line</option>
                        <option value="Bar">Bar</option>
                        <option value="Pie">Pie</option>
                        <option value="Scatter">Scatter</option>
                    </select>
                </div>
                <button onClick={handleCreateGraph}>Create Graph</button>
            </div>

            <div className="graph">
                <h2 className="graph-title">Graph</h2>
                <canvas className='chart' id="canvas"></canvas>
            </div>
        </div>
    );
};
export default DataVisualizationPage;

//     return (
//         <div className="container">
//             <div className="nav-bar">
//                 <div className='import-data'>
//                     <label htmlFor={`${id}-title`} >Import Data <span className="required">*</span></label>
//                     <input type="file" className='import-data_input' id={`${id}-import`} onChange={handleUpload} />
//                     {isDataUploaded && <p>Data successfully uploaded</p>}
//                 </div>
//                 <div className='select-variable'>
//                     <label htmlFor={`${id}-select-variable`}>Filter Variable <span className="required">*</span></label>
//                     <select name="select-variable" id={`${id}-select-variable`} value={selectedVariable} onChange={handleVariableChange}>
//                         {/* Options for variable selection */}
//                     </select>
//                 </div>
//                 <div className="select--type">
//                         <label htmlFor={`${id}-select-type`}>Choose Visualization Type <span className="required">*</span></label>
//                         <select name="select-type" id={`${id}-select-type`} value={selectedVisualization} onChange={handleVisualizationChange} required>
//                             <option value="Line">Line</option>
//                             <option value="Coloumn">Coloumn</option>
//                             <option value="Pie">Pie</option>
//                             <option value="Scatter">Scatter</option>
//                         </select>
//                     </div>
//             </div>

//             <div className='graph'>
//             <label htmlFor={`${id}-graph`} >Graph</label>
//             </div>

//         </div>
//     );
// };


