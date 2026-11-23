import React from 'react';
import { X, GraduationCap, CheckCircle2, PlayCircle, Clock } from 'lucide-react';
import { mockSkillLessons } from '../../data/mockProfile';

interface FeedoSkillsModalProps {
  onClose: () => void;
}

export const FeedoSkillsModal: React.FC<FeedoSkillsModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in font-sans">
      <div className="relative w-full max-w-lg bg-white border border-slate-100 rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200/80 text-amber-700 flex items-center justify-center">
              <GraduationCap size={22} />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-900">Feedo Partner Skills</h2>
              <p className="text-xs text-slate-500">Quick training & delivery excellence micro-courses</p>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-3 flex-1 text-xs">
          {mockSkillLessons.map((lesson) => (
            <div
              key={lesson.id}
              className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80 space-y-2 flex flex-col justify-between"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-slate-200/80 text-slate-700 uppercase">
                      {lesson.category}
                    </span>
                    <span className="text-[11px] text-slate-500 flex items-center gap-1 font-medium">
                      <Clock size={11} />
                      <span>{lesson.durationMinutes} mins</span>
                    </span>
                  </div>
                  <h3 className="text-sm font-extrabold text-slate-900 mt-1">{lesson.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed mt-0.5">{lesson.description}</p>
                </div>

                <div className="flex-shrink-0">
                  {lesson.completed ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <CheckCircle2 size={12} />
                      <span>Done</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-900 border border-amber-300">
                      <PlayCircle size={12} />
                      <span>Start</span>
                    </span>
                  )}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200/70 flex items-center justify-between text-[11px]">
                <span className="text-slate-500">Video + Quick Quiz</span>
                <button
                  type="button"
                  className="text-amber-800 font-bold hover:underline cursor-pointer"
                >
                  {lesson.completed ? 'Review Lesson' : 'Launch Video Guide →'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-end">
          <button
            onClick={onClose}
            type="button"
            className="px-5 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
