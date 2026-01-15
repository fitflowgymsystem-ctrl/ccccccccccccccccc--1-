
import React, { useState, useRef } from 'react';
import { checkInUser } from '../services/gymService';
import { AccessStatus } from '../types';
import { Language } from '../utils/translations';
import { useToast } from './useToast';

export const useCheckIn = (lang: Language, onCheckIn?: () => void) => {
    const { showToast } = useToast();
    const [input, setInput] = useState('');
    const [currentScan, setCurrentScan] = useState<any>(null);
    const [history, setHistory] = useState<any[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [enlargedPhotoUrl, setEnlargedPhotoUrl] = useState<string | null>(null);

    const playBeep = (type: 'success' | 'error' | 'trainer') => {
        if (!soundEnabled) return;
        try {
            const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
            const ctx = new AudioContext();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain); gain.connect(ctx.destination);

            if (type === 'trainer') {
                osc.type = 'triangle'; osc.frequency.setValueAtTime(440, ctx.currentTime);
                osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.2);
            } else if (type === 'success') {
                osc.type = 'sine'; osc.frequency.setValueAtTime(800, ctx.currentTime);
            } else {
                osc.type = 'sawtooth'; osc.frequency.setValueAtTime(150, ctx.currentTime);
            }

            gain.gain.setValueAtTime(0.1, ctx.currentTime);
            osc.start(); osc.stop(ctx.currentTime + 0.3);
        } catch (e) { }
    };

    const speak = (text: string) => {
        if (!soundEnabled || !('speechSynthesis' in window)) return;
        window.speechSynthesis.cancel();
        const ut = new SpeechSynthesisUtterance(text);
        ut.lang = lang === 'ar' ? 'ar-SA' : 'en-US';
        window.speechSynthesis.speak(ut);
    };

    const processCheckIn = (identifier: string) => {
        const cleanId = identifier.trim();
        if (!cleanId) return;

        setIsProcessing(true);
        // Fixed: Use async callback for setTimeout to properly await the async checkInUser service call
        setTimeout(async () => {
            const result = await checkInUser(cleanId);
            const newScan = {
                id: Date.now(),
                ...result,
                timestamp: new Date().toISOString(),
                scannedId: cleanId
            };

            setCurrentScan(newScan);
            setHistory(prev => [newScan, ...prev].slice(0, 10));
            setIsProcessing(false);
            setInput('');

            if (onCheckIn) onCheckIn();

            if (result.status === AccessStatus.GRANTED) {
                if (result.isTrainer) {
                    playBeep('trainer');
                    speak(lang === 'ar' ? 'أهلاً كابتن' : 'Welcome Coach');
                    showToast(lang === 'ar' ? 'أهلاً كابتن' : 'Welcome Coach', 'success');
                } else {
                    playBeep('success');
                    speak(lang === 'ar' ? `مرحباً ${result.user?.name.split(' ')[0]}` : `Welcome ${result.user?.name.split(' ')[0]}`);
                    showToast(lang === 'ar' ? `مرحباً ${result.user?.name}` : `Welcome ${result.user?.name}`, 'success');
                }
            } else {
                playBeep('error');
                const isExpired = result.message?.toLowerCase().includes('expired') || (result as any).reason?.toLowerCase().includes('expired');
                const msg = isExpired
                    ? (lang === 'ar' ? 'عفواً، اشتراك اللاعب منتهي' : 'Sorry, subscription expired')
                    : (lang === 'ar' ? 'عفواً، ممنوع الدخول' : 'Access Denied');

                speak(msg);
                showToast(msg, 'error');
            }
        }, 300);
    };

    return {
        state: { input, currentScan, history, isProcessing, soundEnabled, enlargedPhotoUrl },
        actions: {
            setInput,
            setSoundEnabled,
            setEnlargedPhotoUrl,
            processCheckIn,
            resetScan: () => setCurrentScan(null),
            clearHistory: () => setHistory([])
        }
    };
};
