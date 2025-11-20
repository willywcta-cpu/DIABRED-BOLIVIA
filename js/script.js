/**
 * DIABRED BOLIVIA - Interactive Risk Predictor
 * Educational tool for glycemic risk assessment
 */

// Chart instance
let riskChart = null;

// Risk calculation model based on epidemiological data
function calculateGlycemicRisk(inputs) {
    const factors = {
        food: 0,
        activity: 0,
        stress: 0,
        sleep: 0
    };
    
    const hoursSinceMeal = parseFloat(inputs.hoursSinceMeal) || 0;
    const sleepHours = parseFloat(inputs.sleepHours) || 8;
    const activityLevel = inputs.activityLevel;
    const stressLevel = inputs.stressLevel;
    const diabetesType = inputs.diabetesType;
    
    // Factor 1: Time since last meal (Food timing)
    // Risk increases with longer fasting periods, especially for type 1
    if (hoursSinceMeal <= 2) {
        factors.food = 1; // Very low risk
    } else if (hoursSinceMeal <= 4) {
        factors.food = 3; // Low risk
    } else if (hoursSinceMeal <= 6) {
        factors.food = 6; // Moderate risk
    } else if (hoursSinceMeal <= 8) {
        factors.food = 8; // High risk
    } else {
        factors.food = 10; // Very high risk
    }
    
    // Factor 2: Physical activity level
    // Moderate to intense exercise can lower glucose, but combined with fasting increases hypoglycemia risk
    switch(activityLevel) {
        case 'sedentary':
            factors.activity = 2; // Low risk, but sedentary lifestyle is a risk factor
            break;
        case 'light':
            factors.activity = 1; // Very low risk
            break;
        case 'moderate':
            factors.activity = 5; // Moderate risk if combined with fasting
            break;
        case 'intense':
            factors.activity = 7; // High risk, especially with fasting
            break;
        default:
            factors.activity = 3;
    }
    
    // Factor 3: Stress level
    // High stress increases cortisol, which raises blood glucose
    switch(stressLevel) {
        case 'low':
            factors.stress = 1; // Very low risk
            break;
        case 'moderate':
            factors.stress = 4; // Moderate risk
            break;
        case 'high':
            factors.stress = 8; // High risk
            break;
        default:
            factors.stress = 3;
    }
    
    // Factor 4: Sleep duration
    // Poor sleep affects glucose metabolism and insulin sensitivity
    if (sleepHours >= 8) {
        factors.sleep = 1; // Optimal
    } else if (sleepHours >= 7) {
        factors.sleep = 2; // Good
    } else if (sleepHours >= 6) {
        factors.sleep = 5; // Moderate risk
    } else if (sleepHours >= 4) {
        factors.sleep = 7; // High risk
    } else {
        factors.sleep = 9; // Very high risk
    }
    
    // Calculate aggregate risk score (0-10 scale)
    const aggregateScore = (factors.food + factors.activity + factors.stress + factors.sleep) / 4;
    
    // Determine risk level based on combination of factors
    let riskLevel = 'Bajo';
    let riskScore = aggregateScore;
    const reasons = [];
    const recommendations = [];
    
    // Special considerations for diabetes type
    if (diabetesType === 'type1') {
        if (hoursSinceMeal > 6) {
            riskLevel = 'Alto';
            riskScore = Math.min(10, aggregateScore + 2);
            reasons.push('Tipo 1 con ayuno prolongado (>6h): riesgo muy alto de hipoglucemia.');
            recommendations.push('Considere un snack con carbohidratos antes de períodos prolongados sin comer.');
        } else if (hoursSinceMeal > 4 && (activityLevel === 'moderate' || activityLevel === 'intense')) {
            riskLevel = 'Alto';
            riskScore = Math.min(10, aggregateScore + 1.5);
            reasons.push('Tipo 1 con ayuno >4h y actividad física: mayor riesgo de hipoglucemia.');
            recommendations.push('Si va a ejercitar, consuma 15-30g de carbohidratos antes del ejercicio.');
        }
    }
    
    // Activity + Fasting combination
    if (hoursSinceMeal > 4 && (activityLevel === 'moderate' || activityLevel === 'intense')) {
        if (riskLevel !== 'Alto') riskLevel = 'Moderado';
        riskScore = Math.min(10, riskScore + 1);
        reasons.push('Ayuno >4h combinado con actividad moderada/intensa aumenta el riesgo de hipoglucemia.');
        recommendations.push('Si va a hacer ejercicio después de 4+ horas sin comer, consuma un snack ligero primero.');
    }
    
    // Sleep + Stress combination
    if (sleepHours < 6 && stressLevel === 'high') {
        if (riskLevel !== 'Alto') riskLevel = 'Moderado';
        riskScore = Math.min(10, riskScore + 1);
        reasons.push('Sueño <6h y estrés alto: mayor probabilidad de hiperglucemia por cortisol elevado.');
        recommendations.push('Priorice el descanso y técnicas de manejo del estrés. Monitoree su glucosa más frecuentemente.');
    }
    
    // Type 2 + Sedentary + High Stress
    if (diabetesType === 'type2' && activityLevel === 'sedentary' && stressLevel === 'high') {
        if (riskLevel !== 'Alto') riskLevel = 'Moderado';
        riskScore = Math.min(10, riskScore + 0.5);
        reasons.push('Tipo 2 + sedentarismo + estrés alto: factor para incremento de HbA1c a largo plazo.');
        recommendations.push('Incorpore actividad física ligera diaria (caminar 30 min) y técnicas de relajación.');
    }
    
    // Aggregate score thresholds
    if (riskLevel === 'Bajo' && aggregateScore >= 6) {
        riskLevel = 'Moderado';
        reasons.push('Combinación de factores indica riesgo incrementado.');
    }
    
    if (aggregateScore >= 7.5 || riskScore >= 7.5) {
        riskLevel = 'Alto';
        reasons.push('Puntuación agregada elevada indica necesidad de atención médica.');
    }
    
    // Additional recommendations based on individual factors
    if (sleepHours < 6) {
        recommendations.push('Intente dormir al menos 7-8 horas por noche para mejorar el control glucémico.');
    }
    
    if (stressLevel === 'high') {
        recommendations.push('Practique técnicas de relajación (respiración profunda, meditación) para reducir el estrés.');
    }
    
    if (activityLevel === 'sedentary') {
        recommendations.push('Incorpore actividad física ligera diaria, como caminar 30 minutos.');
    }
    
    if (hoursSinceMeal > 6) {
        recommendations.push('Evite períodos prolongados sin comer. Considere comidas pequeñas y frecuentes.');
    }
    
    return {
        factors,
        riskLevel,
        riskScore: Math.round(riskScore * 10) / 10,
        aggregateScore: Math.round(aggregateScore * 10) / 10,
        reasons,
        recommendations
    };
}

