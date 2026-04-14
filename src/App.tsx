import React, { useRef, useEffect, useState, useCallback } from 'react';
import Webcam from 'react-webcam';
import { Hands, Results, HAND_CONNECTIONS } from '@mediapipe/hands';
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils';
import { detectGesture, GestureType } from './lib/gestures';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Camera, Eraser, FlaskConical, Flag, Sparkles, Download, RefreshCcw, User, Cpu, Terminal, Code, Languages, Info, Hand, ThumbsUp, Pencil, Layers } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { QRCodeSVG } from 'qrcode.react';

const FILTERS = [
  { id: 'none', name: { en: 'Original', ar: 'الأصلي' }, icon: <RefreshCcw className="w-4 h-4" /> },
  { id: 'algeria', name: { en: 'Algeria', ar: 'الجزائر' }, icon: <Flag className="w-4 h-4" /> },
  { id: 'science', name: { en: 'Science', ar: 'علوم' }, icon: <FlaskConical className="w-4 h-4" /> },
  { id: 'future', name: { en: 'Light Mode', ar: 'نمط الإضاءة' }, icon: <Sparkles className="w-4 h-4" /> },
];

type Point = { x: number; y: number };
type DrawingPath = { id: number; points: Point[]; color: string; offset: Point };

const TRANSLATIONS = {
  en: {
    title: "Quantum Code",
    subtitle: "Science Day Booth",
    desc: "Welcome to the future of interaction. Choose a mode to start your scientific journey.",
    start: "Enter Booth",
    cameraMode: "Camera Mode",
    drawingMode: "Creative Mode",
    clear: "Clear Canvas",
    filter: "Effect",
    capture: "Capture",
    draw: "Draw",
    move: "Move Shape",
    tracking: "System Active",
    users: "Visitors Today",
    exit: "Main Menu",
    greatShot: "Scientific Memory!",
    scanDesc: "Scan to download your Science Day photo",
    download: "Download",
    another: "Try Again",
    lang: "العربية",
    clubName: "Quantum Code",
    clubSub: "C.S Club | El Bayadh",
    instruction: "How to Interact",
    gestures: {
      CAMERA: [
        { icon: "👍", label: "Thumbs Up", desc: "Take Photo" },
        { icon: "✌️", label: "V-Sign", desc: "Change Filter" }
      ],
      DRAWING: [
        { icon: "☝️", label: "Index Up", desc: "Draw in Air" },
        { icon: "✊", label: "Fist", desc: "Move Object" },
        { icon: "🖐️", label: "Open Hand", desc: "Clear All" }
      ]
    }
  },
  ar: {
    title: "كوانتوم كود",
    subtitle: "ركن يوم العلم",
    desc: "مرحباً بك في مستقبل التفاعل. اختر النمط المناسب لتبدأ رحلتك العلمية.",
    start: "دخول الركن",
    cameraMode: "نمط التصوير",
    drawingMode: "نمط الإبداع",
    clear: "مسح اللوحة",
    filter: "تأثير",
    capture: "التقاط",
    draw: "رسم",
    move: "تحريك الشكل",
    tracking: "النظام نشط",
    users: "زوار اليوم",
    exit: "القائمة الرئيسية",
    greatShot: "ذكرى علمية!",
    scanDesc: "امسح الرمز لتحميل صورتك من يوم العلم",
    download: "تحميل",
    another: "مرة أخرى",
    lang: "English",
    clubName: "كوانتوم كود",
    clubSub: "نادي الإعلام الآلي | البيض",
    instruction: "كيفية التفاعل",
    gestures: {
      CAMERA: [
        { icon: "👍", label: "إبهام للأعلى", desc: "التقاط صورة" },
        { icon: "✌️", label: "علامة V", desc: "تغيير الفلتر" }
      ],
      DRAWING: [
        { icon: "☝️", label: "سبابة للأعلى", desc: "رسم في الهواء" },
        { icon: "✊", label: "قبضة يد", desc: "تحريك الأشكال" },
        { icon: "🖐️", label: "كف مفتوح", desc: "مسح اللوحة" }
      ]
    }
  }
};

