'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    type?: 'danger' | 'warning' | 'info';
}

export default function ConfirmDialog({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirmer',
    cancelText = 'Annuler',
    type = 'danger',
}: ConfirmDialogProps) {
    const handleConfirm = () => {
        onConfirm();
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
                    />

                    {/* Dialog */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-gray-900 rounded-lg shadow-2xl z-50 p-6"
                    >
                        {/* Icon */}
                        <div className="flex justify-center mb-4">
                            <div className={`w-16 h-16 rounded-full flex items-center justify-center ${type === 'danger' ? 'bg-red-600/20' :
                                    type === 'warning' ? 'bg-yellow-600/20' :
                                        'bg-blue-600/20'
                                }`}>
                                <AlertTriangle
                                    size={32}
                                    className={
                                        type === 'danger' ? 'text-red-600' :
                                            type === 'warning' ? 'text-yellow-600' :
                                                'text-blue-600'
                                    }
                                />
                            </div>
                        </div>

                        {/* Title */}
                        <h2 className="text-2xl font-bold text-center mb-2">{title}</h2>

                        {/* Message */}
                        <p className="text-gray-400 text-center mb-6">{message}</p>

                        {/* Buttons */}
                        <div className="flex gap-3">
                            <button
                                onClick={onClose}
                                className="flex-1 px-4 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg font-semibold transition"
                            >
                                {cancelText}
                            </button>
                            <button
                                onClick={handleConfirm}
                                className={`flex-1 px-4 py-3 rounded-lg font-semibold transition ${type === 'danger'
                                        ? 'bg-red-600 hover:bg-red-700'
                                        : type === 'warning'
                                            ? 'bg-yellow-600 hover:bg-yellow-700'
                                            : 'bg-blue-600 hover:bg-blue-700'
                                    }`}
                            >
                                {confirmText}
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