// Display results
function displayResults(result) {
    const resultsContent = document.getElementById('resultsContent');
    const resultsPlaceholder = document.getElementById('resultsPlaceholder');
    const riskBadge = document.getElementById('riskBadge');
    const riskScore = document.getElementById('riskScore');
    const riskFactors = document.getElementById('riskFactors');
    const recommendations = document.getElementById('recommendations');
    
    // Show results, hide placeholder
    resultsPlaceholder.style.display = 'none';
    resultsContent.style.display = 'flex';
    
    // Set risk badge
    riskBadge.textContent = result.riskLevel.toUpperCase();
    riskBadge.className = `risk-badge ${result.riskLevel.toLowerCase()}`;
    
    // Set risk score
    riskScore.innerHTML = `
        <div style="font-size: 1.5rem; color: var(--text-secondary); margin-bottom: 0.5rem;">Puntuación de Riesgo</div>
        <div style="font-size: 3rem; font-weight: 700; color: ${getRiskColor(result.riskLevel)};">${result.riskScore}</div>
        <div style="font-size: 1rem; color: var(--text-secondary); margin-top: 0.5rem;">de 10.0</div>
    `;
    
    // Set risk factors
    riskFactors.innerHTML = `
        <h4>Factores Contribuyentes:</h4>
        <ul>
            <li><strong>Alimentación:</strong> ${result.factors.food}/10 ${getFactorDescription('food', result.factors.food)}</li>
            <li><strong>Actividad Física:</strong> ${result.factors.activity}/10 ${getFactorDescription('activity', result.factors.activity)}</li>
            <li><strong>Estrés:</strong> ${result.factors.stress}/10 ${getFactorDescription('stress', result.factors.stress)}</li>
            <li><strong>Sueño:</strong> ${result.factors.sleep}/10 ${getFactorDescription('sleep', result.factors.sleep)}</li>
        </ul>
    `;
    
    // Set reasons and recommendations
    if (result.reasons.length > 0) {
        recommendations.innerHTML = `
            <h4>Análisis:</h4>
            <ul>
                ${result.reasons.map(reason => `<li>${reason}</li>`).join('')}
            </ul>
            ${result.recommendations.length > 0 ? `
                <h4 style="margin-top: 1rem;">Recomendaciones:</h4>
                <ul>
                    ${result.recommendations.map(rec => `<li>${rec}</li>`).join('')}
                </ul>
            ` : ''}
        `;
    } else {
        recommendations.innerHTML = `
            <h4>Estado:</h4>
            <p>Sus hábitos actuales muestran un riesgo bajo. Mantenga estos patrones saludables.</p>
            ${result.recommendations.length > 0 ? `
                <h4 style="margin-top: 1rem;">Recomendaciones Generales:</h4>
                <ul>
                    ${result.recommendations.map(rec => `<li>${rec}</li>`).join('')}
                </ul>
            ` : ''}
        `;
    }
    
    // Draw chart
    drawRiskChart(result.factors);
}