export default function App() {
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawingCanvasRef = useRef<HTMLCanvasElement>(null);
  const [gesture, setGesture] = useState<GestureType>('NONE');
  const [currentFilter, setCurrentFilter] = useState(0);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [userCount, setUserCount] = useState(0);
  const [isStarted, setIsStarted] = useState(false);
  const [lang, setLang] = useState<'en' | 'ar'>('ar');
  const [appMode, setAppMode] = useState<'CAMERA' | 'DRAWING'>('CAMERA');
  const [paths, setPaths] = useState<DrawingPath[]>([]);
  const [currentPath, setCurrentPath] = useState<Point[] | null>(null);
  const [selectedPathId, setSelectedPathId] = useState<number | null>(null);

  const t = TRANSLATIONS[lang];

  const lastGestureRef = useRef<GestureType>('NONE');
  const lastGestureTimeRef = useRef(0);
  const prevPosRef = useRef<{ x: number, y: number } | null>(null);

  const capturePhoto = useCallback(() => {
    if (!canvasRef.current) return;
    
    const finalCanvas = document.createElement('canvas');
    finalCanvas.width = canvasRef.current.width;
    finalCanvas.height = canvasRef.current.height + 100;
    const ctx = finalCanvas.getContext('2d')!;

    ctx.drawImage(canvasRef.current, 0, 0);

    ctx.fillStyle = '#2e1065';
    ctx.fillRect(0, canvasRef.current.height, finalCanvas.width, 100);
    
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 32px Amiri';
    ctx.textAlign = 'center';
    ctx.fillText('Quantum Code Club - Innovating through logic', finalCanvas.width / 2, canvasRef.current.height + 60);

    const dataUrl = finalCanvas.toDataURL('image/jpeg');
    setCapturedImage(dataUrl);
    setUserCount(prev => prev + 1);
    confetti();
  }, []);

  const startCapture = useCallback(() => {
    if (countdown !== null) return;
    setCountdown(3);
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev === 1) {
          clearInterval(interval);
          capturePhoto();
          return null;
        }
        return prev ? prev - 1 : null;
      });
    }, 1000);
  }, [countdown, capturePhoto]);

  const onResults = useCallback((results: Results) => {
    if (!canvasRef.current || !drawingCanvasRef.current || !webcamRef.current?.video) return;

    const canvasCtx = canvasRef.current.getContext('2d')!;
    const drawingCtx = drawingCanvasRef.current.getContext('2d')!;
    const { width, height } = canvasRef.current;

    canvasCtx.save();
    canvasCtx.clearRect(0, 0, width, height);
    canvasCtx.drawImage(results.image, 0, 0, width, height);

    applyFilter(canvasCtx, width, height);

    // Draw all stored paths
    paths.forEach(path => {
      if (path.points.length < 2) return;
      canvasCtx.beginPath();
      canvasCtx.strokeStyle = path.color;
      canvasCtx.lineWidth = 8;
      canvasCtx.lineCap = 'round';
      if (FILTERS[currentFilter].id === 'future') {
        canvasCtx.shadowBlur = 15;
        canvasCtx.shadowColor = path.color;
      }
      const startX = path.points[0].x + path.offset.x;
      const startY = path.points[0].y + path.offset.y;
      canvasCtx.moveTo(startX, startY);
      for (let i = 1; i < path.points.length; i++) {
        canvasCtx.lineTo(path.points[i].x + path.offset.x, path.points[i].y + path.offset.y);
      }
      canvasCtx.stroke();
      canvasCtx.shadowBlur = 0;
    });

    // Draw current path being drawn
    if (currentPath && currentPath.length > 1) {
      canvasCtx.beginPath();
      canvasCtx.strokeStyle = '#9333ea';
      canvasCtx.lineWidth = 8;
      canvasCtx.lineCap = 'round';
      canvasCtx.moveTo(currentPath[0].x, currentPath[0].y);
      currentPath.forEach(p => canvasCtx.lineTo(p.x, p.y));
      canvasCtx.stroke();
    }

    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
      const landmarks = results.multiHandLandmarks[0];
      const detected = detectGesture(landmarks);
      setGesture(detected);

      const now = Date.now();
      if (detected !== lastGestureRef.current && now - lastGestureTimeRef.current > 1000) {
        // CAMERA MODE GESTURES
        if (appMode === 'CAMERA') {
          if (detected === 'FILTER') {
            setCurrentFilter(prev => (prev + 1) % FILTERS.length);
          } else if (detected === 'PHOTO') {
            startCapture();
          }
        } 
        // DRAWING MODE GESTURES
        else if (appMode === 'DRAWING') {
          if (detected === 'CLEAR') {
            setPaths([]);
            setCurrentPath(null);
          }
        }
        lastGestureRef.current = detected;
        lastGestureTimeRef.current = now;
      }

      const indexTip = landmarks[8];
      const isIndexUp = indexTip.y < landmarks[6].y && landmarks[12].y > landmarks[10].y;
      const x = (1 - indexTip.x) * width;
      const y = indexTip.y * height;

      // DRAWING LOGIC (Only in DRAWING mode)
      if (appMode === 'DRAWING') {
        if (isIndexUp && detected !== 'PINCH') {
          setCurrentPath(prev => prev ? [...prev, { x, y }] : [{ x, y }]);
        } else if (!isIndexUp && currentPath) {
          setPaths(prev => [...prev, { id: Date.now(), points: currentPath, color: '#9333ea', offset: { x: 0, y: 0 } }]);
          setCurrentPath(null);
        }

        // MOVING LOGIC (Only in DRAWING mode)
        if (detected === 'PINCH') {
          if (selectedPathId === null) {
            const closest = paths.find(p => {
              const firstPoint = p.points[0];
              const dist = Math.sqrt(Math.pow(x - (firstPoint.x + p.offset.x), 2) + Math.pow(y - (firstPoint.y + p.offset.y), 2));
              return dist < 100;
            });
            if (closest) setSelectedPathId(closest.id);
          } else {
            setPaths(prev => prev.map(p => {
              if (p.id === selectedPathId) {
                if (!prevPosRef.current) return p;
                const dx = x - prevPosRef.current.x;
                const dy = y - prevPosRef.current.y;
                return { ...p, offset: { x: p.offset.x + dx, y: p.offset.y + dy } };
              }
              return p;
            }));
          }
        } else {
          setSelectedPathId(null);
        }
      }
      prevPosRef.current = { x, y };

      // Visual feedback for hand
      canvasCtx.beginPath();
      canvasCtx.arc(x, y, 10, 0, Math.PI * 2);
      canvasCtx.fillStyle = detected === 'PINCH' ? '#FFFFFF' : '#9333ea';
      canvasCtx.fill();
    }

    canvasCtx.restore();
  }, [currentFilter, startCapture, paths, currentPath, selectedPathId]);

  const onResultsRef = useRef(onResults);
  useEffect(() => {
    onResultsRef.current = onResults;
  }, [onResults]);

  useEffect(() => {
    if (!isStarted) return;

    const hands = new Hands({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
    });

    hands.setOptions({
      maxNumHands: 1,
      modelComplexity: 1,
      minDetectionConfidence: 0.7,
      minTrackingConfidence: 0.7,
    });

    hands.onResults((results) => {
      onResultsRef.current(results);
    });

    const videoElement = webcamRef.current?.video;

    if (videoElement) {
      const processVideo = async () => {
        if (videoElement.readyState >= 2) {
          await hands.send({ image: videoElement });
        }
        requestAnimationFrame(processVideo);
      };
      processVideo();
    }

    return () => {
      hands.close();
    };
  }, [isStarted]);

  const applyFilter = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
    const filter = FILTERS[currentFilter].id;
    if (filter === 'algeria') {
      ctx.fillStyle = 'rgba(0, 102, 51, 0.2)';
      ctx.fillRect(0, 0, w / 2, h);
      ctx.fillStyle = 'rgba(210, 16, 52, 0.1)';
      ctx.fillRect(w / 2, 0, w / 2, h);
    } else if (filter === 'science') {
      ctx.font = '24px Space Grotesk';
      ctx.fillStyle = 'white';
      ctx.fillText('Quantum Code', 50, 100);
      ctx.fillText('Binary Logic', w - 200, 150);
    } else if (filter === 'future') {
      ctx.globalCompositeOperation = 'hue';
      ctx.fillStyle = '#9333ea';
      ctx.fillRect(0, 0, w, h);
      ctx.globalCompositeOperation = 'source-over';
    }
  };

  if (!isStarted) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-zinc-950 via-quantum-dark to-zinc-950 ${lang === 'ar' ? 'rtl' : 'ltr'}`}>
        <div className="absolute top-6 right-6">
          <Button variant="ghost" className="text-white gap-2" onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}>
            <Languages size={18} /> {t.lang}
          </Button>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl w-full text-center space-y-8"
        >
          <div className="flex justify-center mb-4">
            <img 
              src="/club-logo.png" 
              alt="Club Logo" 
              className="w-32 h-32 object-contain"
              referrerPolicy="no-referrer"
              onError={(e) => (e.currentTarget.style.display = 'none')}
            />
          </div>
          <div className="space-y-4">
            <Badge className="bg-quantum-purple text-white px-4 py-1 text-sm font-bold">{t.clubName}</Badge>
            <h1 className="text-6xl font-display font-bold tracking-tight">
              {t.title} <br />
              <span className="text-quantum-purple">{t.subtitle}</span>
            </h1>
            <p className="text-zinc-400 text-lg max-w-lg mx-auto">
              {t.desc}
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: <Hand />, label: t.openHand, desc: t.clear },
              { icon: <Layers />, label: t.vSign, desc: t.filter },
              { icon: <ThumbsUp />, label: t.thumbsUp, desc: t.capture },
              { icon: <Pencil />, label: t.indexUp, desc: t.draw },
            ].map((item, i) => (
              <Card key={i} className="p-4 bg-white/5 border-white/10 flex flex-col items-center gap-2 hover:border-quantum-purple/50 transition-colors">
                <div className="text-quantum-purple">{item.icon}</div>
                <div className="font-medium text-sm">{item.label}</div>
                <div className="text-xs text-zinc-500">{item.desc}</div>
              </Card>
            ))}
          </div>

          <Button 
            onClick={() => setIsStarted(true)}
            className="w-full max-w-xs h-16 text-xl btn-primary"
          >
            {t.start}
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-zinc-950 flex flex-col md:flex-row overflow-hidden ${lang === 'ar' ? 'rtl' : 'ltr'}`}>
      <div className="w-full md:w-80 p-6 border-r border-white/10 flex flex-col gap-6 bg-zinc-900/50">
        <div className="flex items-center gap-3">
          <img 
            src="/club-logo.png" 
            alt="Logo" 
            className="w-12 h-12 object-contain rounded-lg bg-white/5 p-1"
            referrerPolicy="no-referrer"
            onError={(e) => (e.currentTarget.style.display = 'none')}
          />
          <div>
            <h2 className="font-display font-bold text-lg">{t.clubName}</h2>
            <p className="text-xs text-zinc-500">{t.clubSub}</p>
          </div>
        </div>

        <div className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">{t.cameraMode} / {t.drawingMode}</p>
          <div className="flex gap-2">
            <Button 
              className={`flex-1 gap-2 ${appMode === 'CAMERA' ? 'bg-quantum-purple' : 'bg-zinc-800'}`}
              onClick={() => setAppMode('CAMERA')}
            >
              <Camera size={16} />
            </Button>
            <Button 
              className={`flex-1 gap-2 ${appMode === 'DRAWING' ? 'bg-quantum-purple' : 'bg-zinc-800'}`}
              onClick={() => setAppMode('DRAWING')}
            >
              <Pencil size={16} />
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">{t.instruction}</p>
          <div className="space-y-3">
            {t.gestures[appMode].map((g: any, i: number) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                <span className="text-2xl">{g.icon}</span>
                <div>
                  <p className="text-sm font-bold">{g.label}</p>
                  <p className="text-[10px] text-zinc-500">{g.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-auto space-y-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-zinc-500 flex items-center gap-2"><Code size={14} /> {t.users}</span>
            <span className="font-mono font-bold text-quantum-purple">{userCount}</span>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1 border-white/10" onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}>
              {t.lang}
            </Button>
            <Button variant="outline" className="flex-1 border-white/10" onClick={() => setIsStarted(false)}>
              {t.exit}
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 relative bg-black flex items-center justify-center p-4">
        <div className="relative w-full max-w-4xl aspect-video rounded-3xl overflow-hidden shadow-2xl border-4 border-white/5">
          <Webcam
            ref={webcamRef}
            mirrored
            audio={false}
            screenshotFormat="image/jpeg"
            disablePictureInPicture={true}
            forceScreenshotSourceSize={false}
            imageSmoothing={true}
            onUserMedia={() => {}}
            onUserMediaError={() => {}}
            screenshotQuality={0.92}
            className="absolute inset-0 w-full h-full object-cover opacity-0"
            videoConstraints={{ width: 1280, height: 720 }}
          />
          <canvas ref={canvasRef} width={1280} height={720} className="absolute inset-0 w-full h-full object-cover" />
          <canvas ref={drawingCanvasRef} width={1280} height={720} className="absolute inset-0 w-full h-full object-cover pointer-events-none" />

          <AnimatePresence>
            {countdown !== null && (
              <motion.div
                initial={{ scale: 2, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50"
              >
                <span className="text-9xl font-display font-bold text-white drop-shadow-lg">{countdown}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="absolute bottom-6 left-6 flex gap-4">
            <div className="glass-panel px-4 py-2 flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${gesture !== 'NONE' ? 'bg-purple-500 animate-pulse' : 'bg-zinc-600'}`} />
              <span className="text-xs font-medium uppercase tracking-widest">{t.tracking}</span>
            </div>
          </div>
        </div>

        <div className="absolute bottom-10 right-10 flex flex-col gap-4">
          <Button size="icon" className="w-16 h-16 rounded-full bg-quantum-purple hover:bg-quantum-purple/90 shadow-xl" onClick={startCapture}>
            <Camera size={32} />
          </Button>
          <Button size="icon" variant="outline" className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-md border-white/20" onClick={() => drawingCanvasRef.current?.getContext('2d')?.clearRect(0, 0, 1280, 720)}>
            <Eraser size={28} />
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {capturedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-xl"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="max-w-4xl w-full bg-zinc-900 rounded-3xl overflow-hidden shadow-2xl border border-white/10"
            >
              <div className="flex flex-col md:flex-row">
                <div className="flex-1 p-2">
                  <img src={capturedImage} alt="Captured" className="w-full h-auto rounded-2xl" />
                </div>
                <div className="w-full md:w-80 p-8 flex flex-col items-center justify-center gap-8 text-center">
                  <img 
                    src="/club-logo.png" 
                    alt="Logo" 
                    className="w-16 h-16 object-contain mb-2"
                    referrerPolicy="no-referrer"
                    onError={(e) => (e.currentTarget.style.display = 'none')}
                  />
                  <div className="space-y-2">
                    <h3 className="text-2xl font-display font-bold">{t.greatShot}</h3>
                    <p className="text-sm text-zinc-500">{t.scanDesc}</p>
                  </div>
                  
                  <div className="p-4 bg-white rounded-2xl">
                    <QRCodeSVG value={`https://quantum-code.club/photo/${Date.now()}`} size={160} />
                  </div>

                  <div className="flex flex-col w-full gap-3">
                    <Button className="w-full btn-primary gap-2">
                      <a href={capturedImage} download="quantum-code-photo.jpg" className="flex items-center gap-2">
                        <Download size={18} /> {t.download}
                      </a>
                    </Button>
                    <Button variant="outline" className="w-full border-white/10" onClick={() => setCapturedImage(null)}>
                      {t.another}
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
