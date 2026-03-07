import { useState } from 'react';
import { Shield, RotateCcw } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import type { StudentProfile, University } from '../types';
import { getFallbackAvatar } from '../data/studentImages';

interface DigitalStudentIDProps {
  profile: StudentProfile;
  university: University | null;
}

export default function DigitalStudentID({ profile, university }: DigitalStudentIDProps) {
  const [showBack, setShowBack] = useState(false);

  const qrData = JSON.stringify({
    id: profile.id,
    name: profile.full_name,
    student_number: profile.student_number,
    university: university?.name,
    program: profile.program,
    year: profile.year_of_study,
    verified: profile.is_verified,
    url: `${window.location.origin}/profile/${profile.id}`,
  });

  return (
    <div className="relative w-full max-w-md mx-auto perspective-1000">
      <div
        className={`relative w-full transition-transform duration-700 transform-style-3d ${
          showBack ? 'rotate-y-180' : ''
        }`}
      >
        {!showBack ? (
          <div className="relative bg-gradient-to-br from-gray-900 via-black to-gray-900 rounded-2xl shadow-2xl border-2 border-green-500 overflow-hidden aspect-[1.586/1]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(34,197,94,0.1),transparent_50%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(34,197,94,0.05),transparent_50%)]" />

            <div className="relative z-10 p-6 h-full flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xs font-semibold text-green-500 tracking-wider uppercase">
                    {university?.abbreviation || university?.name}
                  </h3>
                  <p className="text-[10px] text-gray-400 mt-0.5">VersePass ID Africa</p>
                </div>
                {profile.is_verified && (
                  <div className="flex items-center gap-1 px-2 py-1 bg-green-500/20 rounded-full border border-green-500/30">
                    <Shield className="w-3 h-3 text-green-500" />
                    <span className="text-[10px] text-green-500 font-medium">Verified</span>
                  </div>
                )}
              </div>

              <div className="flex gap-4 flex-1">
                <div className="w-24 h-24 rounded-lg overflow-hidden border-2 border-green-500/30 bg-gray-800 flex-shrink-0">
                  <img
                    src={profile.profile_image_url || getFallbackAvatar(profile.full_name, 96)}
                    alt={profile.full_name}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex-1 flex flex-col justify-center">
                  <h2 className="text-lg font-bold text-white mb-1 leading-tight">
                    {profile.full_name}
                  </h2>
                  <p className="text-xs text-gray-400 mb-2">{profile.program}</p>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-gray-500 w-16">Student ID</span>
                      <span className="text-xs text-green-500 font-mono">{profile.student_number}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-gray-500 w-16">Year</span>
                      <span className="text-xs text-white">Year {profile.year_of_study}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-auto pt-4 border-t border-gray-800">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-[10px] text-gray-500">Valid Until</p>
                    <p className="text-xs text-white font-semibold">
                      {new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowBack(true)}
                    className="flex items-center gap-1 text-[10px] text-green-500 hover:text-green-400 transition-colors"
                  >
                    <RotateCcw className="w-3 h-3" />
                    View QR
                  </button>
                </div>
              </div>

              <div className="absolute bottom-0 right-0 w-32 h-32 opacity-5">
                <div className="w-full h-full bg-green-500 rounded-tl-full" />
              </div>
            </div>
          </div>
        ) : (
          <div className="relative bg-gradient-to-br from-black via-gray-900 to-black rounded-2xl shadow-2xl border-2 border-green-500 overflow-hidden aspect-[1.586/1]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(34,197,94,0.1),transparent_70%)]" />

            <div className="relative z-10 p-6 h-full flex flex-col">
              <div className="text-center mb-4">
                <h3 className="text-xs font-semibold text-green-500 tracking-wider uppercase">
                  Student Verification Code
                </h3>
                <p className="text-[10px] text-gray-400 mt-1">Scan to verify student identity</p>
              </div>

              <div className="flex-1 flex items-center justify-center">
                <div className="bg-white p-3 rounded-xl">
                  <QRCodeSVG
                    value={qrData}
                    size={140}
                    level="H"
                    includeMargin={false}
                  />
                </div>
              </div>

              <div className="space-y-2 text-center">
                <div className="bg-gray-900/50 rounded-lg p-2 border border-gray-800">
                  <p className="text-[10px] text-gray-500 mb-0.5">Student Information</p>
                  <div className="grid grid-cols-2 gap-2 text-[10px]">
                    <div>
                      <span className="text-gray-400">ID: </span>
                      <span className="text-white font-mono">{profile.student_number}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Year: </span>
                      <span className="text-white">{profile.year_of_study}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setShowBack(false)}
                  className="flex items-center gap-1 text-[10px] text-green-500 hover:text-green-400 transition-colors mx-auto"
                >
                  <RotateCcw className="w-3 h-3" />
                  View Front
                </button>
              </div>

              <div className="absolute top-0 left-0 w-24 h-24 opacity-5">
                <div className="w-full h-full bg-green-500 rounded-br-full" />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
