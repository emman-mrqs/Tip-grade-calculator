// Global variable to track the currently selected calculation period
        let currentPeriod = 'none';

        document.addEventListener('DOMContentLoaded', () => {
            // Initial setup: hide all input sections
            document.getElementById('prelim_inputs').classList.add('hidden');
            document.getElementById('midterm_inputs').classList.add('hidden');
            document.getElementById('final_inputs').classList.add('hidden');
            document.getElementById('main_result_display').classList.add('hidden');
        });

        // Helper function to truncate a number to a specific decimal place
        function truncateDecimals(num, decimals) {
            const factor = Math.pow(10, decimals);
            return Math.floor(num * factor) / factor;
        }

        // Function to control section visibility based on dropdown selection
        function showSection(period) {
            currentPeriod = period;
            const inputs = ['prelim_inputs', 'midterm_inputs', 'final_inputs'];
            
            // Hide all inputs and the main result display initially
            inputs.forEach(id => document.getElementById(id).classList.add('hidden'));
            document.getElementById('main_result_display').classList.add('hidden');

            if (period !== 'none') {
                document.getElementById(`${period}_inputs`).classList.remove('hidden');
            }

            // Recalculate based on the new selection
            updateGrades();
        }

        // Function 1: Percentage Transmutation (50/50 rule)
        function transmute(rawScore, hps) {
            if (hps <= 0 || rawScore < 0) return 0;
            // Formula: [ (Raw Score / Highest Possible Score) * 50 ] + 50
            let percentage = (rawScore / hps) * 50 + 50;
            // IMPORTANT: Truncate the Exam Percentage Score to 2 decimal places before use (common practice)
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

        // Function 3: Main calculation logic
        function updateGrades() {
            let finalCalculatedGrade = 0;
            let displayTitle = "Calculated Grade";
            const resultBox = document.getElementById('main_result_display');
            const equivalentBox = document.getElementById('equivalent_grade_box');

            // Reset result display
            resultBox.classList.add('hidden');
            equivalentBox.classList.add('hidden');
            resultBox.className = 'p-8 mt-8 rounded-2xl text-white text-center shadow-2xl'; // Reset color classes

            if (currentPeriod === 'prelim') {
                const p_hps = parseFloat(document.getElementById('prelim_hps').value) || 0;
                const p_rs = parseFloat(document.getElementById('prelim_rs').value) || 0;
                const p_cs = parseFloat(document.getElementById('prelim_cs').value) || 0;

                const prelimExamGrade = transmute(p_rs, p_hps);
                document.getElementById('prelim_exam_result').textContent = prelimExamGrade.toFixed(2) + '%';
                
                // Prelim Grade = 0.50 Prelim Exam + 0.50 Class Standing for Prelim
                let rawResult = 0.50 * prelimExamGrade + 0.50 * Math.min(100, p_cs);
                // Truncate the final grade for the Prelim to 2 decimal places
                finalCalculatedGrade = truncateDecimals(rawResult, 2);

                displayTitle = "Prelim Grade";
                resultBox.classList.add('bg-indigo-600');
                if (finalCalculatedGrade > 0) resultBox.classList.remove('hidden');

            } else if (currentPeriod === 'midterm') {
                const prelimGrade = parseFloat(document.getElementById('midterm_prereq_prelim_grade').value) || 0;
                const m_hps = parseFloat(document.getElementById('midterm_hps').value) || 0;
                const m_rs = parseFloat(document.getElementById('midterm_rs').value) || 0;
                const m_cs = parseFloat(document.getElementById('midterm_cs').value) || 0;

                const midtermExamGrade = transmute(m_rs, m_hps);
                document.getElementById('midterm_exam_result').textContent = midtermExamGrade.toFixed(2) + '%';

                // Midterm Class Standing Component = 0.50 Midterm Exam + 0.50 Class Standing for Midterm
                const midtermCSComponent = 0.50 * midtermExamGrade + 0.50 * Math.min(100, m_cs);

                // Midterm Grade = (1/3) * Prelim Grade + (2/3) * (Midterm CS Component)
                let rawResult = (1 / 3) * Math.min(100, prelimGrade) + (2 / 3) * midtermCSComponent;
                // Truncate the final grade for the Midterm to 2 decimal places
                finalCalculatedGrade = truncateDecimals(rawResult, 2);

                displayTitle = "Midterm Grade";
                resultBox.classList.add('bg-purple-600');
                if (finalCalculatedGrade > 0) resultBox.classList.remove('hidden');
            
            } else if (currentPeriod === 'final') {
                const midtermGrade = parseFloat(document.getElementById('final_prereq_midterm_grade').value) || 0;
                const f_hps = parseFloat(document.getElementById('final_hps').value) || 0;
                const f_rs = parseFloat(document.getElementById('final_rs').value) || 0;
                const f_cs = parseFloat(document.getElementById('final_cs').value) || 0;

                const finalExamGrade = transmute(f_rs, f_hps);
                document.getElementById('final_exam_result').textContent = finalExamGrade.toFixed(2) + '%';

                // Final Class Standing Component = 0.50 Final Exam + 0.50 Class Standing for Finals
                const finalCSComponent = 0.50 * finalExamGrade + 0.50 * Math.min(100, f_cs);

                // Final Grade = (1/3) * Midterm Grade + (2/3) * (Final CS Component)
                let rawResult = (1 / 3) * Math.min(100, midtermGrade) + (2 / 3) * finalCSComponent;
                // Truncate the final grade for the Final to 2 decimal places
                finalCalculatedGrade = truncateDecimals(rawResult, 2);
                
                displayTitle = "Final Grade";
                resultBox.classList.add('bg-green-600');
                if (finalCalculatedGrade > 0) {
                    resultBox.classList.remove('hidden');
                    // Display Equivalent Grade for the final output
                    const equivalentGrade = getEquivalentGrade(finalCalculatedGrade);
                    document.getElementById('overall_equivalent_result').textContent = equivalentGrade;
                    equivalentBox.classList.remove('hidden');
                }
            }

            document.getElementById('result_title').textContent = displayTitle;
            document.getElementById('main_grade_result').textContent = finalCalculatedGrade.toFixed(2);
        }