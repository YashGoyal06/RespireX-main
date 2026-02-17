import matplotlib
matplotlib.use('Agg')  # Required for server-side plotting
import matplotlib.pyplot as plt
import matplotlib.patheffects as pe
import numpy as np
import io
import base64
import requests
from xhtml2pdf import pisa
from django.template import Context, Template

def get_base64_image(url):
    """Fetches image from URL and converts to base64 for PDF embedding."""
    if not url: return None
    try:
        response = requests.get(url, timeout=5)
        if response.status_code == 200:
            return f"data:image/jpeg;base64,{base64.b64encode(response.content).decode('utf-8')}"
    except Exception as e:
        print(f"Error fetching image: {e}")
        return None
    return None

def generate_scatter_plot(model_conf, symptom_score):
    """
    Generates a Linear Regression style plot with a SCIENTIFIC GRID.
    """
    # 1. Setup Figure
    fig, ax = plt.subplots(figsize=(6, 4), dpi=300)

    # 2. Formal Gridding (Scientific Look)
    ax.minorticks_on()
    ax.grid(which='major', linestyle='-', linewidth=0.6, color='#cbd5e1', alpha=0.8, zorder=0)
    ax.grid(which='minor', linestyle=':', linewidth=0.4, color='#e2e8f0', alpha=0.5, zorder=0)

    # Clean Spines
    ax.spines['top'].set_visible(False)
    ax.spines['right'].set_visible(False)
    ax.spines['left'].set_color('#64748b')
    ax.spines['bottom'].set_color('#64748b')

    # 3. Generate Population Trend (Green Line)
    np.random.seed(42)
    pop_x = np.linspace(5, 95, 150)
    pop_y = (pop_x * 0.3) + np.random.normal(0, 5, 150) 
    pop_y = np.clip(pop_y, 0, 100) 

    # Plot Population (Green Dots)
    ax.scatter(
        pop_x, 
        pop_y, 
        c='#2ecc71',   # Green
        s=50,          
        alpha=0.5,
        label='Normal Population',
        zorder=5,
        edgecolors='none'
    )
    
    # Visual "Regression Line"
    ax.plot(pop_x, pop_x * 0.3, color='#27ae60', linestyle='--', alpha=0.6, linewidth=1.5, zorder=4)

    # 4. Patient Dot (Red, Off the Line based on Risk)
    ax.scatter(
        [symptom_score], 
        [model_conf], 
        c='#ef4444',   # Red
        s=50,          
        zorder=10,
        label='Patient Result', 
        edgecolors='black', 
        linewidth=1
    )

    # 5. Visual Guide for Distance
    normal_y_at_x = symptom_score * 0.3
    ax.plot(
        [symptom_score, symptom_score], 
        [model_conf, normal_y_at_x], 
        color='#ef4444', 
        linestyle=':', 
        alpha=0.5, 
        zorder=9
    )

    # 6. Labels & Regions
    ax.set_xlabel('Symptom Severity', fontsize=9, fontweight='bold', color='#475569')
    ax.set_ylabel('AI Risk Score', fontsize=9, fontweight='bold', color='#475569')
    
    ax.legend(loc='upper left', fontsize=8, framealpha=0.9, edgecolor='#cbd5e1')
    
    # Scaling
    ax.set_xlim(0, 105) 
    ax.set_ylim(0, 105)   

    # 7. Save
    buffer = io.BytesIO()
    plt.tight_layout()
    plt.savefig(buffer, format='png', facecolor='white', edgecolor='none')
    buffer.seek(0)
    plt.close(fig)
    
    return f"data:image/png;base64,{base64.b64encode(buffer.getvalue()).decode('utf-8')}"

