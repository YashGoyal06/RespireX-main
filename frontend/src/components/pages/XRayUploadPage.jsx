import React, { useState } from 'react';
import { Upload, Image, Check, Loader, AlertTriangle } from 'lucide-react';
import Navbar from '../common/Navbar';
import api from '../../lib/api';

const XRayUploadPage = ({ onNavigate, symptomAnswers = {}, onLogout, user, language = 'en', toggleLanguage }) => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const t = {
    en: {
        step: "Step 2 of 2",
        title: "Upload Chest X-Ray",
        subtitle: "Upload a clear image of your chest X-ray for AI analysis",
        drop: "Drop your file here",
        upload: "Upload X-Ray Image",
        drag: "Drag and drop or click to browse",
        choose: "Choose File",
        format: "PNG, JPG or JPEG up to 10MB",
        uploaded: "Uploaded",
        remove: "Remove",
        change: "Change Image",
        analyze: "Analyze X-Ray →",
        analyzing: "Analyzing...",
        guidelines: "Image Guidelines",
        g1: "Ensure the X-ray image is clear and well-lit",
        g2: "The entire chest area should be visible in the image",
        g3: "Avoid images with excessive blur or artifacts",
        g4: "This is a preliminary screening tool, not a diagnostic tool",
        errType: "Please select a valid image file",
        errDrop: "Please drop a valid image file",
        errMissing: "Please upload an X-ray image",
        errFail: "Analysis failed. Please try again."
    },
    hi: {
        step: "चरण 2 का 2",
        title: "छाती का एक्स-रे अपलोड करें",
        subtitle: "एआई विश्लेषण के लिए अपने छाती के एक्स-रे की स्पष्ट छवि अपलोड करें",
        drop: "अपनी फाइल यहाँ छोड़ें",
        upload: "एक्स-रे छवि अपलोड करें",
        drag: "खींचें और छोड़ें या ब्राउज़ करने के लिए क्लिक करें",
        choose: "फाइल चुनें",
        format: "PNG, JPG या JPEG 10MB तक",
        uploaded: "अपलोड किया गया",
        remove: "हटाएं",
        change: "छवि बदलें",
        analyze: "एक्स-रे का विश्लेषण करें →",
        analyzing: "विश्लेषण हो रहा है...",
        guidelines: "छवि दिशानिर्देश",
        g1: "सुनिश्चित करें कि एक्स-रे छवि स्पष्ट और अच्छी तरह से रोशनी वाली है",
        g2: "छवि में पूरा छाती क्षेत्र दिखाई देना चाहिए",
        g3: "अत्यधिक धुंधली या कलाकृतियों वाली छवियों से बचें",
        g4: "यह एक प्रारंभिक स्क्रीनिंग उपकरण है, निदान उपकरण नहीं",
        errType: "कृपया एक वैध छवि फाइल चुनें",
        errDrop: "कृपया एक वैध छवि फाइल छोड़ें",
        errMissing: "कृपया एक एक्स-रे छवि अपलोड करें",
        errFail: "विश्लेषण विफल रहा। कृपया पुनः प्रयास करें।"
    }
  };

  const currentT = t[language];

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (!selectedFile.type.startsWith('image/')) {
        setError(currentT.errType);
        return;
      }
      setError('');
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragging(true);
    } else if (e.type === "dragleave") {
      setIsDragging(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type.startsWith('image/')) {
      setError('');
      setFile(droppedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(droppedFile);
    } else {
      setError(currentT.errDrop);
    }
  };

  const handleAnalyze = async () => {
    if (!file) {
      setError(currentT.errMissing);
      return;
    }

    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('symptoms', JSON.stringify(symptomAnswers || {}));

    try {
      const response = await api.post('/predict/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      onNavigate('test-result', { 
        result: response.data,
        originalImage: preview,
        uploadDate: new Date().toISOString()
      });

    } catch (err) {
      console.error("Prediction Error:", err);
      const errorMessage = err.response?.data?.error || currentT.errFail;
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Navbar 
        showCancelButton={true}
        onCancel={() => onNavigate('patient-home')}
        isLoggedIn={true}    
        user={user}          
        onLogout={onLogout}  
        userType="patient"   
        language={language}
        toggleLanguage={toggleLanguage}
      />

      <div className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-12 text-center animate-fade-in">
            <div className="inline-block px-4 py-2 bg-blue-50 rounded-full mb-6">
              <span className="text-sm font-semibold text-blue-600">{currentT.step}</span>
            </div>
            <h1 className="text-5xl font-bold text-gray-900 mb-4">{currentT.title}</h1>
            <p className="text-xl text-gray-600">{currentT.subtitle}</p>
          </div>

          <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-12 animate-scale">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center space-x-3 text-red-700">
                <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                <span className="font-medium">{error}</span>
              </div>
            )}

            {!preview ? (
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`border-3 border-dashed rounded-3xl p-16 text-center transition-all ${
                  isDragging 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
                }`}
              >
                <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-3xl flex items-center justify-center mx-auto mb-8">
                  <Upload className="w-12 h-12 text-blue-600" strokeWidth={2} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  {isDragging ? currentT.drop : currentT.upload}
                </h3>
                <p className="text-gray-600 mb-8 text-lg">
                  {currentT.drag}
                </p>
                <label className="inline-block">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <span className="px-10 py-4 bg-gray-900 text-white rounded-xl hover:bg-gray-800 cursor-pointer inline-block font-semibold text-lg shadow-lg hover:shadow-xl btn-primary">
                    {currentT.choose}
                  </span>
                </label>
                <p className="text-sm text-gray-500 mt-6">{currentT.format}</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="relative rounded-2xl overflow-hidden border-2 border-gray-200 shadow-lg">
                  <img 
                    src={preview} 
                    alt="X-Ray Preview" 
                    className="w-full h-auto"
                  />
                  <div className="absolute top-4 right-4">
                    <div className="bg-green-500 text-white px-4 py-2 rounded-full flex items-center space-x-2 shadow-lg">
                      <Check className="w-5 h-5" strokeWidth={3} />
                      <span className="font-semibold">{currentT.uploaded}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-2xl p-6 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <Image className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{file?.name}</p>
                      <p className="text-sm text-gray-600">{(file?.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setFile(null);
                      setPreview(null);
                      setError('');
                    }}
                    disabled={loading}
                    className="text-red-600 hover:text-red-700 font-semibold disabled:opacity-50"
                  >
                    {currentT.remove}
                  </button>
                </div>

                <div className="flex space-x-4 pt-4">
                  <label className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      disabled={loading}
                      className="hidden"
                    />
                    <span className={`block w-full py-4 bg-gray-100 text-gray-900 rounded-xl hover:bg-gray-200 cursor-pointer text-center font-semibold text-lg transition ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                      {currentT.change}
                    </span>
                  </label>
                  <button
                    onClick={handleAnalyze}
                    disabled={loading}
                    className="flex-1 py-4 bg-gray-900 text-white rounded-xl hover:bg-gray-800 font-semibold text-lg shadow-lg hover:shadow-xl btn-primary flex justify-center items-center disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <Loader className="w-6 h-6 animate-spin mr-2" />
                        <span>{currentT.analyzing}</span>
                      </>
                    ) : (
                      currentT.analyze
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="mt-8 bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-2xl p-8 animate-fade-in stagger-1">
            <h4 className="font-bold text-gray-900 text-xl mb-4 flex items-center space-x-2">
              <Image className="w-6 h-6 text-blue-600" />
              <span>{currentT.guidelines}</span>
            </h4>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start space-x-3">
                <Check className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" strokeWidth={2.5} />
                <span>{currentT.g1}</span>
              </li>
              <li className="flex items-start space-x-3">
                <Check className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" strokeWidth={2.5} />
                <span>{currentT.g2}</span>
              </li>
              <li className="flex items-start space-x-3">
                <Check className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" strokeWidth={2.5} />
                <span>{currentT.g3}</span>
              </li>
              <li className="flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" strokeWidth={2.5} />
                <span>{currentT.g4}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default XRayUploadPage;
