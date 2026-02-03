
import React from 'react';

interface RecapModalProps {
  content: string;
  onClose: () => void;
}

const RecapModal: React.FC<RecapModalProps> = ({ content, onClose }) => {
  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[200] flex items-center justify-center p-6">
      <div className="bg-white w-full max-w-lg rounded-[3rem] shadow-2xl border border-slate-200 overflow-hidden animate-pop-in">
        <div className="bg-indigo-600 p-8 text-white relative">
          <h2 className="text-2xl font-black mb-2">Good Morning! ☕️</h2>
          <p className="text-indigo-100 opacity-80">Here's your smart carry-over list for today.</p>
          <div className="absolute top-0 right-0 p-8 opacity-20 text-6xl">✨</div>
        </div>
        
        <div className="p-8">
          <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed italic">
            {content.split('\n').map((line, i) => (
              <p key={i} className="mb-2">{line}</p>
            ))}
          </div>
          
          <button 
            onClick={onClose}
            className="w-full mt-8 bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-lg"
          >
            Let's get to work
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecapModal;
