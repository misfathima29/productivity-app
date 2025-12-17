import { useEffect } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

const Toast = ({ message, type = 'info', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const icons = {
    success: <CheckCircle className="w-5 h-5" />,
    error: <XCircle className="w-5 h-5" />,
    warning: <AlertTriangle className="w-5 h-5" />,
    info: <Info className="w-5 h-5" />
  };

  const colors = {
    success: 'bg-emerald-green/20 border-emerald-green text-emerald-green',
    error: 'bg-electric-red/20 border-electric-red text-electric-red',
    warning: 'bg-vibrant-yellow/20 border-vibrant-yellow text-vibrant-yellow',
    info: 'bg-bright-blue/20 border-bright-blue text-bright-blue'
  };

  return (
    <div className={`fixed top-4 right-4 z-50 border rounded-xl p-4 flex items-center gap-3 shadow-lg ${colors[type]} animate-slide-in`}>
      {icons[type]}
      <span className="font-medium">{message}</span>
      <button
        onClick={onClose}
        className="ml-2 hover:opacity-70"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export default Toast;