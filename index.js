 // Global variable to track the currently selected calculation period
        let currentPeriod = 'none';

        // Global state to store the Class Standing structure for each period
        let csData = {
            prelim: [],
            midterm: [],
            final: []
        };
        
        // --- Core Grade Calculation Functions ---

        document.addEventListener('DOMContentLoaded', () => {
            // Initial setup: hide all input sections
            document.getElementById('prelim_inputs').classList.add('hidden');
            document.getElementById('midterm_inputs').classList.add('hidden');
            document.getElementById('final_inputs').classList.add('hidden');
            document.getElementById('main_result_display').classList.add('hidden');
            
            // Set initial state for CS components 
            // Default Prelim/Midterm: Quizzes (60), Assignments/Activities (40)
            csData.prelim = [{ id: 1, name: 'Quizzes', weight: 60, scores: [] }, { id: 2, name: 'Assignments/Activities', weight: 40, scores: [] }];
            csData.midterm = [{ id: 3, name: 'Quizzes', weight: 60, scores: [] }, { id: 4, name: 'Assignments/Activities', weight: 40, scores: [] }];
            
            // Default Final: Setup for recent example (e.g., all items under one component for simplicity, using 100% weight)
            // Example data based on user's last screenshot (Quiz 0/15 -> 50%, Recitation 15/15 -> 100%)
            csData.final = [{ 
                id: 5, 
                name: 'All CS Items', 
                weight: 100, 
                scores: [
                    { rs: 0, hps: 15 }, // Quiz 1 -> 50.00%
                    { rs: 0, hps: 15 }, // Quiz 2 -> 50.00%
                    { rs: 15, hps: 15 }, // Recitation 1 -> 100.00%
                    { rs: 15, hps: 15 } // Recitation 2 -> 100.00%
                ] 
            }];

            // Set default direct input values to 0
            document.getElementById('prelim_cs_direct').value = 0;
            document.getElementById('midterm_cs_direct').value = 0;
            document.getElementById('final_cs_direct').value = 75; // Set 75 as default based on user's CSF image
        });

        // Helper function to truncate a number to a specific decimal place
        function truncateDecimals(num, decimals) {
            if (isNaN(num) || !isFinite(num)) return 0;
            const factor = Math.pow(10, decimals);
            return Math.floor(num * factor) / factor;
        }
        
        // Function to toggle the visibility of the info box in the modal
        function toggleInfoBox() {
            const infoBox = document.getElementById('cs_info_box');
            infoBox.classList.toggle('hidden');
        }

        // Function 1: Percentage Transmutation (50/50 rule)
        function transmute(rawScore, hps) {
            if (hps <= 0) return 50.00; // If HPS is 0, the grade is effectively 50% (base/failed score)
            if (rawScore < 0) rawScore = 0;
            
            // Formula: [ (Raw Score / Highest Possible Score) * 50 ] + 50
            let percentage = (rawScore / hps) * 50 + 50;
            
            // Transmuted grade cannot exceed 100%
            if (percentage > 100) percentage = 100;

            // Truncate the Percentage Score to 2 decimal places before use
            return truncateDecimals(percentage, 2); 
        }

        // Function 2: Map Final Grade percentage to Equivalent Grade (from image_1a48e6.jpg)
        function getEquivalentGrade(percentage) {
            if (percentage >= 99.00) return '1.00 (Excellent)';
            if (percentage >= 96.00) return '1.25 (Superior)';
            if (percentage >= 93.00) return '1.50 (Meritorious)';
            if (percentage >= 90.00) return '1.75 (Very Good)';
            if (percentage >= 87.00) return '2.00 (Good)';
            if (percentage >= 84.00) return '2.25 (Very Satisfactory)';
            if (percentage >= 81.00) return '2.50 (Satisfactory)';
            if (percentage >= 78.00) return '2.75 (Fair)';
            if (percentage >= 75.00) return '3.00 (Passing)';
            if (percentage > 0) return '5.00 (Failed)';
            return 'N/A';
        }

        // Function to select CS input mode
        function selectCSMode(period, mode) {
            const directDiv = document.getElementById(`${period}_direct_input`);
            const manualDiv = document.getElementById(`${period}_manual_input`);
            
            if (mode === 'direct') {
                directDiv.classList.remove('hidden');
                manualDiv.classList.add('hidden');
            } else {
                directDiv.classList.add('hidden');
                manualDiv.classList.remove('hidden');
            }
            // Trigger update to use the newly selected mode's value
            updateGrades(); 
        }

        // Function 3: Main calculation logic
        function updateGrades() {
            let finalCalculatedGrade = 0;
            let displayTitle = "Calculated Grade";
            const resultBox = document.getElementById('main_result_display');
            const equivalentBox = document.getElementById('equivalent_grade_box');

            // Reset result display style and visibility
            resultBox.classList.add('hidden');
            equivalentBox.classList.add('hidden');
            resultBox.className = 'p-8 mt-8 rounded-2xl text-white text-center shadow-2xl'; // Reset color classes

            let current_cs_value = 0;
            
            if (currentPeriod !== 'none') {
                // Determine CS value based on selected mode
                const period_mode = document.querySelector(`input[name="${currentPeriod}_cs_mode"]:checked`)?.value || 'direct';

                if (period_mode === 'direct') {
                    current_cs_value = parseFloat(document.getElementById(`${currentPeriod}_cs_direct`).value) || 0;
                } else {
                    current_cs_value = parseFloat(document.getElementById(`${currentPeriod}_cs_computed`).value) || 0;
                }
            }


            if (currentPeriod === 'prelim') {
                const p_hps = parseFloat(document.getElementById('prelim_hps').value) || 0;
                const p_rs = parseFloat(document.getElementById('prelim_rs').value) || 0;
                
                const prelimExamGrade = transmute(p_rs, p_hps);
                document.getElementById('prelim_exam_result').textContent = prelimExamGrade.toFixed(2) + '%';
                
                // Prelim Grade = 0.50 Prelim Exam + 0.50 Class Standing for Prelim
                let rawResult = 0.50 * prelimExamGrade + 0.50 * Math.min(100, current_cs_value);
                finalCalculatedGrade = truncateDecimals(rawResult, 2);

                displayTitle = "Prelim Grade";
                resultBox.classList.add('bg-indigo-600');
                if (finalCalculatedGrade > 0) resultBox.classList.remove('hidden');

            } else if (currentPeriod === 'midterm') {
                const prelimGrade = parseFloat(document.getElementById('midterm_prereq_prelim_grade').value) || 0;
                const m_hps = parseFloat(document.getElementById('midterm_hps').value) || 0;
                const m_rs = parseFloat(document.getElementById('midterm_rs').value) || 0;

                const midtermExamGrade = transmute(m_rs, m_hps);
                document.getElementById('midterm_exam_result').textContent = midtermExamGrade.toFixed(2) + '%';

                // Midterm Class Standing Component = 0.50 Midterm Exam + 0.50 Class Standing for Midterm
                const midtermCSComponent = 0.50 * midtermExamGrade + 0.50 * Math.min(100, current_cs_value);

                // Midterm Grade = (1/3) * Prelim Grade + (2/3) * (Midterm CS Component)
                let rawResult = (1 / 3) * Math.min(100, prelimGrade) + (2 / 3) * midtermCSComponent;
                finalCalculatedGrade = truncateDecimals(rawResult, 2);

                displayTitle = "Midterm Grade";
                resultBox.classList.add('bg-purple-600');
                if (finalCalculatedGrade > 0) resultBox.classList.remove('hidden');
            
            } else if (currentPeriod === 'final') {
                const midtermGrade = parseFloat(document.getElementById('final_prereq_midterm_grade').value) || 0;
                const f_hps = parseFloat(document.getElementById('final_hps').value) || 0;
                const f_rs = parseFloat(document.getElementById('final_rs').value) || 0;

                const finalExamGrade = transmute(f_rs, f_hps);
                document.getElementById('final_exam_result').textContent = finalExamGrade.toFixed(2) + '%';

                // Final Class Standing Component = 0.50 Final Exam + 0.50 Class Standing for Finals
                const finalCSComponent = 0.50 * finalExamGrade + 0.50 * Math.min(100, current_cs_value);

                // Final Grade = (1/3) * Midterm Grade + (2/3) * (Final CS Component)
                let rawResult = (1 / 3) * Math.min(100, midtermGrade) + (2 / 3) * finalCSComponent;
                finalCalculatedGrade = truncateDecimals(rawResult, 2);
                
                displayTitle = "Final Grade";
                resultBox.classList.add('bg-green-600');
                if (finalCalculatedGrade > 0) {
                    resultBox.classList.remove('hidden');
                    const equivalentGrade = getEquivalentGrade(finalCalculatedGrade);
                    document.getElementById('overall_equivalent_result').textContent = equivalentGrade;
                    equivalentBox.classList.remove('hidden');
                }
            } else {
                document.getElementById('main_grade_result').textContent = '0.00';
            }

            document.getElementById('result_title').textContent = displayTitle;
            document.getElementById('main_grade_result').textContent = finalCalculatedGrade.toFixed(2);
        }

        // Function to control section visibility based on dropdown selection
        function showSection(period) {
            currentPeriod = period;
            const inputs = ['prelim_inputs', 'midterm_inputs', 'final_inputs'];
            
            inputs.forEach(id => document.getElementById(id).classList.add('hidden'));

            if (period !== 'none') {
                document.getElementById(`${period}_inputs`).classList.remove('hidden');
                // Ensure the default mode is applied when showing a section
                const defaultMode = document.querySelector(`input[name="${period}_cs_mode"]:checked`)?.value || 'direct';
                selectCSMode(period, defaultMode);
            }

            updateGrades();
        }


        // --- Class Standing Modal Logic ---

        let activePeriod = '';
        let nextComponentId = 7; // Start component IDs after initial 6

        function openCSModal(period) {
            activePeriod = period;
            renderCSComponents();
            document.getElementById('cs_modal').classList.remove('hidden');
        }

        function closeCSModal() {
            document.getElementById('cs_modal').classList.add('hidden');
            document.getElementById('modal_message').classList.add('hidden');
        }

        function renderCSComponents() {
            const container = document.getElementById('cs_components_container');
            const data = csData[activePeriod];
            let html = '';
            let totalWeight = 0;

            if (!data) return;

            data.forEach((component, index) => {
                totalWeight += component.weight;
                const componentId = component.id;
                
                // Calculate Transmuted Score Average for this component
                let totalTransmutedScore = 0;
                
                component.scores.forEach(score => {
                    totalTransmutedScore += transmute(parseFloat(score.rs) || 0, parseFloat(score.hps) || 0);
                });

                let componentAveragePercentage = component.scores.length > 0 ? totalTransmutedScore / component.scores.length : 0;
                let displayPercentage = truncateDecimals(componentAveragePercentage, 2);

                html += `
                    <div id="comp_${componentId}" class="p-4 border border-gray-200 rounded-xl bg-gray-50">
                        <div class="flex justify-between items-start mb-2">
                            <input type="text" id="comp_name_${componentId}" value="${component.name}" placeholder="Component Name (e.g., Quiz)" class="text-lg font-semibold w-2/5 p-1 rounded border" onchange="updateCSData(${componentId}, 'name', this.value)">
                            <div class="flex items-center space-x-2">
                                <label class="text-sm font-medium">Weight (%):</label>
                                <input type="number" id="comp_weight_${componentId}" value="${component.weight}" min="0" max="100" class="w-16 p-1 rounded border text-center" oninput="updateCSData(${componentId}, 'weight', this.value); updateCSWeightTotal()">
                                <button onclick="removeComponent(${componentId})" class="text-red-500 hover:text-red-700 text-sm font-bold">
                                    &times;
                                </button>
                            </div>
                        </div>

                        <div class="text-sm font-medium mb-3">
                            Average Transmuted Score: <span class="text-indigo-700 font-bold">${displayPercentage.toFixed(2)}%</span>
                            <span class="text-gray-500 text-xs"> (Avg. of ${component.scores.length} scores)</span>
                        </div>
                        
                        <div id="scores_container_${componentId}" class="space-y-2 pl-4 border-l">
                            <!-- Score Input Header -->
                            <div class="grid grid-cols-12 gap-1 text-xs font-semibold text-gray-500 pt-1 border-b pb-1">
                                <span class="col-span-3">Item</span>
                                <span class="col-span-3 text-center">Raw Score (RS)</span>
                                <span class="col-span-3 text-center">Total Items (HPS)</span>
                                <span class="col-span-3 text-center">Grade</span>
                            </div>
                            <!-- Scores for this component go here -->
                `;
                
                component.scores.forEach((score, scoreIndex) => {
                    const transmutedGrade = transmute(score.rs, score.hps);
                    html += `
                        <div class="grid grid-cols-12 gap-1 items-center text-sm py-1">
                            <label class="col-span-3">Score ${scoreIndex + 1}:</label>
                            <input type="number" value="${score.rs}" placeholder="RS" class="col-span-3 p-1 rounded border text-center" oninput="updateScoreData(${componentId}, ${scoreIndex}, 'rs', this.value)">
                            <input type="number" value="${score.hps}" placeholder="HPS" class="col-span-3 p-1 rounded border text-center" oninput="updateScoreData(${componentId}, ${scoreIndex}, 'hps', this.value)">
                            <span class="col-span-2 text-xs text-green-700 font-semibold text-center">= ${transmutedGrade.toFixed(2)}%</span>
                            <button onclick="removeScore(${componentId}, ${scoreIndex})" class="col-span-1 text-red-400 hover:text-red-600 text-xs font-bold p-1">&times;</button>
                        </div>
                    `;
                });

                html += `
                        </div>
                        <button onclick="addScore(${componentId})" class="mt-3 text-xs text-indigo-500 hover:text-indigo-700 font-semibold underline">
                            + Add Score to ${component.name}
                        </button>
                    </div>
                `;
            });

            container.innerHTML = html;
            updateCSWeightTotal(totalWeight);
        }

        function updateCSWeightTotal(currentTotal = 0) {
            if (currentTotal === 0) {
                // If not passed a total, recalculate from the data
                currentTotal = csData[activePeriod].reduce((sum, comp) => sum + (parseFloat(comp.weight) || 0), 0);
            }
            
            const totalDisplay = document.getElementById('cs_weight_total');
            totalDisplay.textContent = `${currentTotal.toFixed(0)}%`;
            
            // Highlight if total is not 100
            if (currentTotal.toFixed(0) != 100) {
                totalDisplay.classList.remove('text-yellow-900');
                totalDisplay.classList.add('text-red-600');
            } else {
                totalDisplay.classList.remove('text-red-600');
                totalDisplay.classList.add('text-yellow-900');
            }
        }

        function updateCSData(id, key, value) {
            const component = csData[activePeriod].find(c => c.id === id);
            if (component) {
                // Ensure name updates if it's not a number
                component[key] = (key === 'name' ? value : (parseFloat(value) || 0)); 
                renderCSComponents(); 
            }
        }

        function updateScoreData(componentId, scoreIndex, key, value) {
            const component = csData[activePeriod].find(c => c.id === componentId);
            if (component && component.scores[scoreIndex]) {
                component.scores[scoreIndex][key] = parseFloat(value) || 0;
                renderCSComponents(); 
            }
        }

        function addComponent() {
            const newComponent = {
                id: nextComponentId++,
                name: 'New Component',
                weight: 0,
                scores: []
            };
            csData[activePeriod].push(newComponent);
            renderCSComponents();
        }

        function removeComponent(id) {
            csData[activePeriod] = csData[activePeriod].filter(c => c.id !== id);
            renderCSComponents();
        }

        function addScore(componentId) {
            const component = csData[activePeriod].find(c => c.id === componentId);
            if (component) {
                component.scores.push({ rs: 0, hps: 0 });
                renderCSComponents();
            }
        }

        function removeScore(componentId, scoreIndex) {
            const component = csData[activePeriod].find(c => c.id === componentId);
            if (component) {
                component.scores.splice(scoreIndex, 1);
                renderCSComponents();
            }
        }

        function calculateAndSaveCS() {
            const data = csData[activePeriod];
            const totalWeight = data.reduce((sum, comp) => sum + (parseFloat(comp.weight) || 0), 0);
            const messageElement = document.getElementById('modal_message');
            messageElement.classList.add('hidden');

            if (totalWeight.toFixed(0) != 100) {
                messageElement.textContent = `Error: Total component weight must equal 100%. Current total: ${totalWeight.toFixed(0)}%.`;
                messageElement.classList.remove('hidden');
                return;
            }

            let finalClassStanding = 0;

            data.forEach(component => {
                let totalTransmutedScore = 0;
                
                // Calculate total transmuted score for all items in this component
                component.scores.forEach(score => {
                    totalTransmutedScore += transmute(parseFloat(score.rs) || 0, parseFloat(score.hps) || 0);
                });

                // The component average is the average of all transmuted scores
                const componentCount = component.scores.length;
                let componentAveragePercentage = componentCount > 0 ? totalTransmutedScore / componentCount : 0;
                
                // The final CS contribution is the average percentage weighted by the component's weight
                let weightedContribution = (componentAveragePercentage / 100) * (component.weight || 0);
                
                finalClassStanding += weightedContribution;
            });
            
            // Truncate the final Class Standing percentage to 2 decimal places
            const finalCSValue = truncateDecimals(finalClassStanding, 2);

            // 1. Update the hidden input value used for calculation
            document.getElementById(`${activePeriod}_cs_computed`).value = finalCSValue;
            
            // 2. Update the display text outside the modal
            document.getElementById(`${activePeriod}_cs_display`).textContent = `${finalCSValue.toFixed(2)}%`;

            // 3. Close modal and trigger main grade calculation
            closeCSModal();
            updateGrades(); 
        }
