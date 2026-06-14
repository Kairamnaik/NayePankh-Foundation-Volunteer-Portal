import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { QRCodeSVG } from 'qrcode.react';
import { User, Phone, MapPin, Award, ShieldAlert, CheckCircle2, RefreshCw, Edit2, Save, FileImage, UploadCloud } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Profile() {
  const { refreshProfileStatus } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form states
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
  
  // Profile Photo Base64
  const [photoBase64, setPhotoBase64] = useState('');
  const [photoPreview, setPhotoPreview] = useState('');

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/volunteers/profile');
      const data = response.data;
      setProfile(data);
      
      // Seed form states
      setFullName(data.fullName || '');
      setPhone(data.phone || '');
      setAge(data.age || '');
      setGender(data.gender || 'Male');
      setAddress(data.address || '');
      setSkills(data.skills ? data.skills.join(', ') : '');
      setInterests(data.interests ? data.interests.join(', ') : '');
      setAvailability(data.availability || 'Flexible');
      setEmergencyName(data.emergencyContact?.name || '');
      setEmergencyRelationship(data.emergencyContact?.relationship || '');
      setEmergencyPhone(data.emergencyContact?.phone || '');
      setPhotoPreview(data.profilePhoto || '');
    } catch (err) {
      console.error(err);
      setError('Failed to load volunteer profile.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

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

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!fullName || !phone || !age || !address || !emergencyName || !emergencyPhone) {
      return setError('Please fill in all required fields.');
    }

    if (isNaN(age) || Number(age) < 13) {
      return setError('Volunteer must be at least 13 years old.');
    }

    const parsedSkills = skills ? skills.split(',').map((s) => s.trim()).filter(Boolean) : [];
    const parsedInterests = interests ? interests.split(',').map((i) => i.trim()).filter(Boolean) : [];

    try {
      const response = await axios.put('/volunteers/profile', {
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
        profilePhoto: photoBase64 || undefined,
      });

      setProfile(response.data);
      setEditMode(false);
      setSuccess('Profile updated successfully!');
      refreshProfileStatus();
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile details.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="h-8 w-8 text-orange-600 animate-spin" />
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="space-y-8 text-left">
      <div className="flex justify-between items-center border-b border-slate-100 pb-5">
        <div>
          <h1 className="text-2xl font-black text-slate-800">My Profile</h1>
          <p className="text-xs text-slate-400">View and edit your personal volunteer details</p>
        </div>
        <button
          onClick={() => {
            setError('');
            setSuccess('');
            setEditMode(!editMode);
          }}
          className={`flex items-center gap-1.5 font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-sm ${
            editMode
              ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              : 'bg-slate-800 text-white hover:bg-slate-900'
          }`}
        >
          {editMode ? 'Cancel' : <><Edit2 className="h-3.5 w-3.5" /> Edit Profile</>}
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-rose-50 border border-rose-100 text-rose-800 p-3.5 rounded-2xl text-xs font-semibold">
          <ShieldAlert className="h-4.5 w-4.5 text-rose-600 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 text-emerald-800 p-3.5 rounded-2xl text-xs font-semibold">
          <CheckCircle2 className="h-4.5 w-4.5 text-emerald-600 flex-shrink-0" />
          <span>{success}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Profile Info Form / View Details */}
        <div className="lg:col-span-8 bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
          {editMode ? (
            <form onSubmit={handleSave} className="space-y-6">
              
              {/* Photo Upload inside Edit */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-600">Profile Photo</label>
                <div className="flex items-center gap-4 border border-dashed border-slate-200 p-4 rounded-2xl bg-slate-50/50">
                  <div className="h-16 w-16 bg-slate-100 text-slate-400 border border-slate-200 rounded-2xl flex items-center justify-center overflow-hidden">
                    {photoPreview ? (
                      <img src={photoPreview} alt="preview" className="h-full w-full object-cover" />
                    ) : (
                      <User className="h-6 w-6" />
                    )}
                  </div>
                  <div>
                    <label className="flex items-center gap-1.5 cursor-pointer bg-slate-800 hover:bg-slate-900 text-white text-[11px] font-bold px-3 py-2 rounded-xl transition-all shadow-sm">
                      <UploadCloud className="h-4 w-4" />
                      Change Photo
                      <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                    </label>
                    <p className="text-[9px] text-slate-400 mt-1">JPG or PNG. Max 2MB.</p>
                  </div>
                </div>
              </div>

              {/* Personal details grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-600">Full Name</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 px-4 py-3 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-600">Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 px-4 py-3 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-600">Age</label>
                  <input
                    type="number"
                    required
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 px-4 py-3 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                  />
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

              {/* Skills and Location */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-600">Address</label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 px-4 py-3 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-600">Skills (Comma separated)</label>
                  <input
                    type="text"
                    value={skills}
                    onChange={(e) => setSkills(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 px-4 py-3 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-600">Interests (Comma separated)</label>
                  <input
                    type="text"
                    value={interests}
                    onChange={(e) => setInterests(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 px-4 py-3 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-600">Availability</label>
                <select
                  value={availability}
                  onChange={(e) => setAvailability(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 px-4 py-3 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all cursor-pointer"
                >
                  <option value="Flexible">Flexible</option>
                  <option value="Weekdays">Weekdays</option>
                  <option value="Weekends">Weekends</option>
                </select>
              </div>

              {/* Emergency Contact */}
              <div className="pt-4 border-t border-slate-100 space-y-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Emergency Contact</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-600">Contact Name</label>
                    <input
                      type="text"
                      required
                      value={emergencyName}
                      onChange={(e) => setEmergencyName(e.target.value)}
                      className="w-full text-xs bg-slate-50 border border-slate-200 px-4 py-3 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-600">Relationship</label>
                    <input
                      type="text"
                      required
                      value={emergencyRelationship}
                      onChange={(e) => setEmergencyRelationship(e.target.value)}
                      className="w-full text-xs bg-slate-50 border border-slate-200 px-4 py-3 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-600">Contact Phone</label>
                    <input
                      type="tel"
                      required
                      value={emergencyPhone}
                      onChange={(e) => setEmergencyPhone(e.target.value)}
                      className="w-full text-xs bg-slate-50 border border-slate-200 px-4 py-3 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Save Button */}
              <button
                type="submit"
                className="flex items-center justify-center gap-1.5 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs px-6 py-3.5 rounded-2xl shadow-lg shadow-orange-100 hover:shadow-orange-200 transition-all w-full md:w-auto ml-auto"
              >
                <Save className="h-4 w-4" />
                Save Changes
              </button>

            </form>
          ) : (
            <div className="space-y-6">
              {/* Photo & Name Grid */}
              <div className="flex flex-col sm:flex-row items-center gap-5 pb-6 border-b border-slate-100">
                <div className="h-24 w-24 rounded-3xl bg-orange-100 border border-orange-200 overflow-hidden flex items-center justify-center font-bold text-3xl text-orange-600">
                  {profile.profilePhoto ? (
                    <img src={profile.profilePhoto} alt={profile.fullName} className="h-full w-full object-cover" />
                  ) : (
                    profile.fullName.charAt(0).toUpperCase()
                  )}
                </div>
                <div className="text-center sm:text-left space-y-1">
                  <h2 className="text-xl font-bold text-slate-800">{profile.fullName}</h2>
                  <div className="flex flex-wrap justify-center sm:justify-start gap-2 pt-1.5">
                    <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full border border-slate-200 flex items-center gap-1">
                      Age: {profile.age}
                    </span>
                    <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full border border-slate-200 flex items-center gap-1">
                      Gender: {profile.gender}
                    </span>
                    <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full border border-slate-200 flex items-center gap-1">
                      Availability: {profile.availability}
                    </span>
                  </div>
                </div>
              </div>

              {/* Personal metadata lists */}
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Phone className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" />
                  <div className="text-xs">
                    <p className="font-bold text-slate-500">Contact Number</p>
                    <p className="text-slate-700 mt-0.5">{profile.phone}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" />
                  <div className="text-xs">
                    <p className="font-bold text-slate-500">Residential Address</p>
                    <p className="text-slate-700 mt-0.5">{profile.address}</p>
                  </div>
                </div>

                {/* Skills */}
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-500">My Registered Skills</p>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {profile.skills.length === 0 ? (
                      <span className="text-xs text-slate-400 italic">No skills registered</span>
                    ) : (
                      profile.skills.map((s, i) => (
                        <span key={i} className="text-[10px] font-bold bg-orange-50 text-orange-700 border border-orange-100 px-2.5 py-0.5 rounded-full">
                          {s}
                        </span>
                      ))
                    )}
                  </div>
                </div>

                {/* Interests */}
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-500">My Interests</p>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {profile.interests.length === 0 ? (
                      <span className="text-xs text-slate-400 italic">No interests registered</span>
                    ) : (
                      profile.interests.map((int, i) => (
                        <span key={i} className="text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200 px-2.5 py-0.5 rounded-full">
                          {int}
                        </span>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Emergency details view */}
              <div className="pt-4 border-t border-slate-100 space-y-3">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Emergency Contact</h3>
                <div className="bg-slate-50/50 border border-slate-100 p-4 rounded-2xl grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div>
                    <span className="font-semibold text-slate-400 block">Name</span>
                    <span className="font-bold text-slate-700 mt-0.5 block">{profile.emergencyContact?.name}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-400 block">Relationship</span>
                    <span className="font-bold text-slate-700 mt-0.5 block">{profile.emergencyContact?.relationship}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-400 block">Phone</span>
                    <span className="font-bold text-slate-700 mt-0.5 block">{profile.emergencyContact?.phone}</span>
                  </div>
                </div>
              </div>

            </div>
          )}
        </div>

        {/* DIGITAL VOLUNTEER PASS CARD WITH QR CODE */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl text-white space-y-6 text-center relative overflow-hidden">
          {/* Card branding header */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-orange-600/10 rounded-full blur-2xl" />
          <div className="border-b border-slate-800 pb-4 flex flex-col items-center">
            <Award className="h-8 w-8 text-orange-500 animate-float" />
            <h3 className="font-extrabold text-sm tracking-tight text-white mt-2">NayePankh Volunteer Pass</h3>
            <p className="text-[9px] text-slate-400 uppercase tracking-widest mt-0.5">Verified Credential</p>
          </div>

          {/* QR Code layout */}
          <div className="bg-white border-4 border-orange-500 p-4 rounded-2xl w-fit mx-auto shadow-lg shadow-orange-900/10">
            <QRCodeSVG
              value={profile._id} // Represents the volunteer ID
              size={135}
              level="H"
              includeMargin={false}
            />
          </div>

          {/* User badge display inside pass */}
          <div className="space-y-1">
            <h4 className="font-bold text-sm text-slate-200">{profile.fullName}</h4>
            <p className="text-[10px] text-slate-500 font-mono tracking-wider">ID: {profile._id}</p>
          </div>

          <div className="bg-slate-800/80 border border-slate-700 px-4 py-2.5 rounded-2xl text-[10px] font-bold flex justify-between items-center text-slate-300">
            <span>Hours: {profile.totalHours} hrs</span>
            <span className="bg-orange-600 text-white px-2 py-0.5 rounded-full">{profile.badge} Tier</span>
          </div>

          <p className="text-[9px] text-slate-500 leading-relaxed">
            Present this card at event registration desks. Admins will scan this code to complete check-in and check-out tracking.
          </p>
        </div>

      </div>
    </div>
  );
}