// Get risk color
function getRiskColor(riskLevel) {
    switch(riskLevel.toLowerCase()) {
        case 'alto':
            return '#ef4444';
        case 'moderado':
            return '#f59e0b';
        case 'bajo':
            return '#10b981';
        default:
            return '#6b7280';
    }
}

// Get factor description
function getFactorDescription(factor, value) {
    if (value <= 2) return '(Óptimo)';
    if (value <= 4) return '(Bueno)';
    if (value <= 6) return '(Moderado)';
    if (value <= 8) return '(Alto)';
    return '(Muy Alto)';
}

// Draw risk chart
function drawRiskChart(factors) {
    const ctx = document.getElementById('riskChart').getContext('2d');
    
    // Destroy existing chart
    if (riskChart) {
        riskChart.destroy();
    }
    
    // Create new chart
    riskChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Alimentación', 'Actividad', 'Estrés', 'Sueño'],
            datasets: [{
                label: 'Contribución al Riesgo',
                data: [factors.food, factors.activity, factors.stress, factors.sleep],
                backgroundColor: [
                    'rgba(37, 99, 235, 0.7)',
                    'rgba(139, 92, 246, 0.7)',
                    'rgba(245, 158, 11, 0.7)',
                    'rgba(16, 185, 129, 0.7)'
                ],
                borderColor: [
                    'rgb(37, 99, 235)',
                    'rgb(139, 92, 246)',
                    'rgb(245, 158, 11)',
                    'rgb(16, 185, 129)'
                ],
                borderWidth: 2,
                borderRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `Riesgo: ${context.parsed.y}/10`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 10,
                    ticks: {
                        stepSize: 2
                    },
                    title: {
                        display: true,
                        text: 'Nivel de Riesgo (0-10)'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Factores'
                    }
                }
            }
        }
    });
}

// Reset form
function resetForm() {
    document.getElementById('hoursSinceMeal').value = 2;
    document.getElementById('activityLevel').value = 'light';
    document.getElementById('stressLevel').value = 'low';
    document.getElementById('sleepHours').value = 8;
    document.getElementById('diabetesType').value = 'none';
    
    // Hide results
    document.getElementById('resultsContent').style.display = 'none';
    document.getElementById('resultsPlaceholder').style.display = 'flex';
    
    // Destroy chart
    if (riskChart) {
        riskChart.destroy();
        riskChart = null;
    }
}

// Validate inputs
function validateInputs() {
    const hoursSinceMeal = parseFloat(document.getElementById('hoursSinceMeal').value);
    const sleepHours = parseFloat(document.getElementById('sleepHours').value);
    
    if (isNaN(hoursSinceMeal) || hoursSinceMeal < 0 || hoursSinceMeal > 24) {
        alert('Por favor, ingrese un valor válido para las horas desde la última comida (0-24).');
        return false;
    }
    
    if (isNaN(sleepHours) || sleepHours < 0 || sleepHours > 24) {
        alert('Por favor, ingrese un valor válido para las horas de sueño (0-24).');
        return false;
    }
    
    return true;
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    // Calculate button
    const calculateBtn = document.getElementById('calculateBtn');
    if (calculateBtn) {
        calculateBtn.addEventListener('click', function() {
            if (!validateInputs()) return;
            
            const inputs = {
                hoursSinceMeal: document.getElementById('hoursSinceMeal').value,
                activityLevel: document.getElementById('activityLevel').value,
                stressLevel: document.getElementById('stressLevel').value,
                sleepHours: document.getElementById('sleepHours').value,
                diabetesType: document.getElementById('diabetesType').value
            };
            
            const result = calculateGlycemicRisk(inputs);
            displayResults(result);
            
            // Scroll to results
            document.getElementById('resultsContent').scrollIntoView({ 
                behavior: 'smooth', 
                block: 'nearest' 
            });
        });
    }
    
    // Reset button
    const resetBtn = document.getElementById('resetBtn');
    if (resetBtn) {
        resetBtn.addEventListener('click', resetForm);
    }
    
    // Smooth scroll for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Add animation on scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    document.querySelectorAll('.content-section').forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(20px)';
        section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(section);
    });
});


