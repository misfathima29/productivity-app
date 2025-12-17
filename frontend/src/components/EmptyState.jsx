// EmptyState.jsx - A reusable empty state component
const EmptyState = ({ icon, title, message, actionText, onAction }) => {
  return (
    <div className="text-center py-12 px-4">
      <div className="text-6xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-gray-700 mb-2">{title}</h3>
      <p className="text-gray-500 mb-6">{message}</p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};

export default EmptyState;