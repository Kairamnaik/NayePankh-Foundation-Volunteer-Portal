import React from 'react';
import { Link } from 'react-router-dom';
import { Feather, Heart, Award, Shield, ArrowRight, Activity, Smile, Users2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { user } = useAuth();

  const features = [
    {
      icon: Heart,
      title: 'Make Direct Impact',
      desc: 'Join local educational drives, food distributions, and environmental conservation initiatives.'
    },
    {
      icon: Award,
      title: 'Earn Verified Hours & Badges',
      desc: 'Unlock Bronze, Silver, Gold, and Platinum badges. Download authorized participation certificates.'
    },
    {
      icon: Shield,
      title: 'Admin Audited Events',
      desc: 'All programs are verified, organized, and tracked with transparent QR code check-in logs.'
    }
  ];

  const statCounters = [
    { label: 'Registered Volunteers', value: '1,240+' },
    { label: 'Community Hours Logged', value: '8,500+' },
    { label: 'Events Organized', value: '450+' },
    { label: 'Impacted Families', value: '15,000+' }
  ];

  return (
    <div className="relative overflow-hidden min-h-screen flex flex-col bg-slate-50">
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-orange-50 to-transparent -z-10" />

      {/* Hero Section */}
      <section className="flex-1 max-w-7xl mx-auto px-6 py-16 md:py-24 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-7 space-y-6 text-left">
          <div className="inline-flex items-center gap-1.5 bg-orange-100/80 px-3 py-1 rounded-full text-xs font-semibold text-orange-700">
            <Feather className="h-3.5 w-3.5" />
            NayePankh Foundation Onboarding
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold text-slate-800 tracking-tight leading-tight">
            Spread Your Wings.<br />
            <span className="bg-gradient-to-r from-orange-600 to-amber-500 bg-clip-text text-transparent">
              Empower Communities.
            </span>
          </h1>
          <p className="text-slate-600 text-base md:text-lg leading-relaxed max-w-xl">
            NayePankh Foundation is one of the leading NGOs working towards child education, environmental welfare, healthcare, and social upliftment. Join our volunteer network to log hours, earn awards, and drive systemic change.
          </p>

          <div className="flex flex-wrap gap-4 pt-2">
            {user ? (
              <Link
                to={user.role === 'admin' ? '/admin' : '/dashboard'}
                className="bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm px-6 py-3.5 rounded-xl shadow-lg shadow-orange-100 hover:shadow-orange-200 transition-all duration-200 flex items-center gap-2"
              >
                Go to Dashboard
                <ArrowRight className="h-4 w-4" />
              </Link>
            ) : (
              <>
                <Link
                  to="/signup"
                  className="bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm px-6 py-3.5 rounded-xl shadow-lg shadow-orange-100 hover:shadow-orange-200 transition-all duration-200 flex items-center gap-2"
                >
                  Become a Volunteer
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/login"
                  className="bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-sm px-6 py-3.5 rounded-xl shadow-sm transition-all duration-200"
                >
                  Log In
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Decorative Grid Panel */}
        <div className="lg:col-span-5 relative w-full flex justify-center">
          <div className="relative w-80 h-80 md:w-96 md:h-96 rounded-3xl bg-gradient-to-tr from-orange-500 to-amber-400 p-8 text-white shadow-2xl flex flex-col justify-between overflow-hidden animate-float">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
            <div className="flex items-center justify-between">
              <div className="bg-white/20 backdrop-blur-md px-3.5 py-1.5 rounded-xl text-xs font-semibold">
                NayePankh Active
              </div>
              <Feather className="h-6 w-6" />
            </div>

            <div className="space-y-4">
              <div className="flex -space-x-3">
                <div className="h-9 w-9 rounded-full bg-slate-200 border-2 border-orange-500 flex items-center justify-center text-[10px] text-slate-800 font-bold">NP</div>
                <div className="h-9 w-9 rounded-full bg-slate-300 border-2 border-orange-500 flex items-center justify-center text-[10px] text-slate-800 font-bold">FP</div>
                <div className="h-9 w-9 rounded-full bg-slate-400 border-2 border-orange-500 flex items-center justify-center text-[10px] text-slate-800 font-bold">VK</div>
              </div>
              <h3 className="text-xl md:text-2xl font-bold leading-tight">
                "Together we create hope, one action at a time."
              </h3>
            </div>

            <div className="flex items-center justify-between text-xs text-orange-100 border-t border-white/20 pt-4">
              <span>Est. 2020</span>
              <span className="flex items-center gap-1">
                <span className="h-2.5 w-2.5 bg-emerald-400 rounded-full animate-ping" />
                Live Campaigns
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Counter */}
      <section className="bg-slate-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {statCounters.map((stat, i) => (
            <div key={i} className="space-y-2">
              <p className="text-3xl md:text-5xl font-black text-orange-500">{stat.value}</p>
              <p className="text-xs text-slate-400 font-medium">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Feature Section */}
      <section className="max-w-7xl mx-auto px-6 py-20 space-y-12">
        <div className="text-center space-y-3 max-w-xl mx-auto">
          <h2 className="text-3xl font-extrabold text-slate-800">Why Volunteer With Us?</h2>
          <p className="text-slate-500 text-sm">
            We offer a structured, rewarding, and secure platform to make a positive impact in community welfare programs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <div key={i} className="bg-white border border-slate-100 p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-200 text-left space-y-4">
                <div className="bg-orange-50 w-12 h-12 rounded-xl flex items-center justify-center text-orange-600">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-800">{f.title}</h3>
                <p className="text-slate-500 text-xs leading-relaxed">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
