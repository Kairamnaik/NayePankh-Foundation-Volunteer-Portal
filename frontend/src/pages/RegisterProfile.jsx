import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import {
  User,
  Phone,
  Calendar,
  MapPin,
  Heart,
  Clock,
  AlertCircle,
  FileImage,
  UploadCloud,
  ChevronRight,
  ChevronLeft,
  Feather
} from 'lucide-react';

export default function RegisterProfile() {
  const { user, refreshProfileStatus } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Form State
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('Male');
  const [address, setAddress] = useState('');
  const [skills, setSkills] = useState('');
  const [interests, setInterests] = useState('');
  const [availability, setAvailability] = useState('Flexible');
  
  // Emergency Contact
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyRelationship, setEmergencyRelationship] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');

  // Base64 Photo
  const [photoBase64, setPhotoBase64] = useState('');
  const [photoPreview, setPhotoPreview] = useState('');

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      return setError('Image size must be less than 2MB.');
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoBase64(reader.result);
      setPhotoPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleNext = () => {
    setError('');
    if (step === 1) {
      if (!fullName || !phone || !age || !gender) {
        return setError('Please fill in all personal details.');
      }
      if (isNaN(age) || Number(age) < 13) {
        return setError('Volunteer must be at least 13 years old.');
      }
      if (phone.length < 8) {
        return setError('Please enter a valid phone number.');
      }
      setStep(2);
    } else if (step === 2) {
      if (!address || !availability) {
        return setError('Address and availability are required.');
      }
      setStep(3);
    }
  };

  const handlePrev = () => {
    setError('');
    setStep((prev) => prev - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!emergencyName || !emergencyRelationship || !emergencyPhone) {
      return setError('Emergency contact information is required.');
    }

    if (emergencyPhone.length < 8) {
      return setError('Please enter a valid emergency phone number.');
    }

    setLoading(true);

    // Format fields
    const parsedSkills = skills ? skills.split(',').map((s) => s.trim()).filter(Boolean) : [];
    const parsedInterests = interests ? interests.split(',').map((i) => i.trim()).filter(Boolean) : [];

    try {
      await axios.post('/volunteers/register', {
        fullName,
        phone,
        age: Number(age),
        gender,
        address,
        skills: parsedSkills,
        interests: parsedInterests,
        availability,
        emergencyContact: {
          name: emergencyName,
          relationship: emergencyRelationship,
          phone: emergencyPhone,
        },
        profilePhoto: photoBase64,
      });

      await refreshProfileStatus();
      
      // Navigate to overview to await approval
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to complete registration.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 py-12">
      <div className="w-full max-w-2xl bg-white border border-slate-100 rounded-3xl shadow-xl overflow-hidden">
        
        {/* Banner with Progress Bar */}
        <div className="bg-slate-900 p-8 text-white text-left relative">
          <div className="absolute top-4 right-6 text-white/30">
            <Feather className="h-10 w-10" />
          </div>
          <h2 className="text-xl font-bold">Volunteer Profile Setup</h2>
          <p className="text-xs text-slate-400 mt-1">NayePankh Foundation Registration System</p>
          
          {/* Progress Tracker */}
          <div className="mt-6 flex items-center justify-between gap-4 text-xs font-semibold text-slate-400">
            <div className={`flex items-center gap-2 ${step >= 1 ? 'text-orange-500 font-bold' : ''}`}>
              <span className={`h-5 w-5 rounded-full flex items-center justify-center border ${step >= 1 ? 'border-orange-500 bg-orange-500 text-white' : 'border-slate-700'}`}>1</span>
              Personal Details
            </div>
            <div className="flex-1 h-0.5 bg-slate-800 relative">
              <div className="absolute top-0 bottom-0 left-0 bg-orange-500 transition-all duration-300" style={{ width: step === 1 ? '0%' : step === 2 ? '50%' : '100%' }} />
            </div>
            <div className={`flex items-center gap-2 ${step >= 2 ? 'text-orange-500 font-bold' : ''}`}>
              <span className={`h-5 w-5 rounded-full flex items-center justify-center border ${step >= 2 ? 'border-orange-500 bg-orange-500 text-white' : 'border-slate-700'}`}>2</span>
              Skills & Location
            </div>
            <div className="flex-1 h-0.5 bg-slate-800" />
            <div className={`flex items-center gap-2 ${step >= 3 ? 'text-orange-500 font-bold' : ''}`}>
              <span className={`h-5 w-5 rounded-full flex items-center justify-center border ${step >= 3 ? 'border-orange-500 bg-orange-500 text-white' : 'border-slate-700'}`}>3</span>
              Emergency Contact
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="p-8">
          {error && (
            <div className="mb-6 flex items-center gap-2 bg-rose-50 border border-rose-100 text-rose-800 p-3.5 rounded-2xl text-xs font-semibold">
              <AlertCircle className="h-4.5 w-4.5 text-rose-600 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* STEP 1: Personal Details */}
          {step === 1 && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-600">Full Name</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                      <User className="h-4 w-4" />
                    </span>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Jane Doe"
                      className="w-full text-xs bg-slate-50 border border-slate-200 pl-10 pr-4 py-3 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-600">Phone Number</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                      <Phone className="h-4 w-4" />
                    </span>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 XXXXX XXXXX"
                      className="w-full text-xs bg-slate-50 border border-slate-200 pl-10 pr-4 py-3 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-600">Age</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                      <Calendar className="h-4 w-4" />
                    </span>
                    <input
                      type="number"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      placeholder="Min 13"
                      className="w-full text-xs bg-slate-50 border border-slate-200 pl-10 pr-4 py-3 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-600">Gender</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 px-4 py-3 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all cursor-pointer"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>
              </div>

              {/* Photo Upload */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-600">Profile Photo</label>
                <div className="flex items-center gap-4 border border-dashed border-slate-200 p-4 rounded-2xl bg-slate-50/50">
                  <div className="h-16 w-16 bg-slate-100 text-slate-400 border border-slate-200 rounded-2xl flex items-center justify-center overflow-hidden">
                    {photoPreview ? (
                      <img src={photoPreview} alt="preview" className="h-full w-full object-cover" />
                    ) : (
                      <FileImage className="h-6 w-6" />
                    )}
                  </div>
                  <div className="flex-1">
                    <label className="flex items-center gap-1.5 cursor-pointer bg-slate-800 hover:bg-slate-900 text-white text-[11px] font-bold px-3 py-2 rounded-xl transition-all shadow-sm w-fit">
                      <UploadCloud className="h-4 w-4" />
                      Upload Photo
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />
                    </label>
                    <p className="text-[10px] text-slate-400 mt-1">JPG or PNG. Max 2MB.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Skills & Location */}
          {step === 2 && (
            <div className="space-y-5">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-600">Residential Address</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                    <MapPin className="h-4 w-4" />
                  </span>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="123 Street Name, City, Country"
                    className="w-full text-xs bg-slate-50 border border-slate-200 pl-10 pr-4 py-3 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-600">Skills (Comma-separated)</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                      <Feather className="h-4 w-4" />
                    </span>
                    <input
                      type="text"
                      value={skills}
                      onChange={(e) => setSkills(e.target.value)}
                      placeholder="Teaching, Event Mgmt, Writing"
                      className="w-full text-xs bg-slate-50 border border-slate-200 pl-10 pr-4 py-3 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-600">Interests (Comma-separated)</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                      <Heart className="h-4 w-4" />
                    </span>
                    <input
                      type="text"
                      value={interests}
                      onChange={(e) => setInterests(e.target.value)}
                      placeholder="Child Welfare, Green Drives"
                      className="w-full text-xs bg-slate-50 border border-slate-200 pl-10 pr-4 py-3 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-600">Volunteer Availability</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                    <Clock className="h-4 w-4" />
                  </span>
                  <select
                    value={availability}
                    onChange={(e) => setAvailability(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 pl-10 pr-4 py-3 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all cursor-pointer"
                  >
                    <option value="Flexible">Flexible / On-call</option>
                    <option value="Weekdays">Weekdays</option>
                    <option value="Weekends">Weekends Only</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Emergency Contact */}
          {step === 3 && (
            <div className="space-y-5">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Emergency Contact Person</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-600">Full Name</label>
                  <input
                    type="text"
                    value={emergencyName}
                    onChange={(e) => setEmergencyName(e.target.value)}
                    placeholder="Emergency Contact Name"
                    className="w-full text-xs bg-slate-50 border border-slate-200 px-4 py-3 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-600">Relationship</label>
                  <input
                    type="text"
                    value={emergencyRelationship}
                    onChange={(e) => setEmergencyRelationship(e.target.value)}
                    placeholder="Parent / Spouse / Friend"
                    className="w-full text-xs bg-slate-50 border border-slate-200 px-4 py-3 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-600">Phone Number</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                    <Phone className="h-4 w-4" />
                  </span>
                  <input
                    type="tel"
                    value={emergencyPhone}
                    onChange={(e) => setEmergencyPhone(e.target.value)}
                    placeholder="Contact Phone Number"
                    className="w-full text-xs bg-slate-50 border border-slate-200 pl-10 pr-4 py-3 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="mt-8 pt-6 border-t border-slate-100 flex justify-between gap-4">
            {step > 1 ? (
              <button
                type="button"
                onClick={handlePrev}
                className="flex items-center gap-1.5 border border-slate-200 text-slate-700 font-bold text-xs px-5 py-3 rounded-2xl hover:bg-slate-50 transition-all"
              >
                <ChevronLeft className="h-4.5 w-4.5" />
                Previous Step
              </button>
            ) : (
              <div />
            )}

            {step < 3 ? (
              <button
                type="button"
                onClick={handleNext}
                className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs px-6 py-3 rounded-2xl shadow-sm transition-all ml-auto"
              >
                Next Step
                <ChevronRight className="h-4.5 w-4.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="flex items-center gap-1.5 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs px-8 py-3 rounded-2xl shadow-lg shadow-orange-100 hover:shadow-orange-200 transition-all disabled:opacity-50 ml-auto"
              >
                {loading ? 'Submitting...' : 'Complete Profile Setup'}
              </button>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
