import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    redirect('/dashboard')
  }
"use client";

import { motion } from "framer-motion";
import { 
  UploadCloud, 
  CreditCard, 
  CheckCircle, 
  Zap, 
  Clock, 
  Server, 
  Database, 
  Lock,
  Printer
} from "lucide-react";
import Link from "next/link";

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <main className="flex flex-col items-center justify-center gap-8 p-8 text-center max-w-2xl">
        <h1 className="text-5xl font-bold text-gray-900 dark:text-white">
          Welcome to HackForge
        </h1>
        <p className="text-xl text-gray-700 dark:text-gray-300">
          Your ultimate platform for creating, sharing, and collaborating on amazing projects.
        </p>
        <div className="flex gap-4 mt-6">
          <Link
            href="/signup"
            className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition shadow-lg"
          >
            Sign Up
          </Link>
          <Link
            href="/login"
            className="px-8 py-3 bg-gray-200 text-gray-900 font-semibold rounded-lg hover:bg-gray-300 transition dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
          >
            Log In
          </Link>
    <div className="min-h-screen bg-white text-slate-900 selection:bg-blue-100 selection:text-blue-700">
      
      {/* PROFESSIONAL NAVBAR */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-1.5 rounded-lg">
              <Printer className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-900">Printify</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/login" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition">
              Log in
            </Link>
            <Link href="/upload">
              <button className="bg-slate-900 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 transition shadow-lg shadow-slate-900/20">
                Start Printing
              </button>
            </Link>
          </div>
        </div>
      </nav>

      <section className="relative pt-36 pb-20 overflow-hidden px-6 bg-grid-pattern border-b border-slate-100">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-blue-100/50 rounded-full blur-[100px] -z-10" />
        
        <div className="max-w-4xl mx-auto text-center">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 border border-blue-200 bg-blue-50 px-4 py-1.5 rounded-full text-sm text-blue-700 font-medium mb-8"
          >
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
          Smart printing for smart students.
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7 }}
            className="text-5xl md:text-7xl font-bold tracking-tight text-slate-900 mb-6"
          >
            Don&apos;t Wait. <br />
            Just <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Printify.</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.7 }}
            className="text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            The smart Xerox shop for engineering students. Upload from your hostel, 
            pay via UPI, and pick up your assignment in 10 seconds.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row justify-center gap-4"
          >
            <Link href="/upload">
              <button className="px-8 py-4 bg-blue-600 text-white text-lg font-bold rounded-xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20 flex items-center justify-center gap-2">
                Upload Document <UploadCloud className="w-5 h-5" />
              </button>
            </Link>
            <button className="px-8 py-4 bg-white text-slate-700 border border-slate-200 text-lg font-bold rounded-xl hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
              How it works
            </button>
          </motion.div>
        </div>
      </section>

      {/* 2. THE PROBLEM VS SOLUTION (Clean Split) */}
      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Why we built this?</h2>
            <p className="text-slate-500 text-lg">Because WhatsApping files to &quot;Raju Xerox&quot; is painful.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* The Old Way (Red-ish) */}
            <motion.div 
              whileHover={{ y: -5 }}
              className="p-8 rounded-3xl bg-red-50 border border-red-100 relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 bg-red-100 text-red-600 text-xs font-bold px-3 py-1 rounded-bl-xl border-l border-b border-red-200">THE OLD WAY</div>
              <h3 className="text-2xl font-bold text-red-900 mb-6 flex items-center gap-2">
                <Clock className="w-6 h-6 text-red-500" /> The Struggle
              </h3>
              <ul className="space-y-4 text-slate-700">
                <li className="flex items-start gap-3">
                  <span className="text-red-500 font-bold">✕</span> Wait in a 20-minute queue.
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-500 font-bold">✕</span> &quot;Bhaiya, file bheji dekho?&quot; (WhatsApp).
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-500 font-bold">✕</span> Hunting for ₹2 change.
                </li>
              </ul>
            </motion.div>

            {/* The Print-Link Way (Blue-ish) */}
            <motion.div 
              whileHover={{ y: -5 }}
              className="p-8 rounded-3xl bg-blue-50 border border-blue-100 relative overflow-hidden shadow-sm"
            >
              <div className="absolute top-0 right-0 bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-bl-xl border-l border-b border-blue-200">THE NEW WAY</div>
              <h3 className="text-2xl font-bold text-blue-900 mb-6 flex items-center gap-2">
                <Zap className="w-6 h-6 text-blue-600" /> The Solution
              </h3>
              <ul className="space-y-4 text-slate-700">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-blue-600 shrink-0" /> 
                  Upload PDF from your room.
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-blue-600 shrink-0" /> 
                  Pay ₹40 online via UPI.
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-blue-600 shrink-0" /> 
                  Get a 4-digit OTP. Walk in & collect.
                </li>
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 3. FEATURES (4 Steps) */}
      <section className="py-24 px-6 bg-slate-50 border-y border-slate-200">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-slate-900">From PDF to Paper in 4 Steps</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <FeatureCard 
              number="01" 
              title="Upload" 
              desc="Select shop & upload PDF." 
              icon={<UploadCloud className="text-blue-600" />} 
            />
            <FeatureCard 
              number="02" 
              title="Customize" 
              desc="Single/Double side, Spiral binding." 
              icon={<Zap className="text-amber-500" />} 
            />
            <FeatureCard 
              number="03" 
              title="Pay UPI" 
              desc="Secure payment via Razorpay." 
              icon={<CreditCard className="text-green-600" />} 
            />
            <FeatureCard 
              number="04" 
              title="Pickup" 
              desc="Show OTP & collect instantly." 
              icon={<CheckCircle className="text-purple-600" />} 
            />
          </div>
        </div>
      </section>

      {/* 4. TECH STACK (Clean Pills) */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto text-center px-6">
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-10">Powered by Modern Tech</p>
          
          <div className="flex flex-wrap justify-center gap-4">
            <TechBadge icon={<Server className="w-4 h-4" />} name="Next.js 15" />
            <TechBadge icon={<UploadCloud className="w-4 h-4" />} name="AWS S3" />
            <TechBadge icon={<CreditCard className="w-4 h-4" />} name="Razorpay" />
            <TechBadge icon={<Database className="w-4 h-4" />} name="PostgreSQL" />
            <TechBadge icon={<Lock className="w-4 h-4" />} name="NextAuth" />
          </div>
        </div>
      </section>

     
    </div>
  )
}

// --- SUBCOMPONENTS ---

function FeatureCard({ number, title, desc, icon }: { number: string, title: string, desc: string, icon: React.ReactNode }) {
  return (
    <div className="group p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 bg-slate-50 rounded-lg group-hover:bg-blue-50 transition-colors">
          {icon}
        </div>
        <span className="text-4xl font-bold text-slate-100 group-hover:text-slate-200 transition-colors">
          {number}
        </span>
      </div>
      <h3 className="text-xl font-bold mb-2 text-slate-900">{title}</h3>
      <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
    </div>
  );
}

function TechBadge({ icon, name }: { icon: React.ReactNode, name: string }) {
  return (
    <div className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-50 border border-slate-200 text-slate-600 font-medium hover:border-blue-300 hover:text-blue-600 transition-all cursor-default">
      {icon}
      <span>{name}</span>
    </div>
  );
}