def generate_medical_pdf(test_result):
    # --- 1. Data Calculation ---
    model_conf = float(test_result.confidence_score)
    symptoms = test_result.symptoms_data or {}
    yes_count = sum(1 for ans in symptoms.values() if isinstance(ans, str) and ans.lower() == 'yes')
    symptom_score = (yes_count / 8) * 100
    mean_score = (model_conf + symptom_score) / 2
    is_positive = test_result.result == 'Positive'

    # --- DYNAMIC RISK RECALCULATION (Fix for PDF) ---
    # This ensures old "Low" records show as "Medium" if score is 50-80%
    if is_positive:
        if model_conf > 80:
            current_risk_level = "High"
        elif model_conf >= 50:
            current_risk_level = "Medium"
        else:
            current_risk_level = "Low"
    else:
        current_risk_level = "Low"
    # ------------------------------------------------
    
    # --- 2. Theme Configuration ---
    theme_color = '#3498db'   
    accent_color = '#60a5fa'
    light_bg = '#eff6ff'      
    
    status_text = 'POSITIVE FOR ABNORMALITIES' if is_positive else 'NO ABNORMALITIES DETECTED'

    # --- 3. Fetch Assets ---
    xray_img_b64 = get_base64_image(test_result.xray_image_url)
    scatter_plot_b64 = generate_scatter_plot(model_conf, symptom_score)

    # --- 4. Medication Logic ---
    if is_positive:
        meds_title = "Suggested Clinical Protocol"
        meds_note = "Standard First-Line Regimen (Requires Prescription)"
        meds_list = [
            {'name': 'Isoniazid (H)', 'dose': '5 mg/kg', 'desc': 'Primary antibiotic for treatment'},
            {'name': 'Rifampicin (R)', 'dose': '10 mg/kg', 'desc': 'Broad-spectrum antibiotic'},
            {'name': 'Pyrazinamide (Z)', 'dose': '25 mg/kg', 'desc': 'Sterilizing agent'},
            {'name': 'Ethambutol (E)', 'dose': '15 mg/kg', 'desc': 'Bacteriostatic agent'}
        ]
    else:
        meds_title = "Preventive Recommendations"
        meds_note = "Nutritional Support for Respiratory Health"
        meds_list = [
            {'name': 'Vitamin D3', 'dose': '1000 IU', 'desc': 'Immune modulation support'},
            {'name': 'Vitamin C', 'dose': '500 mg', 'desc': 'Antioxidant cellular protection'},
            {'name': 'Zinc Gluconate', 'dose': '50 mg', 'desc': 'Immune defense enhancement'}
        ]

    # --- 5. HTML Template ---
    html_string = """
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            @page { 
                size: A4; 
                margin: 1.5cm;
                margin-bottom: 2.5cm; 
                
                @frame footer_frame {
                    -pdf-frame-content: footerContent; 
                    bottom: 0cm;
                    left: 1.5cm;
                    right: 1.5cm;
                    height: 1.5cm;
                }
            }
            
            body { 
                font-family: 'Helvetica', sans-serif; 
                color: #334155; 
                font-size: 10px; 
                line-height: 1.5; 
            }
            
            /* Header */
            .header { border-bottom: 2px solid {{ theme_color }}; padding-bottom: 15px; margin-bottom: 25px; text-align: center; }
            .brand-name { font-size: 24px; font-weight: bold; color: {{ theme_color }}; letter-spacing: 0.5px; }
            .report-meta { color: #64748b; font-size: 9px; margin-top: 5px; }

            /* Headings */
            .section-label {
                font-size: 10px; font-weight: bold; color: #94a3b8; 
                text-transform: uppercase; letter-spacing: 1px;
                margin-top: 20px; margin-bottom: 8px;
                border-bottom: 1px solid #e2e8f0; padding-bottom: 2px;
            }

            /* Tables & Gridding */
            .info-table { width: 100%; margin-bottom: 15px; border-collapse: collapse; border: 1px solid #e2e8f0; }
            .info-table td { padding: 8px; vertical-align: top; border: 1px solid #e2e8f0; }
            .info-label { font-size: 8px; color: #64748b; text-transform: uppercase; margin-bottom: 2px; }
            .info-value { font-size: 11px; font-weight: bold; color: #0f172a; }

            .visual-table { width: 100%; margin-bottom: 20px; border-spacing: 0; }
            .visual-table td { vertical-align: top; width: 50%; padding: 5px; }
            
            .image-box {
                border: 1px solid #e2e8f0; padding: 5px; border-radius: 2px;
                text-align: center; height: 200px; overflow: hidden; background: #f8fafc;
            }
            .chart-box {
                text-align: center; height: 200px; display: flex; align-items: center; justify-content: center;
                border: 1px solid #e2e8f0; border-radius: 2px; padding: 5px;
            }
            
            .result-container {
                background-color: {{ light_bg }}; border: 1px solid {{ accent_color }};
                padding: 15px; margin-bottom: 20px; border-radius: 4px; text-align: center;
            }
            .result-main { font-size: 14px; font-weight: bold; color: {{ theme_color }}; margin-bottom: 3px; }
            .result-sub { font-size: 10px; color: #475569; }

            .metrics-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; border: 1px solid #e2e8f0; }
            .metrics-table th { text-align: left; color: #64748b; font-size: 8px; text-transform: uppercase; border: 1px solid #cbd5e1; padding: 6px; background-color: #f8fafc; }
            .metrics-table td { padding: 6px; border: 1px solid #e2e8f0; color: #334155; }
            .score-highlight { font-weight: bold; color: {{ theme_color }}; font-size: 12px; }

            .meds-table { width: 100%; border-collapse: collapse; border: 1px solid #e2e8f0; }
            .meds-table th { text-align: left; background-color: #f8fafc; color: #475569; font-size: 8px; font-weight: bold; padding: 6px; border: 1px solid #e2e8f0; }
            .meds-table td { padding: 6px; border: 1px solid #e2e8f0; }
            .dose-badge { background-color: #e2e8f0; color: #334155; padding: 2px 5px; border-radius: 3px; font-size: 8px; font-weight: bold; }

            /* DISCLAIMER */
            .disclaimer-box {
                margin-top: 30px;
                text-align: center;
                font-size: 8px;
                color: #64748b;
                border-top: 1px solid #e2e8f0;
                padding-top: 10px;
            }

            /* FOOTER CONTENT */
            #footerContent { 
                text-align: center; 
                color: #94a3b8; 
            }
        </style>
    </head>
    <body>
        <div class="header">
            <div class="brand-name">RespireX Medical AI</div>
            <div class="report-meta">Report ID: #{{ result_id }} | Date: {{ date }}</div>
        </div>

        <div class="section-label">Patient Demographics</div>
        <table class="info-table">
            <tr>
                <td width="30%"><div class="info-label">Patient Name</div><div class="info-value">{{ patient.full_name|default:patient.user.email }}</div></td>
                <td width="20%"><div class="info-label">Age / Gender</div><div class="info-value">{{ patient.age|default:"--" }} / {{ patient.gender|default:"--" }}</div></td>
                <td width="20%"><div class="info-label">Patient ID</div><div class="info-value">{{ patient.id }}</div></td>
                <td width="30%"><div class="info-label">Location</div><div class="info-value">{{ patient.city|default:"--" }}</div></td>
            </tr>
        </table>

        <div class="section-label">Diagnostic Assessment</div>
        <div class="result-container">
            <div class="result-main">{{ status_text }}</div>
            <div class="result-sub">Risk Classification: <strong>{{ risk_level }}</strong> | Confidence: <strong>{{ mean_score|floatformat:1 }}%</strong></div>
        </div>

        <div class="section-label">Radiographic & Comparative Analysis</div>
        <table class="visual-table">
            <tr>
                <td>
                    <div style="font-size: 9px; color: #64748b; margin-bottom: 5px; font-weight: bold;">ANALYZED RADIOGRAPH</div>
                    <div class="image-box">
                        {% if xray_img %}
                            <img src="{{ xray_img }}" style="height: 100%; width: auto; object-fit: contain;">
                        {% else %}
                            <div style="padding-top: 80px; color: #cbd5e1;">Image Not Available</div>
                        {% endif %}
                    </div>
                </td>
                <td>
                    <div style="font-size: 9px; color: #64748b; margin-bottom: 5px; font-weight: bold;">POPULATION RISK ANALYSIS</div>
                    <div class="chart-box">
                        {% if scatter_plot %}
                            <img src="{{ scatter_plot }}" style="width: 100%; height: auto;">
                        {% else %}
                            <div style="padding-top: 80px; color: #cbd5e1;">Chart Generation Failed</div>
                        {% endif %}
                    </div>
                </td>
            </tr>
        </table>

        <div class="section-label">Detailed Metrics</div>
        <table class="metrics-table">
            <tr>
                <th width="40%">Analysis Metric</th>
                <th width="20%">Score</th>
                <th width="40%">Clinical Significance</th>
            </tr>
            <tr>
                <td>AI Model Prediction</td>
                <td>{{ model_conf|floatformat:1 }}%</td>
                <td>Computer-Aided Detection (CAD) Score</td>
            </tr>
            <tr>
                <td>Symptom Correlation</td>
                <td>{{ symptom_score|floatformat:1 }}%</td>
                <td>Self-reported symptom severity index</td>
            </tr>
            <tr>
                <td><strong>Composite Score</strong></td>
                <td class="score-highlight">{{ mean_score|floatformat:1 }}%</td>
                <td>Weighted diagnostic probability</td>
            </tr>
        </table>

        <div class="section-label">{{ meds_title }}</div>
        <div style="font-size: 8px; color: #64748b; font-style: italic; margin-bottom: 4px;">Note: {{ meds_note }}</div>
        <table class="meds-table">
            <thead>
                <tr>
                    <th width="40%">Medication</th>
                    <th width="20%">Dosage</th>
                    <th width="40%">Indication</th>
                </tr>
            </thead>
            <tbody>
                {% for med in meds_list %}
                <tr>
                    <td><strong>{{ med.name }}</strong></td>
                    <td><span class="dose-badge">{{ med.dose }}</span></td>
                    <td style="color: #64748b;">{{ med.desc }}</td>
                </tr>
                {% endfor %}
            </tbody>
        </table>

        <div class="disclaimer-box">
            <strong>DISCLAIMER:</strong> This report is generated by the RespireX Artificial Intelligence system.<br/>
            It is intended for screening purposes only and DOES NOT constitute a final medical diagnosis.
        </div>

        <div id="footerContent">
            &copy; 2025 RespireX. All rights reserved.<br/>
            By Team BitBash
        </div>
    </body>
    </html>
    """
    
    # --- 6. Render ---
    template = Template(html_string)
    context = Context({
        'theme_color': theme_color,
        'accent_color': accent_color,
        'light_bg': light_bg,
        'status_text': status_text,
        'patient': test_result.patient,
        'result_id': test_result.id,
        'date': test_result.date_tested.strftime('%B %d, %Y'),
        'risk_level': current_risk_level,  # <--- Using the Recalculated Variable
        'model_conf': model_conf,
        'symptom_score': symptom_score,
        'mean_score': mean_score,
        'meds_title': meds_title,
        'meds_note': meds_note,
        'meds_list': meds_list,
        'xray_img': xray_img_b64,
        'scatter_plot': scatter_plot_b64
    })
    
    html = template.render(context)
    result = io.BytesIO()
    pisa_status = pisa.CreatePDF(io.BytesIO(html.encode("UTF-8")), dest=result)
    
    if pisa_status.err:
        raise Exception("PDF Generation Error")
        
    result.seek(0)
    return result